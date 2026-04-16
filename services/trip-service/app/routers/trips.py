import json
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter()

# ─── 🧠 ŞEHİR MESAFELERİ VE HESAPLAMALAR ───
CITY_DISTANCES = {
    ("İstanbul", "Ankara"): 450, ("İstanbul", "İzmir"): 480, ("İstanbul", "Kütahya"): 330,
    ("İstanbul", "Antalya"): 720, ("İstanbul", "Bursa"): 155, ("İstanbul", "Sakarya"): 150,
    ("İstanbul", "Trabzon"): 1060, ("İstanbul", "Adana"): 930, ("İstanbul", "Gaziantep"): 1140,
    ("İstanbul", "Konya"): 710, ("Ankara", "İzmir"): 590, ("Ankara", "Kütahya"): 315, 
    ("Ankara", "Antalya"): 480, ("Ankara", "Trabzon"): 730, ("Ankara", "Adana"): 490, 
    ("Ankara", "Konya"): 260, ("Ankara", "Bursa"): 385, ("İzmir", "Kütahya"): 340, 
    ("İzmir", "Antalya"): 460, ("İzmir", "Bursa"): 330, ("İzmir", "Adana"): 900,
    ("Kütahya", "Antalya"): 390, ("Kütahya", "Bursa"): 180, ("Kütahya", "Konya"): 320
}

def calculate_duration(origin: str, destination: str) -> dict:
    if (origin == "İstanbul" and destination == "Ankara") or (origin == "Ankara" and destination == "İstanbul"):
        return {"distance_km": 450, "text": "7 Saat 15 Dakika", "total_minutes": 435}

    distance = CITY_DISTANCES.get((origin, destination)) or CITY_DISTANCES.get((destination, origin))
    
    if not distance:
        distance = 300 + ((len(origin) * len(destination)) * 13) % 600

    speed = 85 
    total_hours = distance / speed
    hours = int(total_hours)
    minutes = int((total_hours - hours) * 60)
    return {
        "distance_km": distance,
        "text": f"{hours} Saat {minutes} Dakika" if minutes > 0 else f"{hours} Saat",
        "total_minutes": int((distance / speed) * 60)
    }

def generate_info_text(origin: str, destination: str) -> list:
    base_info = [
        "- Öğrenci yolcularımızın fazla bagajlarından ek ücret alınmamaktadır.",
        "- Belirtilen süreler taşıyıcı firma tarafından iletilmektedir. Kalkış ve varış saatleri tahmini olup sorumluluk firmaya aittir."
    ]
    city_shuttles = {
        "İstanbul": "- İSTANBUL'DAN DUDULLU, ALİBEYKÖY VE ESENLER OTOGARINA ÜCRETSİZ SERVİSLERİMİZ MEVCUTTUR.",
        "Ankara": "- ANKARA AŞTİ OTOGARINDAN KIZILAY VE KEÇİÖREN YÖNÜNE SERVİSLERİMİZ MEVCUTTUR.",
        "İzmir": "- İZMİR OTOGARINDAN BORNOVA VE KONAK YÖNÜNE ÜCRETSİZ SERVİS MEVCUTTUR.",
        "Kütahya": "- DPÜ KAMPÜSÜNDEN OTOGARA ÜCRETSİZ ÖĞRENCİ SERVİSİ VARDIR.",
        "Bursa": "- BURSA TERMİNALİNDEN GÖRÜKLE YÖNÜNE SERVİSİMİZ BULUNMAKTADIR."
    }
    if origin in city_shuttles:
        base_info.insert(1, city_shuttles[origin])
    return base_info

