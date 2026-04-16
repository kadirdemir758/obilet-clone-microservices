'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function TicketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 1. URL'den Gelen Gerçek Verileri Yakalıyoruz
  // Eğer herhangi bir veri gelmezse (hata olursa) sağ taraftaki || sonrasındaki yedek verileri kullanır.
  const pnr = searchParams.get('pnr') || `PNR${Math.floor(1000 + Math.random() * 9000)}`;
  const name = searchParams.get('name') || 'MİRAÇ MERÇ';
  const origin = searchParams.get('origin') || 'Eskişehir';
  const dest = searchParams.get('dest') || 'Kütahya';
  const time = searchParams.get('time') || '13:45';
  const date = searchParams.get('date') || '16 Nisan 2026';
  const price = searchParams.get('price') || '470';
  const company = searchParams.get('company') || 'Kütahyalılar Turizm';
  
  // Koltuk "null" gelirse çirkin görünmesin diye ufak bir filtre yapıyoruz
  const rawSeats = searchParams.get('seats');
  const seats = (rawSeats && rawSeats !== 'null') ? rawSeats : 'Seçilmedi';

  return (
    <div style={{ maxWidth: '600px', margin: '4rem auto', fontFamily: 'sans-serif', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', borderRadius: '12px', overflow: 'hidden' }}>
      
      {/* Üst Kısım - Lacivert */}
      <div style={{ backgroundColor: '#1E1B2E', padding: '1.5rem 2rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#A0A0A0', marginBottom: '0.25rem', letterSpacing: '1px' }}>DİJİTAL BİLET (PNR)</div>
          <div style={{ fontSize: '1.75rem', color: '#FF6B35', fontWeight: 900 }}>{pnr}</div>
        </div>
        <div style={{ backgroundColor: '#388E3C', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          ONAYLANDI ✅
        </div>
      </div>

      {/* Orta Kısım - Beyaz */}
      <div style={{ backgroundColor: '#fff', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Yolcu</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#222' }}>{name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Firma</div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#3B5BDB' }}>{company}</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#222' }}>{time}</div>
            <div style={{ fontSize: '1.2rem', color: '#444', fontWeight: 600 }}>{origin}</div>
            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.2rem' }}>{date}</div>
          </div>
          
          <div style={{ padding: '0 1.5rem', color: '#cbd5e1', fontSize: '2rem' }}>→</div>
          
          <div style={{ flex: 1, textAlign: 'right' }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#222' }}>Varış</div>
            <div style={{ fontSize: '1.2rem', color: '#444', fontWeight: 600 }}>{dest}</div>
            <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.2rem' }}>Güvenli Yolculuklar</div>
          </div>
        </div>
      </div>

      {/* Alt Kısım - Gri */}
      <div style={{ backgroundColor: '#F8F9FA', borderTop: '2px dashed #E0E0E0', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Koltuk</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#FF6B35' }}>{seats}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Tutar</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#222' }}>₺{price}</div>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#fff', padding: '1rem', textAlign: 'center' }}>
        <button 
          onClick={() => router.push('/')} 
          style={{ background: '#FF6B35', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>
          Ana Sayfaya Dön
        </button>
      </div>

    </div>
  );
}

export default function SuccessPage() {
  return (
    // URL parametrelerini kullanan componentler Next.js'te Suspense içine alınmalıdır.
    <Suspense fallback={<div style={{textAlign: 'center', padding: '4rem', color: '#666'}}>Biletiniz hazırlanıyor...</div>}>
      <TicketContent />
    </Suspense>
  );
}