FROM python:3.12-slim

LABEL maintainer="Obilet Team"
LABEL service="auth-service"

WORKDIR /app

# Sistem bağımlılıkları (libpq-dev: asyncpg için, curl: healthcheck için)
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Önce requirements — Docker cache optimizasyonu
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY . .

# Güvenlik: root olmayan kullanıcı oluştur
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:${SERVICE_PORT:-8001}/health || exit 1

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${SERVICE_PORT:-8001} --reload"]
