'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function SeatSelectionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const tripId = searchParams.get('tripId');
  const basePrice = parseFloat(searchParams.get('price') || '0');

  const [trip, setTrip] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Yönetimi İçin State'ler
  const [selectingGenderFor, setSelectingGenderFor] = useState(null);
  const [allowedGender, setAllowedGender] = useState('BOTH'); // 'K', 'E', veya 'BOTH'

  useEffect(() => {
    if (!tripId) {
      alert("Sefer bilgisi bulunamadı! Ana sayfaya yönlendiriliyorsunuz.");
      router.push('/');
      return;
    }

    fetch(`https://kadirdemir758-obilet-trip-service.hf.space/api/v1/trips/${tripId}`)
      .then(res => res.json())
      .then(data => {
        setTrip(data);
        
        // ❗ KURŞUN GEÇİRMEZ ALGORİTMA: Backend'den gelen numaralara simülasyon icabı cinsiyet atıyoruz
        const fetchedOccupied = data.occupiedSeats || [2, 5, 6, 11, 15, 18, 22, 23, 28, 33];
        const formattedOccupied = fetchedOccupied.map(seatNo => ({
          seatNo,
          gender: seatNo % 2 === 0 ? 'E' : 'K' // Çift numaralar Erkek, Tek numaralar Kadın simülasyonu
        }));
        setOccupiedSeats(formattedOccupied);
        setLoading(false);

        localStorage.setItem('currentTripId', tripId);
        localStorage.setItem('currentBasePrice', basePrice);
      })
      .catch(err => {
        console.error("Hata:", err);
        setLoading(false);
      });
  }, [tripId, basePrice, router]);

  // Yan koltuğu (partner koltuğu) bulma mantığı
  const getPairedSeat = (seatNo) => {
    // Son sıra (37, 38, 39, 40) için özel kural
    if (seatNo >= 37) {
      if (seatNo === 37) return 38;
      if (seatNo === 38) return 37;
      if (seatNo === 39) return 40;
      if (seatNo === 40) return 39;
    }
    // Ana sıralar: Orta koltuk (+1 ile eşli), Sağ koltuk (-1 ile eşli)
    if (seatNo % 3 === 2) return seatNo + 1;
    if (seatNo % 3 === 0) return seatNo - 1;
    // Tekli koltuk (Sol taraf) - Eşi yok
    return null;
  };

  const toggleSeat = (seatNo) => {
    const isOccupied = occupiedSeats.find(s => s.seatNo === seatNo);
    if (isOccupied) return; // Dolu koltuğa tıklanamaz
    
    const existingSeat = selectedSeats.find(s => s.seatNo === seatNo);
    
    if (existingSeat) {
      setSelectedSeats(selectedSeats.filter(s => s.seatNo !== seatNo));
    } else {
      if (selectedSeats.length >= 4) {
        alert("En fazla 4 adet koltuk seçebilirsiniz.");
        return;
      }

      // ❗ CİNSİYET KONTROLÜ: Yan koltukta kim oturuyor?
      const pairedSeatNo = getPairedSeat(seatNo);
      let restriction = 'BOTH';

      if (pairedSeatNo) {
        const pairedOccupied = occupiedSeats.find(s => s.seatNo === pairedSeatNo);
        const pairedSelected = selectedSeats.find(s => s.seatNo === pairedSeatNo);

        if (pairedOccupied) restriction = pairedOccupied.gender;
        else if (pairedSelected) restriction = pairedSelected.gender;
      }

      setAllowedGender(restriction);
      setSelectingGenderFor(seatNo);
    }
  };

  const confirmGender = (gender) => {
    setSelectedSeats([...selectedSeats, { seatNo: selectingGenderFor, gender }]);
    setSelectingGenderFor(null); 
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      alert("Lütfen devam etmek için en az 1 koltuk seçiniz.");
      return;
    }
    
    const totalPrice = selectedSeats.length * basePrice;
    const seatNumbers = selectedSeats.map(s => s.seatNo).join(',');
    
    localStorage.setItem('selectedSeats', seatNumbers);
    localStorage.setItem('selectedSeatsDetails', JSON.stringify(selectedSeats)); 
    localStorage.setItem('currentTotalPrice', totalPrice);

    router.push(`/passenger?tripId=${tripId}&seats=${seatNumbers}&price=${totalPrice}`);
  };

  const renderSeat = (seatNo) => {
    const occupiedObj = occupiedSeats.find(s => s.seatNo === seatNo);
    const selectedObj = selectedSeats.find(s => s.seatNo === seatNo);
    
    let bgColor = '#fff';
    let borderColor = '#D1D5DB';
    let textColor = '#374151';
    let cursor = 'pointer';

    if (occupiedObj) {
      cursor = 'not-allowed';
      // Dolu koltukların cinsiyetini soluk renklerle belli ediyoruz
      if (occupiedObj.gender === 'K') {
        bgColor = '#FCE4EC'; borderColor = '#F48FB1'; textColor = '#E91E63'; // Açık Pembe
      } else {
        bgColor = '#E3F2FD'; borderColor = '#90CAF9'; textColor = '#2196F3'; // Açık Mavi
      }
    } else if (selectedObj) {
      // Senin seçtiğin koltuklar canlı renkli
      if (selectedObj.gender === 'K') {
        bgColor = '#E91E63'; borderColor = '#E91E63'; textColor = '#fff'; 
      } else {
        bgColor = '#2196F3'; borderColor = '#2196F3'; textColor = '#fff'; 
      }
    }

    return (
      <div
        key={seatNo}
        onClick={() => toggleSeat(seatNo)}
        style={{
          width: '45px', height: '45px', background: bgColor, border: `2px solid ${borderColor}`,
          borderRadius: '8px 8px 4px 4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', cursor: cursor, transition: 'all 0.2s ease', userSelect: 'none', color: textColor,
          boxShadow: selectedObj ? '0 4px 10px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        {seatNo}
      </div>
    );
  };

  if (loading) return <div style={{textAlign: 'center', padding: '5rem', fontSize: '1.2rem'}}>🚌 Otobüs planı yükleniyor...</div>;
  if (!trip) return null;

  const totalPriceFormatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(selectedSeats.length * basePrice);

  return (
    <>
      <div style={{ maxWidth: 1000, margin: '2rem auto', padding: '0 1rem', display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        
        {/* SOL: Otobüs Şeması */}
        <div style={{ flex: '1', minWidth: '320px', background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center', color: '#1F2937' }}>Koltuk Seçimi (2+1 Lüks)</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '45px 45px 45px 45px', gap: '12px', background: '#F9FAFB', padding: '24px', borderRadius: '24px', width: 'max-content', margin: '0 auto', border: '4px solid #E5E7EB' }}>
            <div style={{ gridColumn: '1 / -1', height: '60px', borderBottom: '3px dashed #D1D5DB', marginBottom: '1rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: '10px' }}>
               <span style={{ fontSize: '24px' }}>🧭 Şoför</span>
            </div>

            {Array.from({ length: 13 }).map((_, rowIndex) => {
              const leftSeat = rowIndex * 3 + 1;
              const middleSeat = rowIndex * 3 + 2;
              const rightSeat = rowIndex * 3 + 3;

              if (rowIndex === 12) {
                return (
                  <React.Fragment key={rowIndex}>
                    {renderSeat(leftSeat)}
                    {renderSeat(leftSeat + 1)}
                    {renderSeat(middleSeat + 1)}
                    {renderSeat(rightSeat + 1)}
                  </React.Fragment>
                );
              }

              return (
                <React.Fragment key={rowIndex}>
                  {renderSeat(leftSeat)}
                  <div style={{ width: '45px' }} />
                  {renderSeat(middleSeat)}
                  {renderSeat(rightSeat)}
                </React.Fragment>
              );
            })}
          </div>
          
          {/* Yeni Renk Kodları Lejantı */}
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '1.2rem', marginTop: '2rem', fontSize: '0.80rem', fontWeight: 600, color: '#4B5563' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 14, height: 14, background: '#fff', border: '2px solid #D1D5DB', borderRadius: 3 }}></div> Boş</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 14, height: 14, background: '#FCE4EC', border: '2px solid #F48FB1', borderRadius: 3 }}></div> Dolu (Kadın)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 14, height: 14, background: '#E3F2FD', border: '2px solid #90CAF9', borderRadius: 3 }}></div> Dolu (Erkek)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 14, height: 14, background: '#E91E63', borderRadius: 3 }}></div> Seçili (Kadın)</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: 14, height: 14, background: '#2196F3', borderRadius: 3 }}></div> Seçili (Erkek)</div>
          </div>
        </div>

        {/* SAĞ: Özet ve Sepet */}
        <div style={{ flex: '1', minWidth: '320px', background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #E5E7EB', position: 'sticky', top: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: '#1F2937' }}>Sefer Özeti</h3>
          
          <div style={{ background: '#F3F4F6', padding: '1.25rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#6B7280', fontWeight: 600 }}>Güzergah:</span>
              <span style={{ fontWeight: 800 }}>{trip.origin} → {trip.destination}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#6B7280', fontWeight: 600 }}>Firma:</span>
              <span style={{ fontWeight: 800, color: '#3B5BDB' }}>{trip.company}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6B7280', fontWeight: 600 }}>Birim Fiyat:</span>
              <span style={{ fontWeight: 800 }}>₺{basePrice}</span>
            </div>
          </div>

          <div style={{ borderTop: '2px dashed #E5E7EB', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <span style={{ color: '#6B7280', fontWeight: 600 }}>Seçilen Koltuklar:</span>
              <div style={{ textAlign: 'right' }}>
                {selectedSeats.length > 0 ? (
                  selectedSeats.sort((a,b)=>a.seatNo - b.seatNo).map((s, idx) => (
                    <div key={idx} style={{ fontWeight: 800, color: s.gender === 'K' ? '#E91E63' : '#2196F3', fontSize: '1.1rem', marginBottom: '4px' }}>
                      {s.seatNo} <span style={{fontSize:'0.8rem'}}>({s.gender === 'K' ? 'Kadın' : 'Erkek'})</span>
                    </div>
                  ))
                ) : (
                  <span style={{ fontWeight: 800, color: '#FF6B35', fontSize: '1.2rem' }}>Seçilmedi</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#1F2937', fontWeight: 800, fontSize: '1.1rem' }}>Toplam Tutar:</span>
              <span style={{ fontWeight: 900, fontSize: '1.8rem', color: '#1F2937' }}>{totalPriceFormatted}</span>
            </div>
          </div>

          <button 
            onClick={handleContinue}
            disabled={selectedSeats.length === 0}
            style={{ width: '100%', padding: '1rem', background: selectedSeats.length === 0 ? '#D1D5DB' : '#FF6B35', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 800, cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
          >
            Yolcu Bilgilerine Geç →
          </button>
        </div>
      </div>

      {/* 🔥 KURALCI CİNSİYET SEÇİM MODALI */}
      {selectingGenderFor && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="animate-fadeInUp" style={{ background: '#fff', padding: '2rem', borderRadius: '16px', textAlign: 'center', width: '90%', maxWidth: '400px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💺</div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1F2937', marginBottom: '0.5rem' }}>
              Koltuk No: <span style={{ color: '#FF6B35' }}>{selectingGenderFor}</span>
            </h3>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '1.5rem' }}>Lütfen bu koltuk için yolcu cinsiyetini seçiniz.</p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {/* KADIN BUTONU */}
              <button 
                onClick={() => allowedGender !== 'E' && confirmGender('K')} 
                style={{ 
                  flex: 1, background: '#E91E63', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', 
                  fontSize: '1.1rem', fontWeight: 800, cursor: allowedGender === 'E' ? 'not-allowed' : 'pointer', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  opacity: allowedGender === 'E' ? 0.3 : 1, transition: 'transform 0.1s' 
                }}
                title={allowedGender === 'E' ? "Yan koltukta erkek yolcu oturduğu için seçilemez" : ""}
              >
                <span style={{ fontSize: '1.8rem' }}>👩</span> Kadın
              </button>
              
              {/* ERKEK BUTONU */}
              <button 
                onClick={() => allowedGender !== 'K' && confirmGender('E')} 
                style={{ 
                  flex: 1, background: '#2196F3', color: '#fff', border: 'none', padding: '1rem', borderRadius: '12px', 
                  fontSize: '1.1rem', fontWeight: 800, cursor: allowedGender === 'K' ? 'not-allowed' : 'pointer', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                  opacity: allowedGender === 'K' ? 0.3 : 1, transition: 'transform 0.1s' 
                }}
                title={allowedGender === 'K' ? "Yan koltukta kadın yolcu oturduğu için seçilemez" : ""}
              >
                <span style={{ fontSize: '1.8rem' }}>👨</span> Erkek
              </button>
            </div>

            {allowedGender !== 'BOTH' && (
              <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '8px', color: '#DC2626', fontSize: '0.85rem', fontWeight: 'bold' }}>
                * Yan koltuktaki yolcunun cinsiyeti nedeniyle diğer seçenek kilitlenmiştir.
              </div>
            )}
            
            <button onClick={() => setSelectingGenderFor(null)} style={{ marginTop: '1.5rem', background: 'transparent', border: 'none', color: '#9CA3AF', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>
              İptal Et
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function SeatSelectionPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>Yükleniyor...</div>}>
      <SeatSelectionContent />
    </Suspense>
  );
}