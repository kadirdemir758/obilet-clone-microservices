/**
 * tickets.js — Bilet API Router
 *
 * POST /api/tickets/hold   → Koltuk rezervasyonu (cinsiyet kuralı kontrolü ile)
 * GET  /api/tickets/:pnr   → PNR ile bilet sorgulama
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { checkGenderRule } = require('../services/seatService');

const prisma = new PrismaClient();

/**
 * POST /api/tickets/hold
 * Koltuk geçici rezervasyonu + yolcu kaydı oluşturur.
 * Body: { tripId, seatNumber, passenger: { firstName, lastName, birthDate, gender, tckn } }
 */
router.post('/hold', async (req, res, next) => {
  try {
    const { tripId, seatNumber, passenger } = req.body;

    // ─── Zorunlu Alan Kontrolü ─────────────────────────
    if (!tripId || !seatNumber || !passenger) {
      return res.status(400).json({ error: 'tripId, seatNumber ve passenger zorunludur.' });
    }

    const { firstName, lastName, birthDate, gender, tckn } = passenger;
    if (!firstName || !lastName || !birthDate || !gender || !tckn) {
      return res.status(400).json({ error: 'Tüm yolcu bilgileri zorunludur.' });
    }

    // ─── Koltuk Varlık Kontrolü ───────────────────────
    const seat = await prisma.seat.findFirst({
      where: { tripId, seatNumber: parseInt(seatNumber) },
    });

    if (!seat) {
      return res.status(404).json({ error: 'Koltuk bulunamadı.' });
    }

    if (seat.status !== 'EMPTY') {
      return res.status(409).json({ error: 'Bu koltuk zaten dolu veya rezerve edilmiş.' });
    }

    // ─── Cinsiyet Kuralı Kontrolü ─────────────────────
    const genderCheck = await checkGenderRule(tripId, parseInt(seatNumber), gender);
    if (!genderCheck.allowed) {
      return res.status(422).json({ error: genderCheck.reason });
    }

    // ─── Yolcu Oluştur ────────────────────────────────
    const passengerRecord = await prisma.passenger.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        gender,
        tckn, // Prod'da burada şifreleme yapılmalı
      },
    });

    // ─── Koltuk Rezerve Et ────────────────────────────
    await prisma.seat.update({
      where: { id: seat.id },
      data: { status: 'RESERVED', gender },
    });

    // ─── Bilet Oluştur ────────────────────────────────
    const pnr = `OBL${Date.now().toString(36).toUpperCase()}`;
    const ticket = await prisma.ticket.create({
      data: {
        tripId,
        seatId: seat.id,
        passengerId: passengerRecord.id,
        pnr,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      message: 'Koltuk rezerve edildi. Ödeme adımına geçebilirsiniz.',
      ticket: {
        id: ticket.id,
        pnr: ticket.pnr,
        status: ticket.status,
        seatNumber: seat.seatNumber,
      },
      passenger: {
        id: passengerRecord.id,
        firstName,
        lastName,
        gender,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/tickets/:pnr
 * PNR ile bilet sorgulama (uçuş kontrolü gibi)
 */
router.get('/:pnr', async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { pnr: req.params.pnr },
      include: {
        trip: { include: { bus: { include: { company: true } } } },
        seat: true,
        passenger: true,
        payment: true,
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Bilet bulunamadı.' });
    }

    res.json({ ticket });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
