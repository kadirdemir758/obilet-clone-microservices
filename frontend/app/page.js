'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Popüler şehirler listesi
const CITIES = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana',
  'Konya', 'Gaziantep', 'Mersin', 'Trabzon', 'Samsun', 'Eskişehir',
  'Kayseri', 'Diyarbakır', 'Denizli', 'Bodrum', 'Kuşadası',
];

const today = new Date().toISOString().split('T')[0];

const POPULAR_ROUTES = [
  { from: 'İstanbul', to: 'Ankara', emoji: '🏛️' },
  { from: 'İstanbul', to: 'İzmir', emoji: '🌊' },
  { from: 'Ankara', to: 'Antalya', emoji: '🏖️' },
  { from: 'İzmir', to: 'İstanbul', emoji: '🌉' },
];

export default function HomePage() {
  const router = useRouter();
  const [form, setForm] = useState({ from: '', to: '', date: today });
  const [errors, setErrors] = useState({});

  function swapCities() {
    setForm((f) => ({ ...f, from: f.to, to: f.from }));
  }

  function validate() {
    const e = {};
    if (!form.from) e.from = 'Kalkış şehri seçin';
    if (!form.to)   e.to   = 'Varış şehri seçin';
    if (form.from && form.to && form.from === form.to) e.to = 'Kalkış ve varış aynı olamaz';
    if (!form.date) e.date = 'Tarih seçin';
    return e;
  }

  function handleSearch(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    router.push(`/results?from=${encodeURIComponent(form.from)}&to=${encodeURIComponent(form.to)}&date=${form.date}`);
  }

  function fillRoute(route) {
    setForm((f) => ({ ...f, from: route.from, to: route.to }));
    setErrors({});
  }

  return (
    <div className="page-wrapper">
      {/* ─── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <h1 className="hero__title animate-fadeInUp">
            Otobüs Biletin<br /><em>Saniyeler İçinde</em>
          </h1>
          <p className="hero__subtitle animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Kamil Koç, Pamukkale, Metro Turizm ve daha fazlasından<br />en uygun fiyatı karşılaştır, hemen al.
          </p>

          {/* ─── Arama Kutusu ──────────────────────── */}
          <form
            className="search-box animate-fadeInUp"
            onSubmit={handleSearch}
            style={{ animationDelay: '0.2s' }}
          >
            <div className="search-box__row">
              {/* Kalkış */}
              <div className="search-box__field">
                <label className="search-box__label">🚀 Kalkış</label>
                <select
                  id="from-city"
                  className={`search-box__input${errors.from ? ' error' : ''}`}
                  value={form.from}
                  onChange={(e) => { setForm(f => ({ ...f, from: e.target.value })); setErrors(er => ({ ...er, from: '' })); }}
                >
                  <option value="">Şehir seçin...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.from && <span className="form-error">⚠ {errors.from}</span>}
              </div>

              {/* Değiştirme */}
              <button type="button" className="search-box__swap" onClick={swapCities} title="Şehirleri değiştir">
                ⇄
              </button>

              {/* Varış */}
              <div className="search-box__field">
                <label className="search-box__label">🏁 Varış</label>
                <select
                  id="to-city"
                  className={`search-box__input${errors.to ? ' error' : ''}`}
                  value={form.to}
                  onChange={(e) => { setForm(f => ({ ...f, to: e.target.value })); setErrors(er => ({ ...er, to: '' })); }}
                >
                  <option value="">Şehir seçin...</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.to && <span className="form-error">⚠ {errors.to}</span>}
              </div>

              {/* Tarih */}
              <div className="search-box__field">
                <label className="search-box__label">📅 Tarih</label>
                <input
                  id="trip-date"
                  type="date"
                  className={`search-box__input${errors.date ? ' error' : ''}`}
                  value={form.date}
                  min={today}
                  onChange={(e) => { setForm(f => ({ ...f, date: e.target.value })); setErrors(er => ({ ...er, date: '' })); }}
                />
                {errors.date && <span className="form-error">⚠ {errors.date}</span>}
              </div>
            </div>

            <button type="submit" id="search-btn" className="search-box__btn">
              🔍 Sefer Ara
            </button>
          </form>
        </div>
      </section>

      {/* ─── Popüler Güzergahlar ───────────────────────── */}
      <section style={{ padding: '3rem 0', background: '#fff' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
            🔥 Popüler Güzergahlar
          </h2>
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {POPULAR_ROUTES.map((route) => (
              <button
                key={`${route.from}-${route.to}`}
                className="animate-fadeInUp"
                onClick={() => fillRoute(route)}
                style={{
                  background: 'linear-gradient(135deg, #F8F9FA, #fff)',
                  border: '2px solid #E9ECEF',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='#FF6B35'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='#E9ECEF'; e.currentTarget.style.transform=''; }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{route.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>{route.from}</div>
                <div style={{ color: '#6C757D', fontSize: '0.875rem' }}>→ {route.to}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Özellikler ────────────────────────────────── */}
      <section style={{ padding: '3rem 0', background: '#F8F9FA' }}>
        <div className="container">
          <div
            className="stagger"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}
          >
            {[
              { icon: '🏢', title: '30+ Firma', desc: 'Türkiye\'nin önde gelen firmalarından bilet satın alın' },
              { icon: '💺', title: 'Koltuk Seçimi', desc: 'Otobüs içi görünümüyle istediğiniz koltuğu seçin' },
              { icon: '🔒', title: 'Güvenli Ödeme', desc: 'Iyzico 3D Secure ile korumalı ödeme altyapısı' },
              { icon: '📱', title: 'E-Bilet', desc: 'Aldığınız biletler anında e-posta adresinize gönderilir' },
            ].map((f, i) => (
              <div
                key={i}
                className="animate-fadeInUp"
                style={{
                  background: '#fff',
                  borderRadius: '16px',
                  padding: '2rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                  border: '1px solid #E9ECEF',
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: '#6C757D', fontSize: '0.875rem', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ────────────────────────────────────── */}
      <footer style={{
        background: '#1A1A2E',
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        padding: '2rem',
        fontSize: '0.875rem',
        marginTop: 'auto',
      }}>
        © 2026 Obilet Clone — Eğitim Amaçlı Proje
      </footer>
    </div>
  );
}
