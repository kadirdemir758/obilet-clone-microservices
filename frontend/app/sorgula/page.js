'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SorgulaPage() {
  const router = useRouter();
  const [pnr, setPnr] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!pnr.trim()) {
      setError('Lütfen geçerli bir PNR kodu giriniz.');
      return;
    }

    // ❗ HAFIZADAN SENİN GERÇEK BİLETLERİNİ ÇEKİYORUZ
    const existingBookings = JSON.parse(localStorage.getItem('myBookings') || '[]');
    const foundTicket = existingBookings.find(b => b.pnr.toUpperCase() === pnr.toUpperCase().trim());

    if (foundTicket) {
      setResult(foundTicket);
    } else {
      setError('Bu PNR koduna ait bir bilet bulunamadı. Lütfen kontrol edip tekrar deneyin.');
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '4rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem', textAlign: 'center', color: '#1F2937' }}>
        Bilet Sorgulama
      </h1>
      
      <form onSubmit={handleSearch} style={{ background: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#4B5563' }}>PNR Kodu</label>
          <input 
            type="text" 
            placeholder="Örn: PNR1234" 
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '1.1rem', textTransform: 'uppercase' }} 
            value={pnr} 
            onChange={(e) => setPnr(e.target.value)}
          />
        </div>
        <button type="submit" style={{ width: '100%', background: '#FF6B35', color: '#fff', padding: '1rem', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
          Bileti Bul
        </button>
        {error && <div style={{ marginTop: '1rem', color: '#DC2626', background: '#FEF2F2', padding: '1rem', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>{error}</div>}
      </form>

      {/* ❗ BİLET BULUNDUYSA EKRANA BAS */}
      {result && (
        <div style={{ backgroundColor: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden', animation: 'fadeInUp 0.5s ease' }}>
          <div style={{ backgroundColor: '#1E1B2E', padding: '1.5rem 2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#A0A0A0', marginBottom: '0.25rem', letterSpacing: '1px' }}>DİJİTAL BİLET (PNR)</div>
              <div style={{ fontSize: '1.75rem', color: '#FF6B35', fontWeight: 900 }}>{result.pnr}</div>
            </div>
            <div style={{ backgroundColor: '#388E3C', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              ONAYLANDI ✅
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Yolcu</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#222' }}>{result.name}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Firma</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#3B5BDB' }}>{result.company}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#222' }}>{result.time}</div>
                <div style={{ fontSize: '1.2rem', color: '#444', fontWeight: 600 }}>{result.origin}</div>
                <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.2rem' }}>{result.date}</div>
              </div>
              <div style={{ padding: '0 1.5rem', color: '#cbd5e1', fontSize: '2rem' }}>→</div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#222' }}>Varış</div>
                <div style={{ fontSize: '1.2rem', color: '#444', fontWeight: 600 }}>{result.dest}</div>
                <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.2rem' }}>Güvenli Yolculuklar</div>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#F8F9FA', borderTop: '2px dashed #E0E0E0', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Koltuk</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FF6B35' }}>{result.seats}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Tutar</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#222' }}>₺{result.price}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}