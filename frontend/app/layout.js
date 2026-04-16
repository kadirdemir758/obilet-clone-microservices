import './globals.css';
import AIAssistant from '@/components/AIAssistant';
export const metadata = {
  title: 'Obilet Clone — Otobüs Bileti Rezervasyonu',
  description: 'Kamil Koç, Pamukkale, Metro Turizm ve daha fazlasından en uygun otobüs biletini kolayca satın alın.',
  keywords: 'otobüs bileti, online bilet, kamil koç, pamukkale, metro turizm',
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        <nav className="navbar">
          <div className="navbar__inner">
            <div className="navbar__logo">
              🚌 <span>obi</span>let
              <span className="navbar__tagline">Türkiye'nin Otobüs Platformu</span>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem' }}>
              <a href="/" style={{ color: 'rgba(255,255,255,0.7)' }}>Otobüs Biletleri</a>
              <a href="/sorgula" style={{ color: 'rgba(255,255,255,0.7)' }}>Bilet Sorgula</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>İletişim</a>
            </div>
          </div>
        </nav>
        {children}
        <AIAssistant />
      </body>
    </html>
  );
}
