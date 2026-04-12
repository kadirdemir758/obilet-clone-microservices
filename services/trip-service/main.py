from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from typing import List

# Veritabanı Bağlantısı
DATABASE_URL = "postgresql://obilet:obilet123@postgres:5432/obiletdb"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Veritabanı Modeli (seed.py ile aynı olmalı)
class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

app = FastAPI(title="Obilet Trip Service")

# Veritabanı Bağlantı Yardımcısı
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "trip-service"}

# --- ASIL İŞİ YAPAN ENDPOINT ---
@app.get("/api/v1/trips/cities")
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(City).order_by(City.name).all()
    # Sadece isimleri liste olarak döndürelim (Frontend için en kolayı)
    return [city.name for city in cities]

@app.get("/")
def root():
    return {"message": "Trip Service is running!"}