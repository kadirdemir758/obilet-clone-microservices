from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # ── Servis Kimliği ────────────────────────────────────────
    service_name: str = "auth-service"
    service_port: int = 8001

    # ── Veritabanı ────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://obilet:obilet123@postgres:5432/obiletdb"

    # ── Redis ─────────────────────────────────────────────────
    redis_url: str = "redis://:redis123@redis:6379/0"

    # ── Kafka ─────────────────────────────────────────────────
    kafka_bootstrap_servers: str = "kafka:9092"

    # ── JWT ───────────────────────────────────────────────────
    secret_key: str = "obilet-super-secret-jwt-key-CHANGE-IN-PRODUCTION-at-least-32-chars"
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
