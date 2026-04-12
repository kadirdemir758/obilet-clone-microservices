'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { tripsApi, seatsApi } from '@/lib/api';

/**
 * BusSeatMap — Otobüs Koltuk Haritası Bileşeni
 *
 * 2+1 Düzeni (LAYOUT_2_1): Her satır [sol1][sol2] [koridor] [sağ1]
 * 2+2 Düzeni (LAYOUT_2_2): Her satır [sol1][sol2] [koridor] [sağ1][sağ2]
 */
function BusSeatMap({ seats, layout, selectedSeat, onSeatClick, passengerGender }) {
  function getSeatObj(seatNumber) {
    return seats.find((s) => s.seatNumber === seatNumber) || null;
  }

  function getAdjacentSeatNumber(seatNumber) {
    if (layout === 'LAYOUT_2_1') {
      const row = Math.ceil(seatNumber / 3);
      const pos = seatNumber - (row - 1) * 3;
      if (pos === 1) return seatNumber + 1;
      if (pos === 2) return seatNumber - 1;
      return null; // 3. koltuk = tek taraf
    }
    // LAYOUT_2_2
    const row = Math.ceil(seatNumber / 4);
    const pos = seatNumber - (row - 1) * 4;
    if (pos === 1) return seatNumber + 1;
    if (pos === 2) return seatNumber - 1;
    if (pos === 3) return seatNumber + 1;
    if (pos === 4) return seatNumber - 1;
    return null;
  }

  function isForbidden(seatNumber) {
    if (!passengerGender) return false;
    const adjNum = getAdjacentSeatNumber(seatNumber);
    if (!adjNum) return false;
    const adj = getSeatObj(adjNum);
    if (!adj || adj.status === 'EMPTY') return false;
    return adj.gender && adj.gender !== passengerGender;
  }

  function getSeatClass(seat) {
    if (!seat) return 'seat seat--empty';
    if (seat.seatNumber === selectedSeat) return 'seat seat--selected';
    if (seat.status !== 'EMPTY') {
      return seat.gender === 'MALE' ? 'seat seat--male' : 'seat seat--female';
    }
    if (isForbidden(seat.seatNumber)) return 'seat seat--forbidden';
    return 'seat seat--empty';
  }

  function getSeatLabel(seat) {
    if (!seat) return '';
    if (seat.seatNumber === selectedSeat) return '✓';
    if (seat.status === 'OCCUPIED') return seat.gender === 'MALE' ? '♂' : '♀';
    if (seat.status === 'RESERVED') return '⏳';
    return seat.seatNumber;
  }

  function handleClick(seat) {
    if (!seat || seat.status !== 'EMPTY') return;
    if (isForbidden(seat.seatNumber)) {
      alert(
        '⚠️ Cinsiyet kuralı: Yabancı kadın ve erkek yolcular yan yana oturamaz.\nLütfen farklı bir koltuk seçin.'
      );
      return;
    }
    onSeatClick(seat.seatNumber === selectedSeat ? null : seat.seatNumber);
  }

  // ─── 2+1 Render ─────────────────────────────────────
  if (layout === 'LAYOUT_2_1') {
    const rowCount = Math.ceil((seats.length || 45) / 3);
    return (
      <div className="seat-map__bus">
        <div className="seat-map__driver">
          <div className="seat-map__driver-seat">🧑‍✈️</div>
        </div>
        {Array.from({ length: rowCount }, (_, i) => {
          const s1 = getSeatObj(i * 3 + 1);
          const s2 = getSeatObj(i * 3 + 2);
          const s3 = getSeatObj(i * 3 + 3);
          return (
            <div key={i} className="seat-map__row">
              <span className="seat-map__row-num">{i + 1}</span>
              <div className="seat-map__group">
                <button className={getSeatClass(s1)} onClick={() => handleClick(s1)} disabled={!s1 || s1.status !== 'EMPTY'}>{getSeatLabel(s1)}</button>
                <button className={getSeatClass(s2)} onClick={() => handleClick(s2)} disabled={!s2 || s2.status !== 'EMPTY'}>{getSeatLabel(s2)}</button>
              </div>
              <div className="seat-map__aisle" />
              <div className="seat-map__group">
                <button className={getSeatClass(s3)} onClick={() => handleClick(s3)} disabled={!s3 || s3.status !== 'EMPTY'}>{getSeatLabel(s3)}</button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ─── 2+2 Render ─────────────────────────────────────
  const rowCount = Math.ceil((seats.length || 48) / 4);
  return (
    <div className="seat-map__bus">
      <div className="seat-map__driver">
        <div className="seat-map__driver-seat">🧑‍✈️</div>
      </div>
      {Array.from({ length: rowCount }, (_, i) => {
        const s1 = getSeatObj(i * 4 + 1);
        const s2 = getSeatObj(i * 4 + 2);
        const s3 = getSeatObj(i * 4 + 3);
        const s4 = getSeatObj(i * 4 + 4);
        return (
          <div key={i} className="seat-map__row">
            <span className="seat-map__row-num">{i + 1}</span>
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

// ─── Ana Sayfa İçeriği ────────────────────────────────
function SeatSelectionContent() {
  const params = useSearchParams();
  const router = useRouter();

  const tripId = params.get('tripId');
  const price  = parseFloat(params.get('price') || '0');

  const [trip, setTrip]               = useState(null);
  const [seats, setSeats]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [passengerGender, setPassengerGender] = useState('');

  useEffect(() => {
    if (!tripId) { setLoading(false); return; }
    Promise.all([tripsApi.getById(tripId), seatsApi.getByTrip(tripId)])
      .then(([tripData, seatData]) => {
        setTrip(tripData.trip);
        setSeats(seatData.seats);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tripId]);

  function handleContinue() {
    if (!selectedSeat) { alert('Lütfen bir koltuk seçin.'); return; }
    if (!passengerGender) { alert('Lütfen cinsiyetinizi belirtin.'); return; }
    router.push(
      `/passenger?tripId=${tripId}&seatNumber=${selectedSeat}&price=${price}&gender=${passengerGender}`
    );
  }

  if (loading) return <div className="loading-spinner" style={{ marginTop: '4rem' }} />;
  if (error)   return <div className="alert alert--error" style={{ maxWidth: 600, margin: '2rem auto' }}>❌ {error}</div>;
  if (!trip)   return null;

  const layout     = trip.bus?.seatLayout || 'LAYOUT_2_1';
  const emptyCount = seats.filter((s) => s.status === 'EMPTY').length;
  const formattedPrice = new Intl.NumberFormat('tr-TR', {
    style: 'currency', currency: 'TRY', maximumFractionDigits: 0,
  }).format(price);

  return (
    <div
      style={{
        maxWidth: 1100, margin: '0 auto', padding: '2rem 1rem',
        display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem',
      }}
    >
      {/* ─── Sol Kolon ────────────────────────────── */}
      <div>
        {/* Sefer Özeti */}
        <div className="form-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                {trip.origin} → {trip.destination}
              </div>
              <div style={{ color: '#6C757D', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {new Date(trip.departureTime).toLocaleString('tr-TR')} &nbsp;·&nbsp; {trip.bus?.company?.name}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FF6B35' }}>{formattedPrice}</div>
              <div style={{ fontSize: '0.75rem', color: '#6C757D' }}>{emptyCount} boş koltuk</div>
            </div>
          </div>
        </div>

        {/* Cinsiyet Seçimi */}
        <div className="form-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.75rem' }}>⚧ Cinsiyetiniz</div>
          <div style={{ display: 'flex', gap: '2rem' }}>
            {[{ val: 'MALE', label: '♂ Erkek', color: '#4A90D9' }, { val: 'FEMALE', label: '♀ Kadın', color: '#E91E8C' }].map((g) => (
              <label key={g.val} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="radio"
                  name="gender"
                  value={g.val}
                  checked={passengerGender === g.val}
                  onChange={(e) => setPassengerGender(e.target.value)}
                />
                <span style={{ color: g.color }}>{g.label}</span>
              </label>
            ))}
          </div>
          {!passengerGender && (
            <div className="alert alert--warning" style={{ marginTop: '0.75rem' }}>
              ⚠️ Türkiye düzenlemesi gereği cinsiyetinizi seçmeden koltuk seçimi yapılamaz.
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
            selectedSeat={selectedSeat}
            onSeatClick={setSelectedSeat}
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

      {/* ─── Sağ Kolon: Özet ─────────────────────── */}
      <div>
        <div className="form-card" style={{ position: 'sticky', top: '80px' }}>
          <h2 className="form-card__title">Seçim Özeti</h2>

          {selectedSeat ? (
            <>
              <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                {[
                  ['Koltuk No', selectedSeat],
                  ['Güzergah', `${trip.origin} → ${trip.destination}`],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <span style={{ color: '#6C757D' }}>{k}</span>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #E9ECEF', paddingTop: '0.75rem' }}>
                  <span style={{ color: '#6C757D' }}>Tutar</span>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: '#FF6B35' }}>{formattedPrice}</span>
                </div>
              </div>
              <button id="continue-btn" className="btn btn--primary btn--full btn--lg" onClick={handleContinue}>
                Yolcu Bilgileri →
              </button>
            </>
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
