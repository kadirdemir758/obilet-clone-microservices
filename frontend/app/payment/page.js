'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { paymentApi } from '@/../../lib/api';

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

  const ticketId   = params.get('ticketId');
  const pnr        = params.get('pnr');
  const passengerId = params.get('passengerId');
  const price      = parseFloat(params.get('price') || '0');

  const [card, setCard] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiry: '',
    cvc: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function handleCardChange(field, value) {
    let formatted = value;
    if (field === 'cardNumber') formatted = formatCardNumber(value);
    if (field === 'expiry')     formatted = formatExpiry(value);
    if (field === 'cvc')        formatted = value.replace(/\D/g, '').slice(0, 3);
    setCard(c => ({ ...c, [field]: formatted }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  }

  function validate() {
    const e = {};
    const rawCard = card.cardNumber.replace(/\s/g, '');
    if (rawCard.length !== 16) e.cardNumber = 'Kart numarası 16 haneli olmalıdır.';
    if (!card.cardHolderName.trim()) e.cardHolderName = 'Kart üzerindeki isim zorunludur.';
    const [month, year] = card.expiry.split('/');
    if (!month || !year || month > 12 || month < 1) e.expiry = 'Geçerli bir son kullanma tarihi girin.';
    if (card.cvc.length !== 3) e.cvc = 'CVV 3 haneli olmalıdır.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    try {
      const [expireMonth, expireYear] = card.expiry.split('/');
      const result = await paymentApi.init({
        ticketId,
        pnr,
        amount: price,
        passenger: { id: passengerId },
        card: {
          cardHolderName: card.cardHolderName,
          cardNumber: card.cardNumber.replace(/\s/g, ''),
          expireMonth,
          expireYear: `20${expireYear}`,
          cvc: card.cvc,
        },
      });

      // Iyzico 3D Secure HTML form gelirse render et
      if (result.htmlContent) {
        const blob = new Blob([result.htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        window.location.href = url;
        return;
      }

      // Doğrudan başarı (3D gerektirmeyen kartlar için)
      router.push(`/success?pnr=${pnr}`);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const maskedCardNumber = card.cardNumber || '•••• •••• •••• ••••';
  const displayExpiry = card.expiry || 'MM/YY';
  const displayName   = card.cardHolderName.toUpperCase() || 'AD SOYAD';

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      {/* Adım göstergesi */}
      <div className="stepper" style={{ marginBottom: '2rem' }}>
        {['Sefer Seç', 'Koltuk Seç', 'Yolcu Bilgileri', 'Ödeme'].map((step, i) => (
          <div key={step} className={`stepper__step${i === 3 ? ' active' : i < 3 ? ' done' : ''}`}>
            <div className="stepper__circle">{i < 3 ? '✓' : i + 1}</div>
            <div className="stepper__label">{step}</div>
          </div>
        ))}
      </div>

      <div className="form-card">
        <h1 className="form-card__title">Güvenli Ödeme</h1>

        {/* Iyzico Rozeti */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          background: '#F0FFF4', border: '1px solid #C3E6CB',
          borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem',
          fontSize: '0.875rem', color: '#155724',
        }}>
          🔒 <span><b>Iyzico</b> altyapısıyla korumalı ödeme. Kart bilgileriniz 3D Secure ile doğrulanacaktır.</span>
        </div>

        {/* PNR Özeti */}
        <div style={{
          background: '#F8F9FA', borderRadius: '12px', padding: '1.25rem',
          marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6C757D', fontWeight: 600 }}>BİLET PNR</div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '1px' }}>{pnr}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#6C757D' }}>ÖDENECEK TUTAR</div>
            <div style={{ fontWeight: 900, fontSize: '1.5rem', color: '#FF6B35' }}>
              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price)}
            </div>
          </div>
        </div>

        {/* Görsel Kredi Kartı */}
        <div className="payment-card">
          <div className="payment-card__bank">
            <div className="payment-card__chip" />
            <div style={{ fontWeight: 700, fontSize: '1rem', opacity: 0.8 }}>💳 KREDİ KARTI</div>
          </div>
          <div className="payment-card__number">{maskedCardNumber}</div>
          <div className="payment-card__details">
            <div>
              <div className="payment-card__label">Kart Sahibi</div>
              <div className="payment-card__value">{displayName}</div>
            </div>
            <div>
              <div className="payment-card__label">Son Kul. Tar.</div>
              <div className="payment-card__value">{displayExpiry}</div>
            </div>
          </div>
        </div>

        {/* Kart Formu */}
        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>
              ❌ {apiError}
            </div>
          )}

          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            {/* Kart Numarası */}
            <div className="form-group form-grid--full">
              <label className="form-label" htmlFor="cardNumber">Kart Numarası <span>*</span></label>
              <input
                id="cardNumber"
                type="text"
                inputMode="numeric"
                className={`form-input${errors.cardNumber ? ' error' : ''}`}
                value={card.cardNumber}
                onChange={e => handleCardChange('cardNumber', e.target.value)}
                placeholder="0000 0000 0000 0000"
                autoComplete="cc-number"
              />
              {errors.cardNumber && <span className="form-error">⚠ {errors.cardNumber}</span>}
              <div style={{ fontSize: '0.75rem', color: '#6C757D', marginTop: '0.25rem' }}>
                🧪 Test: <code>5528790000000008</code>
              </div>
            </div>

            {/* Kart Sahibi */}
            <div className="form-group form-grid--full">
              <label className="form-label" htmlFor="cardHolderName">Kart Üzerindeki İsim <span>*</span></label>
              <input
                id="cardHolderName"
                type="text"
                className={`form-input${errors.cardHolderName ? ' error' : ''}`}
                value={card.cardHolderName}
                onChange={e => handleCardChange('cardHolderName', e.target.value)}
                placeholder="AD SOYAD"
                autoComplete="cc-name"
              />
              {errors.cardHolderName && <span className="form-error">⚠ {errors.cardHolderName}</span>}
            </div>

            {/* Son Kul. Tarihi */}
            <div className="form-group">
              <label className="form-label" htmlFor="expiry">Son Kullanma Tarihi <span>*</span></label>
              <input
                id="expiry"
                type="text"
                inputMode="numeric"
                className={`form-input${errors.expiry ? ' error' : ''}`}
                value={card.expiry}
                onChange={e => handleCardChange('expiry', e.target.value)}
                placeholder="AA/YY"
                autoComplete="cc-exp"
              />
              {errors.expiry && <span className="form-error">⚠ {errors.expiry}</span>}
            </div>

            {/* CVV */}
            <div className="form-group">
              <label className="form-label" htmlFor="cvc">CVV <span>*</span></label>
              <input
                id="cvc"
                type="text"
                inputMode="numeric"
                maxLength={3}
                className={`form-input${errors.cvc ? ' error' : ''}`}
                value={card.cvc}
                onChange={e => handleCardChange('cvc', e.target.value)}
                placeholder="•••"
                autoComplete="cc-csc"
              />
              {errors.cvc && <span className="form-error">⚠ {errors.cvc}</span>}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => router.back()}
            >
              ← Geri
            </button>
            <button
              id="pay-btn"
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={loading}
            >
              {loading
                ? '⏳ Ödeme işleniyor...'
                : `🔒 ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price)} Öde`
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="loading-spinner" style={{ marginTop: '4rem' }} />}>
      <PaymentContent />
    </Suspense>
  );
}
