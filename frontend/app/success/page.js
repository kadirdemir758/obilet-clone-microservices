'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const pnr = params.get('pnr') || '—';

  return (
    <div style={{ maxWidth: 600, margin: '4rem auto', padding: '0 1rem', textAlign: 'center' }}>
      <div style={{
        background: '#fff', borderRadius: '24px', padding: '3rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid #E9ECEF',
      }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'fadeInUp 0.5s ease' }}>🎉</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#1A1A2E', marginBottom: '0.75rem' }}>
          Biletiniz Onaylandı!
        </h1>
        <p style={{ color: '#6C757D', marginBottom: '2rem', lineHeight: 1.6 }}>
          Ödemeniz başarıyla gerçekleşti. Bilet bilgileriniz kayıtlı e-posta adresinize gönderilecektir.
        </p>

        {/* PNR Kutusu */}
        <div style={{
          background: 'linear-gradient(135deg, #1A1A2E, #16213E)',
          color: '#fff', borderRadius: '16px', padding: '2rem', marginBottom: '2rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.5rem', letterSpacing: '1px' }}>
            BİLET REFERANS NO (PNR)
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '3px', color: '#FF6B35' }}>
            {pnr}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.5rem' }}>
            Bu numarayı saklayın — binişte gerekebilir.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn--secondary"
            onClick={() => router.push(`/?pnr=${pnr}`)}
          >
            🔍 Bilet Sorgula
          </button>
          <button
            className="btn btn--primary"
            onClick={() => router.push('/')}
          >
            🏠 Ana Sayfaya Dön
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="loading-spinner" style={{ marginTop: '4rem' }} />}>
      <SuccessContent />
    </Suspense>
  );
}
