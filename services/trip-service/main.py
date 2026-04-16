import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy.orm import declarative_base

# Kendi dosyalarımızdan import ediyoruz
from app.routers import trips
from app.database import engine, Base

# --- 🚀 Modern Lifespan Yapısı ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # [STARTUP]: Uygulama Başlarken Çalışır
    print("🚀 Trip Service (Async) başlatılıyor...")
    try:
        # Tabloları asenkron olarak oluşturuyoruz (run_sync hatasını çözen kısım)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ VERİTABANI: Tablolar başarıyla oluşturuldu/kontrol edildi.")
    except Exception as e:
        print(f"❌ VERİTABANI HATASI: {e}")
    
    yield  # Uygulama burada çalışmaya devam eder
    
    # [SHUTDOWN]: Uygulama Kapanırken Çalışır
    print("🛑 SİSTEM: Veritabanı bağlantıları kapatılıyor...")
    await engine.dispose()

# --- 🏗️ FastAPI Uygulama Tanımı ---
app = FastAPI(
    title="Obilet Trip Service",
    description="Redis ve Kafka Entegrasyonlu Asenkron Sefer Mikroservisi",
    version="2.1.0",
    lifespan=lifespan
)

# --- 🌍 CORS Ayarları (Frontend bağlantısı için çok önemli) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Geliştirme aşamasında her yere izin veriyoruz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 🛣️ Rotaları Bağlama ---
# trips.py içindeki tüm endpoint'leri (Arama, Detay, Şehirler) buraya bağlıyoruz.
# Artık /cities için main.py'ye kod yazmamıza gerek yok, router halledecek.
app.include_router(
    trips.router, 
    prefix="/api/v1/trips", 
    tags=["Trips"]
)

# --- 🩺 Sistem Sağlık Kontrolü ---
@app.get("/health", tags=["System"])import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

# Kendi dosyalarımızdan importlar
from app.routers import trips
from app.database import engine, Base

# --- 🚀 Modern Lifespan Yapısı ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # [STARTUP]: Uygulama Başlarken Çalışır
    print("🚀 Trip Service (Async) başlatılıyor...")
    try:
        # Tabloları asenkron olarak oluşturuyoruz (run_sync hatasını çözen kısım)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ VERİTABANI: Tablolar başarıyla oluşturuldu/kontrol edildi.")
    except Exception as e:
        print(f"❌ VERİTABANI HATASI: {e}")
    
    yield  # Uygulama burada çalışmaya devam eder
    
    # [SHUTDOWN]: Uygulama Kapanırken Çalışır
    print("🛑 SİSTEM: Veritabanı bağlantıları kapatılıyor...")
    await engine.dispose()

# --- 🏗️ FastAPI Uygulama Tanımı ---
app = FastAPI(
    title="Obilet Trip Service",
    description="Redis ve Kafka Entegrasyonlu Asenkron Sefer Mikroservisi",
    version="2.2.0",
    lifespan=lifespan
)

# --- 🌍 CORS Ayarları (Çakışmayı Önlemek İçin Güncellendi) ---
# 'Multiple values' hatasını çözmek için "*" yerine direkt localhost:3000 yazıyoruz.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# --- 🛣️ Rotaları Bağlama ---
app.include_router(
    trips.router, 
    prefix="/api/v1/trips", 
    tags=["Trips"]
)

# --- 🩺 Sistem Sağlık Kontrolü ---
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy", 
        "service": "trip-service",
        "mode": "asynchronous"
    }

@app.get("/", tags=["System"])
async def root():
    return {"message": "Obilet Trip Service is running on Async Engine!"}
async def health_check():
    return {
        "status": "healthy", 
        "service": "trip-service",
        "mode": "asynchronous",
        "database": "connected"
    }

@app.get("/", tags=["System"])
async def root():
    return {"message": "Obilet Trip Service is running on Async Engine!"}