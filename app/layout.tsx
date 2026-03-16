'use client'

import './globals.css'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import HamburgerMenu from './components/HamburgerMenu'
import EchoChat from './components/EchoChat'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [currentPackage, setCurrentPackage] = useState<string>('free')

  useEffect(() => {
    // Zapisz aktualny pakiet gdy użytkownik wchodzi na stronę pakietu
    if (pathname === '/') {
      localStorage.setItem('dealsense_current_package', 'free')
      setCurrentPackage('free')
    } else if (pathname === '/plus') {
      localStorage.setItem('dealsense_current_package', 'plus')
      setCurrentPackage('plus')
    } else if (pathname === '/pro') {
      localStorage.setItem('dealsense_current_package', 'pro')
      setCurrentPackage('pro')
    } else if (pathname === '/finance') {
      localStorage.setItem('dealsense_current_package', 'finance')
      setCurrentPackage('finance')
    } else {
      // Na innych stronach (statystyki, configuratory) - załaduj zapisany pakiet
      const saved = localStorage.getItem('dealsense_current_package')
      if (saved) {
        setCurrentPackage(saved)
      }
    }
  }, [pathname])

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
          <a href="/" className={`nav-item ${currentPackage === 'free' ? 'active' : ''}`}>
            <span>FREE</span>
          </a>
          <a href="/plus" className={`nav-item ${currentPackage === 'plus' ? 'active' : ''}`}>
            <span>PLUS</span>
          </a>
          <a href="/pro" className={`nav-item ${currentPackage === 'pro' ? 'active' : ''}`}>
            <span>PRO</span>
          </a>
          <a href="/finance" className={`nav-item ${currentPackage === 'finance' ? 'active' : ''}`}>
            <span>FINANCE</span>
          </a>
        </nav>
      </body>
    </html>
  )
}
