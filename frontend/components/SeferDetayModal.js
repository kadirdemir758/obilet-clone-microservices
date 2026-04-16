import React from 'react';

const SeferDetayModal = ({ tripData, onClose }) => {
  if (!tripData || !tripData.tripDetails) return null;
  const { tripDetails } = tripData;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff', width: '550px', borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)', overflow: 'hidden',
        fontFamily: 'sans-serif', position: 'relative'
      }}>
        
        {/* Modal Başlığı */}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #eee', background: '#f8f9fa' }}>
          <h2 style={{ margin: 0, fontSize: '18px', color: '#333', fontWeight: 'bold' }}>Sefer Detayları</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#d9534f', lineHeight: '18px' }}>✕</button>
        </div>
        
        {/* İçerik */}
        <div style={{ padding: '20px', maxHeight: '65vh', overflowY: 'auto' }}>
          
          <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#555', fontWeight: 'bold' }}>Sefer Bilgisi:</h3>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px', lineHeight: '1.6' }}>
            {tripDetails.infoText.map((text, idx) => <p key={idx} style={{ margin: '6px 0' }}>{text}</p>)}
          </div>

          <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#555', fontWeight: 'bold' }}>Özellikler</h3>
          <div style={{ display: 'flex', gap: '15px', fontSize: '22px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
             <span title="WiFi">📶</span> <span title="Priz">🔌</span> <span title="USB">🔋</span> <span title="Koltuk Ekranı">📺</span>
          </div>

          <h3 style={{ fontSize: '14px', marginBottom: '10px', color: '#555', fontWeight: 'bold' }}>Güzergah</h3>
          <div style={{ background: '#f8f9fa', border: '1px solid #eee', borderRadius: '8px', padding: '10px' }}>
            {tripDetails.itinerary.map((stop, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '20px', padding: '10px 5px', borderBottom: idx === tripDetails.itinerary.length - 1 ? 'none' : '1px solid #eaeaea', fontSize: '14px' }}>
                <span style={{ width: '45px', color: '#888', fontWeight: 'bold' }}>{stop.time}</span>
                <span style={{ color: '#333', fontWeight: '500' }}>{stop.station}</span>
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default SeferDetayModal;