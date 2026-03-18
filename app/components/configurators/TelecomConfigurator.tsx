'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators } from '../../utils/validators'

interface TelecomConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function TelecomConfigurator({ packageType = 'pro', userId }: TelecomConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  const [serviceType, setServiceType] = useState('')
  const [mobileData, setMobileData] = useState<number | ''>('')
  const [mobileMinutes, setMobileMinutes] = useState('')
  const [internetSpeed, setInternetSpeed] = useState<number | ''>('')
  const [tvChannels, setTvChannels] = useState(false)
  const [postcode, setPostcode] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [numberOfSims, setNumberOfSims] = useState<number | ''>(0)
  const [fiveG, setFiveG] = useState(false)
  const [roaming, setRoaming] = useState(false)
  const [fixedPhone, setFixedPhone] = useState(false)
  const [searching, setSearching] = useState(false)
  
  // Auto-fill from user account (without auto-validation)
  useEffect(() => {
    const userData = { postcode: '1943BR', houseNumber: '42' }
    if (userData.postcode) {
      setPostcode(userData.postcode)
    }
    if (userData.houseNumber) {
      setHouseNumber(userData.houseNumber)
    }
  }, [])
  
  // Lock/unlock state
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  
  // Progress tracking
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  // Dynamic totalFields based on serviceType
  const getTotalFields = () => {
    let total = 2 // filterType + serviceType (always required)
    
    if (serviceType === 'mobiel' || serviceType === 'mobiel-internet' || serviceType === 'alles') {
      total += 2 // mobileData + numberOfSims
    }
    if (serviceType === 'internet' || serviceType === 'mobiel-internet' || serviceType === 'alles') {
      total += 1 // internetSpeed
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
      isValid ? newSet.add(fieldName) : newSet.delete(fieldName)
      return newSet
    })
  }
  
  const validateAndMark = (fieldName: string, value: any, customValidator?: (val: any) => boolean) => {
    markFieldTouched(fieldName)
    const isValid = customValidator ? customValidator(value) : validators.required(value)
    markFieldValid(fieldName, isValid)
  }
  
  const progress = Math.round((validFields.size / totalFields) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLocked) { await handleLockConfiguration() }
    setView('results')
  }

  const handleLockConfiguration = async () => {
    try {
      setSaving(true)
      const configData = {
        userId: userId || 'anonymous',
        sector: 'telecom',
        parameters: { serviceType, mobileData, mobileMinutes, internetSpeed, tvChannels, postcode, houseNumber, numberOfSims, fiveG, roaming, fixedPhone },
        timestamp: new Date().toISOString()
      }
      const response = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      })
      const result = await response.json()
      if (result.success) {
        setConfigId(result.configId)
        setConfigTimestamp(configData.timestamp)
        setIsLocked(true)
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUnlockConfiguration = () => {
    setIsLocked(false)
  }

  const handleDownloadPDF = () => {
    if (!configId || !configTimestamp) return
    generateConfigurationPDF({
      configId,
      userId: userId || 'anonymous',
      sector: 'telecom',
      parameters: { serviceType, mobileData, mobileMinutes, internetSpeed, tvChannels, postcode, houseNumber, numberOfSims, fiveG, roaming, fixedPhone },
      timestamp: configTimestamp
    })
  }

  if (view === 'results') {
    return (
      <div>
        <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>🎉 3 beste aanbiedingen gevonden!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>We doorzochten de markt met Deal Score</p>
        <div style={{ fontSize: '32px', textAlign: 'center', margin: '20px 0' }}>🔒</div>
        {[{name: '📱 KPN Compleet', price: '€45/mnd', plan: 'Onbeperkt + 100 Mbps', rating: '⭐ 4.5/5', trust: '🛡️ 9/10', score: 'Score: 9.0', badge: 'BESTE DEAL', best: true}, {name: '📱 Ziggo All-in-One', price: '€52/mnd', plan: 'Mobiel + Internet + TV', rating: '⭐ 4.3/5', trust: '🛡️ 8/10', score: 'Score: 8.6'}, {name: '📱 T-Mobile Premium', price: '€58/mnd', plan: 'Onbeperkt 5G + 500 Mbps', rating: '⭐ 4.4/5', trust: '🛡️ 9/10', score: 'Score: 8.8'}].map((tel, i) => (
          <div key={i} style={{ background: tel.best ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${tel.best ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{tel.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E7F5C' }}>{tel.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{tel.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{tel.rating}</span>
              <span>{tel.trust}</span>
              <span>{tel.score}</span>
            </div>
            {tel.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#1E7F5C', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{tel.badge}</span>}
          </div>
        ))}
        <div style={{ background: '#E6F4EE', border: '2px solid #1E7F5C', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Betaal 9% commissie om toegang te krijgen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E7F5C', margin: '12px 0' }}>€48,60</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>(9% van €540 jaarlijks)</div>
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E7F5C', margin: '12px 0' }}>€48,60</div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>9% commissie voor toegang tot 3 beste deals</div>
          <button onClick={() => setView('unlocked')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>Betaal met Stripe →</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#6B7280' }}>🔒 Veilige betaling via Stripe</div>
      </div>
    )
  }

  if (view === 'unlocked') {
    return (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>✅ Toegang verkregen!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Je hebt nu toegang tot de 3 beste deals</p>
        {[{name: '📱 KPN Compleet', price: '€45/mnd', plan: 'Onbeperkt + 100 Mbps', rating: '⭐ 4.5/5 (12.456 reviews)', trust: '🛡️ Betrouwbaar 9/10', badge: 'BESTE DEAL - BESPAAR €156/jaar', url: 'https://www.kpn.com', best: true}, {name: '📱 Ziggo All-in-One', price: '€52/mnd', plan: 'Mobiel + Internet + TV', rating: '⭐ 4.3/5 (8.234 reviews)', trust: '🛡️ Betrouwbaar 8/10', url: 'https://www.ziggo.nl'}, {name: '📱 T-Mobile Premium', price: '€58/mnd', plan: 'Onbeperkt 5G + 500 Mbps', rating: '⭐ 4.4/5 (9.871 reviews)', trust: '🛡️ Betrouwbaar 9/10', url: 'https://www.t-mobile.nl'}].map((tel, i) => (
          <div key={i} style={{ background: tel.best ? '#E6F4EE' : 'white', border: `2px solid ${tel.best ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{tel.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E7F5C' }}>{tel.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{tel.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{tel.rating}</span>
              <span>{tel.trust}</span>
            </div>
            {tel.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#1E7F5C', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{tel.badge}</span>}
            <button onClick={() => window.open(tel.url, '_blank')} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#1E7F5C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🌐 Bekijk aanbieding</button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>📱 Telecom Configurator</h2>

      <ProgressTracker 
        percentage={progress}
        validCount={validFields.size}
        totalFields={totalFields}
        showWarning={validFields.size < totalFields}
      />

      <LockPanel
        isLocked={isLocked}
        configId={configId}
        onUnlock={handleUnlockConfiguration}
        onDownloadPDF={handleDownloadPDF}
      />

      {false && isLocked && configId && (
        <div style={{ background: '#E6F4EE', border: '1px solid #1E7F5C', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={16} color="#1E7F5C" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E7F5C' }}>Configuratie opgeslagen</div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>ID: {configId}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={handleUnlockConfiguration} title="Ontgrendelen om te wijzigen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'white', border: '2px solid #1E7F5C', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>👆</button>
            <button type="button" onClick={handleDownloadPDF} title="Download PDF" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#1E7F5C', border: 'none', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}><Download size={18} color="white" /></button>
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
        
        {/* 1. TYPE DIENST */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Type dienst</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Wat wil je vergelijken?</label>
            <select value={serviceType} onChange={(e) => { const val = e.target.value; setServiceType(val); validateAndMark('serviceType', val); }} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('serviceType') ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('serviceType') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('serviceType') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              <option value="">Kies dienst...</option>
              <option value="mobiel-internet">📱📡 Mobiel + Internet</option>
              <option value="mobiel">📱 Alleen mobiel</option>
              <option value="internet">📡 Alleen internet</option>
              <option value="alles">📱📡📺 Alles (mobiel + internet + TV)</option>
            </select>
          </div>
        </div>

        {/* 2. MOBIEL */}
        {(serviceType === 'mobiel' || serviceType === 'mobiel-internet' || serviceType === 'alles') && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Mobiel abonnement</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Data per maand (GB)</label>
              <input type="number" min="1" max="100" value={mobileData} onChange={(e) => { const val = parseInt(e.target.value); setMobileData(val); validateAndMark('mobileData', val, (v) => v > 0); }} disabled={isLocked} placeholder="10" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('mobileData') ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('mobileData') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('mobileData') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Of kies onbeperkt hieronder</div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bel & SMS</label>
              <select value={mobileMinutes} onChange={(e) => setMobileMinutes(e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
                <option value="100">100 minuten</option>
                <option value="300">300 minuten</option>
                <option value="onbeperkt">♾️ Onbeperkt bellen & SMS</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Aantal SIM-kaarten</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {value: 1, label: '1 SIM-kaart', desc: 'Voor 1 persoon'},
                  {value: 2, label: '2 SIM-kaarten', desc: 'Voor 2 personen'}
                ].map(s => (
                  <div key={s.value} onClick={() => { if (!isLocked) { setNumberOfSims(s.value); validateAndMark('numberOfSims', s.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: numberOfSims === s.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: numberOfSims === s.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="numberOfSims" value={s.value} checked={numberOfSims === s.value} onChange={() => { if (!isLocked) { setNumberOfSims(s.value); validateAndMark('numberOfSims', s.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{s.label}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. INTERNET */}
        {(serviceType === 'internet' || serviceType === 'mobiel-internet' || serviceType === 'alles') && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Internet thuis</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gewenste snelheid (Mbps)</label>
              <select value={internetSpeed} onChange={(e) => { const val = parseInt(e.target.value); setInternetSpeed(val); validateAndMark('internetSpeed', val, (v) => v > 0); }} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('internetSpeed') ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('internetSpeed') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('internetSpeed') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                <option value="50">50 Mbps - Basis</option>
                <option value="100">100 Mbps - Standaard</option>
                <option value="200">200 Mbps - Snel</option>
                <option value="500">500 Mbps - Zeer snel</option>
                <option value="1000">1000 Mbps (1 Gbps) - Ultra snel</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postcode</label>
              <input type="text" value={postcode} onChange={(e) => { const val = e.target.value; setPostcode(val); }} disabled={isLocked} placeholder="1234AB" maxLength={7} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${postcode ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (postcode ? '#E6F4EE' : 'white'), boxShadow: postcode ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Huisnummer</label>
              <input type="text" value={houseNumber} onChange={(e) => { const val = e.target.value; setHouseNumber(val); }} disabled={isLocked} placeholder="123" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${houseNumber ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (houseNumber ? '#E6F4EE' : 'white'), boxShadow: houseNumber ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Voor beschikbaarheid glasvezel/kabel</div>
            </div>
          </div>
        )}

        {/* 4. EXTRA OPTIES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Extra opties</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {value: fiveG, setter: setFiveG, label: '📡 5G netwerk', desc: 'Toegang tot 5G (sneller mobiel)'},
              {value: roaming, setter: setRoaming, label: '🌍 EU roaming', desc: 'Bellen/internetten in EU'},
              {value: tvChannels, setter: setTvChannels, label: '📺 TV pakket', desc: 'Digitale TV zenders'},
              {value: fixedPhone, setter: setFixedPhone, label: '☎️ Vaste telefonie', desc: 'Vaste lijn voor thuis'}
            ].map((item, i) => (
              <div key={i} onClick={() => { if (!isLocked) { item.setter(!item.value); } }} tabIndex={0} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', border: item.value ? '2px solid #1E7F5C' : '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: item.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                <input type="checkbox" checked={item.value} onChange={() => !isLocked && item.setter(!item.value)} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!postcode && (
          <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#92400e' }}>💡 <strong>Tip:</strong> Vul postcode in om beschikbaarheid te controleren!</div>
          </div>
        )}

        <button type="submit" disabled={isLocked || progress !== 100} style={{ width: '100%', padding: '14px', background: (isLocked || progress !== 100) ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (isLocked || progress !== 100) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {isLocked ? 'Configuratie vergrendeld' : (progress === 100 ? 'Vergelijk telecom aanbiedingen →' : `Vul alle velden in (${progress}%)`)}
        </button>
        {isLocked && <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>👆 Klik op het vinger-icoon hierboven om te wijzigen</div>}
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste telecom aanbiedingen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
