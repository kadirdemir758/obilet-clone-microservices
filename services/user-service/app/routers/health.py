from fastapi import APIRouter
from app.config import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "ok", "service": settings.service_name, "port": settings.service_port, "version": "1.0.0"}
