'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// ─── 🛡️ GERÇEK T.C. KİMLİK DOĞRULAMA ALGORİTMASI ───
function validateTC(tc) {
  if (!tc || tc.length !== 11 || tc[0] === '0') return false;
  
  const digits = tc.split('').map(Number);
  
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const tenthDigit = (oddSum * 7 - evenSum) % 10;
  
  if (digits[9] !== tenthDigit) return false;
  
  const firstTenSum = digits.slice(0, 10).reduce((acc, curr) => acc + curr, 0);
  if (digits[10] !== firstTenSum % 10) return false;
  
  return true;
}

function PassengerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tripId = searchParams.get('tripId') || (typeof window !== 'undefined' ? localStorage.getItem('currentTripId') : null);
  const price = searchParams.get('price') || (typeof window !== 'undefined' ? localStorage.getItem('currentTotalPrice') : '0');
  const seatsParam = searchParams.get('seats') || (typeof window !== 'undefined' ? localStorage.getItem('selectedSeats') : '');

  const seatArray = seatsParam ? seatsParam.split(',') : [];

  const [passengers, setPassengers] = useState([]);

  useEffect(() => {
    if (seatArray.length > 0 && passengers.length === 0) {
      const initialForms = seatArray.map(seat => ({
        seatNo: seat,
        tc: '',
        firstName: '',
        lastName: '',
        // ❗ YENİ: Hataları pop-up yerine burada tutuyoruz
        errors: { tc: '', firstName: '', lastName: '' }
      }));
      setPassengers(initialForms);
    }
  }, [seatArray]);

  const handleInputChange = (index, field, value) => {
    const newPassengers = [...passengers];
    newPassengers[index][field] = value;
    // Kullanıcı yazmaya başladığında o kutudaki hatayı hemen sil (Güzel UX)
    newPassengers[index].errors[field] = '';
    setPassengers(newPassengers);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let hasError = false;
    const newPassengers = [...passengers];
    const tcList = [];

    // 1. AŞAMA: Tek tek form alanlarını kontrol et
    newPassengers.forEach((p, index) => {
      // Önce mevcut hataları sıfırla
      p.errors = { tc: '', firstName: '', lastName: '' };

      if (!p.firstName.trim()) {
        p.errors.firstName = 'Ad alanı zorunludur.';
        hasError = true;
      }
      
      if (!p.lastName.trim()) {
        p.errors.lastName = 'Soyad alanı zorunludur.';
        hasError = true;
      }

      if (!p.tc) {
        p.errors.tc = 'T.C. Kimlik No zorunludur.';
        hasError = true;
      } else if (p.tc.length !== 11) {
        p.errors.tc = 'T.C. tam 11 haneli olmalıdır.';
        hasError = true;
      } else if (!validateTC(p.tc)) {
        p.errors.tc = 'Geçersiz T.C. Numarası girdiniz.';
        hasError = true;
      } else {
        // Kontrol için listeye at (Aynı TC kontrolü için objeyle tutuyoruz)
        tcList.push({ tc: p.tc, index });
      }
    });

    // 2. AŞAMA: T.C. Kimlik Numaraları Benzersiz mi?
    const seenTcs = new Set();
    tcList.forEach(item => {
      if (seenTcs.has(item.tc)) {
        newPassengers[item.index].errors.tc = 'Bu numara başka bir koltukta kullanılmış.';
        
        // İlk giren de hata alsın diye onu da bulup işaretliyoruz
        const firstIndex = tcList.find(t => t.tc === item.tc).index;
        newPassengers[firstIndex].errors.tc = 'Bu numara başka bir koltukta kullanılmış.';
        hasError = true;
      } else {
        seenTcs.add(item.tc);
      }
    });

    // Eğer herhangi bir hata varsa state'i güncelle ve dur (Ödemeye geçme)
    if (hasError) {
      setPassengers(newPassengers);
      return;
    }

    // Her şey kusursuzsa Ödeme sayfasına geçiyoruz
    const firstPassengerName = `${passengers[0].firstName} ${passengers[0].lastName}`.toUpperCase();
    router.push(`/payment?tripId=${tripId}&seats=${seatsParam}&price=${price}&name=${encodeURIComponent(firstPassengerName)}`);
  };

  if (seatArray.length === 0) return <div style={{textAlign: 'center', padding: '4rem'}}>Koltuk seçimi bulunamadı.</div>;

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '0 1rem' }}>
      
      <div className="stepper" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        {['Sefer Seç', 'Koltuk Seç', 'Yolcu Bilgileri', 'Ödeme'].map((step, i) => (
          <div key={step} style={{ fontWeight: i === 2 ? 'bold' : 'normal', color: i <= 2 ? '#FF6B35' : '#999' }}>
            {i + 1}. {step}
          </div>
        ))}
      </div>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem', color: '#1F2937' }}>Yolcu Bilgileri</h1>
      
      <form onSubmit={handleSubmit} noValidate>
        {passengers.map((passenger, index) => (
          <div key={index} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB', marginBottom: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h3 style={{ borderBottom: '2px solid #F3F4F6', paddingBottom: '0.5rem', marginBottom: '1rem', color: '#FF6B35' }}>
              💺 {passenger.seatNo} Numaralı Koltuk
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>T.C. Kimlik No</label>
                <input 
                  type="text" 
                  maxLength={11}
                  style={{ 
                    width: '100%', padding: '0.75rem', borderRadius: '6px', 
                    border: passenger.errors.tc ? '1px solid #DC2626' : '1px solid #D1D5DB', // Hata varsa kırmızı çerçeve
                    outline: 'none', transition: 'border 0.2s'
                  }}
                  value={passenger.tc}
                  onChange={(e) => handleInputChange(index, 'tc', e.target.value.replace(/\D/g, ''))}
                  placeholder="11 Haneli TC Giriniz"
                />
                {/* ❗ YENİ: Hata Mesajı Altına Çıkıyor */}
                {passenger.errors.tc && (
                  <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.3rem', fontWeight: 600 }}>
                    {passenger.errors.tc}
                  </div>
                )}
              </div>
              
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ad</label>
                  <input 
                    type="text" 
                    style={{ 
                      width: '100%', padding: '0.75rem', borderRadius: '6px', 
                      border: passenger.errors.firstName ? '1px solid #DC2626' : '1px solid #D1D5DB',
                      outline: 'none', transition: 'border 0.2s'
                    }}
                    value={passenger.firstName}
                    onChange={(e) => handleInputChange(index, 'firstName', e.target.value)}
                    placeholder="Adınız"
                  />
                  {passenger.errors.firstName && (
                    <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.3rem', fontWeight: 600 }}>
                      {passenger.errors.firstName}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Soyad</label>
                  <input 
                    type="text" 
                    style={{ 
                      width: '100%', padding: '0.75rem', borderRadius: '6px', 
                      border: passenger.errors.lastName ? '1px solid #DC2626' : '1px solid #D1D5DB',
                      outline: 'none', transition: 'border 0.2s'
                    }}
                    value={passenger.lastName}
                    onChange={(e) => handleInputChange(index, 'lastName', e.target.value)}
                    placeholder="Soyadınız"
                  />
                  {passenger.errors.lastName && (
                    <div style={{ color: '#DC2626', fontSize: '0.8rem', marginTop: '0.3rem', fontWeight: 600 }}>
                      {passenger.errors.lastName}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F9FAFB', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
          <div>
            <div style={{ fontSize: '0.9rem', color: '#6B7280' }}>Ödenecek Tutar</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1F2937' }}>₺{price}</div>
          </div>
          <button type="submit" style={{ background: '#FF6B35', color: '#fff', padding: '1rem 2rem', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
            Ödemeye İlerle →
          </button>
        </div>
      </form>
    </div>
  );
}

export default function PassengerPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>Yükleniyor...</div>}>
      <PassengerContent />
    </Suspense>
  );
}