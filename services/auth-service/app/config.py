from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ── Servis Kimliği ────────────────────────────────────────
    service_name: str = "auth-service"
    service_port: int = 8001

    # ── Veritabanı ────────────────────────────────────────────
    # Şifreler silindi, .env'den okunacak
    database_url: str 

    # ── Redis ─────────────────────────────────────────────────
    # Şifreler silindi, .env'den okunacak
    redis_url: str 

    # ── Kafka ─────────────────────────────────────────────────
    kafka_bootstrap_servers: str = "kafka:9092"

    # ── JWT ───────────────────────────────────────────────────
    # Gizli anahtar silindi, .env'den okunacak
    secret_key: str 
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # ── CORS ──────────────────────────────────────────────────
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]

    # ── Uygulama ──────────────────────────────────────────────
    debug: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()