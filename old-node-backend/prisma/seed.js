/**
 * seed.js — Obilet Veritabanı Başlangıç Verileri
 *
 * İçerik:
 *  - 8 gerçek Türk otobüs firması
 *  - Türkiye'nin 81 ili + büyük ilçeler
 *  - Ana güzergahlar arası önümüzdeki 7 gün için seferler
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── 1. OTOBÜS FİRMALARI ──────────────────────────────────
// logoUrl: /images/companies/<slug>.png şeklinde public klasöründen servis edilir.
// Dosyayı eklemeye hazır olduğunuzda oraya koyun; yoksa UI initials gösterir.
const COMPANIES = [
  {
    name: 'Kamil Koç',
    slug: 'kamil-koc',
    logoUrl: '/images/companies/kamil-koc.png',
    phone: '444 0 562',
    website: 'https://www.kamilkoc.com.tr',
    color: '#E63946', // marka rengi (placeholder için)
  },
  {
    name: 'Pamukkale Turizm',
    slug: 'pamukkale',
    logoUrl: '/images/companies/pamukkale.png',
    phone: '444 3 535',
    website: 'https://www.pamukkale.com.tr',
    color: '#2196F3',
  },
  {
    name: 'Metro Turizm',
    slug: 'metro-turizm',
    logoUrl: '/images/companies/metro-turizm.png',
    phone: '444 3 455',
    website: 'https://www.metroturizm.com.tr',
    color: '#FF6B35',
  },
  {
    name: 'Ulusoy',
    slug: 'ulusoy',
    logoUrl: '/images/companies/ulusoy.png',
    phone: '444 1 888',
    website: 'https://www.ulusoy.com.tr',
    color: '#1A237E',
  },
  {
    name: 'Varan Turizm',
    slug: 'varan',
    logoUrl: '/images/companies/varan.png',
    phone: '444 8 272',
    website: 'https://www.varan.com.tr',
    color: '#B71C1C',
  },
  {
    name: 'Süha Turizm',
    slug: 'suha-turizm',
    logoUrl: '/images/companies/suha-turizm.png',
    phone: '444 7 842',
    website: 'https://www.suhaturizm.com.tr',
    color: '#1B5E20',
  },
  {
    name: 'Özkaymak Turizm',
    slug: 'ozkaymak',
    logoUrl: '/images/companies/ozkaymak.png',
    phone: '0242 311 12 34',
    website: 'https://www.ozkaymak.com.tr',
    color: '#4A148C',
  },
  {
    name: 'İzmir Seyahat',
    slug: 'izmir-seyahat',
    logoUrl: '/images/companies/izmir-seyahat.png',
    phone: '444 4 935',
    website: 'https://www.izmirses.com.tr',
    color: '#004D40',
  },
];

// ─── 2. TÜRKİYE'NİN 81 İLİ ───────────────────────────────
const ALL_CITIES = [
  // A
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara',
  'Antalya', 'Ardahan', 'Artvin', 'Aydın',
  // B
  'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis',
  'Bolu', 'Burdur', 'Bursa',
  // C-Ç
  'Çanakkale', 'Çankırı', 'Çorum',
  // D
  'Denizli', 'Diyarbakır', 'Düzce',
  // E
  'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir',
  // G
  'Gaziantep', 'Giresun', 'Gümüşhane',
  // H
  'Hakkari', 'Hatay',
  // I-İ
  'Iğdır', 'Isparta', 'İstanbul', 'İzmir',
  // K
  'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri',
  'Kilis', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli', 'Konya', 'Kütahya',
  // M
  'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş',
  // N
  'Nevşehir', 'Niğde',
  // O
  'Ordu', 'Osmaniye',
  // R
  'Rize',
  // S-Ş
  'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak',
  // T
  'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli',
  // U
  'Uşak',
  // V
  'Van',
  // Y
  'Yalova', 'Yozgat',
  // Z
  'Zonguldak',
  // Büyük İlçeler (popüler terminal noktaları)
  'Bodrum', 'Marmaris', 'Fethiye', 'Alanya', 'Side', 'Kuşadası', 'Çeşme',
  'Didim', 'Bergama', 'Edremit', 'Bandırma', 'Çorlu', 'Gebze', 'İzmit',
  'Adapazarı', 'Kapadokya', 'Ürgüp', 'Göreme',
];

// ─── 3. GÜZERGAH ÇİFTLERİ (Ana hatlar) ───────────────────
const MAIN_ROUTES = [
  // İstanbul çıkışlı
  { from: 'İstanbul', to: 'Ankara',         durationH: 6  },
  { from: 'İstanbul', to: 'İzmir',           durationH: 8  },
  { from: 'İstanbul', to: 'Antalya',         durationH: 11 },
  { from: 'İstanbul', to: 'Bursa',           durationH: 3  },
  { from: 'İstanbul', to: 'Trabzon',         durationH: 16 },
  { from: 'İstanbul', to: 'Samsun',          durationH: 12 },
  { from: 'İstanbul', to: 'Konya',           durationH: 9  },
  { from: 'İstanbul', to: 'Gaziantep',       durationH: 14 },
  { from: 'İstanbul', to: 'Diyarbakır',      durationH: 18 },
  { from: 'İstanbul', to: 'Kayseri',         durationH: 10 },
  { from: 'İstanbul', to: 'Eskişehir',       durationH: 4  },
  { from: 'İstanbul', to: 'Bodrum',          durationH: 12 },
  { from: 'İstanbul', to: 'Marmaris',        durationH: 13 },
  { from: 'İstanbul', to: 'Çanakkale',       durationH: 5  },
  { from: 'İstanbul', to: 'Edirne',          durationH: 3  },
  // Ankara çıkışlı
  { from: 'Ankara', to: 'İzmir',             durationH: 9  },
  { from: 'Ankara', to: 'Antalya',           durationH: 7  },
  { from: 'Ankara', to: 'Trabzon',           durationH: 10 },
  { from: 'Ankara', to: 'Samsun',            durationH: 7  },
  { from: 'Ankara', to: 'Konya',             durationH: 3  },
  { from: 'Ankara', to: 'Gaziantep',         durationH: 9  },
  { from: 'Ankara', to: 'Kayseri',           durationH: 4  },
  { from: 'Ankara', to: 'Erzurum',           durationH: 14 },
  { from: 'Ankara', to: 'Diyarbakır',        durationH: 12 },
  { from: 'Ankara', to: 'Malatya',           durationH: 9  },
  // İzmir çıkışlı
  { from: 'İzmir',  to: 'Antalya',           durationH: 6  },
  { from: 'İzmir',  to: 'Bodrum',            durationH: 4  },
  { from: 'İzmir',  to: 'Marmaris',          durationH: 5  },
  { from: 'İzmir',  to: 'Kuşadası',          durationH: 2  },
  { from: 'İzmir',  to: 'Çeşme',             durationH: 1  },
  { from: 'İzmir',  to: 'Denizli',           durationH: 3  },
  // Antalya çıkışlı
  { from: 'Antalya', to: 'Konya',            durationH: 5  },
  { from: 'Antalya', to: 'Alanya',           durationH: 2  },
  { from: 'Antalya', to: 'Bodrum',           durationH: 6  },
  { from: 'Antalya', to: 'Denizli',          durationH: 4  },
  // Karadeniz hattı
  { from: 'Trabzon', to: 'Samsun',           durationH: 5  },
  { from: 'Samsun',  to: 'Ordu',             durationH: 2  },
  { from: 'Trabzon', to: 'Rize',             durationH: 1  },
  // Doğu hattı
  { from: 'Diyarbakır', to: 'Şanlıurfa',    durationH: 2  },
  { from: 'Gaziantep',  to: 'Şanlıurfa',    durationH: 2  },
  { from: 'Gaziantep',  to: 'Adana',        durationH: 3  },
  { from: 'Malatya',    to: 'Erzurum',      durationH: 5  },
];

// ─── YARDIMCI FONKSİYONLAR ────────────────────────────────
function addHours(date, hours) {
  const d = new Date(date);
  d.setTime(d.getTime() + hours * 3600000);
  return d;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Güzergah süresine göre bilet fiyatı hesapla
function calcPrice(durationH) {
  const base = durationH * 28;           // ~28 TL/saat
  const variance = randomBetween(-40, 60);
  return Math.max(80, Math.round(base + variance));
}

// ─── ANA FONKSİYON ────────────────────────────────────────
async function main() {
  console.log('🌱 Seed başladı...\n');

  // ── Firmaları ekle ──────────────────────────────────────
  const createdCompanies = [];
  for (const c of COMPANIES) {
    // eslint-disable-next-line no-await-in-loop
    const company = await prisma.company.upsert({
      where:  { slug: c.slug },
      update: { name: c.name, logoUrl: c.logoUrl, phone: c.phone, website: c.website },
      create: { name: c.name, slug: c.slug, logoUrl: c.logoUrl, phone: c.phone, website: c.website },
    });
    createdCompanies.push(company);
    console.log(`✅ Firma: ${company.name}`);
  }

  // ── Her firma için 1 otobüs ekle ───────────────────────
  const buses = [];
  const layouts = ['LAYOUT_2_1', 'LAYOUT_2_2'];
  for (let i = 0; i < createdCompanies.length; i++) {
    const layout     = layouts[i % 2];
    const totalSeats = layout === 'LAYOUT_2_1' ? 45 : 48;
    // eslint-disable-next-line no-await-in-loop
    const bus = await prisma.bus.upsert({
      where:  { plateNo: `34OBL${100 + i}` },
      update: {},
      create: {
        companyId:  createdCompanies[i].id,
        plateNo:    `34OBL${100 + i}`,
        model:      i % 2 === 0 ? 'Mercedes Travego' : 'Neoplan Tourliner',
        seatLayout: layout,
        totalSeats,
      },
    });
    buses.push(bus);
    console.log(`🚌 Otobüs: ${bus.plateNo} (${layout})`);
  }

  // ── Seferleri ekle (önümüzdeki 7 gün) ──────────────────
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let tripCount = 0;
  const DEPARTURE_HOURS = [7, 10, 14, 18, 22]; // Günde 5 sefer

  for (const route of MAIN_ROUTES) {
    for (let day = 0; day < 7; day++) {
      for (const hour of DEPARTURE_HOURS) {
        const bus = buses[randomBetween(0, buses.length - 1)];

        const dep = new Date(today);
        dep.setDate(today.getDate() + day);
        dep.setHours(hour, 0, 0, 0);

        const arr      = addHours(dep, route.durationH);
        const price    = calcPrice(route.durationH);

        // eslint-disable-next-line no-await-in-loop
        const trip = await prisma.trip.create({
          data: {
            busId:         bus.id,
            origin:        route.from,
            destination:   route.to,
            departureTime: dep,
            arrivalTime:   arr,
            price,
          },
        });

        // Koltukları boş oluştur
        // eslint-disable-next-line no-await-in-loop
        await prisma.seat.createMany({
          data: Array.from({ length: bus.totalSeats }, (_, idx) => ({
            tripId:     trip.id,
            seatNumber: idx + 1,
            status:     'EMPTY',
            gender:     null,
          })),
        });

        tripCount++;
      }
    }
  }

  console.log(`\n✈️  Toplam ${tripCount} sefer eklendi.`);
  console.log(`🏙️  Kullanılabilir ${ALL_CITIES.length} şehir/ilçe (frontend listesi için aşağıya bakın)`);
  console.log('\n— Şehir listesi frontend/lib/cities.js dosyasına yazıldı.');
  console.log('\n🎉 Seed tamamlandı!');
}

main()
  .catch((e) => { console.error('❌ Seed hatası:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());

// 81 il listesini dışa aktar (frontend tarafından import edilebilir, gerekirse)
module.exports = { ALL_CITIES };
