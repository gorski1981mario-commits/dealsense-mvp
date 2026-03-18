'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, Sun } from 'lucide-react'
import { useConfigurationLock } from '../../_lib/hooks/useConfigurationLock'
import { FlowTracker } from '../../_lib/flow-tracker'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators } from '../../utils/validators'

interface VacationConfiguratorProps {
  packageType?: 'free' | 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function VacationConfigurator({ packageType = 'pro', userId }: VacationConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  
  // Track view on mount
  useEffect(() => {
    const uid = userId || 'anonymous'
    const pkg = (packageType === 'zakelijk' ? 'finance' : packageType) as 'free' | 'plus' | 'pro' | 'finance'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-vacation', 'view', pkg)
  }, [])
  const [adults, setAdults] = useState(0)
  const [children, setChildren] = useState(0)
  const [childrenAges, setChildrenAges] = useState<number[]>([])
  const [destination, setDestination] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [duration, setDuration] = useState(1)
  const [transport, setTransport] = useState('')
  const [accommodationType, setAccommodationType] = useState('')
  const [stars, setStars] = useState('')
  const [board, setBoard] = useState('')
  const [extras, setExtras] = useState<string[]>([])
  
  // Lock/unlock state using custom hook
  const {
    isLocked,
    saving,
    configId,
    configTimestamp,
    handleLockConfiguration: lockConfig,
    handleUnlockConfiguration: unlockConfig,
    handleDownloadPDF: downloadPDF
  } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'vacation' })
  
  // Active field tracking for visual highlight
  const [activeField, setActiveField] = useState<string | null>(null)
  
  // Progress tracking
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  
  // Dynamic totalFields calculation
  const getTotalFields = () => {
    let total = 10 // filterType, adults, destination, departureDate, duration, transport, accommodationType, stars, board, extras
    if (children > 0) {
      total += 1 // childrenAges (only if children > 0)
    }
    return total
  }
  const totalFields = getTotalFields()
  
  const markFieldTouched = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
  }
  
  const markFieldValid = (fieldName: string, isValid: boolean) => {
    setValidFields(prev => {
      const newSet = new Set(prev)
      if (isValid) {
        newSet.add(fieldName)
      } else {
        newSet.delete(fieldName)
      }
      return newSet
    })
  }
  
  const validateAndMark = (fieldName: string, value: any, customValidator?: (v: any) => boolean) => {
    markFieldTouched(fieldName)
    const isValid = customValidator ? customValidator(value) : validators.required(value)
    markFieldValid(fieldName, isValid)
    return isValid
  }
  
  // Validator for adults (must be >= 1)
  const validateAdults = (value: number) => value >= 1 && value <= 9
  
  const progress = Math.round((validFields.size / totalFields) * 100)

  const limits = {
    free: 1,
    plus: 3,
    pro: 5,
    finance: 10,
    zakelijk: 10
  }

  const maxDestinations = limits[packageType || 'pro']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Track action
    const uid = userId || 'anonymous'
    const pkg = (packageType === 'zakelijk' ? 'finance' : packageType) as 'free' | 'plus' | 'pro' | 'finance'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-vacation', 'action', pkg, {
      adults, children, destination, duration
    })
    
    // Auto-lock configuration on submit
    if (!isLocked) {
      const parameters = { adults, children, childrenAges, destination, departureDate, duration, transport, accommodationType, stars, board, extras }
      await lockConfig(parameters)
    }
    
    setView('results')
  }

  const handleLockConfiguration = async () => {
    const parameters = { adults, children, childrenAges, destination, departureDate, duration, transport, accommodationType, stars, board, extras }
    await lockConfig(parameters)
  }

  const handleUnlockConfiguration = () => {
    unlockConfig()
  }

  const handleDownloadPDF = () => {
    const parameters = { adults, children, childrenAges, destination, departureDate, duration, transport, accommodationType, stars, board, extras }
    downloadPDF(parameters)
  }

  const updateChildren = (newCount: number) => {
    if (isLocked) return
    
    // Check if we're reducing children count and had valid ages
    const hadValidAges = validFields.has('childrenAges') && childrenAges.some(age => age > 0)
    
    setChildren(newCount)
    
    // Reset childrenAges - initialize with age 1 (Baby) so they're valid by default
    const newAges = Array(newCount).fill(1)
    setChildrenAges(newAges)
    if (newCount === 0) {
      validFields.delete('childrenAges')
      // If Adults Only was selected, deselect it when adding children
      if (board === 'adults_only') {
        setBoard('')
        validFields.delete('board')
      }
    } else {
      // Auto-validate since all ages are set to 1 (Baby)
      validateAndMark('childrenAges', newAges, () => true)
    }
    
    // Show warning if configuration was changed
    if (hadValidAges && newCount < children) {
      // User reduced children count - ages need to be re-entered
      touchedFields.add('childrenAges')
    }
  }

  const selectStar = (star: string) => {
    if (isLocked) return
    setStars(star)
    validateAndMark('stars', star)
  }

  const toggleExtra = (extra: string) => {
    if (isLocked) return
    setExtras(prev => {
      const newExtras = prev.includes(extra) ? prev.filter(e => e !== extra) : [...prev, extra]
      // Mark extras field as touched and valid (extras are optional, any selection is valid)
      markFieldTouched('extras')
      markFieldValid('extras', true)
      return newExtras
    })
  }

  if (view === 'configurator') {
    return (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Sun size={24} strokeWidth={2} /> Vakantie Configurator
        </h2>

        {/* Progress Tracker */}
        <ProgressTracker 
          percentage={progress}
          validCount={validFields.size}
          totalFields={totalFields}
          showWarning={validFields.size < totalFields}
        />

        {/* Lock Panel */}
        <LockPanel
          isLocked={isLocked}
          configId={configId}
          onUnlock={handleUnlockConfiguration}
          onDownloadPDF={handleDownloadPDF}
        />

        {isLocked && configId && (
          <div style={{ background: '#E6F4EE', border: '1px solid #15803d', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={16} color="#15803d" /><div><div style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>Configuratie opgeslagen</div><div style={{ fontSize: '11px', color: '#6B7280' }}>ID: {configId}</div></div></div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleUnlockConfiguration} title="Ontgrendelen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'white', border: '2px solid #15803d', borderRadius: '8px', cursor: 'pointer' }}>👆</button>
              <button type="button" onClick={handleDownloadPDF} title="Download PDF" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#15803d', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Download size={18} color="white" /></button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* FILTER OPTIONS */}
          <FilterOptions 
            selectedFilter={filterType}
            onFilterChange={(filter) => { setFilterType(filter); validateAndMark('filterType', filter); }}
            disabled={isLocked}
          />
          
          {/* 1. REIZIGERS */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Reizigers</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Volwassenen (18+)</label>
              <div onFocus={() => setActiveField('adults')} onBlur={() => setActiveField(null)} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: validFields.has('adults') ? '#E6F4EE' : (touchedFields.has('adults') ? '#FEF3C7' : '#F3F4F6'), borderRadius: '10px', padding: '8px 12px', width: 'fit-content', border: validFields.has('adults') ? '2px solid #15803d' : (touchedFields.has('adults') ? '2px solid #F59E0B' : '2px solid transparent'), transition: 'all 0.2s' }}>
                <button type="button" onClick={() => { if (!isLocked && adults > 0) { const newVal = adults - 1; setAdults(newVal); validateAndMark('adults', newVal, validateAdults); } }} disabled={adults <= 0 || isLocked} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'white', color: '#111827', fontSize: '16px', fontWeight: 600, cursor: (adults <= 1 || isLocked) ? 'not-allowed' : 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', opacity: isLocked ? 0.5 : 1 }}>−</button>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', minWidth: '25px', textAlign: 'center' }}>{adults}</div>
                <button type="button" onClick={() => { if (!isLocked && adults < 9) { const newVal = adults + 1; setAdults(newVal); validateAndMark('adults', newVal, validateAdults); } }} disabled={adults >= 9 || isLocked} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'white', color: '#111827', fontSize: '16px', fontWeight: 600, cursor: (adults >= 9 || isLocked) ? 'not-allowed' : 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', opacity: isLocked ? 0.5 : 1 }}>+</button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Kinderen (0-17)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: children > 0 ? '#E6F4EE' : '#F3F4F6', borderRadius: '10px', padding: '8px 12px', width: 'fit-content', border: children > 0 ? '2px solid #15803d' : '2px solid transparent', transition: 'all 0.2s' }}>
                <button type="button" onClick={() => !isLocked && children > 0 && updateChildren(children - 1)} disabled={children <= 0 || isLocked} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'white', color: '#111827', fontSize: '16px', fontWeight: 600, cursor: (children <= 0 || isLocked) ? 'not-allowed' : 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', opacity: isLocked ? 0.5 : 1 }}>−</button>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', minWidth: '25px', textAlign: 'center' }}>{children}</div>
                <button type="button" onClick={() => !isLocked && children < 4 && updateChildren(children + 1)} disabled={children >= 4 || isLocked} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'white', color: '#111827', fontSize: '16px', fontWeight: 600, cursor: (children >= 4 || isLocked) ? 'not-allowed' : 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', opacity: isLocked ? 0.5 : 1 }}>+</button>
              </div>
              {children > 0 && (
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {childrenAges.map((age, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <label style={{ margin: 0, minWidth: '70px', fontSize: '13px' }}>Kind {i + 1}:</label>
                      <select value={age || 1} onChange={(e) => { if (!isLocked) { const newAges = [...childrenAges]; newAges[i] = parseInt(e.target.value); setChildrenAges(newAges); const allValid = newAges.every(a => a >= 1 && a <= 17); if (allValid) { validateAndMark('childrenAges', newAges, () => true); } else { validFields.delete('childrenAges'); }}}} onFocus={() => setActiveField(`childAge${i}`)} onBlur={() => setActiveField(null)} disabled={isLocked} style={{ flex: 1, padding: '8px 10px', border: age >= 1 ? '2px solid #15803d' : '2px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', background: isLocked ? '#F3F4F6' : (age >= 1 ? '#E6F4EE' : 'white'), cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                        <option value="1">👶 Baby (0-1 jaar)</option>
                        {Array.from({length: 17}, (_, i) => <option key={i+2} value={i+2}>{i+2} jaar</option>)}
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
              <select value={destination} onChange={(e) => { const val = e.target.value; setDestination(val); validateAndMark('destination', val); }} onFocus={() => setActiveField('destination')} onBlur={() => setActiveField(null)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: validFields.has('destination') ? '2px solid #15803d' : (touchedFields.has('destination') ? '2px solid #F59E0B' : '2px solid #E5E7EB'), borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('destination') ? '#E6F4EE' : (touchedFields.has('destination') ? '#FEF3C7' : 'white')), cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                <option value="">Kies bestemming...</option>
                <optgroup label="Meest populair voor Nederlanders">
                  <option value="turkije">MEEST GEKOZEN 🇹🇷 Turkije</option>
                  <option value="griekenland">MEEST GEKOZEN 🇬🇷 Griekenland</option>
                  <option value="spanje">MEEST GEKOZEN 🇪🇸 Spanje</option>
                  <option value="egypte">MEEST GEKOZEN 🇪🇬 Egypte</option>
                  <option value="portugal">MEEST GEKOZEN 🇵🇹 Portugal</option>
                  <option value="italie">MEEST GEKOZEN 🇮🇹 Italië</option>
                  <option value="frankrijk">MEEST GEKOZEN 🇫🇷 Frankrijk</option>
                  <option value="kroatie">MEEST GEKOZEN 🇭🇷 Kroatië</option>
                  <option value="thailand">MEEST GEKOZEN 🇹🇭 Thailand</option>
                  <option value="dubai">MEEST GEKOZEN 🇦🇪 Dubai (VAE)</option>
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
              <input type="date" min={new Date().toISOString().split('T')[0]} value={departureDate} onChange={(e) => { const val = e.target.value; setDepartureDate(val); validateAndMark('departureDate', val); }} onFocus={() => setActiveField('departureDate')} onBlur={() => setActiveField(null)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: validFields.has('departureDate') ? '2px solid #15803d' : (touchedFields.has('departureDate') ? '2px solid #F59E0B' : '2px solid #E5E7EB'), borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('departureDate') ? '#E6F4EE' : (touchedFields.has('departureDate') ? '#FEF3C7' : 'white')), cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Duur: <span style={{ color: '#15803d', fontWeight: 700 }}>{duration} {duration === 1 ? 'dag' : 'dagen'}</span></div>
              <input type="range" min="1" max="30" value={duration} onChange={(e) => { const val = parseInt(e.target.value); setDuration(val); validateAndMark('duration', val, (v) => v >= 1); }} disabled={isLocked} style={{ width: '100%', height: '8px', borderRadius: '4px', background: '#E5E7EB', outline: 'none', cursor: isLocked ? 'not-allowed' : 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                <span>1 dag</span>
                <span>30 dagen</span>
              </div>
            </div>
          </div>

          {/* 3. VERVOER */}
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Vervoer</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[{value: 'flight', label: '✈️ Vliegtuig'}, {value: 'own', label: '🚗 Eigen vervoer'}, {value: 'bus', label: '🚌 Bus'}].map(t => (
                <div key={t.value} onClick={() => { if (!isLocked) { setTransport(t.value); validateAndMark('transport', t.value); } }} onFocus={() => setActiveField('transport')} onBlur={() => setActiveField(null)} tabIndex={0} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: transport === t.value ? '2px solid #15803d' : '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: transport === t.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                  <input type="radio" name="transport" value={t.value} checked={transport === t.value} onChange={() => !isLocked && setTransport(t.value)} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[{value: 'hotel', label: '🏨 Hotel'}, {value: 'apartment', label: '🏠 Appartement'}, {value: 'resort', label: '🏖️ Resort'}, {value: 'park', label: '🏡 Vakantiepark'}].map(a => (
                  <div key={a.value} onClick={() => { if (!isLocked) { setAccommodationType(a.value); validateAndMark('accommodationType', a.value); } }} onFocus={() => setActiveField('accommodationType')} onBlur={() => setActiveField(null)} tabIndex={0} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: accommodationType === a.value ? '2px solid #15803d' : '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: accommodationType === a.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="accommodationType" value={a.value} checked={accommodationType === a.value} onChange={() => !isLocked && setAccommodationType(a.value)} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <label style={{ margin: 0, fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: 1 }}>{a.label}</label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Hotel categorie (sterren)</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[{value: '3', label: '⭐⭐⭐ 3 sterren'}, {value: '4', label: '⭐⭐⭐⭐ 4 sterren'}, {value: '5', label: '⭐⭐⭐⭐⭐ 5 sterren'}].map(s => (
                  <div key={s.value} onClick={() => !isLocked && selectStar(s.value)} onFocus={() => setActiveField('stars')} onBlur={() => setActiveField(null)} tabIndex={0} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: stars === s.value ? '2px solid #15803d' : '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: stars === s.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="stars" value={s.value} checked={stars === s.value} onChange={() => !isLocked && selectStar(s.value)} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <label style={{ margin: 0, fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: 1 }}>{s.label}</label>
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
                <div key={b.value} onClick={() => { if (!isLocked) { setBoard(b.value); validateAndMark('board', b.value); } }} onFocus={() => setActiveField('board')} onBlur={() => setActiveField(null)} tabIndex={0} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: board === b.value ? '2px solid #15803d' : (touchedFields.has('board') && !validFields.has('board') ? '2px solid #F59E0B' : '2px solid #E5E7EB'), borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: board === b.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : (touchedFields.has('board') && !validFields.has('board') ? '#FEF3C7' : 'white')), opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                  <input type="radio" name="board" value={b.value} checked={board === b.value} onChange={() => !isLocked && setBoard(b.value)} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <label style={{ margin: 0, fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: 1 }}>{b.label}</label>
                </div>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>6. Extra voorkeuren</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {[{value: 'pool', label: '🏊 Zwembad'}, {value: 'wifi', label: '📶 Wifi'}, {value: 'parking', label: '🅿️ Parkeren'}, {value: 'kids', label: '👶 Kinderclub'}, {value: 'spa', label: '💆 Spa/Wellness'}, {value: 'beach', label: '🏖️ Strand'}, ...(children === 0 ? [{value: 'adults', label: '🔞 Adults Only'}] : [])].map(e => (
                <div key={e.value} onClick={() => !isLocked && toggleExtra(e.value)} tabIndex={0} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', border: extras.includes(e.value) ? '2px solid #15803d' : '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: extras.includes(e.value) ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={extras.includes(e.value)} readOnly disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer', pointerEvents: 'none' }} />
                  <label style={{ margin: 0, fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{e.label}</label>
                </div>
              ))}
            </div>
          </div>

          {/* Waarschuwing als niet alle velden zijn ingevuld */}
          {!destination && !departureDate && (
            <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '13px', color: '#92400e' }}>💡 <strong>Tip:</strong> Vul meer velden in voor betere resultaten. Hoe meer informatie, hoe nauwkeuriger de aanbiedingen!</div>
            </div>
          )}

          <button type="submit" disabled={isLocked || validFields.size < totalFields} style={{ width: '100%', padding: '14px', background: (isLocked || validFields.size < totalFields) ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (isLocked || validFields.size < totalFields) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
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
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>We doorzochten 50% e-commerce giganten + 50% niszowe biura met Deal Score</p>

        <div style={{ fontSize: '32px', textAlign: 'center', margin: '20px 0' }}>🔒</div>

        {[{name: '⭐⭐⭐⭐⭐ Delphin Imperial', price: '€1.749', location: '📍 Lara, Turkije • Ultra All Inclusive', rating: '⭐ 4.8/5', trust: '🛡️ 9/10', score: 'Score: 9.2', badge: 'BESTE DEAL', best: true}, {name: '⭐⭐⭐⭐⭐ Rixos Premium Belek', price: '€1.899', location: '📍 Belek, Turkije • All Inclusive', rating: '⭐ 4.5/5', trust: '🛡️ 9/10', score: 'Score: 8.8'}, {name: '⭐⭐⭐⭐⭐ Maxx Royal Belek', price: '€2.299', location: '📍 Belek, Turkije • Ultra All Inclusive', rating: '⭐ 4.7/5', trust: '🛡️ 10/10', score: 'Score: 9.0'}].map((hotel, i) => (
          <div key={i} style={{ background: hotel.best ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${hotel.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{hotel.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{hotel.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{hotel.location}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{hotel.rating}</span>
              <span>{hotel.trust}</span>
              <span>{hotel.score}</span>
            </div>
            {hotel.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{hotel.badge}</span>}
          </div>
        ))}

        <div style={{ background: '#E6F4EE', border: '2px solid #15803d', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Betaal 10% commissie om toegang te krijgen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€174,90</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>(10% van €1.749 × 2 personen)</div>
          <button onClick={() => setView('payment')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #15803d 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>Betaal en krijg toegang →</button>
        </div>
      </div>
    )
  }

  if (view === 'payment') {
    return (
      <div>
        <button onClick={() => setView('results')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>💳 Betaling</h2>
        <div style={{ background: '#E6F4EE', border: '2px solid #15803d', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '16px', color: '#374151', marginBottom: '12px' }}>Totaal te betalen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€174,90</div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>10% commissie voor toegang tot 3 beste deals</div>
          <button onClick={() => setView('unlocked')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #15803d 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>Betaal met Stripe →</button>
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
        <div key={i} style={{ background: hotel.best ? '#E6F4EE' : 'white', border: `2px solid ${hotel.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{hotel.name}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{hotel.price}</div>
          </div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{hotel.location}</div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
            <span>{hotel.rating}</span>
            <span>{hotel.trust}</span>
          </div>
          {hotel.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{hotel.badge}</span>}
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button onClick={() => window.open(hotel.url, '_blank')} style={{ flex: 1, padding: '10px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🌐 Boek bij {hotel.url.includes('corendon') ? 'Corendon' : hotel.url.includes('tui') ? 'TUI' : 'Sunweb'}</button>
            <button onClick={() => window.open(`https://www.tiktok.com/search?q=${encodeURIComponent(hotel.name + ' hotel review')}`, '_blank')} style={{ flex: 1, padding: '10px', background: '#000', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>📱 TikTok reviews</button>
          </div>
        </div>
      ))}
    </div>
  )
}




