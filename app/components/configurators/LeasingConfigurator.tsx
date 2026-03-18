'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, Car } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators } from '../../utils/validators'

interface LeasingConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function LeasingConfigurator({ packageType = 'pro', userId }: LeasingConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  const [vehicleType, setVehicleType] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [duration, setDuration] = useState<number | ''>('')
  const [kilometers, setKilometers] = useState<number | ''>('')
  const [leasingType, setLeasingType] = useState('')
  const [maintenance, setMaintenance] = useState(false)
  const [insurance, setInsurance] = useState(false)
  const [tires, setTires] = useState(false)
  const [fuelCard, setFuelCard] = useState(false)
  const [searching, setSearching] = useState(false)
  
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 6 // filterType, vehicleType, amount, duration, kilometers, leasingType
  const validateAndMark = (f: string, v: any, customValidator?: (v: any) => boolean) => { setTouchedFields(p => new Set(p).add(f)); const ok = customValidator ? customValidator(v) : validators.required(v); setValidFields(p => { const n = new Set(p); ok ? n.add(f) : n.delete(f); return n }) }
  const progress = Math.round((validFields.size / totalFields) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLocked) { await handleLockConfiguration() }
    setView('results')
  }

  const handleLockConfiguration = async () => {
    try {
      setSaving(true)
      const configData = { userId: userId || 'anonymous', sector: 'leasing', parameters: { vehicleType, brand, model, amount, duration, kilometers, leasingType, maintenance, insurance, tires, fuelCard }, timestamp: new Date().toISOString() }
      const response = await fetch('/api/configurations/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) })
      const result = await response.json()
      if (result.success) { setConfigId(result.configId); setConfigTimestamp(configData.timestamp); setIsLocked(true) }
    } catch (error) { console.error('Error:', error) } finally { setSaving(false) }
  }

  const handleUnlockConfiguration = () => { setIsLocked(false) }

  const handleDownloadPDF = () => {
    if (!configId || !configTimestamp) return
    generateConfigurationPDF({ configId, userId: userId || 'anonymous', sector: 'leasing', parameters: { vehicleType, brand, model, amount, duration, kilometers, leasingType, maintenance, insurance, tires, fuelCard }, timestamp: configTimestamp })
  }

  if (view === 'results') {
    return (
      <div>
        <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>🎉 3 beste aanbiedingen gevonden!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>We doorzochten de markt met Deal Score</p>
        <div style={{ fontSize: '32px', textAlign: 'center', margin: '20px 0' }}>🔒</div>
        {[{name: '🚗 Athlon All-in', price: '€425/mnd', plan: 'VW Golf | 48 mnd | 20k km', rating: '⭐ 4.6/5', trust: '🛡️ 9/10', score: 'Score: 9.1', badge: 'BESTE DEAL', best: true}, {name: '🚗 LeasePlan Flex', price: '€465/mnd', plan: 'VW Golf | 48 mnd | 20k km', rating: '⭐ 4.4/5', trust: '🛡️ 8/10', score: 'Score: 8.7'}, {name: '🚗 Alphabet Premium', price: '€495/mnd', plan: 'VW Golf | 48 mnd | 20k km', rating: '⭐ 4.5/5', trust: '🛡️ 9/10', score: 'Score: 8.8'}].map((lease, i) => (
          <div key={i} style={{ background: lease.best ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${lease.best ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{lease.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E7F5C' }}>{lease.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{lease.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{lease.rating}</span>
              <span>{lease.trust}</span>
              <span>{lease.score}</span>
            </div>
            {lease.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#1E7F5C', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{lease.badge}</span>}
          </div>
        ))}
        <div style={{ background: '#E6F4EE', border: '2px solid #1E7F5C', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Betaal 9% commissie om toegang te krijgen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E7F5C', margin: '12px 0' }}>€458,40</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>(9% van €5.100 jaarlijks)</div>
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E7F5C', margin: '12px 0' }}>€458,40</div>
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
        {[{name: '🚗 Athlon All-in', price: '€425/mnd', plan: 'VW Golf | 48 mnd | 20k km', rating: '⭐ 4.6/5 (9.234 reviews)', trust: '🛡️ Betrouwbaar 9/10', badge: 'BESTE DEAL - BESPAAR €840/jaar', url: 'https://www.athlon.com', best: true}, {name: '🚗 LeasePlan Flex', price: '€465/mnd', plan: 'VW Golf | 48 mnd | 20k km', rating: '⭐ 4.4/5 (7.891 reviews)', trust: '🛡️ Betrouwbaar 8/10', url: 'https://www.leaseplan.com'}, {name: '🚗 Alphabet Premium', price: '€495/mnd', plan: 'VW Golf | 48 mnd | 20k km', rating: '⭐ 4.5/5 (8.456 reviews)', trust: '🛡️ Betrouwbaar 9/10', url: 'https://www.alphabet.com'}].map((lease, i) => (
          <div key={i} style={{ background: lease.best ? '#E6F4EE' : 'white', border: `2px solid ${lease.best ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{lease.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E7F5C' }}>{lease.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{lease.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{lease.rating}</span>
              <span>{lease.trust}</span>
            </div>
            {lease.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#1E7F5C', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{lease.badge}</span>}
            <button onClick={() => window.open(lease.url, '_blank')} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#1E7F5C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🌐 Bekijk aanbieding</button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Car size={24} strokeWidth={2} /> Leasing Configurator</h2>

      <ProgressTracker percentage={progress} validCount={validFields.size} totalFields={totalFields} showWarning={validFields.size < totalFields} />
      <LockPanel isLocked={isLocked} configId={configId} onUnlock={handleUnlockConfiguration} onDownloadPDF={handleDownloadPDF} />

      {false && isLocked && configId && (
        <div style={{ background: '#E6F4EE', border: '1px solid #1E7F5C', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={16} color="#1E7F5C" /><div><div style={{ fontSize: '13px', fontWeight: 600, color: '#1E7F5C' }}>Configuratie opgeslagen</div><div style={{ fontSize: '11px', color: '#6B7280' }}>ID: {configId}</div></div></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={handleUnlockConfiguration} title="Ontgrendelen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'white', border: '2px solid #1E7F5C', borderRadius: '8px', cursor: 'pointer' }}>👆</button>
            <button type="button" onClick={handleDownloadPDF} title="Download PDF" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#1E7F5C', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Download size={18} color="white" /></button>
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
        
        {/* 1. VOERTUIG */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Voertuig</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Type</label>
            <select value={vehicleType} onChange={(e) => { const val = e.target.value; setVehicleType(val); validateAndMark('vehicleType', val); }} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('vehicleType') ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('vehicleType') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('vehicleType') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              <option value="">Kies type...</option>
              <option value="auto">🚗 Auto</option>
              <option value="elektrisch">⚡ Elektrische auto</option>
              <option value="hybride">🔋 Hybride auto</option>
              <option value="bestelauto">🚐 Bestelauto</option>
              <option value="motor">🏍️ Motor</option>
              <option value="fiets">🚴 (Elektrische) fiets</option>
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Merk (optioneel)</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} onFocus={() => setActiveField('brand')} onBlur={() => setActiveField(null)} disabled={isLocked} placeholder="Bijv. Volkswagen, Tesla, BMW..." style={{ width: '100%', padding: '10px 14px', border: activeField === 'brand' ? '2px solid #1E7F5C' : '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (activeField === 'brand' ? '#E6F4EE' : 'white'), cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Model (optioneel)</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} onFocus={() => setActiveField('model')} onBlur={() => setActiveField(null)} disabled={isLocked} placeholder="Bijv. Golf, Model 3, X5..." style={{ width: '100%', padding: '10px 14px', border: activeField === 'model' ? '2px solid #1E7F5C' : '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (activeField === 'model' ? '#E6F4EE' : 'white'), cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>
        </div>

        {/* 2. FINANCIEEL */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Financieel</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Cataloguswaarde (€)</label>
            <input type="number" min="10000" max="100000" step="1000" value={amount} onChange={(e) => { const val = parseInt(e.target.value); setAmount(val); validateAndMark('amount', val, (v) => v > 0); }} disabled={isLocked} placeholder="30000" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('amount') ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('amount') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('amount') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Looptijd (maanden)</label>
            <input type="number" min="12" max="60" step="12" value={duration} onChange={(e) => { const val = parseInt(e.target.value); setDuration(val); validateAndMark('duration', val, (v) => v > 0); }} disabled={isLocked} placeholder="48" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('duration') ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('duration') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('duration') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Kilometers per jaar</label>
            <input type="number" min="10000" max="50000" step="5000" value={kilometers} onChange={(e) => { const val = parseInt(e.target.value); setKilometers(val); validateAndMark('kilometers', val, (v) => v > 0); }} disabled={isLocked} placeholder="20000" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('kilometers') ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('kilometers') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('kilometers') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>
        </div>

        {/* 3. TYPE LEASING */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Type leasing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[{value: 'operational', label: '💼 Operational Lease', desc: 'All-in, incl. onderhoud'}, {value: 'financial', label: '📊 Financial Lease', desc: 'Voertuig wordt eigendom'}].map(t => (
              <div key={t.value} onClick={() => { if (!isLocked) { setLeasingType(t.value); validateAndMark('leasingType', t.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: leasingType === t.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: leasingType === t.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1 }}>
                <input type="radio" name="leasingType" value={t.value} checked={leasingType === t.value} onChange={() => { if (!isLocked) { setLeasingType(t.value); validateAndMark('leasingType', t.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{t.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. EXTRA SERVICES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Extra services</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[{value: maintenance, setter: setMaintenance, label: '🔧 Onderhoud & reparaties'}, {value: insurance, setter: setInsurance, label: '🛡️ Verzekering (WA, Casco)'}, {value: tires, setter: setTires, label: '🛞 Banden (zomer & winter)'}, {value: fuelCard, setter: setFuelCard, label: '⛽ Tankpas'}].map((item, i) => (
              <div key={i} onClick={() => !isLocked && item.setter(!item.value)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: item.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: item.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1 }}>
                <input type="checkbox" checked={item.value} onChange={() => !isLocked && item.setter(!item.value)} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <label style={{ margin: 0, fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: 1 }}>{item.label}</label>
              </div>
            ))}
          </div>
        </div>

        {!brand && !model && (
          <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#92400e' }}>💡 <strong>Tip:</strong> Vul merk en model in voor nauwkeurigere aanbiedingen!</div>
          </div>
        )}

        <button type="submit" disabled={searching || isLocked || progress !== 100} style={{ width: '100%', padding: '14px', background: (searching || isLocked || progress !== 100) ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (searching || isLocked || progress !== 100) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {searching ? 'Zoeken & opslaan...' : (isLocked ? 'Configuratie vergrendeld' : (progress === 100 ? 'Vergelijk leasing aanbiedingen →' : `Vul alle velden in (${progress}%)`))}  
        </button>
        {isLocked && <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>👆 Klik op het vinger-icoon hierboven om te wijzigen</div>}
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste leasing aanbiedingen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

