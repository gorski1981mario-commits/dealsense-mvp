'use client'

import { useState, useEffect } from 'react'
import Scanner from './components/Scanner'
import SocialShare from './components/SocialShare'
import PaymentButton from './components/PaymentButton'
import { getDeviceId, showToast, createConfetti } from './_lib/utils'

export default function HomePage() {
  const [scansRemaining, setScansRemaining] = useState(3)
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('electronics')
  const [categoryLocked, setCategoryLocked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  
  // NEW: Ghost Mode, Cookie Consent, Onboarding
  const [ghostMode, setGhostMode] = useState(false)
  const [showCookieConsent, setShowCookieConsent] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // FAQ accordion state
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  // Load usage count on mount
  useEffect(() => {
    const loadUsageCount = async () => {
      try {
        const res = await fetch('https://dealsense-aplikacja.onrender.com/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base_price: 0,
            url: '',
            session_id: getDeviceId(),
            fingerprint: getDeviceId(),
            dry_run: true
          })
        })
        const data = await res.json()
        if (data.usage_count !== undefined) {
          setScansRemaining(Math.max(0, 3 - data.usage_count))
        }
      } catch (err) {
        console.error('Failed to load usage count:', err)
      }
    }
    loadUsageCount()

    // Check if first visit and terms accepted (show onboarding)
    const hasVisited = localStorage.getItem('dealsense_visited')
    const termsAcceptedStorage = localStorage.getItem('dealsense_terms_accepted')
    const cookieConsent = localStorage.getItem('dealsense_cookies')
    
    if (!hasVisited || !termsAcceptedStorage) {
      setShowOnboarding(true)
    } else if (!cookieConsent) {
      // Show cookie banner only if onboarding is NOT shown
      setShowCookieConsent(true)
    }
  }, [])

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const priceNum = parseFloat(price.replace(',', '.'))
    if (!priceNum || priceNum <= 0) {
      showToast('❌ Vul een geldige prijs in')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('https://dealsense-aplikacja.onrender.com/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base_price: priceNum,
          url: url,
          session_id: getDeviceId(),
          fingerprint: getDeviceId(),
          category: category,
          ghost_mode: ghostMode
        })
      })

      const data = await res.json()

      // Update usage counter
      if (data.usage_count !== undefined) {
        setScansRemaining(Math.max(0, 3 - data.usage_count))
      }

      if (!res.ok || !data) {
        const errorMsg = data?.error || data?.message || 'Scan mislukt'
        showToast('❌ ' + errorMsg)
        
        // Show upgrade prompt if locked
        if (data?.locked || errorMsg.includes('limit') || errorMsg.includes('upgrade')) {
          setShowUpgradePrompt(true)
        }
        setLoading(false)
        return
      }

      setResult(data)
      setLoading(false)
      
      // Show success toast
      showToast('✓ Vergelijking voltooid!')
      
      // Trigger confetti for big savings
      if (data.savings && data.savings > 50) {
        setTimeout(() => createConfetti(), 500)
      }

    } catch (err: any) {
      showToast('❌ Fout: ' + err.message)
      setLoading(false)
    }
  }

  const acceptCookies = () => {
    localStorage.setItem('dealsense_cookies', 'accepted')
    setShowCookieConsent(false)
    showToast('✓ Cookie instellingen opgeslagen')
  }

  const handleWelcomeStart = () => {
    if (!termsAccepted) {
      showToast('⚠️ Accepteer de Algemene Voorwaarden om door te gaan')
      return
    }
    localStorage.setItem('dealsense_visited', 'true')
    localStorage.setItem('dealsense_terms_accepted', 'true')
    localStorage.setItem('dealsense_cookies', 'accepted')
    setShowOnboarding(false)
    showToast('✓ Welkom bij DealSense!')
  }

  return (
    <div>
      {/* Badge + Usage Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: '#10b981',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>FREE</span>
        <span style={{ 
          fontSize: '14px', 
          color: scansRemaining === 0 ? '#ef4444' : '#10b981', 
          fontWeight: 700,
          padding: '4px 12px',
          background: scansRemaining === 0 ? '#fee2e2' : '#f0fdf4',
          borderRadius: '6px'
        }}>
          {3 - scansRemaining}/3 scans gebruikt
        </span>
      </div>
      
      {/* Paywall Warning - Show when 0 scans remaining */}
      {scansRemaining === 0 && (
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #fbbf24',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#92400e' }}>
            ⚠️ Gratis scans op
          </div>
          <div style={{ fontSize: '14px', color: '#78350f', marginBottom: '12px' }}>
            Je hebt alle 3 gratis scans gebruikt. Upgrade naar PLUS voor onbeperkt scannen!
          </div>
          <PaymentButton packageType="plus" userId={getDeviceId()} price={19.99} />
        </div>
      )}
      
      <p style={{ fontSize: '18px', color: '#374151', marginBottom: '32px' }}>Vind de beste deal</p>

      {/* QR Scanner */}
      <Scanner type="free" />

      {/* Badges */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 14px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #86efac',
          borderRadius: '10px',
          fontSize: '13px',
          boxShadow: '0 2px 8px rgba(37,139,82,0.1)'
        }}>
          <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
          <span style={{ fontWeight: 600 }}>100+ winkels</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 14px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #86efac',
          borderRadius: '10px',
          fontSize: '13px',
          boxShadow: '0 2px 8px rgba(37,139,82,0.1)'
        }}>
          <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
          <span style={{ fontWeight: 600 }}>Veilig & betrouwbaar</span>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 14px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #86efac',
          borderRadius: '10px',
          fontSize: '13px',
          boxShadow: '0 2px 8px rgba(37,139,82,0.1)'
        }}>
          <span style={{ color: '#10b981', fontSize: '16px' }}>✓</span>
          <span style={{ fontWeight: 600 }}>3 gratis scans</span>
        </div>
      </div>

      {/* Scan Form */}
      <form onSubmit={handleScan} style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '6px'
        }}>Categorie</label>
        <input
          type="text"
          value={category === 'electronics' ? 'Elektronika' : category}
          readOnly
          placeholder="Automatisch gedetecteerd via product URL"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            fontSize: '16px',
            marginBottom: '8px',
            background: '#f1f5f9',
            cursor: 'not-allowed',
            color: '#64748b'
          }}
        />
        <div style={{ fontSize: '11px', color: '#6B7280', marginBottom: '16px' }}>
          ⚠️ Niet ondersteund: voedsel en tweedehands/refurbished producten
        </div>

        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '6px'
        }}>Product URL</label>
        <input
          type="url"
          placeholder="Automatisch ingevuld via QR-scan"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          readOnly
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            fontSize: '16px',
            marginBottom: '16px',
            background: '#f1f5f9',
            cursor: 'not-allowed',
            color: '#64748b'
          }}
        />

        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '6px'
        }}>Prijs (€)</label>
        <input
          type="text"
          placeholder="Automatisch ingevuld via QR-scan"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          readOnly
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            fontSize: '16px',
            marginBottom: '16px',
            background: '#f1f5f9',
            cursor: 'not-allowed',
            color: '#64748b'
          }}
        />

        {/* Ghost Mode Toggle */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '16px',
          padding: '12px',
          background: '#f1f3f5',
          borderRadius: '10px'
        }}>
          <input
            type="checkbox"
            id="ghostMode"
            checked={ghostMode}
            onChange={(e) => setGhostMode(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <label htmlFor="ghostMode" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer', flex: 1 }}>
            Ghost Mode (24 uur)
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading || scansRemaining === 0}
          style={{
            width: '100%',
            padding: '14px',
            background: loading || scansRemaining === 0 ? '#9ca3af' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading || scansRemaining === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Scannen...' : scansRemaining === 0 ? 'Upgrade voor meer scans' : 'Vergelijk prijzen'}
        </button>
      </form>

      {/* Skeleton Loader */}
      {loading && (
        <div style={{ marginBottom: '24px' }}>
          <div className="skeleton" style={{ height: '100px', marginBottom: '12px' }}></div>
          <div className="skeleton" style={{ height: '80px', marginBottom: '12px' }}></div>
          <div className="skeleton" style={{ height: '80px' }}></div>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <div style={{
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
            Resultaten
          </h3>
          <p style={{ fontSize: '14px', color: '#374151', marginBottom: '12px' }}>
            {result.message || 'Scan voltooid!'}
          </p>
          {result.savings && (
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginBottom: '8px' }}>
              €{result.savings.toFixed(2)} besparing
            </div>
          )}
          {result.best_offer && (
            <div style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>
              Beste prijs: €{result.best_offer.price} bij {result.best_offer.seller}
            </div>
          )}

          {/* Social Sharing */}
          {result.savings && result.savings > 0 && (
            <SocialShare 
              savings={result.savings}
              productName={result.product_name || 'dit product'}
              userPackage="free"
            />
          )}
        </div>
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000
        }} onClick={() => setShowUpgradePrompt(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            margin: '20px'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
              Upgrade naar Plus
            </h3>
            <p style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>
              Je hebt 3 gratis scans gebruikt. Upgrade naar PLUS voor onbeperkt scannen en slechts 9% commissie!
            </p>
            
            <div style={{ marginBottom: '16px', padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 900, color: '#10b981', marginBottom: '4px' }}>
                €19,99/maand
              </div>
              <div style={{ fontSize: '12px', color: '#374151' }}>
                Annuleer wanneer je wilt
              </div>
            </div>

            <PaymentButton packageType="plus" userId={getDeviceId()} price={19.99} />
            
            <button
              onClick={() => setShowUpgradePrompt(false)}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '12px',
                background: '#f1f3f5',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Annuleren
            </button>
          </div>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
        <div className="cookie-consent">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                🍪 We gebruiken cookies
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Voor een betere ervaring. Alleen noodzakelijke cookies.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setShowCookieConsent(false)}
                style={{
                  padding: '8px 16px',
                  background: '#f1f3f5',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Weigeren
              </button>
              <button
                onClick={acceptCookies}
                style={{
                  padding: '8px 16px',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Accepteren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Flow with Terms Acceptance */}
      {showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-modal">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎁</div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>
              Welkom bij DealSense!
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
              3 gratis scans om te proberen
            </p>

            {/* Terms Acceptance Box - Updated colors */}
            <div style={{
              background: '#F7F9F8',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'left'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  style={{
                    marginTop: '4px',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#10b981'
                  }}
                />
                <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                  Ik ga akkoord met de{' '}
                  <a href="/voorwaarden" target="_blank" style={{ color: '#10b981', textDecoration: 'underline' }}>
                    Algemene Voorwaarden
                  </a>
                  {' '}en het{' '}
                  <a href="/veiligheid" target="_blank" style={{ color: '#10b981', textDecoration: 'underline' }}>
                    Privacybeleid
                  </a>
                </span>
              </label>
            </div>

            {/* Start Button */}
            <button
              onClick={handleWelcomeStart}
              disabled={!termsAccepted}
              style={{
                padding: '12px 24px',
                background: termsAccepted ? '#10b981' : '#D1D5DB',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: termsAccepted ? 'pointer' : 'not-allowed',
                width: '100%',
                transition: 'all 0.2s ease'
              }}
            >
              Akkoord & Start →
            </button>

            <div style={{ marginTop: '16px', fontSize: '12px', color: '#6B7280' }}>
              Geen registratie nodig • Direct beginnen
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Veelgestelde vragen</h3>
        
        <div 
          onClick={() => setFaqOpen(faqOpen === 0 ? null : 0)}
          style={{
            marginBottom: '16px',
            padding: '16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
            borderRadius: '10px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontWeight: 600 }}>
            Hoeveel scans krijg ik gratis?
          </div>
          {faqOpen === 0 && (
            <p style={{ marginTop: '12px', color: '#374151' }}>
              Je krijgt 3 gratis scans om DealSense te proberen. Daarna kun je upgraden naar PLUS, PRO of FINANCE voor onbeperkt scannen en betaal je 9% commissie op besparingen.
            </p>
          )}
        </div>

        <div 
          onClick={() => setFaqOpen(faqOpen === 1 ? null : 1)}
          style={{
            marginBottom: '16px',
            padding: '16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
            borderRadius: '10px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontWeight: 600 }}>
            Is er een prijslimiet?
          </div>
          {faqOpen === 1 && (
            <p style={{ marginTop: '12px', color: '#374151' }}>
              Nee, er is geen prijslimiet. Je kunt producten van elke prijs vergelijken.
            </p>
          )}
        </div>

        <div 
          onClick={() => setFaqOpen(faqOpen === 2 ? null : 2)}
          style={{
            marginBottom: '16px',
            padding: '16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
            borderRadius: '10px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontWeight: 600 }}>
            Wat is de commissie?
          </div>
          {faqOpen === 2 && (
            <p style={{ marginTop: '12px', color: '#374151' }}>
              We rekenen 10% commissie op de besparingen die je maakt. Als je €50 bespaart, betaal je €5.
            </p>
          )}
        </div>

        <div 
          onClick={() => setFaqOpen(faqOpen === 3 ? null : 3)}
          style={{
            marginBottom: '16px',
            padding: '16px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1px solid #86efac',
            borderRadius: '10px',
            cursor: 'pointer',
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            transition: 'all 0.2s ease'
          }}
        >
          <div style={{ fontWeight: 600 }}>
            Hoe werkt het?
          </div>
          {faqOpen === 3 && (
            <p style={{ marginTop: '12px', color: '#374151' }}>
              1. Scan QR code op product. 2. We scannen 1000+ winkels. 3. Je ziet de beste 3 deals. Simpel!
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '48px',
        paddingTop: '24px',
        paddingBottom: '32px',
        borderTop: '1px solid #E5E7EB',
        textAlign: 'center',
        fontSize: '13px',
        color: '#64748b'
      }}>
        <a href="/voorwaarden" style={{ color: '#10b981', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
          Algemene Voorwaarden
        </a>
        <div>
          &copy; 2026 DealSense.nl
        </div>
      </div>
    </div>
  )
}
