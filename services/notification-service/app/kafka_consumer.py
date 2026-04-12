"""
Kafka Consumer — Notification Service

Bu modül Phase 2'de aktif hale getirilecek.
Dinlenecek topic'ler:
  - user.registered   → Hoşgeldin e-postası
  - booking.created   → Rezervasyon onay bildirimi
  - payment.completed → Ödeme makbuzu e-postası
  - payment.failed    → Ödeme hatası bildirimi
"""

import asyncio
import json
import logging

# from aiokafka import AIOKafkaConsumer
# from app.config import settings

logger = logging.getLogger(__name__)

TOPICS = [
    "user.registered",
    "booking.created",
    "payment.completed",
    "payment.failed",
]


async def handle_user_registered(data: dict):
    """Yeni kayıt olan kullanıcıya hoşgeldin e-postası gönder."""
    logger.info(f"📧 Hoşgeldin e-postası: {data.get('email')}")
    # TODO (Phase 2): fastapi-mail ile şablonlu e-posta gönder


async def handle_booking_created(data: dict):
    """Rezervasyon onay bildirimi gönder."""
    logger.info(f"🎫 Rezervasyon onayı: booking_id={data.get('booking_id')}")
    # TODO (Phase 2): Bilet PDF oluştur ve e-posta ile gönder


async def handle_payment_completed(data: dict):
    """Ödeme makbuzu gönder."""
    logger.info(f"✅ Ödeme makbuzu: payment_id={data.get('payment_id')}")
    # TODO (Phase 2): Ödeme makbuzu e-postası


async def handle_payment_failed(data: dict):
    """Ödeme hatası bildirimi gönder."""
    logger.info(f"❌ Ödeme hatası: payment_id={data.get('payment_id')}")
    # TODO (Phase 2): Hata bildirimi e-postası


HANDLERS = {
    "user.registered": handle_user_registered,
    "booking.created": handle_booking_created,
    "payment.completed": handle_payment_completed,
    "payment.failed": handle_payment_failed,
}


async def start_kafka_consumer():
    """
    Kafka consumer başlatır. Bu fonksiyon main.py lifespan'ında
    asyncio.create_task() ile çalıştırılacak (Phase 2).
    """
    logger.info(f"📡 Kafka consumer başlatılıyor — topic'ler: {TOPICS}")

    # TODO (Phase 2): Aşağıdaki kodu aktifleştir
    # consumer = AIOKafkaConsumer(
    #     *TOPICS,
    #     bootstrap_servers=settings.kafka_bootstrap_servers,
    #     group_id="notification-service-group",
    #     value_deserializer=lambda m: json.loads(m.decode("utf-8")),
    #     auto_offset_reset="earliest",
    # )
    # await consumer.start()
    # try:
    #     async for msg in consumer:
    #         handler = HANDLERS.get(msg.topic)
    #         if handler:
    #             await handler(msg.value)
    # finally:
    #     await consumer.stop()

    logger.info("⚠️  Kafka consumer Phase 2'de aktifleştirilecek — şimdilik stub modunda.")
