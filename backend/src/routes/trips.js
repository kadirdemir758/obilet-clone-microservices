/**
 * trips.js — Sefer API Router
 * GET /api/trips   → Kalkış/varış/tarih ile seferleri filtrele
 * GET /api/trips/:id → Tek sefer detayı
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/trips
 * Query: ?from=İstanbul&to=Ankara&date=2026-04-12
 */
router.get('/', async (req, res, next) => {
  try {
    const { from, to, date } = req.query;

    if (!from || !to || !date) {
      return res.status(400).json({
        error: 'from, to ve date parametreleri zorunludur.',
      });
    }

    // Seçilen günün başlangıç ve sonu
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const trips = await prisma.trip.findMany({
      where: {
        origin: { contains: from, mode: 'insensitive' },
        destination: { contains: to, mode: 'insensitive' },
        departureTime: { gte: startOfDay, lte: endOfDay },
        status: 'ACTIVE',
      },
      include: {
        bus: {
          include: {
            company: true,
          },
        },
        seats: {
          select: {
            id: true,
            seatNumber: true,
            status: true,
            gender: true,
          },
        },
      },
      orderBy: { departureTime: 'asc' },
    });

    // Dolu/boş koltuk sayılarını hesapla
    const enrichedTrips = trips.map((trip) => {
      const emptySeats = trip.seats.filter((s) => s.status === 'EMPTY').length;
      const occupiedSeats = trip.seats.filter((s) => s.status !== 'EMPTY').length;
      const durationMs = new Date(trip.arrivalTime) - new Date(trip.departureTime);
      const durationHours = Math.floor(durationMs / 3600000);
      const durationMinutes = Math.floor((durationMs % 3600000) / 60000);

      return {
        id: trip.id,
        origin: trip.origin,
        destination: trip.destination,
        departureTime: trip.departureTime,
        arrivalTime: trip.arrivalTime,
        duration: `${durationHours}s ${durationMinutes}dk`,
        price: parseFloat(trip.price),
        currency: trip.currency,
        emptySeats,
        occupiedSeats,
        totalSeats: trip.seats.length,
        seatLayout: trip.bus.seatLayout,
        company: {
          id: trip.bus.company.id,
          name: trip.bus.company.name,
          slug: trip.bus.company.slug,
          logoUrl: trip.bus.company.logoUrl,
          phone: trip.bus.company.phone,
        },
        bus: {
          id: trip.bus.id,
          model: trip.bus.model,
          plateNo: trip.bus.plateNo,
        },
      };
    });

    res.json({ trips: enrichedTrips, total: enrichedTrips.length });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/trips/:id
 * Tek sefer detayı (koltuk bilgileriyle birlikte)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: req.params.id },
      include: {
        bus: { include: { company: true } },
        seats: {
          orderBy: { seatNumber: 'asc' },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Sefer bulunamadı.' });
    }

    res.json({ trip });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
