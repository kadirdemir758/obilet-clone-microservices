'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ALL_CITIES } from '@/lib/cities';

const today = new Date().toISOString().split('T')[0];

const POPULAR_ROUTES = [
  { from: 'İstanbul', to: 'Ankara',  emoji: '🏛️' },
  { from: 'İstanbul', to: 'İzmir',   emoji: '🌊' },
  { from: 'İstanbul', to: 'Antalya', emoji: '🏖️' },
  { from: 'Ankara',   to: 'İzmir',   emoji: '🌉' },
  { from: 'İzmir',    to: 'Bodrum',  emoji: '⛵' },
  { from: 'İstanbul', to: 'Trabzon', emoji: '🌿' },
];

export default function HomePage() {
  const router = useRouter();
  const [form, setForm]     = useState({ from: '', to: '', date: today });
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

  // 🔥 GÜNCELLENEN KISIM: Sayfa yenilenmesini engeller ve doğru parametreleri gönderir
  function handleSearch(e) {
    if (e) e.preventDefault();
    
    console.log("🚀 Butona basıldı, arama başlıyor...");
    console.log("📦 Form Verileri:", form);

    const errs = validate();
    console.log("📋 Doğrulama Sonuçları:", errs);

    if (Object.keys(errs).length > 0) { 
        console.warn("⚠️ Formda hatalar var, durduruldu!");
        setErrors(errs); 
        return; 
    }

    // Backend parametreleri (origin/destination) ile uyumlu yönlendirme
    console.log("🔗 Yönlendirme hazırlanıyor...");
    const queryParams = new URLSearchParams({
        from: form.from, // Senin sayfanda 'from' ve 'to' olarak tanımlıydı
        to: form.to,
        date: form.date
    }).toString();

    const targetUrl = `/results?${queryParams}`;
    console.log("📍 Hedef URL:", targetUrl);

    try {
        router.push(targetUrl);
        console.log("✅ router.push çalıştırıldı!");
    } catch (error) {
        console.error("❌ Yönlendirme hatası:", error);
    }
  }

  function fillRoute(route) {
    setForm((f) => ({ ...f, from: route.from, to: route.to }));
    setErrors({});
  }

  return (
    <div className="page-wrapper">
      <section className="hero">
        <div className="container">
          <h1 className="hero__title animate-fadeInUp">
            Otobüs Biletin<br /><em>Saniyeler İçinde</em>
          </h1>
          <p className="hero__subtitle animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            Kamil Koç, Pamukkale, Varan, Metro Turizm ve daha fazlasından<br />
            en uygun fiyatı karşılaştır, hemen al.
          </p>

          {/* Arama Kutusu */}
          <form
            className="search-box animate-fadeInUp"
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
                  onChange={(e) => {
                    setForm((f) => ({ ...f, from: e.target.value }));
                    setErrors((er) => ({ ...er, from: '' }));
                  }}
                >
                  <option value="">Şehir seçin... ({ALL_CITIES.length} seçenek)</option>
                  {ALL_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.from && <span className="form-error">⚠ {errors.from}</span>}
              </div>

              {/* Değiştir Butonu */}
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
                  onChange={(e) => {
                    setForm((f) => ({ ...f, to: e.target.value }));
                    setErrors((er) => ({ ...er, to: '' }));
                  }}
                >
                  <option value="">Şehir seçin...</option>
                  {ALL_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
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
                  onChange={(e) => {
                    setForm((f) => ({ ...f, date: e.target.value }));
                    setErrors((er) => ({ ...er, date: '' }));
                  }}
                />
                {errors.date && <span className="form-error">⚠ {errors.date}</span>}
              </div>
            </div>

            {/* 🔥 GARANTİ YÖNTEM: type="button" ve onClick kullanımı */}
            <button 
              type="button" 
              id="search-btn" 
              className="search-box__btn"
              onClick={(e) => handleSearch(e)}
            >
              🔍 Sefer Ara
            </button>
          </form>
        </div>
      </section>

      {/* Popüler Güzergahlar */}
      <section style={{ padding: '3rem 0', background: '#fff' }}>
        <div className="container">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
            🔥 Popüler Güzergahlar
          </h2>
          <div
            className="stagger"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}
          >
            {POPULAR_ROUTES.map((route) => (
              <button
                key={`${route.from}-${route.to}`}
                className="animate-fadeInUp"
                onClick={() => fillRoute(route)}
                style={{
                  background: '#F8F9FA', border: '2px solid #E9ECEF',
                  borderRadius: '12px', padding: '1.25rem',
                  textAlign: 'left', cursor: 'pointer',
                  transition: 'all 0.2s ease', fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#FF6B35'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E9ECEF'; e.currentTarget.style.transform = ''; }}
              >
                <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{route.emoji}</div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{route.from}</div>
                <div style={{ color: '#6C757D', fontSize: '0.8rem' }}>→ {route.to}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1A1A2E', color: 'rgba(255,255,255,0.5)',
        textAlign: 'center', padding: '2rem', fontSize: '0.875rem', marginTop: 'auto',
      }}>
        © 2026 Obilet Clone — Eğitim Amaçlı Proje
      </footer>
    </div>
  );
}