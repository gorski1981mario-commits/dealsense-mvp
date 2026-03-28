import './globals.css'
import HamburgerMenu from './components/HamburgerMenu'
import EchoChat from './components/EchoChat'
import BottomNav from './components/BottomNav'
import ServiceWorkerRegistration from './components/ServiceWorkerRegistration'
import { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'DealSense.nl – AI aankoop assistent',
  description: 'Scan producten en vind direct de beste prijs',
  verification: {
    google: 'NIjouinoYr-swaCTIe_LsUIWIIrUEVynpKyUObykIo',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  viewportFit: 'cover',
  themeColor: '#15803d',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <meta name="5548963fd09ec94" content="d576c6fb863602c19121ad5b660e51d3" />
        {/* iOS PWA meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DealSense" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful');
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `
          }}
        />
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
        {/* Service Worker Registration */}
        <ServiceWorkerRegistration />
        
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





