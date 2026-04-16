from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    service_name: str = "payment-service"
    service_port: int = 8005
    
    # Şifreler silindi, .env'den okunacak
    database_url: str 
    redis_url: str 
    kafka_bootstrap_servers: str = "kafka:9092"
    secret_key: str 
    algorithm: str = "HS256"
    
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    debug: bool = True
    
    # Iyzico (Phase 2)
    # API anahtarları silindi, .env'den okunacak
    iyzico_api_key: str 
    iyzico_secret_key: str 
    iyzico_base_url: str = "https://sandbox-api.iyzipay.com"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()