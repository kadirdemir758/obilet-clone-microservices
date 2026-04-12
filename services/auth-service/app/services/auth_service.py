from datetime import datetime, timedelta
from typing import Optional

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.user import AuthUser
from app.schemas.auth import (
    LoginResponse,
    MeResponse,
    RegisterRequest,
    TokenResponse,
)

# ── Şifre Hashleme Bağlamı ────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Kimlik doğrulama iş mantığı katmanı."""

    def __init__(self, db: AsyncSession):
        self.db = db

    # ── Yardımcı Metodlar ─────────────────────────────────────

    def _hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def _verify_password(self, plain: str, hashed: str) -> bool:
        return pwd_context.verify(plain, hashed)

    def _create_access_token(self, user_id: str) -> str:
        payload = {
            "sub": user_id,
            "type": "access",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes),
        }
        return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

    def _create_refresh_token(self, user_id: str) -> str:
        payload = {
            "sub": user_id,
            "type": "refresh",
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(days=settings.refresh_token_expire_days),
        }
        return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

    def _build_token_response(self, user_id: str) -> dict:
        return {
            "access_token": self._create_access_token(user_id),
            "refresh_token": self._create_refresh_token(user_id),
            "token_type": "bearer",
            "expires_in": settings.access_token_expire_minutes * 60,
        }

    async def _get_user_by_email(self, email: str) -> Optional[AuthUser]:
        result = await self.db.execute(
            select(AuthUser).where(AuthUser.email == email)
        )
        return result.scalar_one_or_none()

    async def _get_user_by_id(self, user_id: str) -> Optional[AuthUser]:
        result = await self.db.execute(
            select(AuthUser).where(AuthUser.id == user_id)
        )
        return result.scalar_one_or_none()

    # ── Ana İşlemler ──────────────────────────────────────────

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        """Yeni kullanıcı kaydı."""
        # E-posta kontrolü
        if await self._get_user_by_email(payload.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Bu e-posta adresi zaten kayıtlı.",
            )

        user = AuthUser(
            email=payload.email,
            hashed_password=self._hash_password(payload.password),
            full_name=payload.full_name,
            phone=payload.phone,
        )
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)

        # TODO (Phase 2): Kafka'ya user.registered event'i yayınla
        # await kafka_producer.send("user.registered", {"user_id": str(user.id), "email": user.email})

        return TokenResponse(**self._build_token_response(str(user.id)))

    async def login(self, email: str, password: str) -> LoginResponse:
        """Kullanıcı girişi — JWT döndürür."""
        user = await self._get_user_by_email(email)

        if not user or not self._verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="E-posta veya şifre hatalı.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Hesabınız devre dışı bırakılmış. Destek ile iletişime geçin.",
            )

        tokens = self._build_token_response(str(user.id))
        return LoginResponse(
            **tokens,
            user_id=str(user.id),
            email=user.email,
            full_name=user.full_name,
        )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        """Refresh token ile yeni access token al."""
        try:
            payload = jwt.decode(
                refresh_token,
                settings.secret_key,
                algorithms=[settings.algorithm],
            )
            if payload.get("type") != "refresh":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Geçersiz token türü.",
                )
            user_id: str = payload.get("sub")
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Geçersiz veya süresi dolmuş token.",
            )

        # Kullanıcı hâlâ aktif mi?
        user = await self._get_user_by_id(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Kullanıcı bulunamadı veya devre dışı.",
            )

        return TokenResponse(**self._build_token_response(str(user.id)))

    async def get_me(self, token: str) -> MeResponse:
        """Mevcut kullanıcı bilgilerini döndür."""
        try:
            payload = jwt.decode(
                token,
                settings.secret_key,
                algorithms=[settings.algorithm],
            )
            if payload.get("type") != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Access token bekleniyor.",
                )
            user_id: str = payload.get("sub")
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Geçersiz veya süresi dolmuş token.",
            )

        user = await self._get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Kullanıcı bulunamadı.",
            )

        return MeResponse(
            user_id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            is_verified=user.is_verified,
            created_at=user.created_at,
        )
