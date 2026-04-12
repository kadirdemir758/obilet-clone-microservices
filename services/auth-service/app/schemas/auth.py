from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# ── İstek Şemaları ────────────────────────────────────────────

class RegisterRequest(BaseModel):
    """Yeni kullanıcı kaydı isteği."""
    email: EmailStr = Field(..., examples=["ali@example.com"])
    password: str = Field(..., min_length=8, examples=["Gizli123!"])
    full_name: str = Field(..., min_length=2, max_length=100, examples=["Ali Veli"])
    phone: Optional[str] = Field(None, examples=["+905551234567"])


class LoginRequest(BaseModel):
    """Giriş isteği."""
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Token yenileme isteği."""
    refresh_token: str


# ── Yanıt Şemaları ────────────────────────────────────────────

class TokenResponse(BaseModel):
    """JWT token çifti yanıtı."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Access token süresi (saniye)")


class LoginResponse(BaseModel):
    """Giriş yanıtı — token + kullanıcı bilgileri."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user_id: str
    email: str
    full_name: str


class MeResponse(BaseModel):
    """Mevcut kullanıcı bilgileri."""
    user_id: str
    email: str
    full_name: str
    is_verified: bool
    created_at: datetime
