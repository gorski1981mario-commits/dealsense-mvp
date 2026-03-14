'use client'

import { useState, useEffect } from 'react'
import Scanner from './components/Scanner'

// Device fingerprint - generates unique ID for session tracking
function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  
  let id = localStorage.getItem('dealsense_device_id')
  if (!id) {
    id = `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('dealsense_device_id', id)
  }
  return id
}

// Toast notification helper
function showToast(message: string) {
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => toast.classList.add('show'), 100)
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => document.body.removeChild(toast), 300)
  }, 3000)
}

// Confetti animation
function createConfetti() {
  const colors = ['#258b52', '#15803d', '#166534', '#14532d']
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'
    confetti.style.left = Math.random() * 100 + '%'
    confetti.style.top = '-10px'
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.animationDelay = Math.random() * 0.5 + 's'
    document.body.appendChild(confetti)
    
    setTimeout(() => document.body.removeChild(confetti), 3000)
  }
}

export default function HomePage() {
  const [scansRemaining, setScansRemaining] = useState(3)
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('electronics')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  
  // NEW: Ghost Mode, Price Slider, Cookie Consent, Onboarding
  const [ghostMode, setGhostMode] = useState(false)
  const [maxPrice, setMaxPrice] = useState(5000)
  const [showCookieConsent, setShowCookieConsent] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)

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

    // Check if first visit (show onboarding)
    const hasVisited = localStorage.getItem('dealsense_visited')
    if (!hasVisited) {
      setShowOnboarding(true)
      localStorage.setItem('dealsense_visited', 'true')
    }

    // Check cookie consent
    const cookieConsent = localStorage.getItem('dealsense_cookies')
    if (!cookieConsent) {
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
          ghost_mode: ghostMode,
          max_price: maxPrice
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

  const nextOnboardingStep = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      setShowOnboarding(false)
    }
  }

  return (
    <div>
      {/* Savings Tracker */}
      <div style={{
        background: 'linear-gradient(135deg, #258b52 0%, #1e7043 100%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '24px',
        color: 'white',
        boxShadow: '0 4px 12px rgba(37,139,82,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', opacity: 0.9 }}>Je besparingen deze maand</span>
        </div>
        <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '12px' }}>€0</div>
        <div style={{ background: 'rgba(255,255,255,0.2)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ background: 'white', height: '100%', width: '0%', borderRadius: '4px' }}></div>
        </div>
        <div style={{ fontSize: '12px', marginTop: '6px', opacity: 0.8 }}>🔥 Geweldig gedaan!</div>
      </div>

      {/* Badge + Usage Counter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: '#15803d',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>FREE</span>
        <span style={{ 
          fontSize: '12px', 
          color: scansRemaining === 0 ? '#ef4444' : '#374151', 
          fontWeight: 600 
        }}>
          {scansRemaining}/3 scans remaining
        </span>
      </div>
      
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
          <span style={{ color: '#258b52', fontSize: '16px' }}>✓</span>
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
          <span style={{ color: '#258b52', fontSize: '16px' }}>✓</span>
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
          <span style={{ color: '#258b52', fontSize: '16px' }}>✓</span>
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
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            fontSize: '16px',
            marginBottom: '16px',
            background: 'white'
          }}
        >
          <optgroup label="Shopping (FREE)">
            <option value="electronics">Elektronika</option>
            <option value="home">Dom i ogród</option>
            <option value="fashion">Moda</option>
            <option value="health">Zdrowie i uroda</option>
            <option value="sports">Sport i fitness</option>
            <option value="auto">Auto i akcesoria</option>
            <option value="toys">Zabawki i edukacja</option>
            <option value="furniture">Meble</option>
            <option value="pets">Zwierzęta</option>
            <option value="tools">Narzędzia - DIY</option>
          </optgroup>
          <optgroup label="Services (PRO)">
            <option value="vacations">Vacations</option>
            <option value="insurance">Insurance</option>
            <option value="energy">Energy</option>
            <option value="mobile">Mobile</option>
            <option value="internet">Internet</option>
            <option value="tv">TV</option>
          </optgroup>
          <optgroup label="Finance (FINANCE)">
            <option value="mortgage">Mortgage</option>
            <option value="loans">Loans</option>
            <option value="leasing">Leasing</option>
            <option value="cards">Cards</option>
            <option value="subscriptions">Subscriptions</option>
          </optgroup>
        </select>

        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '6px'
        }}>Product URL</label>
        <input
          type="url"
          placeholder="https://www.bol.com/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            fontSize: '16px',
            marginBottom: '16px'
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
          placeholder="74.95"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            fontSize: '16px',
            marginBottom: '16px'
          }}
        />

        {/* Price Slider */}
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '6px'
        }}>Max prijs: €{maxPrice}</label>
        <input
          type="range"
          min="0"
          max="5000"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(parseInt(e.target.value))}
          className="price-slider"
          style={{ marginBottom: '16px' }}
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
            Ghost Mode (24/7 monitoring)
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading || scansRemaining === 0}
          style={{
            width: '100%',
            padding: '14px',
            background: loading || scansRemaining === 0 ? '#9ca3af' : '#258b52',
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
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#258b52', marginBottom: '8px' }}>
              €{result.savings.toFixed(2)} besparing
            </div>
          )}
          {result.best_offer && (
            <div style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>
              Beste prijs: €{result.best_offer.price} bij {result.best_offer.seller}
            </div>
          )}

          {/* Social Sharing Buttons */}
          {result.savings && result.savings > 0 && (
            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
                Deel deze deal:
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(`Ik heb €${result.savings.toFixed(2)} bespaard met DealSense! 🎉 ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    background: '#25D366',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  WhatsApp
                </a>
                <a 
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    background: '#1877F2',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Facebook
                </a>
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Ik heb €${result.savings.toFixed(2)} bespaard met DealSense! 🎉`)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 16px',
                    background: '#1DA1F2',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 600
                  }}
                >
                  Twitter
                </a>
              </div>
            </div>
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
            <p style={{ fontSize: '14px', color: '#374151', marginBottom: '20px' }}>
              Je hebt 3 gratis scans gebruikt. Upgrade naar Plus voor onbeperkt scannen!
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowUpgradePrompt(false)}
                style={{
                  flex: 1,
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
              <button
                onClick={() => window.location.href = '/plus'}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#258b52',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Upgrade nu
              </button>
            </div>
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
                  background: '#258b52',
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

      {/* Onboarding Flow */}
      {showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-modal">
            {onboardingStep === 1 && (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" style={{ marginBottom: '16px' }}>
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="6"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
                  Welkom bij DealSense!
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                  Vind altijd de beste deal. Snel, betrouwbaar, en gratis te proberen.
                </p>
                <button
                  onClick={nextOnboardingStep}
                  style={{
                    padding: '12px 24px',
                    background: '#258b52',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Volgende
                </button>
              </>
            )}
            {onboardingStep === 2 && (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" style={{ marginBottom: '16px' }}>
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
                  Hoe het werkt
                </h2>
                <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>1. Plak product URL en prijs</div>
                  <div style={{ fontSize: '14px', marginBottom: '8px' }}>2. We scannen 100+ winkels</div>
                  <div style={{ fontSize: '14px' }}>3. Jij ziet de beste 3 deals</div>
                </div>
                <button
                  onClick={nextOnboardingStep}
                  style={{
                    padding: '12px 24px',
                    background: '#258b52',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Volgende
                </button>
              </>
            )}
            {onboardingStep === 3 && (
              <>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#15803d" strokeWidth="2" style={{ marginBottom: '16px' }}>
                  <polyline points="20 12 20 22 4 22 4 12"/>
                  <rect x="2" y="7" width="20" height="5"/>
                  <line x1="12" y1="22" x2="12" y2="7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
                <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
                  3 gratis scans!
                </h2>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>
                  Probeer DealSense gratis. Geen registratie nodig.
                </p>
                <button
                  onClick={nextOnboardingStep}
                  style={{
                    padding: '12px 24px',
                    background: '#258b52',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Start nu
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid #E2E8F0' }}>
        <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>Veelgestelde vragen</h3>
        
        <details style={{
          marginBottom: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #86efac',
          borderRadius: '10px'
        }}>
          <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Hoeveel scans krijg ik gratis?</summary>
          <p style={{ marginTop: '12px', color: '#374151' }}>
            Je krijgt 3 gratis scans. Daarna kun je upgraden naar Plus, Pro of Finance voor onbeperkt scannen.
          </p>
        </details>

        <details style={{
          marginBottom: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #86efac',
          borderRadius: '10px'
        }}>
          <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Is er een prijslimiet?</summary>
          <p style={{ marginTop: '12px', color: '#374151' }}>
            Nee! Je kunt producten van elke prijs scannen, zelfs tot €3000-4000, zolang ze een EAN code hebben.
          </p>
        </details>

        <details style={{
          marginBottom: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #86efac',
          borderRadius: '10px'
        }}>
          <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Wat is de commissie?</summary>
          <p style={{ marginTop: '12px', color: '#374151' }}>
            We rekenen 10% commissie op de besparingen die je maakt. Als je €50 bespaart, betaal je €5.
          </p>
        </details>

        <details style={{
          marginBottom: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #86efac',
          borderRadius: '10px'
        }}>
          <summary style={{ fontWeight: 600, cursor: 'pointer' }}>Hoe werkt het?</summary>
          <p style={{ marginTop: '12px', color: '#374151' }}>
            1. Plak de product URL en prijs. 2. We scannen 100+ winkels. 3. Je ziet de beste 3 deals. Simpel!
          </p>
        </details>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '32px', padding: '20px', textAlign: 'center', fontSize: '12px', color: '#374151' }}>
        <p>© 2026 DealSense.nl - AI aankoop assistent</p>
      </div>
    </div>
  )
}
