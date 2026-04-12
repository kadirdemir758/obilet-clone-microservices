import os
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, ForeignKey, text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime, timedelta

# Veritabanı Bağlantısı
DATABASE_URL = "postgresql://obilet:obilet123@postgres:5432/obiletdb"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Modeller
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

def seed_data():
    db = SessionLocal()
    try:
        print("🧹 Mevcut veriler temizleniyor (CASCADE)...")
        db.execute(text("DROP TABLE IF EXISTS trips CASCADE;"))
        db.execute(text("DROP TABLE IF EXISTS cities CASCADE;"))
        db.execute(text("DROP TABLE IF EXISTS companies CASCADE;"))
        db.commit()

        print("⏳ Tablolar yeniden oluşturuluyor...")
        Base.metadata.create_all(bind=engine)

        # 🏙️ Şehirleri Ekle
        cities = ["Kütahya", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya"]
        for c in cities:
            db.add(City(name=c))
        
        # 🚌 Firmaları Ekle
        companies = [
            Company(name="Kamil Koç", logo_url="/logos/kamilkoc.png"),
            Company(name="Pamukkale Turizm", logo_url="/logos/pamukkale.png"),
            Company(name="Metro Turizm", logo_url="/logos/metro.png")
        ]
        db.add_all(companies)
        db.commit()

        # Eklenen firmaların ID'lerini alalım
        comp_ids = [c.id for c in db.query(Company).all()]

        print("🎫 Seferler (Trips) oluşturuluyor...")
        
        # Bugün ve Yarın için örnek seferler
        now = datetime.now()
        sample_trips = [
            # Kütahya -> İstanbul
            Trip(origin="Kütahya", destination="İstanbul", departure_time=now + timedelta(hours=2), price=450.0, company_id=comp_ids[0]),
            Trip(origin="Kütahya", destination="İstanbul", departure_time=now + timedelta(hours=5), price=480.0, company_id=comp_ids[1]),
            Trip(origin="Kütahya", destination="İstanbul", departure_time=now + timedelta(days=1, hours=1), price=400.0, available_seats=22, company_id=comp_ids[0]), # Yeni
            
            # Ankara -> İzmir
            Trip(origin="Ankara", destination="İzmir", departure_time=now + timedelta(days=1, hours=3), price=600.0, company_id=comp_ids[2]),
            
            # İstanbul -> Ankara
            Trip(origin="İstanbul", destination="Ankara", departure_time=now + timedelta(hours=8), price=550.0, company_id=comp_ids[0]),
            
            # Antalya -> Ankara (Yeni)
            Trip(origin="Antalya", destination="Ankara", departure_time=now + timedelta(hours=14), price=650.0, available_seats=15, company_id=comp_ids[1]),
            
            # Bursa -> İzmir (Yeni)
            Trip(origin="Bursa", destination="İzmir", departure_time=now + timedelta(days=1, hours=6), price=380.0, available_seats=4, company_id=comp_ids[2])
        ]
        
        db.add_all(sample_trips)
        db.commit()
        print("✅ KUSURSUZ: Şehirler, Firmalar ve Seferler veritabanına işlendi! 🚀")

    except Exception as e:
        db.rollback()
        print(f"❌ Hata: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()