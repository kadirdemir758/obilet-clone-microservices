from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    service_name: str = "trip-service"
    service_port: int = 8003
    
    # Şifreleri ve linkleri buradan sildik, 
    # Pydantic bunları otomatik olarak .env dosyasından çekecek.
    database_url: str 
    redis_url: str
    kafka_bootstrap_servers: str = "kafka:9092"
    secret_key: str
    algorithm: str = "HS256"
    
    allowed_origins: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    debug: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()