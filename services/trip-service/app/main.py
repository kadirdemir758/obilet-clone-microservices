import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import trips
from app.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Veritabanı tablolarını otomatik oluştur (Neon bağlantısı için kritik)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(
    title="Obilet Trip Service", 
    lifespan=lifespan,
    docs_url="/docs",  # Dökümantasyonun yerini sağlama alalım
    redoc_url=None
)

# ─── 🛡️ CORS AYARLARI (GÜNCELLENDİ) ───
# 'allow_origins' kısmına "*" vermek bazen yetmeyebilir. 
# Hugging Face proxy kullandığı için tüm metodlara açık izin veriyoruz.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"] # Bazı tarayıcıların cevabı okuyabilmesi için eklendi
)

# Router'ı ekliyoruz
app.include_router(trips.router, prefix="/api/v1/trips", tags=["Trips"])

@app.get("/")
async def root():
    return {"message": "Obilet Backend is Running on Hugging Face!", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}