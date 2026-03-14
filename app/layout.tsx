'use client'

import './globals.css'
import { useState, useEffect } from 'react'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [menuOpen])

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
          <button
            onClick={() => setMenuOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              marginLeft: 'auto'
            }}
            aria-label="Open menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </header>

        {/* Menu Overlay */}
        <div
          className={`menu-overlay ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        />

        {/* Hamburger Menu */}
        <div className={`hamburger-menu ${menuOpen ? 'active' : ''}`}>
          <div className="menu-header">
            <div style={{ fontSize: '20px', fontWeight: 700 }}>Menu</div>
            <button className="menu-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="menu-content">
            {/* Pakiety Section */}
            <div className="menu-section">
              <div className="menu-section-title">PAKIETY</div>

              <a href="/" className="package-card" onClick={() => setMenuOpen(false)}>
                <div className="package-header">
                  <div className="package-name">FREE</div>
                  <div className="package-price">€0</div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Altijd gratis</div>
                <div className="package-features">
                  <div className="package-feature">✓ 3 gratis scans</div>
                  <div className="package-feature">✓ Shopping</div>
                  <div className="package-feature">✓ Geen prijslimiet</div>
                  <div className="package-feature">✓ 10% commissie</div>
                </div>
              </a>

              <a href="/plus" className="package-card plus" onClick={() => setMenuOpen(false)}>
                <div className="package-header">
                  <div className="package-name">PLUS</div>
                  <div className="package-price">€19,99</div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Eenmalige betaling</div>
                <div className="package-features">
                  <div className="package-feature">✓ Onbeperkt scans</div>
                  <div className="package-feature">✓ Shopping</div>
                  <div className="package-feature">✓ 5% commissie</div>
                  <div className="package-feature">✓ Ghost Mode (24h)</div>
                </div>
              </a>

              <a href="/pro" className="package-card pro" onClick={() => setMenuOpen(false)}>
                <div className="package-header">
                  <div className="package-name">PRO</div>
                  <div className="package-price">€29,99</div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Eenmalige betaling</div>
                <div className="package-features">
                  <div className="package-feature">✓ Onbeperkt scans</div>
                  <div className="package-feature">✓ Shopping + Services</div>
                  <div className="package-feature">✓ Vakanties, Verzekeringen</div>
                  <div className="package-feature">✓ 3% commissie</div>
                </div>
              </a>

              <a href="/finance" className="package-card finance" onClick={() => setMenuOpen(false)}>
                <div className="package-header">
                  <div className="package-name">FINANCE</div>
                  <div className="package-price">€39,99</div>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>Eenmalige betaling</div>
                <div className="package-features">
                  <div className="package-feature">✓ Alles inclusief</div>
                  <div className="package-feature">✓ Hypotheken, Leningen</div>
                  <div className="package-feature">✓ Ghost Mode (5 min)</div>
                  <div className="package-feature">✓ 0% commissie</div>
                </div>
              </a>
            </div>

            {/* Functies Section */}
            <div className="menu-section">
              <div className="menu-section-title">FUNCTIES</div>

              <a href="/dashboard" className="menu-item" onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                  <polyline points="17 6 23 6 23 12"/>
                </svg>
                <div className="menu-item-content">
                  <div className="menu-item-title">Mijn Besparingen</div>
                  <div className="menu-item-desc">Bekijk je totale besparingen</div>
                </div>
              </a>

              <a href="/veiligheid" className="menu-item" onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <div className="menu-item-content">
                  <div className="menu-item-title">Veiligheid & Vertrouwen</div>
                  <div className="menu-item-desc">Hoe we je beschermen</div>
                </div>
              </a>

              <a href="/hoe-het-werkt" className="menu-item" onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <div className="menu-item-content">
                  <div className="menu-item-title">Hoe het werkt</div>
                  <div className="menu-item-desc">Leer hoe DealSense werkt</div>
                </div>
              </a>

              <a href="/contact" className="menu-item" onClick={() => setMenuOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <div className="menu-item-content">
                  <div className="menu-item-title">Contact</div>
                  <div className="menu-item-desc">Neem contact met ons op</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="container">{children}</main>

        {/* Bottom Navigation */}
        <nav className="bottom-nav">
          <a href="/" className="nav-item active">
            <span style={{ fontSize: '20px' }}>🆓</span>
            <span>Free</span>
          </a>
          <a href="/plus" className="nav-item">
            <span style={{ fontSize: '20px' }}>➕</span>
            <span>Plus</span>
          </a>
          <a href="/pro" className="nav-item">
            <span style={{ fontSize: '20px' }}>⭐</span>
            <span>Pro</span>
          </a>
          <a href="/finance" className="nav-item">
            <span style={{ fontSize: '20px' }}>💰</span>
            <span>Finance</span>
          </a>
        </nav>
      </body>
    </html>
  )
}
