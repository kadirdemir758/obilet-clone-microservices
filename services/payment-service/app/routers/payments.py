from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter()


@router.post("/initiate", summary="Ödeme Başlat", status_code=201)
async def initiate_payment(db: AsyncSession = Depends(get_db)):
    """
    Iyzico ile ödeme başlatır ve ödeme formu URL'si döndürür.

    **Phase 2'de implement edilecek:**
    - Iyzico Python SDK entegrasyonu
    - `payments` tablosuna PENDING kayıt
    - Checkout form token döndürme
    - Her ödeme girişimi loglanacak
    """
    return {
        "message": "Payment POST /initiate endpoint — Phase 2'de tamamlanacak",
        "hint": "Iyzico sandbox ile entegre edilecek"
    }


@router.post("/callback", summary="Iyzico Ödeme Callback")
async def payment_callback(db: AsyncSession = Depends(get_db)):
    """
    Iyzico'dan gelen ödeme sonucu callback'i işler.

    **Phase 2'de implement edilecek:**
    - Token doğrulama
    - Ödeme durumu güncelleme
    - `payment.completed` veya `payment.failed` Kafka event'i yayınlama
    """
    return {"message": "Payment POST /callback endpoint — Phase 2'de tamamlanacak"}


@router.get("/{payment_id}", summary="Ödeme Detayı")
async def get_payment(payment_id: str, db: AsyncSession = Depends(get_db)):
    """Belirli bir ödemenin durumunu ve detaylarını döndürür."""
    return {"message": f"Payment GET /{payment_id} — Phase 2'de tamamlanacak", "payment_id": payment_id}
