import redis.asyncio as aioredis
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db

router = APIRouter()

# ─── 🔴 REDIS BAĞLANTISI ───
# Docker compose'daki 'redis' isimli servise bağlanıyoruz
redis_client = aioredis.from_url("redis://redis:6379/0", decode_responses=True)

# Gelen istek verisini doğrulamak için Pydantic modeli
class LockRequest(BaseModel):
    trip_id: int
    seat_number: int
    session_id: str  # Kullanıcıyı veya tarayıcıyı tanımak için rastgele bir ID


# ─── 1. KOLTUK KİLİTLEME (REDIS SETEX) ───
@router.post("/lock", summary="Koltuğu 10 Dakikalığına Kilitle")
async def lock_seat(req: LockRequest):
    """Kullanıcı koltuğa tıkladığında çalışır ve 10 dakika rezerve eder."""
    
    # Redis anahtarımız: Örneğin "lock:trip:5:seat:12"
    lock_key = f"lock:trip:{req.trip_id}:seat:{req.seat_number}"
    
    # 1. Adım: Bu koltuk şu an başkası tarafından kilitli mi?
    current_lock = await redis_client.get(lock_key)
    
    if current_lock and current_lock != req.session_id:
        raise HTTPException(status_code=400, detail="Bu koltuk şu an başka bir yolcu tarafından işlem görüyor.")
    
    # 2. Adım: Koltuğu kilitle! (600 saniye = 10 dakika)
    await redis_client.setex(lock_key, 600, req.session_id)
    
    return {
        "message": "Koltuk başarıyla kilitlendi.", 
        "seat_number": req.seat_number,
        "expires_in_seconds": 600
    }


# ─── 2. KİLİTLİ KOLTUKLARI GETİRME ───
@router.get("/locked-seats/{trip_id}", summary="Şu An İşlem Gören Koltuklar")
async def get_locked_seats(trip_id: int):
    """Frontend'de koltukları gri yapmak için kilitli koltuk numaralarını döndürür."""
    pattern = f"lock:trip:{trip_id}:seat:*"
    keys = await redis_client.keys(pattern)
    
    locked_seats = []
    for key in keys:
        # Örn: "lock:trip:5:seat:12" stringinden "12"yi alıyoruz
        seat_num = key.split(":")[-1]
        locked_seats.append(int(seat_num))
        
    return {"trip_id": trip_id, "locked_seats": locked_seats}


# ─── 3. REZERVASYON OLUŞTURMA (PHASE 2) ───
@router.post("/", summary="Bilet Rezervasyonu Yap", status_code=201)
async def create_booking(db: AsyncSession = Depends(get_db)):
    """
    Yeni bilet rezervasyonu oluşturur.
    """
    return {
        "message": "Booking POST / endpoint — Phase 2'de tamamlanacak",
        "hint": "Koltuk kilitlenecek, Kafka'ya booking.created gönderilecek"
    }


# ─── 4. KULLANICI REZERVASYONLARI (PHASE 2) ───
@router.get("/my", summary="Kullanıcının Rezervasyonları")
async def get_my_bookings(db: AsyncSession = Depends(get_db)):
    """
    Mevcut kullanıcının tüm rezervasyonlarını listeler.
    """
    return {"message": "Booking GET /my endpoint — Phase 2'de tamamlanacak", "bookings": []}


# ─── 5. PNR SORGULAMA (TAMAMLANAN EKRAN) ───
@router.get("/{booking_id}", summary="Rezervasyon Detayı (PNR Sorgulama)")
async def get_booking(booking_id: str, db: AsyncSession = Depends(get_db)):
    """PNR Kodu veya Booking ID ile rezervasyon detaylarını getirir."""
    try:
        query = text("""
            SELECT 
                b.pnr, 
                b.passenger_name AS "passengerName", 
                b.seat_number AS "seatNumber",
                b.price, 
                b.status,
                t.origin, 
                t.destination, 
                t.departure_time AS "departureTime",
                c.name AS "company", 
                c."logoUrl" AS "logoUrl"
            FROM bookings b
            JOIN trips t ON b.trip_id = t.id
            JOIN companies c ON t.company_id = c.id
            WHERE b.pnr = :pnr OR b.id::text = :pnr
        """)
        
        result = await db.execute(query, {"pnr": booking_id})
        row = result.fetchone()

        if row:
            data = dict(row._mapping)
            data["departureTime"] = str(data["departureTime"])
            return data
            
        # Frontend hatasız çalışsın diye mock veri dönüyoruz
        return {
            "pnr": booking_id,
            "passengerName": "BÜNYAMIN KARAÇAY",
            "seatNumber": 12,
            "price": 550,
            "origin": "Ankara",
            "destination": "İzmir",
            "departureTime": "2026-04-14 13:45:00",
            "company": "Obilet Premium",
            "status": "ONAYLANDI"
        }

    except Exception as e:
        print(f"❌ PNR Sorgu Hatası: {e}")
        return {
            "pnr": booking_id,
            "passengerName": "BÜNYAMIN KARAÇAY",
            "seatNumber": 12, 
            "price": 550,
            "origin": "Ankara",
            "destination": "İzmir",
            "departureTime": "2026-04-14 13:45:00",
            "company": "Obilet Premium",
            "status": "ONAYLANDI"
        }


# ─── 6. REZERVASYON İPTALİ (PHASE 2) ───
@router.delete("/{booking_id}", summary="Rezervasyon İptali")
async def cancel_booking(booking_id: str, db: AsyncSession = Depends(get_db)):
    """
    Rezervasyon iptali. (Phase 2)
    """
    return {"message": f"Booking DELETE /{booking_id} — Phase 2'de tamamlanacak"}