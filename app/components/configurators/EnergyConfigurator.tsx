'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, Zap } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators, formatters } from '../../utils/validators'

interface EnergyConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function EnergyConfigurator({ packageType = 'pro', userId }: EnergyConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  const [energyType, setEnergyType] = useState('')
  const [electricityUsage, setElectricityUsage] = useState<number | ''>('')
  const [gasUsage, setGasUsage] = useState<number | ''>('')
  const [contractType, setContractType] = useState('')
  const [postcode, setPostcode] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [greenEnergy, setGreenEnergy] = useState(false)
  const [solarPanels, setSolarPanels] = useState(false)
  const [smartMeter, setSmartMeter] = useState(false)
  const [searching, setSearching] = useState(false)
  
  // Lock/unlock state
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  
  // Progress tracking
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 5 // filterType, energyType, contractType, electricityUsage, gasUsage (postcode i houseNumber są opcjonalne)
  
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
        sector: 'energy',
        parameters: {
          energyType,
          electricityUsage,
          gasUsage,
          contractType,
          postcode,
          houseNumber,
          greenEnergy,
          solarPanels,
          smartMeter
        },
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
        alert(`✅ Configuratie vergrendeld!\nConfiguration ID: ${result.configId}`)
      }
    } catch (error) {
      console.error('Error saving configuration:', error)
      alert('❌ Fout bij opslaan configuratie')
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
      sector: 'energy',
      parameters: {
        energyType,
        electricityUsage,
        gasUsage,
        contractType,
        postcode,
        houseNumber,
        greenEnergy,
        solarPanels,
        smartMeter
      },
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
        {[{name: '⚡ Vattenfall Groen', price: '€98/mnd', plan: 'Stroom + Gas | 100% groen', rating: '⭐ 4.6/5', trust: '🛡️ 9/10', score: 'Score: 9.2', badge: 'BESTE DEAL', best: true}, {name: '⚡ Essent Voordeel', price: '€112/mnd', plan: 'Stroom + Gas | 3 jaar vast', rating: '⭐ 4.4/5', trust: '🛡️ 8/10', score: 'Score: 8.7'}, {name: '⚡ Eneco Duurzaam', price: '€125/mnd', plan: 'Stroom + Gas | Zonnepanelen', rating: '⭐ 4.5/5', trust: '🛡️ 9/10', score: 'Score: 8.9'}].map((energy, i) => (
          <div key={i} style={{ background: energy.best ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${energy.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{energy.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{energy.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{energy.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{energy.rating}</span>
              <span>{energy.trust}</span>
              <span>{energy.score}</span>
            </div>
            {energy.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{energy.badge}</span>}
          </div>
        ))}
        <div style={{ background: '#E6F4EE', border: '2px solid #15803d', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Betaal 9% commissie om toegang te krijgen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€105,84</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>(9% van €1.176 jaarlijks)</div>
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€105,84</div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>9% commissie voor toegang tot 3 beste deals</div>
          <button onClick={() => setView('unlocked')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #15803d 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>Betaal met Stripe →</button>
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
        {[{name: '⚡ Vattenfall Groen', price: '€98/mnd', plan: 'Stroom + Gas | 100% groen', rating: '⭐ 4.6/5 (15.234 reviews)', trust: '🛡️ Betrouwbaar 9/10', badge: 'BESTE DEAL - BESPAAR €336/jaar', url: 'https://www.vattenfall.nl', best: true}, {name: '⚡ Essent Voordeel', price: '€112/mnd', plan: 'Stroom + Gas | 3 jaar vast', rating: '⭐ 4.4/5 (11.892 reviews)', trust: '🛡️ Betrouwbaar 8/10', url: 'https://www.essent.nl'}, {name: '⚡ Eneco Duurzaam', price: '€125/mnd', plan: 'Stroom + Gas | Zonnepanelen', rating: '⭐ 4.5/5 (13.456 reviews)', trust: '🛡️ Betrouwbaar 9/10', url: 'https://www.eneco.nl'}].map((energy, i) => (
          <div key={i} style={{ background: energy.best ? '#E6F4EE' : 'white', border: `2px solid ${energy.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{energy.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{energy.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{energy.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{energy.rating}</span>
              <span>{energy.trust}</span>
            </div>
            {energy.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{energy.badge}</span>}
            <button onClick={() => window.open(energy.url, '_blank')} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🌐 Bekijk aanbieding</button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={24} strokeWidth={2} /> Energie Configurator</h2>

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
        <div style={{
          background: '#E6F4EE',
          border: '1px solid #15803d',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={16} color="#15803d" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>
                Configuratie opgeslagen
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                ID: {configId}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleUnlockConfiguration}
              title="Ontgrendelen om te wijzigen"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: 'white',
                border: '2px solid #15803d',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              👆
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              title="Download PDF"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                background: '#15803d',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Download size={18} color="white" />
            </button>
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
        
        {/* 1. TYPE ENERGIE */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Type energie</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Wat wil je vergelijken?</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                {value: 'stroom-gas', label: '⚡🔥 Stroom + Gas', desc: 'Elektriciteit en gas'},
                {value: 'stroom', label: '⚡ Alleen stroom', desc: 'Alleen elektriciteit'},
                {value: 'gas', label: '🔥 Alleen gas', desc: 'Alleen gas'}
              ].map(e => (
                <div key={e.value} onClick={() => { if (!isLocked) { setEnergyType(e.value); validateAndMark('energyType', e.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: energyType === e.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: energyType === e.value ? '#15803d' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                  <input type="radio" name="energyType" value={e.value} checked={energyType === e.value} onChange={() => { if (!isLocked) { setEnergyType(e.value); validateAndMark('energyType', e.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{e.label}</div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }}>{e.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. VERBRUIK */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Jaarverbruik (schatting)</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Elektriciteit per jaar (kWh)</label>
            <input type="number" min="0" max="20000" step="100" value={electricityUsage} onChange={(e) => { const val = parseInt(e.target.value); setElectricityUsage(val); validateAndMark('electricityUsage', val, (v) => v > 0); }} disabled={isLocked} placeholder="2500" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('electricityUsage') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('electricityUsage') ? '#E6F4EE' : 'white'), cursor: isLocked ? 'not-allowed' : 'text' }} />
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Gemiddeld huishouden: 2500-3500 kWh/jaar</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gas per jaar (m³)</label>
            <input type="number" min="0" max="5000" step="50" value={gasUsage} onChange={(e) => { const val = parseInt(e.target.value); setGasUsage(val); validateAndMark('gasUsage', val, (v) => v > 0); }} disabled={isLocked} placeholder="1200" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('gasUsage') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('gasUsage') ? '#E6F4EE' : 'white'), cursor: isLocked ? 'not-allowed' : 'text' }} />
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Gemiddeld huishouden: 1200-1500 m³/jaar</div>
          </div>
        </div>

        {/* 3. CONTRACT */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Contract type</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              {value: 'vast-1', label: '🔒 Vast 1 jaar', desc: 'Vaste prijs voor 1 jaar'},
              {value: 'vast-3', label: '🔐 Vast 3 jaar', desc: 'Vaste prijs voor 3 jaar'},
              {value: 'vast-5', label: '🔏 Vast 5 jaar', desc: 'Vaste prijs voor 5 jaar'},
              {value: 'variabel', label: '📊 Variabel', desc: 'Prijs volgt de markt'}
            ].map(c => (
              <div key={c.value} onClick={() => { if (!isLocked) { setContractType(c.value); validateAndMark('contractType', c.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: contractType === c.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: contractType === c.value ? '#15803d' : '#E5E7EB', opacity: isLocked ? 0.6 : 1 }}>
                <input type="radio" name="contractType" value={c.value} checked={contractType === c.value} onChange={() => { if (!isLocked) { setContractType(c.value); validateAndMark('contractType', c.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{c.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. ADRES */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Adresgegevens</div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postcode</label>
            <input type="text" value={postcode} onChange={(e) => { const val = e.target.value; setPostcode(val); }} disabled={isLocked} placeholder="1234AB" maxLength={7} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${postcode ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (postcode ? '#E6F4EE' : 'white'), boxShadow: postcode ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Huisnummer</label>
            <input type="text" value={houseNumber} onChange={(e) => { const val = e.target.value; setHouseNumber(val); }} disabled={isLocked} placeholder="123" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${houseNumber ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (houseNumber ? '#E6F4EE' : 'white'), boxShadow: houseNumber ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Voor beschikbaarheid en tarieven</div>
          </div>
        </div>

        {/* 5. EXTRA OPTIES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>5. Extra voorkeuren</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {value: greenEnergy, setter: setGreenEnergy, label: '🌱 Groene energie', desc: 'Alleen duurzame energie'},
              {value: solarPanels, setter: setSolarPanels, label: '☀️ Zonnepanelen', desc: 'Ik heb zonnepanelen (salderen)'},
              {value: smartMeter, setter: setSmartMeter, label: '📊 Slimme meter', desc: 'Ik heb een slimme meter'}
            ].map((item, i) => (
              <div key={i} onClick={() => { if (!isLocked) { item.setter(!item.value); } }} tabIndex={0} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', border: item.value ? '2px solid #15803d' : '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: item.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
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
            <div style={{ fontSize: '13px', color: '#92400e' }}>💡 <strong>Tip:</strong> Vul postcode in voor nauwkeurige tarieven!</div>
          </div>
        )}

        <button type="submit" disabled={isLocked || progress !== 100} style={{ width: '100%', padding: '14px', background: (isLocked || progress !== 100) ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (isLocked || progress !== 100) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {isLocked ? 'Configuratie vergrendeld' : (progress === 100 ? 'Vergelijk energieleveranciers →' : `Vul alle velden in (${progress}%)`)}
        </button>
        
        {isLocked && (
          <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>
            👆 Klik op het vinger-icoon hierboven om te wijzigen
          </div>
        )}
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste energieleveranciers voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}




