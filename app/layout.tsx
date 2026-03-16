'use client'

import './globals.css'
import { usePathname } from 'next/navigation'
import HamburgerMenu from './components/HamburgerMenu'
import EchoChat from './components/EchoChat'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <html lang="nl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#258b52" />
        <title>DealSense.nl – AI aankoop assistent</title>
      </head>
      <body>
        {/* Top Bar */}
        <header className="top-bar">
          <a href="/" className="logo">
            D<span className="logo-dot">.</span><span className="logo-nl">nl</span>
          </a>
          <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500, textAlign: 'center' }}>
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
            color: '#6B7280'
          }}>
            © 2026 DealSense.nl | {' '}
            <a href="/voorwaarden" style={{ color: '#1E7F5C', textDecoration: 'none' }}>
              Algemene voorwaarden
            </a>
            {' '} | {' '}
            <a href="/privacy" style={{ color: '#1E7F5C', textDecoration: 'none' }}>
              Privacy
            </a>
          </div>
        </footer>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <a href="/" className={`nav-item ${pathname === '/' ? 'active' : ''}`}>
            <span>FREE</span>
          </a>
          <a href="/plus" className={`nav-item ${pathname === '/plus' ? 'active' : ''}`}>
            <span>PLUS</span>
          </a>
          <a href="/pro" className={`nav-item ${pathname === '/pro' ? 'active' : ''}`}>
            <span>PRO</span>
          </a>
          <a href="/finance" className={`nav-item ${pathname === '/finance' ? 'active' : ''}`}>
            <span>FINANCE</span>
          </a>
        </nav>
      </body>
    </html>
  )
}
