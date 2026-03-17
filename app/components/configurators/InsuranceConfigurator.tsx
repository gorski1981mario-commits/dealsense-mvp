'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators, formatters } from '../../utils/validators'

interface InsuranceConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function InsuranceConfigurator({ packageType = 'pro', userId }: InsuranceConfiguratorProps = {}) {
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  const [insuranceType, setInsuranceType] = useState('')
  const [coverage, setCoverage] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [postcode, setPostcode] = useState('')
  const [bonusMalus, setBonusMalus] = useState<number | ''>('')
  const [vehicleValue, setVehicleValue] = useState<number | ''>('')
  const [annualMileage, setAnnualMileage] = useState<number | ''>('')
  const [parkingLocation, setParkingLocation] = useState('')
  const [youngDrivers, setYoungDrivers] = useState(false)
  const [businessUse, setBusinessUse] = useState(false)
  const [legalAid, setLegalAid] = useState(false)
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
  
  const getTotalFields = () => {
    let total = 6 // insuranceType, coverage, age, postcode, bonusMalus, extras
    if (insuranceType === 'auto') total += 1 // parkingLocation
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
  
  const validateAndMark = (fieldName: string, value: any, customValidator?: (val: any) => boolean) => {
    markFieldTouched(fieldName)
    const isValid = customValidator ? customValidator(value) : validators.required(value)
    markFieldValid(fieldName, isValid)
    return isValid
  }
  
  const progress = Math.round((validFields.size / totalFields) * 100)

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

      {/* Old Lock Status - Remove */}
      {false && isLocked && configId && (
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
            <select 
              value={insuranceType} 
              onChange={(e) => {
                const val = e.target.value
                setInsuranceType(val)
                validateAndMark('insuranceType', val)
              }} 
              onFocus={() => setActiveField('insuranceType')} 
              onBlur={() => setActiveField(null)} 
              disabled={isLocked} 
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                border: validFields.has('insuranceType') ? '2px solid #1E7F5C' : (touchedFields.has('insuranceType') ? '2px solid #F59E0B' : '2px solid #E5E7EB'),
                borderRadius: '10px', 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#111827', 
                background: isLocked ? '#F3F4F6' : (validFields.has('insuranceType') ? '#E6F4EE' : (touchedFields.has('insuranceType') ? '#FEF3C7' : 'white')), 
                cursor: isLocked ? 'not-allowed' : 'pointer', 
                transition: 'all 0.2s' 
              }}>
              <option value="">Selecteer type...</option>
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
              <div 
                key={c.value} 
                onClick={() => {
                  if (!isLocked) {
                    setCoverage(c.value)
                    validateAndMark('coverage', c.value)
                  }
                }} 
                onFocus={() => setActiveField('coverage')} 
                onBlur={() => setActiveField(null)} 
                tabIndex={0} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '10px 12px', 
                  border: coverage === c.value ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '8px', 
                  cursor: isLocked ? 'not-allowed' : 'pointer', 
                  background: coverage === c.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), 
                  opacity: isLocked ? 0.6 : 1, 
                  transition: 'all 0.2s' 
                }}>
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
            <input 
              type="number" 
              min="18" 
              max="80" 
              value={age} 
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : ''
                setAge(val)
                if (val) validateAndMark('age', val, (v) => validators.age(v, 18, 80))
              }} 
              onFocus={() => setActiveField('age')} 
              onBlur={() => setActiveField(null)} 
              disabled={isLocked} 
              placeholder="35" 
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                border: validFields.has('age') ? '2px solid #1E7F5C' : (touchedFields.has('age') ? '2px solid #DC2626' : '2px solid #E5E7EB'),
                borderRadius: '10px', 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#111827', 
                background: isLocked ? '#F3F4F6' : (validFields.has('age') ? '#E6F4EE' : (touchedFields.has('age') && !validFields.has('age') ? '#FEE2E2' : 'white')), 
                cursor: isLocked ? 'not-allowed' : 'text', 
                transition: 'all 0.2s' 
              }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postcode</label>
            <input 
              type="text" 
              value={postcode} 
              onChange={(e) => {
                const formatted = formatters.postcode(e.target.value)
                setPostcode(formatted)
                validateAndMark('postcode', formatted, validators.postcode)
              }} 
              onFocus={() => setActiveField('postcode')} 
              onBlur={() => setActiveField(null)} 
              disabled={isLocked} 
              placeholder="1234 AB" 
              maxLength={7}
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                border: validFields.has('postcode') ? '2px solid #1E7F5C' : (touchedFields.has('postcode') ? '2px solid #DC2626' : '2px solid #E5E7EB'),
                borderRadius: '10px', 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#111827', 
                background: isLocked ? '#F3F4F6' : (validFields.has('postcode') ? '#E6F4EE' : (touchedFields.has('postcode') && !validFields.has('postcode') ? '#FEE2E2' : 'white')), 
                cursor: isLocked ? 'not-allowed' : 'text', 
                transition: 'all 0.2s' 
              }} />
            {touchedFields.has('postcode') && !validFields.has('postcode') && (
              <span style={{ fontSize: '11px', color: '#DC2626', marginTop: '4px', display: 'block' }}>❌ Gebruik format: 1234 AB</span>
            )}
            {validFields.has('postcode') && (
              <span style={{ fontSize: '11px', color: '#1E7F5C', marginTop: '4px', display: 'block' }}>✅ Geldige postcode</span>
            )}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bonus-malus (schadevrije jaren)</label>
            <input 
              type="number" 
              min="0" 
              max="15" 
              value={bonusMalus} 
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : ''
                setBonusMalus(val)
                if (val !== '') validateAndMark('bonusMalus', val, validators.bonusMalus)
              }} 
              onFocus={() => setActiveField('bonusMalus')} 
              onBlur={() => setActiveField(null)} 
              disabled={isLocked} 
              placeholder="0" 
              style={{ 
                width: '100%', 
                padding: '10px 14px', 
                border: validFields.has('bonusMalus') ? '2px solid #1E7F5C' : (touchedFields.has('bonusMalus') ? '2px solid #DC2626' : '2px solid #E5E7EB'),
                borderRadius: '10px', 
                fontSize: '14px', 
                fontWeight: 500, 
                color: '#111827', 
                background: isLocked ? '#F3F4F6' : (validFields.has('bonusMalus') ? '#E6F4EE' : (touchedFields.has('bonusMalus') && !validFields.has('bonusMalus') ? '#FEE2E2' : 'white')), 
                cursor: isLocked ? 'not-allowed' : 'text', 
                transition: 'all 0.2s' 
              }} />
          </div>

          {insuranceType === 'auto' && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Waarde voertuig (€)</label>
                <input type="number" min="1000" max="100000" step="1000" value={vehicleValue} onChange={(e) => setVehicleValue(e.target.value ? parseInt(e.target.value) : '')} onFocus={() => setActiveField('vehicleValue')} onBlur={() => setActiveField(null)} disabled={isLocked} placeholder="25000" style={{ width: '100%', padding: '10px 14px', border: activeField === 'vehicleValue' ? '2px solid #1E7F5C' : '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (activeField === 'vehicleValue' ? '#E6F4EE' : 'white'), cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Kilometers per jaar</label>
                <input type="number" min="5000" max="50000" step="5000" value={annualMileage} onChange={(e) => setAnnualMileage(e.target.value ? parseInt(e.target.value) : '')} onFocus={() => setActiveField('annualMileage')} onBlur={() => setActiveField(null)} disabled={isLocked} placeholder="15000" style={{ width: '100%', padding: '10px 14px', border: activeField === 'annualMileage' ? '2px solid #1E7F5C' : '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (activeField === 'annualMileage' ? '#E6F4EE' : 'white'), cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Parkeerlocatie</label>
                <select 
                  value={parkingLocation} 
                  onChange={(e) => {
                    const val = e.target.value
                    setParkingLocation(val)
                    validateAndMark('parkingLocation', val)
                  }} 
                  onFocus={() => setActiveField('parkingLocation')} 
                  onBlur={() => setActiveField(null)} 
                  disabled={isLocked} 
                  style={{ 
                    width: '100%', 
                    padding: '10px 14px', 
                    border: validFields.has('parkingLocation') ? '2px solid #1E7F5C' : (touchedFields.has('parkingLocation') ? '2px solid #F59E0B' : '2px solid #E5E7EB'),
                    borderRadius: '10px', 
                    fontSize: '14px', 
                    fontWeight: 500, 
                    color: '#111827', 
                    background: isLocked ? '#F3F4F6' : (validFields.has('parkingLocation') ? '#E6F4EE' : (touchedFields.has('parkingLocation') ? '#FEF3C7' : 'white')), 
                    cursor: isLocked ? 'not-allowed' : 'pointer', 
                    transition: 'all 0.2s' 
                  }}>
                  <option value="">Selecteer locatie...</option>
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
              <div key={i} onClick={() => { if (!isLocked) { item.setter(!item.value); markFieldTouched('extras'); markFieldValid('extras', true); } }} onFocus={() => setActiveField('extras')} onBlur={() => setActiveField(null)} tabIndex={0} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', border: activeField === 'extras' ? '2px solid #1E7F5C' : (item.value ? '2px solid #1E7F5C' : '2px solid #E5E7EB'), borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: activeField === 'extras' ? '#E6F4EE' : (item.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white')), opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                <input type="checkbox" checked={item.value} onChange={() => !isLocked && item.setter(!item.value)} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!insuranceType && !coverage && (
          <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#92400e' }}>💡 <strong>Tip:</strong> Vul type verzekering en dekking in voor betere resultaten!</div>
          </div>
        )}

        <button type="submit" disabled={isLocked || validFields.size < totalFields} style={{ width: '100%', padding: '14px', background: (isLocked || validFields.size < totalFields) ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (isLocked || validFields.size < totalFields) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {isLocked ? 'Configuratie vergrendeld' : 'Vergelijk verzekeringen →'}
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
