/**
 * seats.js — Koltuk API Router
 * GET /api/seats/:tripId   → Sefere ait tüm koltuklar
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /api/seats/:tripId
 * Bir seferin tüm koltuk durumlarını döner.
 */
router.get('/:tripId', async (req, res, next) => {
  try {
    const seats = await prisma.seat.findMany({
      where: { tripId: req.params.tripId },
      orderBy: { seatNumber: 'asc' },
    });

    if (!seats.length) {
      return res.status(404).json({ error: 'Bu sefere ait koltuk bulunamadı.' });
    }

    res.json({ seats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
