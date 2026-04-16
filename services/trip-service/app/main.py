import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import trips
from app.database import engine, Base

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()

app = FastAPI(title="Obilet Trip Service", lifespan=lifespan)

# ─── 🚀 KESİN ÇÖZÜM: CORS BURADA VE HERKESE AÇIK ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Herkese izin ver (Zaman daraldı, güvenlik ikinci planda)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(trips.router, prefix="/api/v1/trips", tags=["Trips"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}