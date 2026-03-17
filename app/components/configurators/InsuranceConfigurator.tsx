'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'

interface InsuranceConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function InsuranceConfigurator({ packageType = 'pro', userId }: InsuranceConfiguratorProps = {}) {
  const [insuranceType, setInsuranceType] = useState('auto')
  const [coverage, setCoverage] = useState('wa')
  const [age, setAge] = useState(35)
  const [postcode, setPostcode] = useState('')
  const [bonusMalus, setBonusMalus] = useState(0)
  const [vehicleValue, setVehicleValue] = useState(25000)
  const [annualMileage, setAnnualMileage] = useState(15000)
  const [parkingLocation, setParkingLocation] = useState('straat')
  const [youngDrivers, setYoungDrivers] = useState(false)
  const [businessUse, setBusinessUse] = useState(false)
  const [legalAid, setLegalAid] = useState(false)
  const [searching, setSearching] = useState(false)
  
  // Lock/unlock state
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Auto-lock when any field changes
  useEffect(() => {
    const hasChanges = insuranceType !== 'auto' || coverage !== 'wa' || age !== 35 || postcode || bonusMalus !== 0 || vehicleValue !== 25000 || annualMileage !== 15000 || parkingLocation !== 'straat' || youngDrivers || businessUse || legalAid
    
    if (hasChanges && !isLocked && !saving && !configId) {
      const lockConfig = async () => {
        try {
          setSaving(true)
          const configData = { userId: userId || 'anonymous', sector: 'insurance', parameters: { insuranceType, coverage, age, postcode, bonusMalus, vehicleValue, annualMileage, parkingLocation, youngDrivers, businessUse, legalAid }, timestamp: new Date().toISOString() }
          const response = await fetch('/api/configurations/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) })
          const result = await response.json()
          if (result.success) { setConfigId(result.configId); setConfigTimestamp(configData.timestamp); setIsLocked(true) }
        } catch (error) { console.error('Error:', error) } finally { setSaving(false) }
      }
      lockConfig()
    }
  }, [insuranceType, coverage, age, postcode, bonusMalus, vehicleValue, annualMileage, parkingLocation, youngDrivers, businessUse, legalAid, isLocked, saving, configId, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    
    // Auto-lock configuration on submit
    if (!isLocked) {
      await handleLockConfiguration()
    }
    
    setTimeout(() => setSearching(false), 3000)
  }

  const handleLockConfiguration = async () => {
    try {
      setSaving(true)
      
      const configData = {
        userId: userId || 'anonymous',
        sector: 'insurance',
        parameters: {
          insuranceType,
          coverage,
          age,
          postcode,
          bonusMalus,
          vehicleValue,
          annualMileage,
          parkingLocation,
          youngDrivers,
          businessUse,
          legalAid
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
      sector: 'insurance',
      parameters: {
        insuranceType,
        coverage,
        age,
        postcode,
        bonusMalus,
        vehicleValue,
        annualMileage,
        parkingLocation,
        youngDrivers,
        businessUse,
        legalAid
      },
      timestamp: configTimestamp
    })
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>🛡️ Verzekering Configurator</h2>

      {/* Lock Status - Compact */}
      {isLocked && configId && (
        <div style={{
          background: '#E6F4EE',
          border: '1px solid #1E7F5C',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={16} color="#1E7F5C" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E7F5C' }}>
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
                border: '2px solid #1E7F5C',
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
                background: '#1E7F5C',
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
        
        {/* 1. TYPE VERZEKERING */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Type verzekering</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Soort</label>
            <select value={insuranceType} onChange={(e) => setInsuranceType(e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
              <option value="auto">🚗 Autoverzekering</option>
              <option value="motor">🏍️ Motorverzekering</option>
              <option value="zorg">🏥 Zorgverzekering</option>
              <option value="woon">🏠 Woonverzekering</option>
              <option value="leven">❤️ Levensverzekering</option>
              <option value="reis">✈️ Reisverzekering</option>
              <option value="aansprakelijkheid">⚖️ Aansprakelijkheidsverzekering</option>
            </select>
          </div>
        </div>

        {/* 2. DEKKING */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Dekking</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              {value: 'wa', label: '💼 WA (Wettelijke Aansprakelijkheid)', desc: 'Basis dekking, verplicht'},
              {value: 'wa-beperkt', label: '🔒 WA + Beperkt Casco', desc: 'Incl. diefstal, brand, storm'},
              {value: 'allrisk', label: '🛡️ All-risk / Volledig Casco', desc: 'Volledige dekking'}
            ].map(c => (
              <div key={c.value} onClick={() => !isLocked && setCoverage(c.value)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: coverage === c.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: coverage === c.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1 }}>
                <input type="radio" name="coverage" value={c.value} checked={coverage === c.value} onChange={() => !isLocked && setCoverage(c.value)} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{c.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. PERSOONLIJKE GEGEVENS */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Persoonlijke gegevens</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Leeftijd (jaar)</label>
            <input type="number" min="18" max="80" value={age} onChange={(e) => setAge(parseInt(e.target.value))} disabled={isLocked} placeholder="35" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postcode</label>
            <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} disabled={isLocked} placeholder="1234 AB" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bonus-malus (schadevrije jaren)</label>
            <input type="number" min="0" max="10" value={bonusMalus} onChange={(e) => setBonusMalus(parseInt(e.target.value))} disabled={isLocked} placeholder="0" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
          </div>

          {insuranceType === 'auto' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Waarde voertuig (€)</label>
                <input type="number" min="1000" max="100000" step="1000" value={vehicleValue} onChange={(e) => setVehicleValue(parseInt(e.target.value))} disabled={isLocked} placeholder="25000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Kilometers per jaar</label>
                <input type="number" min="5000" max="50000" step="5000" value={annualMileage} onChange={(e) => setAnnualMileage(parseInt(e.target.value))} disabled={isLocked} placeholder="15000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'text' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Parkeerlocatie</label>
                <select value={parkingLocation} onChange={(e) => setParkingLocation(e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
                  <option value="straat">🚗 Op straat</option>
                  <option value="parkeerplaats">🅿️ Openbare parkeerplaats</option>
                  <option value="carport">🏚️ Carport</option>
                  <option value="garage">🏠 Afgesloten garage</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* 4. EXTRA OPTIES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Extra opties</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {value: youngDrivers, setter: setYoungDrivers, label: '👶 Jonge bestuurders', desc: 'Bestuurders onder 25 jaar'},
              {value: businessUse, setter: setBusinessUse, label: '💼 Zakelijk gebruik', desc: 'Ook voor zakelijke ritten'},
              {value: legalAid, setter: setLegalAid, label: '⚖️ Rechtsbijstand', desc: 'Juridische hulp bij schade'}
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

        <button type="submit" disabled={searching || isLocked} style={{ width: '100%', padding: '14px', background: (searching || isLocked) ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (searching || isLocked) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {searching ? 'Zoeken & opslaan...' : (isLocked ? 'Configuratie vergrendeld' : 'Zoek beste verzekering →')}
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
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste verzekeringen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
