'use client'

import { useState } from 'react'
import { Lock, Unlock, Download } from 'lucide-react'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'

interface VacationConfiguratorProps {
  packageType?: 'free' | 'plus' | 'pro' | 'finance'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function VacationConfigurator({ packageType = 'pro', userId }: VacationConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [childrenAges, setChildrenAges] = useState<number[]>([])
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [duration, setDuration] = useState('14')
  const [transport, setTransport] = useState('flight')
  const [accommodationType, setAccommodationType] = useState('hotel')
  const [stars, setStars] = useState<string[]>(['4'])
  const [board, setBoard] = useState('ai')
  const [extras, setExtras] = useState<string[]>([])
  
  // Lock/unlock state
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const limits = {
    free: 3,
    plus: 10,
    pro: 20,
    finance: 30
  }

  const maxDestinations = limits[packageType || 'pro']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Auto-lock configuration on submit
    if (!isLocked) {
      await handleLockConfiguration()
    }
    
    setView('results')
  }

  const handleLockConfiguration = async () => {
    try {
      setSaving(true)
      const configData = {
        userId: userId || 'anonymous',
        sector: 'vacation',
        parameters: { adults, children, childrenAges, destination, departureDate, duration, transport, accommodationType, stars, board, extras },
        timestamp: new Date().toISOString()
      }
      const response = await fetch('/api/configurations/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) })
      const result = await response.json()
      if (result.success) { setConfigId(result.configId); setConfigTimestamp(configData.timestamp); setIsLocked(true) }
    } catch (error) { console.error('Error:', error) } finally { setSaving(false) }
  }

  const handleUnlockConfiguration = () => { setIsLocked(false) }

  const handleDownloadPDF = () => {
    if (!configId || !configTimestamp) return
    generateConfigurationPDF({ configId, userId: userId || 'anonymous', sector: 'vacation', parameters: { adults, children, childrenAges, destination, departureDate, duration, transport, accommodationType, stars, board, extras }, timestamp: configTimestamp })
  }

  const updateChildren = (newCount: number) => {
    setChildren(newCount)
    setChildrenAges(Array(newCount).fill(0))
  }

  const toggleStar = (star: string) => {
    setStars(prev => 
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    )
  }

  const toggleExtra = (extra: string) => {
    setExtras(prev => 
      prev.includes(extra) ? prev.filter(e => e !== extra) : [...prev, extra]
    )
  }

  if (view === 'configurator') {
    return (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          🏖️ Vakantie Configurator
        </h2>

        {isLocked && configId && (
          <div style={{ background: '#E6F4EE', border: '1px solid #1E7F5C', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={16} color="#1E7F5C" /><div><div style={{ fontSize: '13px', fontWeight: 600, color: '#1E7F5C' }}>Configuratie opgeslagen</div><div style={{ fontSize: '11px', color: '#6B7280' }}>ID: {configId}</div></div></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleUnlockConfiguration} title="Ontgrendelen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'white', border: '2px solid #1E7F5C', borderRadius: '8px', cursor: 'pointer' }}>👆</button>
              <button type="button" onClick={handleDownloadPDF} title="Download PDF" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#1E7F5C', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Download size={18} color="white" /></button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* 1. REIZIGERS */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Reizigers</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Volwassenen (18+)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F3F4F6', borderRadius: '10px', padding: '8px 12px', width: 'fit-content' }}>
                <button type="button" onClick={() => adults > 1 && setAdults(adults - 1)} disabled={adults <= 1} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'white', color: '#111827', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>−</button>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', minWidth: '25px', textAlign: 'center' }}>{adults}</div>
                <button type="button" onClick={() => adults < 9 && setAdults(adults + 1)} disabled={adults >= 9} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'white', color: '#111827', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>+</button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Kinderen (0-17)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F3F4F6', borderRadius: '10px', padding: '8px 12px', width: 'fit-content' }}>
                <button type="button" onClick={() => children > 0 && updateChildren(children - 1)} disabled={children <= 0} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'white', color: '#111827', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>−</button>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', minWidth: '25px', textAlign: 'center' }}>{children}</div>
                <button type="button" onClick={() => children < 4 && updateChildren(children + 1)} disabled={children >= 4} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'white', color: '#111827', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>+</button>
              </div>
              {children > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {childrenAges.map((age, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ margin: 0, minWidth: '70px', fontSize: '13px' }}>Kind {i + 1}:</label>
                      <select value={age} onChange={(e) => { const newAges = [...childrenAges]; newAges[i] = parseInt(e.target.value); setChildrenAges(newAges); }} style={{ flex: 1, padding: '8px 10px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: 'white' }}>
                        <option value="0">Leeftijd...</option>
                        {Array.from({length: 18}, (_, i) => <option key={i} value={i}>{i} jaar</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. BESTEMMING & DATUM */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Bestemming & Datum</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bestemming</label>
              <select value={destination} onChange={(e) => setDestination(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
                <option value="">Kies bestemming...</option>
                <optgroup label="🔥 Meest populair voor Nederlanders">
                  <option value="turkije">🔥 🇹🇷 Turkije</option>
                  <option value="griekenland">🔥 🇬🇷 Griekenland</option>
                  <option value="spanje">🔥 🇪🇸 Spanje</option>
                  <option value="egypte">🔥 🇪🇬 Egypte</option>
                  <option value="portugal">🔥 🇵🇹 Portugal</option>
                  <option value="italie">🔥 🇮🇹 Italië</option>
                  <option value="frankrijk">🔥 🇫🇷 Frankrijk</option>
                  <option value="kroatie">🔥 🇭🇷 Kroatië</option>
                  <option value="thailand">🔥 🇹🇭 Thailand</option>
                  <option value="dubai">🔥 🇦🇪 Dubai (VAE)</option>
                </optgroup>
                <optgroup label="Andere bestemmingen">
                  <option value="marokko">🇲🇦 Marokko</option>
                  <option value="tunesie">🇹🇳 Tunesië</option>
                  <option value="cyprus">🇨🇾 Cyprus</option>
                  <option value="malta">🇲🇹 Malta</option>
                  <option value="bulgarije">🇧🇬 Bulgarije</option>
                  <option value="mexico">🇲🇽 Mexico</option>
                  <option value="dominicaanse">🇩🇴 Dominicaanse Republiek</option>
                  <option value="cuba">🇨🇺 Cuba</option>
                  <option value="jamaica">🇯🇲 Jamaica</option>
                  <option value="bali">🇮🇩 Indonesië (Bali)</option>
                  <option value="malediven">🇲🇻 Malediven</option>
                  <option value="srilanka">🇱🇰 Sri Lanka</option>
                  <option value="vietnam">🇻🇳 Vietnam</option>
                  <option value="usa">🇺🇸 Verenigde Staten</option>
                  <option value="canada">🇨🇦 Canada</option>
                  <option value="zuidafrika">🇿🇦 Zuid-Afrika</option>
                  <option value="kenia">🇰🇪 Kenia</option>
                  <option value="tanzania">🇹🇿 Tanzania</option>
                  <option value="australie">🇦🇺 Australië</option>
                  <option value="nieuwzeeland">🇳🇿 Nieuw-Zeeland</option>
                </optgroup>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Vertrekdatum</label>
              <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Duur</label>
              <select value={duration} onChange={(e) => setDuration(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
                <option value="7">7 dagen</option>
                <option value="10">10 dagen</option>
                <option value="14">14 dagen</option>
                <option value="21">21 dagen</option>
              </select>
            </div>
          </div>

          {/* 3. VERVOER */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Vervoer</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[{value: 'flight', label: '✈️ Vliegtuig'}, {value: 'own', label: '🚗 Eigen vervoer'}, {value: 'bus', label: '🚌 Bus'}].map(t => (
                <div key={t.value} onClick={() => setTransport(t.value)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: transport === t.value ? '#E6F4EE' : 'white', borderColor: transport === t.value ? '#1E7F5C' : '#E5E7EB' }}>
                  <input type="radio" name="transport" value={t.value} checked={transport === t.value} onChange={() => setTransport(t.value)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label style={{ margin: 0, fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: 1 }}>{t.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* 4. ACCOMMODATIE */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Accommodatie</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Type</label>
              <select value={accommodationType} onChange={(e) => setAccommodationType(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
                <option value="hotel">🏨 Hotel</option>
                <option value="apartment">🏠 Appartement</option>
                <option value="resort">🏖️ Resort</option>
                <option value="park">🏡 Vakantiepark</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Hotel categorie (sterren)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[{value: '3', label: '⭐⭐⭐ 3 sterren'}, {value: '4', label: '⭐⭐⭐⭐ 4 sterren'}, {value: '5', label: '⭐⭐⭐⭐⭐ 5 sterren'}].map(s => (
                  <div key={s.value} onClick={() => toggleStar(s.value)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: stars.includes(s.value) ? '#E6F4EE' : 'white', borderColor: stars.includes(s.value) ? '#1E7F5C' : '#E5E7EB' }}>
                    <input type="checkbox" checked={stars.includes(s.value)} onChange={() => toggleStar(s.value)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <label style={{ margin: 0, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{s.label}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 5. VERBLIJF TYPE */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>5. Verblijf type</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[{value: 'bb', label: '🍳 Logies & Ontbijt'}, {value: 'hb', label: '🍽️ Halfpension'}, {value: 'fb', label: '🍽️🍽️ Volpension'}, {value: 'ai', label: '🍹 All Inclusive'}, {value: 'uai', label: '🍹+ Ultra All Inclusive'}].map(b => (
                <div key={b.value} onClick={() => setBoard(b.value)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: board === b.value ? '#E6F4EE' : 'white', borderColor: board === b.value ? '#1E7F5C' : '#E5E7EB' }}>
                  <input type="radio" name="board" value={b.value} checked={board === b.value} onChange={() => setBoard(b.value)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label style={{ margin: 0, fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: 1 }}>{b.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* 6. EXTRA FILTERS */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>6. Extra voorkeuren</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {[{value: 'pool', label: '🏊 Zwembad'}, {value: 'wifi', label: '📶 Wifi'}, {value: 'parking', label: '🅿️ Parkeren'}, {value: 'kids', label: '👶 Kinderclub'}, {value: 'spa', label: '💆 Spa/Wellness'}, {value: 'beach', label: '🏖️ Strand'}, {value: 'adults', label: '🔞 Adults Only'}].map(e => (
                <div key={e.value} onClick={() => toggleExtra(e.value)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: extras.includes(e.value) ? '#E6F4EE' : 'white', borderColor: extras.includes(e.value) ? '#1E7F5C' : '#E5E7EB' }}>
                  <input type="checkbox" checked={extras.includes(e.value)} onChange={() => toggleExtra(e.value)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label style={{ margin: 0, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{e.label}</label>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isLocked} style={{ width: '100%', padding: '14px', background: isLocked ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: isLocked ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
            {isLocked ? 'Configuratie vergrendeld' : 'Zoek beste vakantie →'}
          </button>
          {isLocked && <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>👆 Klik op het vinger-icoon hierboven om te wijzigen</div>}
        </form>
      </div>
    )
  }

  if (view === 'results') {
    return (
      <div>
        <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>🎉 3 beste aanbiedingen gevonden!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>We doorzochten 50% e-commerce giganten + 50% niszowe biura met Ranking 4.0 (AI + kwant)</p>

        <div style={{ fontSize: '32px', textAlign: 'center', margin: '20px 0' }}>🔒</div>

        {[{name: '⭐⭐⭐⭐⭐ Delphin Imperial', price: '€1.749', location: '📍 Lara, Turkije • Ultra All Inclusive', rating: '⭐ 4.8/5', trust: '🛡️ 9/10', score: 'Score: 9.2', badge: 'BESTE DEAL', best: true}, {name: '⭐⭐⭐⭐⭐ Rixos Premium Belek', price: '€1.899', location: '📍 Belek, Turkije • All Inclusive', rating: '⭐ 4.5/5', trust: '🛡️ 9/10', score: 'Score: 8.8'}, {name: '⭐⭐⭐⭐⭐ Maxx Royal Belek', price: '€2.299', location: '📍 Belek, Turkije • Ultra All Inclusive', rating: '⭐ 4.7/5', trust: '🛡️ 10/10', score: 'Score: 9.0'}].map((hotel, i) => (
          <div key={i} style={{ background: hotel.best ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${hotel.best ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{hotel.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E7F5C' }}>{hotel.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{hotel.location}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{hotel.rating}</span>
              <span>{hotel.trust}</span>
              <span>{hotel.score}</span>
            </div>
            {hotel.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#1E7F5C', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{hotel.badge}</span>}
          </div>
        ))}

        <div style={{ background: '#E6F4EE', border: '2px solid #1E7F5C', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Betaal 10% commissie om toegang te krijgen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E7F5C', margin: '12px 0' }}>€174,90</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>(10% van €1.749 × 2 personen)</div>
          <button onClick={() => setView('payment')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>Betaal en krijg toegang →</button>
        </div>
      </div>
    )
  }

  if (view === 'payment') {
    return (
      <div>
        <button onClick={() => setView('results')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>💳 Betaling</h2>
        
        <div style={{ background: '#E6F4EE', border: '2px solid #1E7F5C', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '16px', color: '#374151', marginBottom: '12px' }}>Totaal te betalen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E7F5C', margin: '12px 0' }}>€174,90</div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>10% commissie voor toegang tot 3 beste deals</div>
          <button onClick={() => setView('unlocked')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>Betaal met Stripe →</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#6B7280' }}>🔒 Veilige betaling via Stripe</div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>✅ Toegang verkregen!</h2>
      <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Je hebt nu toegang tot de 3 beste deals + TikTok reviews</p>

      {[{name: '⭐⭐⭐⭐⭐ Delphin Imperial', price: '€1.749 p.p.', location: '📍 Lara, Turkije • Ultra All Inclusive', rating: '⭐ 4.8/5 (2.341 reviews)', trust: '🛡️ Betrouwbaar 9/10', badge: 'BESTE DEAL - BESPAAR €450', url: 'https://www.corendon.nl', best: true}, {name: '⭐⭐⭐⭐⭐ Rixos Premium Belek', price: '€1.899 p.p.', location: '📍 Belek, Turkije • All Inclusive', rating: '⭐ 4.5/5 (1.892 reviews)', trust: '🛡️ Betrouwbaar 9/10', url: 'https://www.tui.nl'}, {name: '⭐⭐⭐⭐⭐ Maxx Royal Belek', price: '€2.299 p.p.', location: '📍 Belek, Turkije • Ultra All Inclusive', rating: '⭐ 4.7/5 (3.127 reviews)', trust: '🛡️ Betrouwbaar 10/10', url: 'https://www.sunweb.nl'}].map((hotel, i) => (
        <div key={i} style={{ background: hotel.best ? '#E6F4EE' : 'white', border: `2px solid ${hotel.best ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{hotel.name}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E7F5C' }}>{hotel.price}</div>
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{hotel.location}</div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
            <span>{hotel.rating}</span>
            <span>{hotel.trust}</span>
          </div>
          {hotel.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#1E7F5C', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{hotel.badge}</span>}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button onClick={() => window.open(hotel.url, '_blank')} style={{ flex: 1, padding: '10px', background: '#1E7F5C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🌐 Boek bij {hotel.url.includes('corendon') ? 'Corendon' : hotel.url.includes('tui') ? 'TUI' : 'Sunweb'}</button>
            <button onClick={() => window.open(`https://www.tiktok.com/search?q=${encodeURIComponent(hotel.name + ' hotel review')}`, '_blank')} style={{ flex: 1, padding: '10px', background: '#000', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>📱 TikTok reviews</button>
          </div>
        </div>
      ))}
    </div>
  )
}
