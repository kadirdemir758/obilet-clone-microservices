from typing import Optional
from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter()


@router.get("/search", summary="Sefer Arama")
async def search_trips(
    origin: str = Query(..., description="Kalkış şehri", example="İstanbul"),
    destination: str = Query(..., description="Varış şehri", example="Ankara"),
    date: str = Query(..., description="Yolculuk tarihi (YYYY-MM-DD)", example="2026-05-01"),
    sort_by: Optional[str] = Query("departure_time", description="Sıralama: price | departure_time"),
    db: AsyncSession = Depends(get_db),
):
    """
    Şehirler arası otobüs seferlerini arar ve listeler.

    **Phase 2'de implement edilecek:**
    - `trip_routes` tablosundan SQLAlchemy ile sorgulama
    - Redis cache (5 dakika TTL)
    - Fiyat ve saat sıralaması
    - Şehir fuzzy search (pg_trgm)
    - Old Node backend'den 81 il ve şirket verisi migrate edilecek
    """
    return {
        "message": "Trip /search endpoint — Phase 2'de tamamlanacak",
        "params": {
            "origin": origin,
            "destination": destination,
            "date": date,
            "sort_by": sort_by,
        },
        "trips": []
    }


@router.get("/companies", summary="Otobüs Şirketleri")
async def list_companies(db: AsyncSession = Depends(get_db)):
    """
    Tüm otobüs şirketlerini listeler.
    **Phase 2'de implement edilecek** — old-node-backend'deki şirket listesi buraya taşınacak.
    """
    return {"message": "Trip /companies endpoint — Phase 2'de tamamlanacak", "companies": []}


@router.get("/{trip_id}", summary="Sefer Detayı")
async def get_trip(trip_id: str, db: AsyncSession = Depends(get_db)):
    """
    Belirli bir seferin detayları ve müsait koltukları.
    **Phase 2'de implement edilecek.**
    """
    return {
        "message": f"Trip GET /{trip_id} endpoint — Phase 2'de tamamlanacak",
        "trip_id": trip_id
    }
