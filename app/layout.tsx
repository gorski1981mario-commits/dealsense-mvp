'use client'

import './globals.css'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import HamburgerMenu from './components/HamburgerMenu'
import EchoChat from './components/EchoChat'
import { Layers, CirclePlus, Star } from 'lucide-react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [currentPackage, setCurrentPackage] = useState<string>('free')

  useEffect(() => {
    // Ustaw aktywny pakiet na podstawie pathname
    if (pathname === '/') {
      setCurrentPackage('free')
    } else if (pathname === '/plus') {
      setCurrentPackage('plus')
    } else if (pathname === '/pro') {
      setCurrentPackage('pro')
    } else if (pathname === '/finance') {
      setCurrentPackage('finance')
    }
    // Na innych stronach (configuratory, settings) - nie zmieniaj currentPackage
    // Pozostaje ostatni ustawiony pakiet
  }, [pathname])

  return (
    <html lang="nl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta name="theme-color" content="#15803d" />
        <title>DealSense.nl – AI aankoop assistent</title>
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
        <nav className="bottom-nav">
          <a href="/" className={`nav-item ${currentPackage === 'free' ? 'active' : ''}`}>
            <Layers size={20} strokeWidth={2} />
            <span>FREE</span>
          </a>
          <a href="/plus" className={`nav-item ${currentPackage === 'plus' ? 'active' : ''}`}>
            <CirclePlus size={20} strokeWidth={2} />
            <span>PLUS</span>
          </a>
          <a href="/pro" className={`nav-item ${currentPackage === 'pro' ? 'active' : ''}`}>
            <Star size={20} strokeWidth={2} />
            <span>PRO</span>
          </a>
          <a href="/finance" className={`nav-item ${currentPackage === 'finance' ? 'active' : ''}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"/>
              <path d="m19 9-5 5-4-4-3 3"/>
            </svg>
            <span>FINANCE</span>
          </a>
        </nav>
      </body>
    </html>
  )
}




