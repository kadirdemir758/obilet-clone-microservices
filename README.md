# 🚌 Obilet Clone — Otobüs Bileti Rezervasyon Sistemi

Türkiye'nin önde gelen otobüs firmalarını listeleyen, gerçek koltuk seçimi, TCKN doğrulama ve Iyzico ödeme entegrasyonu içeren modern bir otobüs bileti rezervasyon uygulaması.

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| Frontend | Next.js 14 (App Router) |
| Backend | Node.js + Express.js |
| Veritabanı | PostgreSQL + Prisma ORM |
| Ödeme | Iyzico |
| Container | Docker + Docker Compose |

## ✨ Özellikler

- 🏢 **Gerçek Firmalar**: Kamil Koç, Pamukkale, Metro Turizm, Ali Osman Ulusoy
- 💺 **Dinamik Koltuk Seçimi**: 2+1 görsel otobüs düzeni
- ⚧ **Cinsiyet Kuralı**: Yabancı kadın-erkek yan yana oturamaz
- 🪪 **TCKN Doğrulama**: Gerçek algoritmik doğrulama
- 💳 **Iyzico Ödeme**: 3D Secure kredi kartı entegrasyonu

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Node.js v18+
- Docker Desktop
- Git

### Kurulum

```bash
# 1. Repository'yi klonla
git clone <repo-url>
cd obilet

# 2. Docker ile veritabanını başlat
docker-compose up -d

# 3. Backend kurulumu
cd backend
cp .env.example .env
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# 4. Frontend kurulumu (yeni terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### Erişim

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| pgAdmin | http://localhost:5050 |

## 📁 Proje Yapısı

```
obilet/
├── docker-compose.yml      # PostgreSQL + pgAdmin
├── backend/                # Node.js + Express API
│   ├── prisma/             # Veritabanı şemaları
│   └── src/                # Kaynak kodlar
└── frontend/               # Next.js 14 uygulaması
```

## 🔑 Çevre Değişkenleri

Backend `.env` dosyası:
```
DATABASE_URL="postgresql://obilet:obilet123@localhost:5432/obiletdb"
PORT=5000
IYZICO_API_KEY=your_api_key_here
IYZICO_SECRET_KEY=your_secret_key_here
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

## 📜 Lisans

MIT
