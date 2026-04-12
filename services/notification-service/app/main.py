from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import health, notifications


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 {settings.service_name} başlatılıyor — port {settings.service_port}")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Veritabanı bağlantısı hazır")

    # TODO (Phase 2): Kafka consumer'ı başlat
    # asyncio.create_task(start_kafka_consumer())
    yield

    await engine.dispose()
    print(f"🛑 {settings.service_name} kapatıldı")


app = FastAPI(
    title="Obilet Notification Service",
    version="1.0.0",
    description=(
        "**Obilet Mikroservis — Bildirim Servisi**\n\n"
        "E-posta, SMS bildirimlerini yönetir. "
        "Kafka'dan şu event'leri dinler:\n"
        "- `user.registered` → Hoşgeldin e-postası\n"
        "- `booking.created` → Rezervasyon onayı\n"
        "- `payment.completed` → Ödeme makbuzu\n"
        "- `payment.failed` → Ödeme hatası"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])
