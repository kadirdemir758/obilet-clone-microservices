/**
 * seed.js — Veritabanı Başlangıç Verileri
 *
 * Gerçek Türk otobüs firmalarını, otobüsleri ve
 * örnek seferleri veritabanına ekler.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─── Gerçek Firma Verileri ────────────────────────────
const companies = [
  {
    name: 'Kamil Koç',
    slug: 'kamil-koc',
    logoUrl: 'https://www.kamilkoc.com.tr/img/logo.png',
    phone: '444 0 562',
    website: 'https://www.kamilkoc.com.tr',
  },
  {
    name: 'Pamukkale Turizm',
    slug: 'pamukkale',
    logoUrl: 'https://www.pamukkale.com.tr/images/logo.png',
    phone: '444 3 535',
    website: 'https://www.pamukkale.com.tr',
  },
  {
    name: 'Metro Turizm',
    slug: 'metro-turizm',
    logoUrl: 'https://www.metroturizm.com.tr/assets/images/logo/logo.svg',
    phone: '444 3 455',
    website: 'https://www.metroturizm.com.tr',
  },
  {
    name: 'Ali Osman Ulusoy',
    slug: 'ulusoy',
    logoUrl: 'https://www.aliosmanturizm.com.tr/images/logo.png',
    phone: '444 1 888',
    website: 'https://www.aliosmanturizm.com.tr',
  },
];

// ─── Şehir Çiftleri ───────────────────────────────────
const routes = [
  { origin: 'İstanbul', destination: 'Ankara' },
  { origin: 'İstanbul', destination: 'İzmir' },
  { origin: 'Ankara', destination: 'İzmir' },
  { origin: 'İstanbul', destination: 'Antalya' },
  { origin: 'Ankara', destination: 'Antalya' },
  { origin: 'İzmir', destination: 'Ankara' },
];

function addHours(date, hours) {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log('🌱 Seed verisi yükleniyor...');

  // Firmaları ekle
  const createdCompanies = [];
  for (const company of companies) {
    const c = await prisma.company.upsert({
      where: { slug: company.slug },
      update: {},
      create: company,
    });
    createdCompanies.push(c);
    console.log(`✅ Firma eklendi: ${c.name}`);
  }

  // Her firma için 1 otobüs ekle
  const buses = [];
  for (let i = 0; i < createdCompanies.length; i++) {
    const layout = i % 2 === 0 ? 'LAYOUT_2_1' : 'LAYOUT_2_2';
    const totalSeats = layout === 'LAYOUT_2_1' ? 45 : 48;

    const bus = await prisma.bus.upsert({
      where: { plateNo: `34 OBL ${100 + i}` },
      update: {},
      create: {
        companyId: createdCompanies[i].id,
        plateNo: `34 OBL ${100 + i}`,
        model: 'Mercedes Travego',
        seatLayout: layout,
        totalSeats,
      },
    });
    buses.push(bus);
    console.log(`✅ Otobüs eklendi: ${bus.plateNo} (${layout})`);
  }

  // Her rota için seferler ekle (önümüzdeki 7 gün)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const route of routes) {
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const departureDate = new Date(today);
      departureDate.setDate(today.getDate() + dayOffset);

      // Günde 3 sefer: sabah, öğle, gece
      const departureTimes = [8, 14, 22];
      const durations = { 'İstanbul-Ankara': 6, 'İstanbul-İzmir': 8, 'Ankara-İzmir': 9, 'İstanbul-Antalya': 12, 'Ankara-Antalya': 7, 'İzmir-Ankara': 9 };
      const routeKey = `${route.origin}-${route.destination}`;
      const duration = durations[routeKey] || 6;

      for (let t = 0; t < departureTimes.length; t++) {
        const departureDateTime = new Date(departureDate);
        departureDateTime.setHours(departureTimes[t], 0, 0, 0);
        const arrivalDateTime = addHours(departureDateTime, duration);

        const bus = buses[randomBetween(0, buses.length - 1)];
        const price = randomBetween(150, 600);

        const trip = await prisma.trip.create({
          data: {
            busId: bus.id,
            origin: route.origin,
            destination: route.destination,
            departureTime: departureDateTime,
            arrivalTime: arrivalDateTime,
            price,
          },
        });

        // Koltukları oluştur (boş)
        const seatData = Array.from({ length: bus.totalSeats }, (_, idx) => ({
          tripId: trip.id,
          seatNumber: idx + 1,
          status: 'EMPTY',
          gender: null,
        }));

        await prisma.seat.createMany({ data: seatData });
        console.log(`✅ Sefer eklendi: ${route.origin} → ${route.destination} (${departureDateTime.toLocaleString('tr-TR')})`);
      }
    }
  }

  console.log('\n🎉 Seed tamamlandı!');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
