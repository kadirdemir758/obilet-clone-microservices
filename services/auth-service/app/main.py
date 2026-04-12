from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.routers import health, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Uygulama yaşam döngüsü: başlangıç ve kapanış işlemleri."""
    # ── Startup ──────────────────────────────────────────────
    print(f"🚀 {settings.service_name} başlatılıyor — port {settings.service_port}")

    # Tabloları oluştur (Alembic migration yoksa fallback)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    print(f"✅ Veritabanı bağlantısı hazır")

    yield

    # ── Shutdown ─────────────────────────────────────────────
    await engine.dispose()
    print(f"🛑 {settings.service_name} kapatıldı")


# ── FastAPI App ───────────────────────────────────────────────
app = FastAPI(
    title="Obilet Auth Service",
    version="1.0.0",
    description=(
        "**Obilet Mikroservis — Kimlik Doğrulama**\n\n"
        "Kayıt, giriş, token yenileme ve çıkış işlemleri.\n\n"
        "Tüm endpoint'lere API Gateway üzerinden erişin: `http://localhost:8000/api/v1/auth/`"
    ),
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Router Kayıtları ──────────────────────────────────────────
app.include_router(health.router, tags=["Health"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
