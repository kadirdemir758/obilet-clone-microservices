require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const tripsRouter = require('./routes/trips');
const seatsRouter = require('./routes/seats');
const ticketsRouter = require('./routes/tickets');
const paymentRouter = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Güvenlik ve Middleware ────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ───────────────────────────────────────
app.use('/api/trips', tripsRouter);
app.use('/api/seats', seatsRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/payment', paymentRouter);

// ─── Sağlık Kontrolü ──────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'obilet-api',
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı.' });
});

// ─── Global Hata Handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Sunucu Hatası:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Beklenmeyen bir sunucu hatası oluştu.',
  });
});

// ─── Sunucuyu Başlat ──────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚌 Obilet API çalışıyor → http://localhost:${PORT}`);
  console.log(`📊 Ortam: ${process.env.NODE_ENV}`);
});

module.exports = app;
