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

export default function TelecomConfigurator({ packageType = 'pro', userId }: TelecomConfiguratorProps = {}) {
  const [filterType, setFilterType] = useState<FilterType>('balanced')
  const [serviceType, setServiceType] = useState('')
  const [mobileData, setMobileData] = useState<number | ''>('')
  const [mobileMinutes, setMobileMinutes] = useState('')
  const [internetSpeed, setInternetSpeed] = useState<number | ''>('')
  const [tvChannels, setTvChannels] = useState(false)
  const [postcode, setPostcode] = useState('')
  const [numberOfSims, setNumberOfSims] = useState<number | ''>('')
  const [fiveG, setFiveG] = useState(false)
  const [roaming, setRoaming] = useState(false)
  const [fixedPhone, setFixedPhone] = useState(false)
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
  const totalFields = 3 // serviceType, postcode, mobileData or internetSpeed
  
  const validateAndMark = (fieldName: string, value: any, customValidator?: (val: any) => boolean) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
    const isValid = customValidator ? customValidator(value) : validators.required(value)
    setValidFields(prev => {
      const newSet = new Set(prev)
      isValid ? newSet.add(fieldName) : newSet.delete(fieldName)
      return newSet
    })
  }
  
  const progress = Math.round((validFields.size / totalFields) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    if (!isLocked) { await handleLockConfiguration() }
    setTimeout(() => setSearching(false), 3000)
  }

  const handleLockConfiguration = async () => {
    try {
      setSaving(true)
      const configData = {
        userId: userId || 'anonymous',
        sector: 'telecom',
        parameters: { serviceType, mobileData, mobileMinutes, internetSpeed, tvChannels, postcode, numberOfSims, fiveG, roaming, fixedPhone },
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
      parameters: { serviceType, mobileData, mobileMinutes, internetSpeed, tvChannels, postcode, numberOfSims, fiveG, roaming, fixedPhone },
      timestamp: configTimestamp
    })
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
        
        {/* 1. TYPE DIENST */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Type dienst</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Wat wil je vergelijken?</label>
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
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
              <input type="number" min="1" max="100" value={mobileData} onChange={(e) => setMobileData(parseInt(e.target.value))} disabled={isLocked} placeholder="10" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
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
              <input type="number" min="1" max="5" value={numberOfSims} onChange={(e) => setNumberOfSims(parseInt(e.target.value))} disabled={isLocked} placeholder="1" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
            </div>
          </div>
        )}

        {/* 3. INTERNET */}
        {(serviceType === 'internet' || serviceType === 'mobiel-internet' || serviceType === 'alles') && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Internet thuis</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gewenste snelheid (Mbps)</label>
              <select value={internetSpeed} onChange={(e) => setInternetSpeed(parseInt(e.target.value))} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
                <option value="50">50 Mbps - Basis</option>
                <option value="100">100 Mbps - Standaard</option>
                <option value="200">200 Mbps - Snel</option>
                <option value="500">500 Mbps - Zeer snel</option>
                <option value="1000">1000 Mbps (1 Gbps) - Ultra snel</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postcode</label>
              <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} disabled={isLocked} placeholder="1234 AB" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
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
              <div key={i} onClick={() => !isLocked && item.setter(!item.value)} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: item.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: item.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1 }}>
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

        <button type="submit" disabled={isLocked} style={{ width: '100%', padding: '14px', background: isLocked ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: isLocked ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {isLocked ? 'Configuratie vergrendeld' : 'Vergelijk telecom aanbiedingen →'}
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
