import './globals.css'
import HamburgerMenu from './components/HamburgerMenu'
import EchoChat from './components/EchoChat'
import BottomNav from './components/BottomNav'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'DealSense.nl – AI aankoop assistent',
  verification: {
    google: 'NIjouinoYr-swaCTIe_LsUIWIIrUEVynpKyUObykIo',
  },
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  themeColor: '#15803d',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <meta name="5548963fd09ec94" content="d576c6fb863602c19121ad5b660e51d3" />
        <script
          data-cfasync="false"
          data-wpfc-render="false"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var script = document.createElement("script");
                script.async = 1;
                script.src = 'https://emrld.ltd/NTEwNzA1.js?t=510705';
                document.head.appendChild(script);
              })();
            `
          }}
        />
      </head>
      <body>
        {/* Top Bar */}
        <header className="top-bar">
          <a href="/" className="logo">
            D<span className="logo-dot">.</span><span className="logo-nl">nl</span>
          </a>
          <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500, textAlign: 'center' }}>
            AI aankoop assistent
          </span>
        </header>

        {/* Hamburger Menu */}
        <HamburgerMenu />

        {/* Echo Chat */}
        <EchoChat />

        {/* Main Content */}
        <main className="container">{children}</main>

        {/* Footer */}
        <footer style={{
          background: 'white',
          borderTop: '1px solid #E5E7EB',
          padding: '20px',
          marginTop: '40px',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            fontSize: '14px',
            color: '#111827'
          }}>
            © 2026 DealSense.nl | {' '}
            <a href="/voorwaarden" style={{ color: '#15803d', textDecoration: 'none' }}>
              Algemene voorwaarden
            </a>
            {' '} | {' '}
            <a href="/privacy" style={{ color: '#15803d', textDecoration: 'none' }}>
              Privacy
            </a>
          </div>
        </footer>

        {/* Bottom Navigation */}
        <BottomNav />
      </body>
    </html>
  )
}




