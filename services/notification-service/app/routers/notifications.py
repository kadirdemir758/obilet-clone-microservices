from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter()


@router.get("/my", summary="Bildirimlerim")
async def get_my_notifications(db: AsyncSession = Depends(get_db)):
    """
    Kullanıcının bildirimlerini listeler.
    **Phase 2'de implement edilecek.**
    """
    return {"message": "Notification GET /my endpoint — Phase 2'de tamamlanacak", "notifications": []}


@router.post("/email/send", summary="E-posta Gönder (Internal)", status_code=201)
async def send_email(db: AsyncSession = Depends(get_db)):
    """
    Dahili servislerden e-posta gönderim isteği alır.
    Bu endpoint sadece diğer mikroservisler tarafından çağrılmalıdır.

    **Phase 2'de implement edilecek:**
    - fastapi-mail ile SMTP entegrasyonu
    - Jinja2 e-posta şablonları
    - Gönderim logları
    """
    return {"message": "Notification POST /email/send — Phase 2'de tamamlanacak"}
