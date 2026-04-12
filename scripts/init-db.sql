-- ═══════════════════════════════════════════════════════════════
--  Obilet PostgreSQL Başlangıç Script'i
--  Her mikroservis kendi tablo prefix'ini kullanır:
--    auth_*         → auth-service
--    user_*         → user-service
--    trip_*         → trip-service
--    booking_*      → booking-service
--    payment_*      → payment-service
--    notification_* → notification-service
-- ═══════════════════════════════════════════════════════════════

-- UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Fuzzy text search için

-- ─── Bilgi mesajı ─────────────────────────────────────────────
DO $$
BEGIN
    RAISE NOTICE '✅ Obilet veritabanı başlatıldı. Tablolar Alembic migration ile oluşturulacak.';
END $$;
