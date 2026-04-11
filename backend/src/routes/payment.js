/**
 * payment.js — Ödeme API Router
 *
 * POST /api/payment/init         → Iyzico 3D Secure başlat
 * POST /api/payment/callback     → Iyzico 3D sonrası callback
 * GET  /api/payment/status/:id   → Ödeme durumu sorgula
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { initialize3DSecure, confirm3DSecure } = require('../services/paymentService');

const prisma = new PrismaClient();

/**
 * POST /api/payment/init
 * Ödeme başlatma — Iyzico 3DS HTML form döner
 *
 * Body: {
 *   ticketId, pnr, amount,
 *   passenger: { id, firstName, lastName, tckn, email, phone },
 *   card: { cardHolderName, cardNumber, expireMonth, expireYear, cvc }
 * }
 */
router.post('/init', async (req, res, next) => {
  try {
    const { ticketId, pnr, amount, passenger, card } = req.body;

    if (!ticketId || !pnr || !amount || !passenger || !card) {
      return res.status(400).json({ error: 'Tüm ödeme bilgileri zorunludur.' });
    }

    // Bileti ve durumunu kontrol et
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).json({ error: 'Bilet bulunamadı.' });
    if (ticket.status !== 'PENDING') {
      return res.status(409).json({ error: 'Bu bilet zaten işleme alınmış.' });
    }

    // Ödeme kaydı oluştur
    const payment = await prisma.payment.create({
      data: { amount, currency: 'TRY', status: 'PENDING' },
    });

    // Bileti ödemeye bağla
    await prisma.ticket.update({
      where: { id: ticketId },
      data: { paymentId: payment.id },
    });

    // Iyzico callback URL (frontend yönlendirmesi burada olacak)
    const callbackUrl = `${process.env.FRONTEND_URL}/payment/callback?paymentId=${payment.id}`;

    const result = await initialize3DSecure({
      ticketId,
      pnr,
      amount,
      passenger,
      card,
      callbackUrl,
    });

    if (result.error) {
      // Ödeme başarısız — kaydı güncelle
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', errorMessage: result.error, errorCode: result.errorCode },
      });
      return res.status(402).json({ error: result.error });
    }

    // Iyzico 3D HTML formunu döndür
    res.json({
      htmlContent: result.htmlContent,
      paymentId: payment.id,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/payment/callback
 * Iyzico 3D Secure sonrası callback
 * Body: { paymentId (Iyzico'dan), conversationId, paymentRecordId (bizim DB kaydı) }
 */
router.post('/callback', async (req, res, next) => {
  try {
    const { paymentId: iyzicoPaymentId, conversationId, paymentRecordId } = req.body;

    if (!iyzicoPaymentId || !conversationId || !paymentRecordId) {
      return res.status(400).json({ error: 'Eksik callback parametreleri.' });
    }

    const confirmResult = await confirm3DSecure(iyzicoPaymentId, conversationId);

    if (!confirmResult.success) {
      // Ödeme başarısız
      await prisma.payment.update({
        where: { id: paymentRecordId },
        data: { status: 'FAILED', errorMessage: confirmResult.error },
      });

      // Koltuk rezervasyonunu geri al
      const ticket = await prisma.ticket.findFirst({
        where: { paymentId: paymentRecordId },
        include: { seat: true },
      });
      if (ticket) {
        await prisma.seat.update({
          where: { id: ticket.seatId },
          data: { status: 'EMPTY', gender: null },
        });
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: 'CANCELLED' },
        });
      }

      return res.status(402).json({ error: confirmResult.error });
    }

    // ─── Ödeme Başarılı ───────────────────────────────
    const { payment: iyzicoPayment } = confirmResult;

    // Ödeme kaydını güncelle
    await prisma.payment.update({
      where: { id: paymentRecordId },
      data: {
        status: 'SUCCESS',
        iyzicoPaymentId: iyzicoPayment.iyzicoPaymentId,
        iyzicoToken: iyzicoPayment.iyzicoToken,
        cardLastFour: iyzicoPayment.cardLastFour,
        cardBrand: iyzicoPayment.cardBrand,
      },
    });

    // Bileti ve koltuğu onayla
    const ticket = await prisma.ticket.findFirst({
      where: { paymentId: paymentRecordId },
    });
    if (ticket) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: { status: 'CONFIRMED' },
      });
      await prisma.seat.update({
        where: { id: ticket.seatId },
        data: { status: 'OCCUPIED' },
      });
    }

    res.json({
      success: true,
      message: 'Ödeme başarıyla tamamlandı!',
      pnr: ticket?.pnr,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/payment/status/:id
 * Ödeme durumunu sorgula
 */
router.get('/status/:id', async (req, res, next) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: req.params.id },
    });
    if (!payment) return res.status(404).json({ error: 'Ödeme bulunamadı.' });
    res.json({ payment });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
