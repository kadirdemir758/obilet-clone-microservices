from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter()


@router.post("/", summary="Bilet Rezervasyonu Yap", status_code=201)
async def create_booking(db: AsyncSession = Depends(get_db)):
    """
    Yeni bilet rezervasyonu oluşturur.

    **Phase 2'de implement edilecek:**
    - Koltuk kilitleme (Redis ile 10 dakika rezervasyon)
    - `bookings` tablosuna kayıt
    - `booking.created` Kafka event'i yayınlama
    - payment-service'e yönlendirme bilgisi döndürme
    """
    return {
        "message": "Booking POST / endpoint — Phase 2'de tamamlanacak",
        "hint": "Koltuk kilitlenecek, Kafka'ya booking.created gönderilecek"
    }


@router.get("/my", summary="Kullanıcının Rezervasyonları")
async def get_my_bookings(db: AsyncSession = Depends(get_db)):
    """
    Mevcut kullanıcının tüm rezervasyonlarını listeler.
    **Phase 2'de implement edilecek.**
    """
    return {"message": "Booking GET /my endpoint — Phase 2'de tamamlanacak", "bookings": []}


@router.get("/{booking_id}", summary="Rezervasyon Detayı")
async def get_booking(booking_id: str, db: AsyncSession = Depends(get_db)):
    """Belirli bir rezervasyonun detaylarını döndürür."""
    return {"message": f"Booking GET /{booking_id} — Phase 2'de tamamlanacak", "booking_id": booking_id}


@router.delete("/{booking_id}", summary="Rezervasyon İptali")
async def cancel_booking(booking_id: str, db: AsyncSession = Depends(get_db)):
    """
    Rezervasyon iptali.
    **Phase 2'de implement edilecek** — iade işlemi payment-service'e Kafka ile bildirilecek.
    """
    return {"message": f"Booking DELETE /{booking_id} — Phase 2'de tamamlanacak"}
