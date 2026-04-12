'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('loading');

  const paymentId = searchParams.get('paymentId');
  const statusParam = searchParams.get('status');

  useEffect(() => {
    // Simülasyon olduğu için doğrudan başarılı kabul ediyoruz
    if (statusParam === 'success' || paymentId) {
      setStatus('success');
    } else {
      setStatus('error');
    }
  }, [paymentId, statusParam]);

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      justifyContent: 'center', height: '100vh', textAlign: 'center',
      fontFamily: 'sans-serif', background: '#f4f7f6' 
    }}>
      {status === 'success' ? (
        <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ color: '#2ecc71', margin: '0 0 10px 0' }}>Ödeme Başarılı!</h1>
          <p style={{ color: '#636e72', fontSize: '18px' }}>Biletiniz başarıyla oluşturuldu.</p>
          <div style={{ 
            background: '#f8f9fa', padding: '15px', borderRadius: '10px', 
            margin: '20px 0', border: '1px dashed #dfe6e9' 
          }}>
            <small style={{ color: '#b2bec3', display: 'block', marginBottom: '5px' }}>İŞLEM NUMARASI (PAYMENT ID)</small>
            <strong style={{ fontSize: '14px', color: '#2d3436' }}>{paymentId}</strong>
          </div>
          <Link href="/" style={{
            display: 'inline-block', background: '#ff6b35', color: 'white', 
            padding: '12px 30px', borderRadius: '10px', textDecoration: 'none',
            fontWeight: 'bold', transition: 'background 0.3s'
          }}>
            Ana Sayfaya Dön
          </Link>
        </div>
      ) : (
        <div>
          <h1>❌ Ödeme Başarısız</h1>
          <Link href="/payment">Tekrar Dene</Link>
        </div>
      )}
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <CallbackContent />
    </Suspense>
  );
}