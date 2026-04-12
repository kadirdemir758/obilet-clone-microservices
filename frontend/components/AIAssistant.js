'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Merhaba! Ben Obilet Asistan 🤖 Sana nasıl yardımcı olabilirim? (Örn: Yarın Kütahya\'dan İstanbul\'a bilet bul)' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const messagesEndRef = useRef(null);

  // Yeni mesaj geldiğinde otomatik en aşağı kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:9004/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg }),
      });
      
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);

      if (data.action && data.action.type === 'SEARCH_TRIPS') {
        const { origin, destination, date } = data.action.params;
        
        setTimeout(() => {
            const queryParams = new URLSearchParams({ from: origin, to: destination, date }).toString();
            router.push(`/results?${queryParams}`);
            setIsOpen(false);
        }, 2000); 
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [...prev, { sender: 'ai', text: 'Bağlantı hatası! AI servisi uyuyor olabilir 😴' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, fontFamily: 'sans-serif' }}>
      
      {/* ─── CHAT PENCERESİ ─── */}
      {isOpen && (
        <div style={{ 
            width: '320px', height: '450px', background: '#fff', borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column',
            marginBottom: '15px', overflow: 'hidden', border: '1px solid #e9ecef'
        }}>
          {/* Header */}
          <div style={{ background: '#FF6B35', color: '#fff', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🤖 Yapay Zeka Asistanı</span>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '16px' }}>✖</button>
          </div>

          {/* Mesaj Listesi */}
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', background: '#f8f9fa', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ 
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  background: msg.sender === 'user' ? '#3B5BDB' : '#fff',
                  color: msg.sender === 'user' ? '#fff' : '#333',
                  padding: '10px 14px', borderRadius: '12px',
                  borderBottomRightRadius: msg.sender === 'user' ? '2px' : '12px',
                  borderBottomLeftRadius: msg.sender === 'ai' ? '2px' : '12px',
                  maxWidth: '85%', fontSize: '0.9rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}>
                {msg.text}
              </div>
            ))}
            
            {loading && (
              <div style={{ alignSelf: 'flex-start', background: '#fff', padding: '12px 16px', borderRadius: '12px', display: 'flex', gap: '6px', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Giriş Alanı */}
          <form onSubmit={sendMessage} style={{ display: 'flex', padding: '10px', background: '#fff', borderTop: '1px solid #e9ecef' }}>
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder="Bilet aratın..." 
              style={{ flex: 1, padding: '10px', border: '1px solid #ced4da', borderRadius: '20px', outline: 'none' }}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} style={{ 
                background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '50%',
                width: '40px', height: '40px', marginLeft: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              ➤
            </button>
          </form>
        </div>
      )}

      {/* ─── YUVARLAK AÇMA BUTONU ─── */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{ 
            background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '50%',
            width: '60px', height: '60px', fontSize: '28px', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(255, 107, 53, 0.4)', float: 'right', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
          💬
        </button>
      )}
    </div>
  );
}