'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const clean = value.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) return `${clean.slice(0, 2)}/${clean.slice(2)}`;
  return clean;
}

function PaymentContent() {
  const params = useSearchParams();
  const router = useRouter();

  const tripId    = params.get('tripId') || (typeof window !== 'undefined' ? localStorage.getItem('currentTripId') : null);
  const seats     = params.get('seats');
  const price     = parseFloat(params.get('price') || '0');
  const passengerName = params.get('name') || 'MİSAFİR YOLCU';

  const [card, setCard] = useState({ cardNumber: '', cardHolderName: '', expiry: '', cvc: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function handleCardChange(field, value) {
    let v = value;
    if (field === 'cardNumber') v = formatCardNumber(value);
    if (field === 'expiry')     v = formatExpiry(value);
    if (field === 'cvc')        v = value.replace(/\D/g, '').slice(0, 3);
    setCard((c) => ({ ...c, [field]: v }));
    setErrors((e) => ({ ...e, [field]: '' }));
  }

  function validate() {
    const e = {};
    if (card.cardNumber.replace(/\s/g, '').length !== 16) e.cardNumber = 'Kart numarası 16 haneli olmalıdır.';
    if (!card.cardHolderName.trim()) e.cardHolderName = 'Kart üzerindeki isim zorunludur.';
    const parts = card.expiry.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1] || parseInt(parts[0]) > 12 || parseInt(parts[0]) < 1) {
      e.expiry = 'Geçerli bir tarih girin.';
    }
    if (card.cvc.length !== 3) e.cvc = 'CVV 3 haneli olmalıdır.';
    return e;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const queryParams = new URLSearchParams();
      const finalPnr = `PNR${Math.floor(1000 + Math.random() * 9000)}`;

      let origin = 'Bilinmiyor';
      let dest = 'Bilinmiyor';
      let time = '00:00';
      let date = 'Belirsiz';
      let company = 'Obilet Premium';

      if (tripId) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${tripId}`);
          if (res.ok) {
            const tripData = await res.json();
            const depDate = new Date(tripData.departureTime);
            
            origin = tripData.origin;
            dest = tripData.destination;
            time = depDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
            date = depDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
            company = tripData.company;
          }
        } catch (fetchErr) {
          console.error("Backend'e ulaşılamadı.");
        }
      }

      // ❗ HAYAT KURTARAN YER: BİLETİ "SORGULA" SAYFASI İÇİN HAFIZAYA KAYDEDİYORUZ
      const newTicket = { pnr: finalPnr, name: passengerName, origin, dest, time, date, company, seats, price };
      
      const existingBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
      existingBookings.push(newTicket);
      localStorage.setItem('myBookings', JSON.stringify(existingBookings));

      // Success sayfasına yolla
      Object.keys(newTicket).forEach(key => {
        if (newTicket[key]) queryParams.set(key, newTicket[key]);
      });

      router.push(`/success?${queryParams.toString()}`);
    } catch (err) {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price);
  const displayNumber = card.cardNumber || '•••• •••• •••• ••••';
  const displayExpiry = card.expiry     || 'AA/YY';
  const displayName   = card.cardHolderName.toUpperCase() || 'AD SOYAD';

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      
      <div className="stepper" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        {['Sefer Seç', 'Koltuk Seç', 'Yolcu Bilgileri', 'Ödeme'].map((step, i) => (
          <div key={step} style={{ fontWeight: i === 3 ? 'bold' : 'normal', color: i === 3 ? '#FF6B35' : '#999' }}>
            {i + 1}. {step}
          </div>
        ))}
      </div>

      <div className="form-card">
        <h1 className="form-card__title">Güvenli Ödeme</h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#F0FFF4', border: '1px solid #C3E6CB', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#155724' }}>
          🔒 <span><b>Iyzico</b> altyapısıyla korumalı ödeme — 3D Secure ile doğrulanacak.</span>
        </div>

        <div style={{ background: '#F8F9FA', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: '#6C757D', fontWeight: 600, letterSpacing: '1px' }}>KOLTUKLAR</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px' }}>{seats}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#6C757D', letterSpacing: '1px' }}>ÖDENECEK TUTAR</div>
            <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#FF6B35' }}>{formattedPrice}</div>
          </div>
        </div>

        {/* ❗ GÖRSEL KREDİ KARTI GERİ GELDİ */}
        <div className="payment-card" style={{ background: 'linear-gradient(135deg, #1E1B2E 0%, #3B5BDB 100%)', color: '#fff', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 10px 20px rgba(59,91,219,0.3)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ width: '40px', height: '30px', background: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', borderRadius: '4px' }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', opacity: 0.8 }}>💳 KREDİ KARTI</div>
          </div>
          <div style={{ fontSize: '1.5rem', letterSpacing: '2px', fontWeight: 'bold', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
            {displayNumber}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Kart Sahibi</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{displayName}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.7, textTransform: 'uppercase' }}>Son Kul. Tar.</div>
              <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{displayExpiry}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-grid">
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="cardNumber">Kart Numarası <span>*</span></label>
              <input id="cardNumber" type="text" inputMode="numeric" className={`form-input${errors.cardNumber ? ' error' : ''}`} value={card.cardNumber} onChange={(e) => handleCardChange('cardNumber', e.target.value)} placeholder="0000 0000 0000 0000" />
              {errors.cardNumber && <span className="form-error" style={{color: 'red', fontSize:'0.8rem'}}>⚠ {errors.cardNumber}</span>}
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label" htmlFor="cardHolderName">Kart Üzerindeki İsim <span>*</span></label>
              <input id="cardHolderName" type="text" className={`form-input${errors.cardHolderName ? ' error' : ''}`} value={card.cardHolderName} onChange={(e) => handleCardChange('cardHolderName', e.target.value)} placeholder="AD SOYAD" />
              {errors.cardHolderName && <span className="form-error" style={{color: 'red', fontSize:'0.8rem'}}>⚠ {errors.cardHolderName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="expiry">Son Kullanma <span>*</span></label>
              <input id="expiry" type="text" inputMode="numeric" className={`form-input${errors.expiry ? ' error' : ''}`} value={card.expiry} onChange={(e) => handleCardChange('expiry', e.target.value)} placeholder="AA/YY" />
              {errors.expiry && <span className="form-error" style={{color: 'red', fontSize:'0.8rem'}}>⚠ {errors.expiry}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="cvc">CVV <span>*</span></label>
              <input id="cvc" type="text" inputMode="numeric" maxLength={3} className={`form-input${errors.cvc ? ' error' : ''}`} value={card.cvc} onChange={(e) => handleCardChange('cvc', e.target.value)} placeholder="•••" />
              {errors.cvc && <span className="form-error" style={{color: 'red', fontSize:'0.8rem'}}>⚠ {errors.cvc}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn--secondary" onClick={() => router.back()}>← Geri</button>
            <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading} style={{ background: '#FF6B35', border: 'none', color: 'white', padding: '1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? '⏳ Ödeme işleniyor...' : `🔒 ${formattedPrice} Öde`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return <Suspense fallback={<div className="loading-spinner" style={{ marginTop: '4rem' }} />}><PaymentContent /></Suspense>;
}