'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { validateTCKN, formatTCKN } from '@/../../lib/tcknValidator';
import { ticketsApi } from '@/../../lib/api';

function PassengerContent() {
  const params = useSearchParams();
  const router = useRouter();

  const tripId      = params.get('tripId');
  const seatNumber  = parseInt(params.get('seatNumber'));
  const price       = parseFloat(params.get('price'));
  const gender      = params.get('gender'); // MALE | FEMALE

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: gender || '',
    tckn: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [tcknStatus, setTcknStatus] = useState(null); // null | {valid, message}
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // ─── Alan güncelleme ─────────────────────────────────
  function handleChange(field, value) {
    if (field === 'tckn') {
      const formatted = formatTCKN(value);
      setForm(f => ({ ...f, tckn: formatted }));
      if (formatted.length === 11) {
        const result = validateTCKN(formatted);
        setTcknStatus(result);
      } else {
        setTcknStatus(null);
      }
      return;
    }
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  }

  // ─── Form doğrulama ───────────────────────────────────
  function validate() {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Ad zorunludur.';
    if (!form.lastName.trim())  e.lastName  = 'Soyad zorunludur.';
    if (!form.birthDate)         e.birthDate = 'Doğum tarihi zorunludur.';
    if (!form.gender)            e.gender    = 'Cinsiyet zorunludur.';
    if (!form.tckn)              e.tckn      = 'TCKN zorunludur.';
    else {
      const tcknResult = validateTCKN(form.tckn);
      if (!tcknResult.valid) e.tckn = tcknResult.message;
    }
    return e;
  }

  // ─── Form gönder ─────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    try {
      const result = await ticketsApi.hold({
        tripId,
        seatNumber,
        passenger: {
          firstName: form.firstName.trim(),
          lastName:  form.lastName.trim(),
          birthDate: form.birthDate,
          gender:    form.gender,
          tckn:      form.tckn,
          email:     form.email,
          phone:     form.phone,
        },
      });

      // Başarılı — ödeme sayfasına yönlendir
      router.push(
        `/payment?ticketId=${result.ticket.id}&pnr=${result.ticket.pnr}&passengerId=${result.passenger.id}&price=${price}`
      );
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 2);
  const maxBirthDateStr = maxBirthDate.toISOString().split('T')[0];

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '0 1rem' }}>
      {/* Adım göstergesi */}
      <div className="stepper" style={{ marginBottom: '2rem' }}>
        {['Sefer Seç', 'Koltuk Seç', 'Yolcu Bilgileri', 'Ödeme'].map((step, i) => (
          <div key={step} className={`stepper__step${i === 2 ? ' active' : i < 2 ? ' done' : ''}`}>
            <div className="stepper__circle">{i < 2 ? '✓' : i + 1}</div>
            <div className="stepper__label">{step}</div>
          </div>
        ))}
      </div>

      <div className="form-card">
        <h1 className="form-card__title">Yolcu Bilgileri</h1>

        {apiError && (
          <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>
            ❌ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Ad */}
            <div className="form-group">
              <label className="form-label" htmlFor="firstName">Ad <span>*</span></label>
              <input
                id="firstName"
                type="text"
                className={`form-input${errors.firstName ? ' error' : ''}`}
                value={form.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
                placeholder="Adınız"
                autoComplete="given-name"
              />
              {errors.firstName && <span className="form-error">⚠ {errors.firstName}</span>}
            </div>

            {/* Soyad */}
            <div className="form-group">
              <label className="form-label" htmlFor="lastName">Soyad <span>*</span></label>
              <input
                id="lastName"
                type="text"
                className={`form-input${errors.lastName ? ' error' : ''}`}
                value={form.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
                placeholder="Soyadınız"
                autoComplete="family-name"
              />
              {errors.lastName && <span className="form-error">⚠ {errors.lastName}</span>}
            </div>

            {/* Doğum Tarihi */}
            <div className="form-group">
              <label className="form-label" htmlFor="birthDate">Doğum Tarihi <span>*</span></label>
              <input
                id="birthDate"
                type="date"
                className={`form-input${errors.birthDate ? ' error' : ''}`}
                value={form.birthDate}
                max={maxBirthDateStr}
                onChange={e => handleChange('birthDate', e.target.value)}
              />
              {errors.birthDate && <span className="form-error">⚠ {errors.birthDate}</span>}
            </div>

            {/* Cinsiyet */}
            <div className="form-group">
              <label className="form-label" htmlFor="gender">Cinsiyet <span>*</span></label>
              <select
                id="gender"
                className={`form-input${errors.gender ? ' error' : ''}`}
                value={form.gender}
                onChange={e => handleChange('gender', e.target.value)}
              >
                <option value="">Seçin...</option>
                <option value="MALE">♂ Erkek</option>
                <option value="FEMALE">♀ Kadın</option>
              </select>
              {errors.gender && <span className="form-error">⚠ {errors.gender}</span>}
            </div>

            {/* TCKN — Tam satır */}
            <div className="form-group form-grid--full">
              <label className="form-label" htmlFor="tckn">
                T.C. Kimlik Numarası <span>*</span>
              </label>
              <input
                id="tckn"
                type="text"
                inputMode="numeric"
                maxLength={11}
                className={`form-input${errors.tckn ? ' error' : tcknStatus?.valid ? ' success' : ''}`}
                value={form.tckn}
                onChange={e => handleChange('tckn', e.target.value)}
                placeholder="11 haneli T.C. kimlik numaranız"
                autoComplete="off"
              />
              {/* Gerçek zamanlı TCKN feedback */}
              {form.tckn.length > 0 && form.tckn.length < 11 && (
                <span style={{ fontSize: '0.75rem', color: '#ADB5BD' }}>
                  {form.tckn.length}/11 hane girildi
                </span>
              )}
              {tcknStatus && !tcknStatus.valid && (
                <span className="form-error">⚠ {tcknStatus.message}</span>
              )}
              {tcknStatus && tcknStatus.valid && (
                <span className="form-success">✅ {tcknStatus.message}</span>
              )}
              {errors.tckn && !tcknStatus && (
                <span className="form-error">⚠ {errors.tckn}</span>
              )}
            </div>

            {/* E-posta */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">E-posta</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="eposta@ornek.com"
                autoComplete="email"
              />
            </div>

            {/* Telefon */}
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Telefon</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                value={form.phone}
                onChange={e => handleChange('phone', e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                autoComplete="tel"
              />
            </div>
          </div>

          {/* Bilgilendirme */}
          <div className="alert alert--warning" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            🔒 Kişisel bilgileriniz şifrelenmiş olarak saklanmakta ve yalnızca bilet işlemleri için kullanılmaktadır.
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
              id="passenger-submit-btn"
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={loading}
            >
              {loading ? '⏳ İşleniyor...' : 'Ödemeye Geç →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PassengerPage() {
  return (
    <Suspense fallback={<div className="loading-spinner" style={{ marginTop: '4rem' }} />}>
      <PassengerContent />
    </Suspense>
  );
}
