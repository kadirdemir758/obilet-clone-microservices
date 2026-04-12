/**
 * cities.js — Türkiye Şehir ve İlçe Listesi
 * Ana sayfa arama kutusu için kullanılır.
 */

// Önce arama kutusunda gösterilecek sıra (önce büyük şehirler)
export const POPULAR_CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana',
  'Konya', 'Gaziantep', 'Mersin', 'Samsun', 'Trabzon', 'Eskişehir',
  'Kayseri', 'Diyarbakır', 'Denizli', 'Kocaeli', 'Malatya',
];

// Popüler tatil & terminal ilçeleri
export const POPULAR_DISTRICTS = [
  'Bodrum', 'Marmaris', 'Fethiye', 'Alanya', 'Side', 'Kuşadası', 'Çeşme',
  'Didim', 'Kapadokya', 'Ürgüp', 'Göreme', 'Bergama', 'Edremit', 'Çorlu',
];

// Türkiye'nin 81 ili
export const ALL_PROVINCES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya',
  'Ankara', 'Antalya', 'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın',
  'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce',
  'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep',
  'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul',
  'İzmir', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu',
  'Kayseri', 'Kilis', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kocaeli',
  'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya',
  'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ',
  'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak',
];

// Tüm şehirler: önce popüler, sonra diğer iller, sonra ilçeler
export const ALL_CITIES = [
  ...POPULAR_CITIES,
  ...ALL_PROVINCES.filter((c) => !POPULAR_CITIES.includes(c)).sort(),
  ...POPULAR_DISTRICTS,
];
