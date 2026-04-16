# 🚌 Obilet Clone — Mikroservis Mimarili Bilet Rezervasyon Sistemi

Bu proje, modern web teknolojileri ve mikroservis mimarisi kullanılarak geliştirilmiş kapsamlı bir otobüs bileti rezervasyon platformudur. Kullanıcılar sefer arayabilir, yapay zeka asistanı ile etkileşime geçebilir ve koltuk seçimi yaparak bilet satın alma süreçlerini simüle edebilirler.

## 🚀 Öne Çıkan Özellikler

- **🤖 Yapay Zeka Entegreli Asistan:** Doğal dil işleme ile bilet arama ve kullanıcı desteği.
- **🏗️ Mikroservis Mimarisi:** FastAPI ile güçlendirilmiş bağımsız servis yapıları.
- **⚡ Modern Frontend:** Next.js (App Router) ile hızlı ve SEO uyumlu kullanıcı arayüzü.
- **🐳 Dockerize Yapı:** Tüm sistem tek bir komutla (`docker-compose up`) ayağa kalkar.
- **🎫 Dinamik Bilet Sorgulama:** PNR tabanlı dinamik bilet görüntüleme ve doğrulama simülasyonu.

## 🛠️ Teknolojik Yığın (Tech Stack)

| Katman | Teknoloji |
| :--- | :--- |
| **Frontend** | React, Next.js 14, Tailwind CSS |
| **Backend** | Python, FastAPI |
| **Veritabanı** | PostgreSQL, SQLAlchemy (Async) |
| **Konteynerizasyon** | Docker, Docker Compose |
| **Yapay Zeka** | Google Gemini API Entegrasyonu |

## 📐 Sistem Mimarisi

Sistem, istemci taleplerini karşılayan bir **API Gateway** ve bilet işlemlerini yöneten **Trip Service** olmak üzere modüler bir yapıdadır. Tüm servisler Docker ağında birbirleriyle izole ve güvenli bir şekilde iletişim kurar.

[Buraya Proje Ekran Görüntülerinden Birini Ekleyebilirsin: ![Ana Sayfa](./screenshots/home.png)]

## ⚙️ Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için Docker'ın yüklü olması yeterlidir:

1. Depoyu klonlayın: `git clone https://github.com/kadir/obilet-clone.git`
2. Proje dizinine gidin: `cd obilet-clone`
3. Sistemi başlatın: `docker-compose up --build`
4. Tarayıcıda açın: `http://localhost:3000`

---
*Bu proje Kütahya Dumlupınar Üniversitesi (DPÜ) Yazılım Mühendisliği 1. Sınıf projesi kapsamında geliştirilmiştir.*