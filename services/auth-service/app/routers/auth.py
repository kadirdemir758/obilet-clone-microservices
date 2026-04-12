from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.auth import (
    LoginResponse,
    MeResponse,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()
bearer_scheme = HTTPBearer()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Yeni Kullanıcı Kaydı",
)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Yeni kullanıcı hesabı oluşturur ve JWT token çifti döndürür.

    - **email**: Benzersiz e-posta adresi
    - **password**: En az 8 karakter
    - **full_name**: Ad Soyad
    """
    return await AuthService(db).register(payload)


@router.post(
    "/login",
    response_model=LoginResponse,
    summary="Kullanıcı Girişi",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """
    Kullanıcı girişi yapar ve JWT token çifti + kullanıcı bilgileri döndürür.

    OAuth2 form formatı: `username` = e-posta adresi.
    """
    return await AuthService(db).login(form_data.username, form_data.password)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Token Yenileme",
)
async def refresh_token(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
):
    """Geçerli bir refresh token ile yeni access token alır."""
    return await AuthService(db).refresh(payload.refresh_token)


@router.post(
    "/logout",
    summary="Çıkış Yap",
)
async def logout():
    """
    Kullanıcı çıkışı.

    **Phase 2'de** token Redis blacklist'e eklenerek geçersiz kılınacak.
    Şimdilik client tarafında token silinmeli.
    """
    return {"message": "Başarıyla çıkış yapıldı."}


@router.get(
    "/me",
    response_model=MeResponse,
    summary="Mevcut Kullanıcı Bilgileri",
)
async def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
):
    """Authorization header'daki token ile mevcut kullanıcı bilgilerini döndürür."""
    return await AuthService(db).get_me(credentials.credentials)
