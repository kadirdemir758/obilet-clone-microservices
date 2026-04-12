from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    service_name: str = "payment-service"
    service_port: int = 8005
    database_url: str = "postgresql+asyncpg://obilet:obilet123@postgres:5432/obiletdb"
    redis_url: str = "redis://:redis123@redis:6379/0"
    kafka_bootstrap_servers: str = "kafka:9092"
    secret_key: str = "obilet-super-secret-jwt-key-CHANGE-IN-PRODUCTION-at-least-32-chars"
    algorithm: str = "HS256"
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    debug: bool = True
    # Iyzico (Phase 2)
    iyzico_api_key: str = "sandbox-api-key"
    iyzico_secret_key: str = "sandbox-secret-key"
    iyzico_base_url: str = "https://sandbox-api.iyzipay.com"
    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
