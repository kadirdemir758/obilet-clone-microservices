from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.routers import health, payments


@asynccontextmanager
async def lifespan(app: FastAPI):
    print(f"🚀 {settings.service_name} başlatılıyor — port {settings.service_port}")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Veritabanı bağlantısı hazır")
    yield
    await engine.dispose()
    print(f"🛑 {settings.service_name} kapatıldı")


app = FastAPI(
    title="Obilet Payment Service",
    version="1.0.0",
    description=(
        "**Obilet Mikroservis — Ödeme İşlemleri**\n\n"
        "Iyzico entegrasyonu ile ödeme başlatma, doğrulama ve iade. "
        "Kafka ile booking-service'e ödeme sonuçlarını bildirir."
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
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
