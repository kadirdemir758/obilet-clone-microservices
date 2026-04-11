'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { tripsApi, seatsApi } from '@/../../lib/api';

/**
 * BusSeatMap — Otobüs Koltuk Haritası Bileşeni
 *
 * 2+1 Düzeni (LAYOUT_2_1):
 * Her satır: [sol1][sol2] [koridor] [sağ1]
 * Toplam: 15 sıra × 3 = 45 koltuk
 *
 * 2+2 Düzeni (LAYOUT_2_2):
 * Her satır: [sol1][sol2] [koridor] [sağ1][sağ2]
 * Toplam: 12 sıra × 4 = 48 koltuk
 */
function BusSeatMap({ seats, layout, selectedSeats, onSeatClick, passengerGender }) {
  function getSeatStatus(seatNumber) {
    const seat = seats.find(s => s.seatNumber === seatNumber);
    if (!seat) return null;
    return seat;
  }

  function getAdjacentSeatNumber(seatNumber, layout) {
    if (layout === 'LAYOUT_2_1') {
      const row = Math.ceil(seatNumber / 3);
      const pos = seatNumber - (row - 1) * 3;
      if (pos === 1) return seatNumber + 1;
      if (pos === 2) return seatNumber - 1;
      return null;
    }
    if (layout === 'LAYOUT_2_2') {
      const row = Math.ceil(seatNumber / 4);
      const pos = seatNumber - (row - 1) * 4;
      if (pos === 1) return seatNumber + 1;
      if (pos === 2) return seatNumber - 1;
      if (pos === 3) return seatNumber + 1;
      if (pos === 4) return seatNumber - 1;
    }
    return null;
  }

  function isForbiddenByGender(seatNumber) {
    if (!passengerGender) return false;
    const adjNum = getAdjacentSeatNumber(seatNumber, layout);
    if (!adjNum) return false;
    const adjSeat = getSeatStatus(adjNum);
    if (!adjSeat || adjSeat.status === 'EMPTY') return false;
    return adjSeat.gender && adjSeat.gender !== passengerGender;
  }

  function getSeatClass(seat) {
    if (!seat) return 'seat seat--empty';
    const isSelected = selectedSeats.includes(seat.seatNumber);
    if (isSelected) return 'seat seat--selected';
    if (seat.status !== 'EMPTY') {
      return seat.gender === 'MALE' ? 'seat seat--male' : 'seat seat--female';
    }
    if (isForbiddenByGender(seat.seatNumber)) return 'seat seat--forbidden';
    return 'seat seat--empty';
  }

  function getSeatLabel(seat) {
    if (!seat) return '';
    const isSelected = selectedSeats.includes(seat.seatNumber);
    if (isSelected) return '✓';
    if (seat.status === 'OCCUPIED') return seat.gender === 'MALE' ? '♂' : '♀';
    if (seat.status === 'RESERVED') return '⏳';
    return seat.seatNumber;
  }

  function handleClick(seat) {
    if (!seat) return;
    if (seat.status !== 'EMPTY') return;
    if (isForbiddenByGender(seat.seatNumber)) {
      alert('⚠️ Cinsiyet kuralı: Farklı cinsiyetten yabancı kişiler yan yana oturamaz. Lütfen başka bir koltuk seçin.');
      return;
    }
    onSeatClick(seat.seatNumber);
  }

  // ─── 2+1 Düzen Render ─────────────────────────────────
  if (layout === 'LAYOUT_2_1') {
    const totalSeats = seats.length || 45;
    const rows = Math.ceil(totalSeats / 3);

    return (
      <div className="seat-map__bus">
        <div className="seat-map__driver">
          <div className="seat-map__driver-seat">🧑‍✈️</div>
        </div>
        {Array.from({ length: rows }, (_, i) => {
          const rowNum = i + 1;
          const left1 = (i * 3) + 1;
          const left2 = (i * 3) + 2;
          const right1 = (i * 3) + 3;
          const s1 = getSeatStatus(left1);
          const s2 = getSeatStatus(left2);
          const s3 = getSeatStatus(right1);

          return (
            <div key={rowNum} className="seat-map__row">
              <span className="seat-map__row-num">{rowNum}</span>
              <div className="seat-map__group">
                <button
                  className={getSeatClass(s1)}
                  onClick={() => handleClick(s1)}
                  title={s1 ? `Koltuk ${left1}` : ''}
                  disabled={!s1 || s1.status !== 'EMPTY'}
                >
                  {getSeatLabel(s1)}
                </button>
                <button
                  className={getSeatClass(s2)}
                  onClick={() => handleClick(s2)}
                  title={s2 ? `Koltuk ${left2}` : ''}
                  disabled={!s2 || s2.status !== 'EMPTY'}
                >
                  {getSeatLabel(s2)}
                </button>
              </div>
              <div className="seat-map__aisle" />
              <div className="seat-map__group">
                <button
                  className={getSeatClass(s3)}
                  onClick={() => handleClick(s3)}
                  title={s3 ? `Koltuk ${right1}` : ''}
                  disabled={!s3 || s3.status !== 'EMPTY'}
                >
                  {getSeatLabel(s3)}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── 2+2 Düzen Render ─────────────────────────────────
  const totalSeats = seats.length || 48;
  const rows = Math.ceil(totalSeats / 4);

  return (
    <div className="seat-map__bus">
      <div className="seat-map__driver">
        <div className="seat-map__driver-seat">🧑‍✈️</div>
      </div>
      {Array.from({ length: rows }, (_, i) => {
        const rowNum = i + 1;
        const s1 = getSeatStatus((i * 4) + 1);
        const s2 = getSeatStatus((i * 4) + 2);
        const s3 = getSeatStatus((i * 4) + 3);
        const s4 = getSeatStatus((i * 4) + 4);

        return (
          <div key={rowNum} className="seat-map__row">
            <span className="seat-map__row-num">{rowNum}</span>
            <div className="seat-map__group">
              <button className={getSeatClass(s1)} onClick={() => handleClick(s1)} disabled={!s1 || s1.status !== 'EMPTY'}>{getSeatLabel(s1)}</button>
              <button className={getSeatClass(s2)} onClick={() => handleClick(s2)} disabled={!s2 || s2.status !== 'EMPTY'}>{getSeatLabel(s2)}</button>
            </div>
            <div className="seat-map__aisle" />
            <div className="seat-map__group">
              <button className={getSeatClass(s3)} onClick={() => handleClick(s3)} disabled={!s3 || s3.status !== 'EMPTY'}>{getSeatLabel(s3)}</button>
              <button className={getSeatClass(s4)} onClick={() => handleClick(s4)} disabled={!s4 || s4.status !== 'EMPTY'}>{getSeatLabel(s4)}</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SeatSelectionContent() {
  const params = useSearchParams();
  const router = useRouter();
  const tripId = params.get('tripId');
  const price  = parseFloat(params.get('price') || '0');

  const [trip, setTrip] = useState(null);
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [passengerGender, setPassengerGender] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tripId) return;
    Promise.all([tripsApi.getById(tripId), seatsApi.getByTrip(tripId)])
      .then(([tripData, seatData]) => {
        setTrip(tripData.trip);
        setSeats(seatData.seats);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [tripId]);

  function handleSeatClick(seatNumber) {
    setSelectedSeat(prev => prev === seatNumber ? null : seatNumber);
  }

  function handleContinue() {
    if (!selectedSeat) { alert('Lütfen bir koltuk seçin.'); return; }
    if (!passengerGender) { alert('Lütfen cinsiyetinizi belirtin.'); return; }
    router.push(
      `/passenger?tripId=${tripId}&seatNumber=${selectedSeat}&price=${price}&gender=${passengerGender}`
    );
  }

  if (loading) return <div className="loading-spinner" style={{ marginTop: '4rem' }} />;
  if (error) return <div className="alert alert--error" style={{ maxWidth: 600, margin: '2rem auto' }}>❌ {error}</div>;
  if (!trip) return null;

  const layout = trip.bus?.seatLayout || 'LAYOUT_2_1';
  const emptyCount = seats.filter(s => s.status === 'EMPTY').length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem' }}>
      {/* Sol: Sefer Özeti + Koltuk Haritası */}
      <div>
        {/* Sefer Özeti */}
        <div className="form-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                {trip.origin} → {trip.destination}
              </div>
              <div style={{ color: '#6C757D', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {new Date(trip.departureTime).toLocaleString('tr-TR')} · {trip.bus?.company?.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FF6B35' }}>
                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6C757D' }}>{emptyCount} boş koltuk</div>
            </div>
          </div>
        </div>

        {/* Cinsiyet Seçimi (Kural için kritik) */}
        <div className="form-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '1rem' }}>⚧ Cinsiyet Bilgisi</div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <input type="radio" name="gender" value="MALE" checked={passengerGender === 'MALE'} onChange={e => setPassengerGender(e.target.value)} />
              <span style={{ color: '#4A90D9' }}>♂ Erkek</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <input type="radio" name="gender" value="FEMALE" checked={passengerGender === 'FEMALE'} onChange={e => setPassengerGender(e.target.value)} />
              <span style={{ color: '#E91E8C' }}>♀ Kadın</span>
            </label>
          </div>
          {!passengerGender && (
            <div className="alert alert--warning" style={{ marginTop: '1rem' }}>
              ⚠️ Cinsiyetinizini seçmeden koltuk seçimi yapılamaz. Türkiye zorunlu düzenlemesi gereği.
            </div>
          )}
        </div>

        {/* Koltuk Haritası */}
        <div className="seat-map-wrapper">
          <div className="seat-map__header">
            <div className="seat-map__bus-icon">🚌</div>
            <div className="seat-map__title">
              {layout === 'LAYOUT_2_1' ? '2+1 Koltuk Düzeni' : '2+2 Koltuk Düzeni'}
            </div>
            <div className="seat-map__subtitle">
              {selectedSeat ? `Seçilen koltuk: ${selectedSeat}` : 'Bir koltuk seçin'}
            </div>
          </div>

          <BusSeatMap
            seats={seats}
            layout={layout}
            selectedSeats={selectedSeat ? [selectedSeat] : []}
            onSeatClick={handleSeatClick}
            passengerGender={passengerGender}
          />

          {/* Renk Efsanesi */}
          <div className="seat-legend">
            <div className="seat-legend__item"><div className="seat-legend__dot seat-legend__dot--empty" />Boş</div>
            <div className="seat-legend__item"><div className="seat-legend__dot seat-legend__dot--male" />Erkek</div>
            <div className="seat-legend__item"><div className="seat-legend__dot seat-legend__dot--female" />Kadın</div>
            <div className="seat-legend__item"><div className="seat-legend__dot seat-legend__dot--selected" />Seçili</div>
          </div>
        </div>
      </div>

      {/* Sağ: Özet ve Devam */}
      <div>
        <div className="form-card" style={{ position: 'sticky', top: '80px' }}>
          <h2 className="form-card__title">Seçim Özeti</h2>

          {selectedSeat ? (
            <div>
              <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#6C757D' }}>Koltuk No</span>
                  <span style={{ fontWeight: 700 }}>{selectedSeat}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#6C757D' }}>Güzergah</span>
                  <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{trip.origin} → {trip.destination}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E9ECEF', paddingTop: '0.75rem' }}>
                  <span style={{ color: '#6C757D' }}>Tutar</span>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#FF6B35' }}>
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price)}
                  </span>
                </div>
              </div>

              <button
                id="continue-btn"
                className="btn btn--primary btn--full btn--lg"
                onClick={handleContinue}
              >
                Yolcu Bilgileri →
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#6C757D', padding: '2rem 0' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💺</div>
              <p>Haritadan bir koltuk seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SeatSelectionPage() {
  return (
    <Suspense fallback={<div className="loading-spinner" style={{ marginTop: '4rem' }} />}>
      <SeatSelectionContent />
    </Suspense>
  );
}
