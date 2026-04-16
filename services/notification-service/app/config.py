from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    service_name: str = "notification-service"
    service_port: int = 8006
    
    # Şifreler silindi, .env'den okunacak
    database_url: str 
    redis_url: str 
    kafka_bootstrap_servers: str = "kafka:9092"
    secret_key: str 
    algorithm: str = "HS256"
    
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    debug: bool = True
    
    # E-posta (Phase 2)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    
    # E-posta kullanıcı adı ve şifresi .env'den okunacak
    smtp_user: str 
    smtp_password: str 
    email_from_name: str = "Obilet"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()