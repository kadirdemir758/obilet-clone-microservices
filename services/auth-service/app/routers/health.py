from fastapi import APIRouter
from app.config import settings

router = APIRouter()


@router.get("/health", summary="Servis Sağlık Kontrolü")
async def health_check():
    """Bu servisin çalışıp çalışmadığını kontrol eder."""
    return {
        "status": "ok",
        "service": settings.service_name,
        "port": settings.service_port,
        "version": "1.0.0",
    }
