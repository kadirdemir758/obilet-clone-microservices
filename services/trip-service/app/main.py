from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import sessionmaker, Session, declarative_base, relationship
from typing import List
import os

# Veritabanı Ayarları
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://obilet:obilet123@postgres:5432/obiletdb")
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- MODELLER ---
class City(Base):
    __tablename__ = "cities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    logo_url = Column("logoUrl", String, nullable=True)

class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    origin = Column(String, index=True)
    destination = Column(String, index=True)
    departure_time = Column(DateTime)
    price = Column(Float)
    company_id = Column(Integer, ForeignKey("companies.id"))
    available_seats = Column(Integer, default=40)

Base.metadata.create_all(bind=engine)

app = FastAPI()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ENDPOINT'LER ---

@app.get("/health")
def health():
    return {"status": "ok", "service": "trip-service"}

# Gerçek şehir listesini getiren endpoint
@app.get("/api/v1/trips/cities")
def get_cities(db: Session = Depends(get_db)):
    cities = db.query(City).order_by(City.name).all()
    return [city.name for city in cities]

# Sefer arama endpoint'i
@app.get("/api/v1/trips/search")
def search_trips(origin: str, destination: str, db: Session = Depends(get_db)):
    trips = db.query(Trip).filter(
        Trip.origin == origin, 
        Trip.destination == destination
    ).all()
    return trips