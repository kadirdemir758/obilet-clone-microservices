'use client';

import { useEffect, useState, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// ─── Sıralama Seçenekleri ─────────────────────────────────
const SORT_OPTIONS = [
  { key: 'default',   label: '🔀 Önerilen'       },
  { key: 'cheapest',  label: '💰 En Ucuz'        },
  { key: 'earliest',  label: '🌅 En Erken Sefer' },
  { key: 'fastest',   label: '⚡ En Hızlı'       },
];

// ─── Firma Logo Bileşeni ──────────────────────────────────
function CompanyLogo({ company }) {
  const [imgFailed, setImgFailed] = useState(false);

  const initials = company.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const BRAND_COLORS = {
    'kamil-koc':     '#E63946',
    'pamukkale':     '#2196F3',
    'metro-turizm':  '#FF6B35',
    'ulusoy':        '#1A237E',
    'varan':         '#B71C1C',
    'suha-turizm':   '#1B5E20',
    'ozkaymak':      '#4A148C',
    'izmir-seyahat': '#004D40',
  };
  const bgColor = BRAND_COLORS[company.slug] || '#6C757D';

  if (!imgFailed && company.logoUrl) {
    return (
      <img
        src={company.logoUrl}
        alt={company.name}
        style={{ width: 72, height: 36, objectFit: 'contain', borderRadius: 4 }}
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div
      title={company.name}
      style={{
        width: 72, height: 36, borderRadius: 6,
        background: bgColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontWeight: 800, fontSize: '0.875rem',
        letterSpacing: '0.5px', flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

// ─── Otobüs Özellikleri ──────────────
const BUS_FEATURES = {
  'LAYOUT_2_1': ['WiFi', 'Priz', 'Ekran', 'İkram'],
  'LAYOUT_2_2': ['WiFi', 'Priz'],
};

function TripFeatures({ layout }) {
  const features = BUS_FEATURES[layout] || [];
  const FEATURE_ICONS = { 'WiFi': '📶', 'Priz': '🔌', 'Ekran': '🖥️', 'İkram': '☕' };
  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
      {features.map((f) => (
        <span
          key={f}
          title={f}
          style={{
            background: '#F0F4FF', color: '#3B5BDB',
            borderRadius: '20px', padding: '2px 8px',
            fontSize: '0.7rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '3px',
          }}
        >
          {FEATURE_ICONS[f]} {f}
        </span>
      ))}
    </div>
  );
}

// ─── Sefer Kartı ──────────────────────────────────────────
function TripCard({ trip, onSelect, animDelay }) {
  const hasLowSeats = trip.emptySeats <= 5;

  function formatTime(dateStr) {
    return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency', currency: 'TRY', maximumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div
      className="trip-card animate-fadeInUp"
      style={{ animationDelay: `${animDelay}s` }}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(trip)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(trip)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', minWidth: 90 }}>
        <CompanyLogo company={trip.company} />
        <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6C757D', textAlign: 'center' }}>
          {trip.company.name}
        </span>
        <TripFeatures layout={trip.seatLayout} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="trip-card__time">{formatTime(trip.departureTime)}</div>
          <div className="trip-card__city">{trip.origin}</div>
        </div>

        <div className="trip-card__route-line">
          <div className="trip-card__duration">⏱ {trip.duration}</div>
          <div className="trip-card__line" />
          <div style={{ fontSize: '0.65rem', color: '#ADB5BD' }}>
            {trip.seatLayout === 'LAYOUT_2_1' ? '2+1 Lüks' : '2+2 Standart'}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="trip-card__time">{formatTime(trip.arrivalTime)}</div>
          <div className="trip-card__city">{trip.destination}</div>
        </div>
      </div>

      <div style={{ textAlign: 'right', minWidth: 130 }}>
        <div className={`trip-card__seats${hasLowSeats ? ' trip-card__seats--low' : ''}`}>
          {hasLowSeats ? `⚡ Son ${trip.emptySeats} koltuk!` : `✅ ${trip.emptySeats} boş koltuk`}
        </div>
        <div className="trip-card__price">{formatPrice(trip.price)}</div>
        <div className="trip-card__price-label">kişi başı</div>
        <button
          className="trip-card__select-btn"
          style={{ marginTop: '0.75rem' }}
          onClick={(e) => { e.stopPropagation(); onSelect(trip); }}
        >
          Koltuk Seç →
        </button>
      </div>
    </div>
  );
}

// ─── Sıralama Barı ────────────────────────────────────────
function SortBar({ activeSort, onSort, count }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem',
      background: '#fff', borderRadius: '12px', padding: '0.75rem 1rem',
      border: '1px solid #E9ECEF', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    }}>
      <span style={{ color: '#6C757D', fontSize: '0.875rem', fontWeight: 500 }}>
        <b style={{ color: '#212529' }}>{count}</b> sefer bulundu · Sırala:
      </span>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            id={`sort-${opt.key}`}
            onClick={() => onSort(opt.key)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '20px',
              border: `2px solid ${activeSort === opt.key ? '#FF6B35' : '#E9ECEF'}`,
              background: activeSort === opt.key ? '#FF6B35' : '#fff',
              color: activeSort === opt.key ? '#fff' : '#495057',
              fontWeight: 600, fontSize: '0.8rem',
              cursor: 'pointer', transition: 'all 0.15s ease',
              fontFamily: 'inherit',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Sıralama Fonksiyonu ──────────────────────────────────
function sortTrips(trips, sortKey) {
  const list = [...trips];
  switch (sortKey) {
    case 'cheapest':
      return list.sort((a, b) => a.price - b.price);
    case 'earliest':
      return list.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    case 'fastest':
      return list.sort((a, b) => {
        const durA = new Date(a.arrivalTime) - new Date(a.departureTime);
        const durB = new Date(b.arrivalTime) - new Date(b.departureTime);
        return durA - durB;
      });
    default:
      return list;
  }
}

// ─── Ana İçerik ───────────────────────────────────────────
function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();

  const from = params.get('from') || '';
  const to   = params.get('to')   || '';
  const date = params.get('date') || '';

  const [trips, setTrips]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [sortKey, setSortKey] = useState('default');

  // 🔥 GÜNCELLENEN KISIM: Doğrudan 8000 Portuna İstek Atan Kısım
  useEffect(() => {
    if (!from || !to || !date) { setLoading(false); return; }
    setLoading(true);
    setError('');

    // Backend origin ve destination beklediği için eşleştiriyoruz
    // Eski satırı bununla değiştir (Tarih parametresini ekliyoruz):
const searchUrl = `http://localhost:8000/api/v1/trips/search?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&date=${date}`;

    fetch(searchUrl)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Sunucu Hatası: ${res.status}`);
        const data = await res.json();
        
        // 🛠️ MAPPING: Python verilerini React'in istediği formata çeviriyoruz
        const mappedTrips = Array.isArray(data) ? data.map(t => {
          // Varış saatini kalkıştan 4 saat sonrası olarak farz ediyoruz
          const depTime = new Date(t.departure_time);
          const arrTime = new Date(depTime.getTime() + (4 * 60 * 60 * 1000));

          return {
            id: t.id,
            origin: t.origin,
            destination: t.destination,
            departureTime: t.departure_time,
            arrivalTime: arrTime.toISOString(),
            duration: "4 Saat",
            price: t.price,
            emptySeats: t.available_seats,
            seatLayout: "LAYOUT_2_1",
            company: {
              name: t.company_id === 1 ? "Kamil Koç" : t.company_id === 2 ? "Pamukkale Turizm" : "Metro Turizm",
              slug: t.company_id === 1 ? "kamil-koc" : t.company_id === 2 ? "pamukkale" : "metro-turizm",
              logoUrl: ""
            }
          };
        }) : [];

        setTrips(mappedTrips);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [from, to, date]);

  const handleSelect = useCallback((trip) => {
    router.push(`/seat-selection?tripId=${trip.id}&price=${trip.price}`);
  }, [router]);

  const sortedTrips = sortTrips(trips, sortKey);

  const formattedDate = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('tr-TR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '';

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {from}
            <span style={{ color: '#FF6B35', fontSize: '1.25rem' }}>→</span>
            {to}
          </h1>
          <p style={{ color: '#6C757D', marginTop: '0.25rem', fontSize: '0.9rem' }}>📅 {formattedDate}</p>
        </div>
        <button
          className="btn btn--secondary"
          onClick={() => router.push('/')}
          style={{ fontSize: '0.875rem' }}
        >
          ← Aramayı Değiştir
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loading-spinner" />
          <p style={{ color: '#6C757D', marginTop: '1rem' }}>Seferler aranıyor...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert--error">
          <span>❌</span>
          <div>
            <b>Bağlantı hatası:</b> {error}
            <br />
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              Backend sunucusunun <code>localhost:8000</code> adresinde çalıştığından emin olun.
            </span>
          </div>
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6C757D' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚌</div>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Bu Güzergah İçin Sefer Bulunamadı</h2>
          <p>Seçilen tarih ve güzergahta sefer yok. Farklı bir tarih deneyin veya yukarıdan güzergahı değiştirin.</p>
          <button className="btn btn--primary" style={{ marginTop: '1.5rem' }} onClick={() => router.push('/')}>
            ← Yeni Arama Yap
          </button>
        </div>
      )}

      {!loading && sortedTrips.length > 0 && (
        <>
          <SortBar activeSort={sortKey} onSort={setSortKey} count={sortedTrips.length} />
          {sortKey === 'cheapest' && (
            <div className="alert alert--success" style={{ marginBottom: '1rem' }}>
              💡 En ucuz sefer: <b>
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(
                  Math.min(...sortedTrips.map((t) => t.price))
                )}
              </b> kişi başı
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedTrips.map((trip, idx) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onSelect={handleSelect}
                animDelay={Math.min(idx * 0.05, 0.4)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="loading-spinner" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}