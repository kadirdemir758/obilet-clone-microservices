'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { tripsApi } from '@/../../lib/api';

// Firma logo URL'leri (fallback)
const COMPANY_LOGOS = {
  'kamil-koc':    'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Kamil_Ko%C3%A7_logo.svg/200px-Kamil_Ko%C3%A7_logo.svg.png',
  'pamukkale':    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Pamukkale_Turizm_logo.svg/200px-Pamukkale_Turizm_logo.svg.png',
  'metro-turizm': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Metro_Turizm_logo.svg/200px-Metro_Turizm_logo.svg.png',
  'ulusoy':       'https://www.kamil koc.com.tr/image/logo.png',
};

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

function formatPrice(price) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price);
}

function TripCard({ trip, onSelect }) {
  const hasLowSeats = trip.emptySeats <= 5;

  return (
    <div
      className="trip-card animate-fadeInUp"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(trip)}
      onKeyDown={e => e.key === 'Enter' && onSelect(trip)}
    >
      {/* Firma */}
      <div className="trip-card__company">
        <img
          src={trip.company.logoUrl || COMPANY_LOGOS[trip.company.slug] || ''}
          alt={trip.company.name}
          className="trip-card__logo"
          onError={e => { e.target.style.display = 'none'; }}
        />
        {/* Logo yüklenemezse firma adını göster */}
        <div
          style={{
            fontWeight: 700,
            fontSize: '0.75rem',
            color: '#1A1A2E',
            textAlign: 'center',
            padding: '4px 8px',
            background: '#F0F2F5',
            borderRadius: '6px',
          }}
        >
          {trip.company.name}
        </div>
      </div>

      {/* Kalkış–Varış–Süre */}
      <div className="trip-card__times" style={{ flex: 1 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="trip-card__time">{formatTime(trip.departureTime)}</div>
          <div className="trip-card__city">{trip.origin}</div>
        </div>

        <div className="trip-card__route-line">
          <div className="trip-card__duration">⏱ {trip.duration}</div>
          <div className="trip-card__line" />
          <div style={{ fontSize: '0.7rem', color: '#ADB5BD' }}>
            {trip.seatLayout === 'LAYOUT_2_1' ? '2+1 Düzen' : '2+2 Düzen'}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="trip-card__time">{formatTime(trip.arrivalTime)}</div>
          <div className="trip-card__city">{trip.destination}</div>
        </div>
      </div>

      {/* Koltuk ve Fiyat */}
      <div style={{ textAlign: 'right', minWidth: '140px' }}>
        <div className={`trip-card__seats${hasLowSeats ? ' trip-card__seats--low' : ''}`}>
          {hasLowSeats ? `⚡ Son ${trip.emptySeats} koltuk!` : `✅ ${trip.emptySeats} boş koltuk`}
        </div>
        <div className="trip-card__price">{formatPrice(trip.price)}</div>
        <div className="trip-card__price-label">kişi başı</div>
        <button
          className="trip-card__select-btn"
          style={{ marginTop: '0.75rem' }}
          onClick={e => { e.stopPropagation(); onSelect(trip); }}
        >
          Koltuk Seç →
        </button>
      </div>
    </div>
  );
}

function ResultsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const from = params.get('from') || '';
  const to   = params.get('to')   || '';
  const date = params.get('date') || '';

  useEffect(() => {
    if (!from || !to || !date) { setLoading(false); return; }
    setLoading(true);
    tripsApi
      .search(from, to, date)
      .then(data => setTrips(data.trips))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [from, to, date]);

  function handleSelect(trip) {
    router.push(`/seat-selection?tripId=${trip.id}&price=${trip.price}`);
  }

  const formattedDate = date
    ? new Date(date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Başlık */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          {from} → {to}
        </h1>
        <p style={{ color: '#6C757D', marginTop: '0.25rem' }}>
          📅 {formattedDate}
        </p>
      </div>

      {loading && <div className="loading-spinner" />}

      {error && (
        <div className="alert alert--error">
          <span>❌</span>
          <span>{error} — Backend sunucusunun çalıştığından emin olun.</span>
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6C757D' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚌</div>
          <h2 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Sefer Bulunamadı</h2>
          <p>Seçilen tarih ve güzergah için sefer bulunmuyor. Farklı bir tarih deneyin.</p>
          <button
            className="btn btn--primary"
            style={{ marginTop: '1.5rem' }}
            onClick={() => router.push('/')}
          >
            ← Geri Dön
          </button>
        </div>
      )}

      {!loading && trips.length > 0 && (
        <>
          <div style={{ marginBottom: '1rem', color: '#6C757D', fontSize: '0.875rem', fontWeight: 500 }}>
            {trips.length} sefer bulundu
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="stagger">
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} onSelect={handleSelect} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="loading-spinner" style={{ marginTop: '4rem' }} />}>
      <ResultsContent />
    </Suspense>
  );
}
