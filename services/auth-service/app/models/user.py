import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base


class AuthUser(Base):
    """
    auth_users tablosu — Kimlik doğrulama için kullanıcı bilgileri.

    Not: Kullanıcı profil bilgileri (adres, tercihler vb.)
    user-service'deki user_profiles tablosunda tutulur.
    """

    __tablename__ = "auth_users"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Benzersiz kullanıcı kimliği",
    )
    email = Column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
        comment="E-posta adresi (login için)",
    )
    hashed_password = Column(
        String(255),
        nullable=False,
        comment="bcrypt ile hashlenmiş şifre",
    )
    full_name = Column(
        String(100),
        nullable=False,
        comment="Ad Soyad",
    )
    phone = Column(
        String(20),
        nullable=True,
        comment="Telefon numarası",
    )
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
        comment="Hesap aktif mi?",
    )
    is_verified = Column(
        Boolean,
        default=False,
        nullable=False,
        comment="E-posta doğrulandı mı?",
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<AuthUser id={self.id} email={self.email}>"
