from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter()


@router.get("/profile", summary="Kullanıcı Profilini Getir")
async def get_profile(db: AsyncSession = Depends(get_db)):
    """
    Mevcut kullanıcının profil bilgilerini döndürür.
    Auth header'daki JWT token doğrulanarak user_id alınır.

    **Phase 2'de implement edilecek:**
    - JWT token doğrulama dependency'si eklenecek
    - user_profiles tablosundan veri çekilecek
    """
    return {
        "message": "User /profile endpoint — Phase 2'de tamamlanacak",
        "hint": "JWT token'dan user_id alınarak user_profiles tablosu sorgulanacak"
    }


@router.put("/profile", summary="Kullanıcı Profilini Güncelle")
async def update_profile(db: AsyncSession = Depends(get_db)):
    """
    Kullanıcı profil bilgilerini günceller.
    **Phase 2'de implement edilecek.**
    """
    return {"message": "User PUT /profile endpoint — Phase 2'de tamamlanacak"}


@router.get("/{user_id}", summary="Kullanıcı Bilgisini ID ile Getir")
async def get_user_by_id(user_id: str, db: AsyncSession = Depends(get_db)):
    """
    ID'ye göre kullanıcı bilgisi döndürür (internal servis iletişimi için).
    **Phase 2'de implement edilecek.**
    """
    return {
        "message": f"User GET /{user_id} endpoint — Phase 2'de tamamlanacak",
        "user_id": user_id
    }
