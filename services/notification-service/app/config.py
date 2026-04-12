from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    service_name: str = "notification-service"
    service_port: int = 8006
    database_url: str = "postgresql+asyncpg://obilet:obilet123@postgres:5432/obiletdb"
    redis_url: str = "redis://:redis123@redis:6379/0"
    kafka_bootstrap_servers: str = "kafka:9092"
    secret_key: str = "obilet-super-secret-jwt-key-CHANGE-IN-PRODUCTION-at-least-32-chars"
    algorithm: str = "HS256"
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    debug: bool = True
    # E-posta (Phase 2)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "noreply@obilet.com"
    smtp_password: str = ""
    email_from_name: str = "Obilet"
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
