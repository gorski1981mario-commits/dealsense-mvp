'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'

interface LeasingConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function LeasingConfigurator({ packageType = 'finance', userId }: LeasingConfiguratorProps = {}) {
  const [vehicleType, setVehicleType] = useState('auto')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [amount, setAmount] = useState(30000)
  const [duration, setDuration] = useState(48)
  const [kilometers, setKilometers] = useState(20000)
  const [leasingType, setLeasingType] = useState('operational')
  const [maintenance, setMaintenance] = useState(true)
  const [insurance, setInsurance] = useState(true)
  const [tires, setTires] = useState(true)
  const [fuelCard, setFuelCard] = useState(false)
  const [searching, setSearching] = useState(false)
  
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    if (!isLocked) { await handleLockConfiguration() }
    setTimeout(() => setSearching(false), 3000)
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

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>🚗 Leasing Configurator</h2>

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
        
        {/* 1. VOERTUIG */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Voertuig</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Type</label>
            <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} onFocus={() => setActiveField('vehicleType')} onBlur={() => setActiveField(null)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: activeField === 'vehicleType' ? '2px solid #1E7F5C' : '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (activeField === 'vehicleType' ? '#E6F4EE' : 'white'), cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
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
            <input type="number" min="10000" max="100000" step="1000" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} disabled={isLocked} placeholder="30000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Looptijd (maanden)</label>
            <input type="number" min="12" max="60" step="12" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} disabled={isLocked} placeholder="48" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Kilometers per jaar</label>
            <input type="number" min="10000" max="50000" step="5000" value={kilometers} onChange={(e) => setKilometers(parseInt(e.target.value))} disabled={isLocked} placeholder="20000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
          </div>
        </div>

        {/* 3. TYPE LEASING */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Type leasing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[{value: 'operational', label: '💼 Operational Lease', desc: 'All-in, incl. onderhoud'}, {value: 'financial', label: '📊 Financial Lease', desc: 'Voertuig wordt eigendom'}].map(t => (
              <div key={t.value} onClick={() => !isLocked && setLeasingType(t.value)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: leasingType === t.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: leasingType === t.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1 }}>
                <input type="radio" name="leasingType" value={t.value} checked={leasingType === t.value} onChange={() => !isLocked && setLeasingType(t.value)} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
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

        <button type="submit" disabled={searching || isLocked} style={{ width: '100%', padding: '14px', background: (searching || isLocked) ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (searching || isLocked) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {searching ? 'Zoeken & opslaan...' : (isLocked ? 'Configuratie vergrendeld' : 'Vergelijk leasing aanbiedingen →')}
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