def generate_itinerary(origin: str, destination: str, departure_str: str):
    try:
        time_part = str(departure_str).strip().split()[-1] 
        hh_mm = time_part[:5] 
        dep_time = datetime.strptime(hh_mm, "%H:%M")
    except Exception:
        dep_time = datetime.now()

    if origin == "İstanbul" and destination == "Ankara":
        return [
            {"time": dep_time.strftime("%H:%M"), "station": "Esenler Otogarı"},
            {"time": (dep_time + timedelta(minutes=20)).strftime("%H:%M"), "station": "Alibeyköy Otogarı"},
            {"time": (dep_time + timedelta(minutes=105)).strftime("%H:%M"), "station": "Ataşehir Dudullu Terminali"},
            {"time": (dep_time + timedelta(minutes=135)).strftime("%H:%M"), "station": "Gebze Otogarı"},
            {"time": (dep_time + timedelta(minutes=180)).strftime("%H:%M"), "station": "Kocaeli Otogarı"},
            {"time": (dep_time + timedelta(minutes=210)).strftime("%H:%M"), "station": "Sakarya Otogarı"},
            {"time": (dep_time + timedelta(minutes=360)).strftime("%H:%M"), "station": "Bolu Otogarı"},
            {"time": (dep_time + timedelta(minutes=435)).strftime("%H:%M"), "station": "Ankara (Aşti) Otogarı"}
        ]
    else:
        duration = calculate_duration(origin, destination)
        total_mins = duration["total_minutes"]
        return [
            {"time": dep_time.strftime("%H:%M"), "station": f"{origin} Otogarı"},
            {"time": (dep_time + timedelta(minutes=total_mins // 2)).strftime("%H:%M"), "station": "Dinlenme Tesisleri (Mola)"},
            {"time": (dep_time + timedelta(minutes=total_mins)).strftime("%H:%M"), "station": f"{destination} Otogarı"}
        ]

# ─── 1. SABİT ROTALAR ───
@router.get("/cities", summary="Tüm Şehirleri Listele")
async def get_cities(db: AsyncSession = Depends(get_db)):
    try:
        query = text("SELECT DISTINCT origin FROM trips ORDER BY origin ASC")
        result = await db.execute(query)
        cities = result.scalars().all()
        if not cities:
            return ["İstanbul", "Ankara", "İzmir", "Kütahya", "Antalya", "Bursa", "Sakarya", "Adana", "Trabzon", "Konya", "Gaziantep", "Eskişehir", "Kayseri"]
        return list(cities)
    except Exception:
        return ["İstanbul", "Ankara", "İzmir", "Kütahya", "Antalya"]


# ─── 2. GİZLİ TOHUMLAMA (SEED) MOTORU ───
@router.get("/seed", summary="Veritabanını Rastgele Seferlerle Doldur")
async def seed_database(db: AsyncSession = Depends(get_db)):
    try:
        # ❗ HATAYI ÇÖZEN KISIM: Veritabanı çökse bile rollback ile kendini sıfırlayacak
        try:
            await db.execute(text("DELETE FROM bookings")) 
            await db.execute(text("DELETE FROM trips"))    
            await db.commit()
        except Exception:
            await db.rollback() # İşlemi geri al ve sistemi temizle

        companies_data = [
            ("Kamil Koç", "kamil-koc"), ("Pamukkale Turizm", "pamukkale"),
            ("Metro Turizm", "metro-turizm"), ("Varan Turizm", "varan"),
            ("Ulusoy", "ulusoy"), ("Anadolu Ulaşım", "anadolu-ulasim"),
            ("Kütahyalılar Turizm", "kutahyalilar"), ("Efe Tur", "efe-tur"),
            ("Vib Turizm", "vib-turizm"), ("Nilüfer Turizm", "nilufer"),
            ("Ali Osman Ulusoy", "ali-osman"), ("Süha Turizm", "suha"),
            ("Özkaymak", "ozkaymak"), ("Lüks Karadeniz", "karadeniz"),
            ("Astor Seyahat", "astor")
        ]
        
        res = await db.execute(text("SELECT name FROM companies"))
        existing_names = [row[0] for row in res.fetchall()]
        
        for name, slug in companies_data:
            if name not in existing_names:
                await db.execute(
                    text('INSERT INTO companies (name, "logoUrl") VALUES (:name, :logo)'), 
                    {"name": name, "logo": f"/{slug}.png"}
                )
        await db.commit()
        
        res2 = await db.execute(text("SELECT id, name FROM companies"))
        comp_map = {row[1]: row[0] for row in res2.fetchall()}
        
        cities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Kütahya", "Adana", "Trabzon", "Konya", "Gaziantep", "Eskişehir", "Kayseri"]
        
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        total_inserted = 0
        for day_offset in range(7):
            current_date = today + timedelta(days=day_offset)
            
            for origin in cities:
                for dest in cities:
                    if origin != dest: 
                        for hour in [6, 11, 16, 22]: 
                            minute = random.choice([0, 15, 30, 45])
                            dep_time = current_date + timedelta(hours=hour, minutes=minute)
                            
                            comp_name = random.choice([c[0] for c in companies_data])
                            comp_id = comp_map.get(comp_name, 1)
                            price = random.randint(350, 950) 
                            seats = random.randint(1, 40)    
                            
                            await db.execute(text("""
                                INSERT INTO trips (origin, destination, departure_time, price, available_seats, company_id)
                                VALUES (:o, :d, :dt, :p, :s, :cid)
                            """), {"o": origin, "d": dest, "dt": dep_time, "p": price, "s": seats, "cid": comp_id})
                            total_inserted += 1
                            
        await db.commit()
        return {"message": f"✅ Başarılı! 12 Şehir ve 15 Firma ile tam {total_inserted} yeni sefer oluşturuldu!"}
    except Exception as e:
        await db.rollback()
        return {"error": f"Hata oluştu: {str(e)}"}


# ─── 3. ARAMA ROTALARI ───
@router.get("/search", summary="Sefer Arama")
async def search_trips(
    origin: str = Query(...),
    destination: str = Query(...),
    date: str = Query(None),
    db: AsyncSession = Depends(get_db)
):
    try:
        date_pattern = f"{date}%" if date else "%"
        
        query = text("""
            SELECT t.id, t.origin, t.destination, t.departure_time, t.price, t.available_seats,
                   c.name as company, c."logoUrl" as logoUrl
            FROM trips t
            JOIN companies c ON t.company_id = c.id
            WHERE t.origin = :origin 
              AND t.destination = :destination
              AND CAST(t.departure_time AS TEXT) LIKE :search_date
            ORDER BY t.departure_time ASC
        """)
        
        result = await db.execute(query, {"origin": origin, "destination": destination, "search_date": date_pattern})
        rows = result.fetchall()
        
        duration_info = calculate_duration(origin, destination)
        
        trips_list = []
        for row in rows:
            item = dict(row._mapping)
            trips_list.append({
                "id": int(item["id"]),
                "origin": str(item["origin"]),
                "destination": str(item["destination"]),
                "departure_time": str(item["departure_time"]),
                "price": float(item["price"]),
                "available_seats": int(item["available_seats"]),
                "company": str(item.get("company", "Obilet")),
                "logoUrl": str(item.get("logoUrl", "")),
                "estimatedDuration": duration_info["text"],
                "durationMinutes": duration_info["total_minutes"] 
            })
            
        return trips_list
    except Exception as e:
        print(f"❌ ARAMA HATASI: {e}")
        return []


# ─── 4. DİNAMİK ROTALAR (SEFER DETAYLARI) ───
@router.get("/{trip_id}", summary="Sefer Detayı")
async def get_trip(trip_id: int, db: AsyncSession = Depends(get_db)):
    try:
        query = text("""
            SELECT t.id, t.origin, t.destination, t.departure_time, 
                   t.price, t.available_seats,
                   c.name as company, c."logoUrl" as logoUrl
            FROM trips t
            JOIN companies c ON t.company_id = c.id
            WHERE t.id = :trip_id
        """)
        
        result = await db.execute(query, {"trip_id": trip_id})
        row = result.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Sefer bulunamadı")

        data = dict(row._mapping)
        origin_city = str(data["origin"])
        dest_city = str(data["destination"])
        dep_time_str = str(data["departure_time"])
        
        duration_info = calculate_duration(origin_city, dest_city)
        
        safe_response = {
            "id": int(data["id"]),
            "origin": origin_city,
            "destination": dest_city,
            "departureTime": dep_time_str,
            "price": float(data["price"]) if data["price"] is not None else 0.0,
            "availableSeats": int(data.get("available_seats") or 40),
            "occupiedSeats": [3, 4, 15, 22, 23],
            "company": str(data.get("company", "Obilet Premium")),
            "logoUrl": str(data.get("logoUrl", "")),
            "tripDetails": {
                "infoText": generate_info_text(origin_city, dest_city), 
                "features": ["wifi", "plug", "usb", "phone", "multimedia", "seat"],
                "busType": "Mercedes Travego 2+1",
                "platform": f"Peron {trip_id % 10 + 1}",
                "estimatedDuration": duration_info["text"],
                "distance": f"{duration_info['distance_km']} KM",
                "itinerary": generate_itinerary(origin_city, dest_city, dep_time_str)
            }
        }
        return safe_response
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ DETAY SORGULAMA HATASI: {e}")
        raise HTTPException(status_code=500, detail=str(e))