'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, ShieldCheck } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators, formatters } from '../../utils/validators'

interface InsuranceConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function InsuranceConfigurator({ packageType = 'pro', userId }: InsuranceConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  const [insuranceType, setInsuranceType] = useState('')
  const [coverage, setCoverage] = useState('')
  const [age, setAge] = useState<number | ''>('')
  const [postcode, setPostcode] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  
  // User profile fields (auto-filled from account)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  
  // Auto-specific fields
  const [kenteken, setKenteken] = useState('')
  const [meldcode, setMeldcode] = useState('')
  const [bonusMalus, setBonusMalus] = useState<number | ''>('')
  const [vehicleValue, setVehicleValue] = useState<number | ''>('')
  const [annualMileage, setAnnualMileage] = useState<number | ''>('')
  const [parkingLocation, setParkingLocation] = useState('')
  const [hoofdbestuurder, setHoofdbestuurder] = useState('')
  const [youngDrivers, setYoungDrivers] = useState(false)
  const [businessUse, setBusinessUse] = useState(false)
  
  // Levensverzekering fields
  const [gender, setGender] = useState('')
  const [smoker, setSmoker] = useState('')
  const [insuredAmount, setInsuredAmount] = useState<number | ''>('')
  const [duration, setDuration] = useState<number | ''>('')
  const [insuranceForm, setInsuranceForm] = useState('')
  const [purpose, setPurpose] = useState('')
  
  // Zorgverzekering fields
  const [bsn, setBsn] = useState('')
  const [eigenRisico, setEigenRisico] = useState<number | ''>('')
  const [polissoort, setPolissoort] = useState('')
  const [betaalwijze, setBetaalwijze] = useState('')
  const [gezinssamenstelling, setGezinssamenstelling] = useState('')
  const [additionalCoverage, setAdditionalCoverage] = useState('')
  const [tandartsPakket, setTandartsPakket] = useState('')
  const [fysioPakket, setFysioPakket] = useState('')
  
  // Woonverzekering fields
  const [verzekeringType, setVerzekeringType] = useState('') // inboedel, opstal, beide
  const [propertyType, setPropertyType] = useState('')
  const [buildYear, setBuildYear] = useState<number | ''>('')
  const [propertyValue, setPropertyValue] = useState<number | ''>('')
  const [herbouwwaarde, setHerbouwwaarde] = useState<number | ''>('')
  const [contentsValue, setContentsValue] = useState<number | ''>('')
  const [inboedelwaarde, setInboedelwaarde] = useState<number | ''>('')
  const [eigenRisicoWoon, setEigenRisicoWoon] = useState<number | ''>('')
  const [beveiliging, setBeveiliging] = useState('')
  
  // Reisverzekering fields
  const [reisverzekeringType, setReisverzekeringType] = useState('') // doorlopend, eenmalig
  const [numberOfPersons, setNumberOfPersons] = useState<number | ''>('')
  const [travelDuration, setTravelDuration] = useState<number | ''>('')
  const [destination, setDestination] = useState('')
  const [travelType, setTravelType] = useState('')
  const [annulering, setAnnulering] = useState(false)
  const [wintersport, setWintersport] = useState(false)
  const [maxBedrag, setMaxBedrag] = useState<number | ''>('')
  
  // AVP fields
  const [familyComposition, setFamilyComposition] = useState('')
  const [dekkingBedrag, setDekkingBedrag] = useState<number | ''>('')
  const [rechtsbijstandAVP, setRechtsbijstandAVP] = useState(false)
  const [motorrijtuigen, setMotorrijtuigen] = useState(false)
  const [specialActivities, setSpecialActivities] = useState(false)
  
  // General extras
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
  
  // Reset validation on component mount and when insurance type changes
  useEffect(() => {
    // Clear all validations to ensure clean start
    setValidFields(new Set())
    setTouchedFields(new Set())
  }, [insuranceType])
  
  // Ensure clean start on mount + autofill user profile data
  useEffect(() => {
    // Force reset on initial load
    setValidFields(new Set())
    setTouchedFields(new Set())
    
    // Auto-fill user profile data from account (mock data - replace with API call)
    const userProfile = {
      firstName: 'Jan',
      lastName: 'de Vries',
      email: 'jan.devries@example.nl',
      phone: '+31 6 12345678',
      postcode: '1012 AB',
      houseNumber: '42',
      street: 'Damstraat',
      city: 'Amsterdam'
    }
    
    // Fill user data
    setFirstName(userProfile.firstName)
    setLastName(userProfile.lastName)
    setEmail(userProfile.email)
    setPhone(userProfile.phone)
    setPostcode(userProfile.postcode)
    setHouseNumber(userProfile.houseNumber)
    setStreet(userProfile.street)
    setCity(userProfile.city)
  }, [])
  
  const getTotalFields = () => {
    let total = 2 // filterType, insuranceType (base fields for all)
    
    if (insuranceType === 'auto' || insuranceType === 'motor') {
      total += 7 // coverage, kenteken, bonusMalus, parkingLocation, postcode, age, annualMileage
    } else if (insuranceType === 'leven') {
      total += 8 // age, gender, smoker, insuredAmount, duration, insuranceForm, purpose, postcode
    } else if (insuranceType === 'zorg') {
      total += 5 // age, postcode, eigenRisico, polissoort, gezinssamenstelling
    } else if (insuranceType === 'woon') {
      total += 10 // propertyType, postcode, buildYear, propertyValue, contentsValue, verzekeringType, eigenRisicoWoon, beveiliging, inboedelwaarde, herbouwwaarde
    } else if (insuranceType === 'reis') {
      total += 6 // reisverzekeringType, numberOfPersons, travelDuration, destination, annulering, wintersport
    } else if (insuranceType === 'aansprakelijkheid') {
      total += 5 // familyComposition, postcode, dekkingBedrag, rechtsbijstandAVP, motorrijtuigen
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
  
  const validateAndMark = (fieldName: string, value: any, customValidator?: (val: any) => boolean) => {
    markFieldTouched(fieldName)
    const isValid = customValidator ? customValidator(value) : validators.required(value)
    markFieldValid(fieldName, isValid)
    return isValid
  }
  
  const progress = Math.round((validFields.size / totalFields) * 100)

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
      
      // Generate unique Configuration ID
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase()
      const generatedConfigId = `INS-${new Date().getFullYear()}-${randomSuffix}-${timestamp.toString().slice(-6)}`
      
      const configData = {
        configId: generatedConfigId,
        userId: userId || 'anonymous',
        sector: 'insurance',
        userProfile: {
          firstName,
          lastName,
          email,
          phone,
          postcode,
          houseNumber,
          street,
          city
        },
        parameters: {
          filterType,
          insuranceType,
          // Auto/Motor fields
          kenteken,
          meldcode,
          coverage,
          bonusMalus,
          parkingLocation,
          vehicleValue,
          annualMileage,
          hoofdbestuurder,
          youngDrivers,
          businessUse,
          // Levensverzekering fields
          gender,
          smoker,
          insuredAmount,
          duration,
          insuranceForm,
          purpose,
          // Zorgverzekering fields
          bsn,
          eigenRisico,
          polissoort,
          betaalwijze,
          gezinssamenstelling,
          additionalCoverage,
          tandartsPakket,
          fysioPakket,
          // Woonverzekering fields
          verzekeringType,
          propertyType,
          buildYear,
          propertyValue,
          herbouwwaarde,
          contentsValue,
          inboedelwaarde,
          eigenRisicoWoon,
          beveiliging,
          // Reisverzekering fields
          reisverzekeringType,
          numberOfPersons,
          travelDuration,
          destination,
          travelType,
          annulering,
          wintersport,
          maxBedrag,
          // AVP fields
          familyComposition,
          dekkingBedrag,
          rechtsbijstandAVP,
          motorrijtuigen,
          specialActivities,
          // Common fields
          age,
          postcode,
          houseNumber,
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
        setConfigId(generatedConfigId)
        setConfigTimestamp(configData.timestamp)
        setIsLocked(true)
        alert(`✅ Configuratie opgeslagen!\n\nConfiguration ID: ${generatedConfigId}\n\nJe kunt nu:\n• PDF downloaden\n• Versturen naar verzekeraar`)
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
      sector: 'insurance',
      userProfile: {
        firstName,
        lastName,
        email,
        phone,
        postcode,
        houseNumber,
        street,
        city
      },
      parameters: {
        filterType,
        insuranceType,
        kenteken,
        meldcode,
        coverage,
        bonusMalus,
        parkingLocation,
        vehicleValue,
        annualMileage,
        hoofdbestuurder,
        youngDrivers,
        businessUse,
        gender,
        smoker,
        insuredAmount,
        duration,
        insuranceForm,
        purpose,
        bsn,
        eigenRisico,
        polissoort,
        betaalwijze,
        gezinssamenstelling,
        additionalCoverage,
        tandartsPakket,
        fysioPakket,
        verzekeringType,
        propertyType,
        buildYear,
        propertyValue,
        herbouwwaarde,
        contentsValue,
        inboedelwaarde,
        eigenRisicoWoon,
        beveiliging,
        reisverzekeringType,
        numberOfPersons,
        travelDuration,
        destination,
        travelType,
        annulering,
        wintersport,
        maxBedrag,
        familyComposition,
        dekkingBedrag,
        rechtsbijstandAVP,
        motorrijtuigen,
        specialActivities,
        age,
        postcode,
        houseNumber,
        legalAid
      },
      timestamp: configTimestamp
    })
  }

  // Results view
  if (view === 'results') {
    return (
      <div>
        <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>🎉 3 beste aanbiedingen gevonden!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>We doorzochten de markt met Deal Score</p>
        <div style={{ fontSize: '32px', textAlign: 'center', margin: '20px 0' }}>🔒</div>
        {[{name: '🛡️ Zilveren Kruis Basis', price: '€89/mnd', coverage: 'WA + Beperkt Casco', rating: '⭐ 4.6/5', trust: '🛡️ 9/10', score: 'Score: 9.1', badge: 'BESTE DEAL', best: true}, {name: '🛡️ FBTO Compleet', price: '€112/mnd', coverage: 'All-risk dekking', rating: '⭐ 4.4/5', trust: '🛡️ 8/10', score: 'Score: 8.7'}, {name: '🛡️ Centraal Beheer Premium', price: '€135/mnd', coverage: 'All-risk + extra\'s', rating: '⭐ 4.5/5', trust: '🛡️ 9/10', score: 'Score: 8.9'}].map((ins, i) => (
          <div key={i} style={{ background: ins.best ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${ins.best ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{ins.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E7F5C' }}>{ins.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{ins.coverage}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{ins.rating}</span>
              <span>{ins.trust}</span>
              <span>{ins.score}</span>
            </div>
            {ins.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#1E7F5C', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{ins.badge}</span>}
          </div>
        ))}
        <div style={{ background: '#E6F4EE', border: '2px solid #1E7F5C', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Betaal 9% commissie om toegang te krijgen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E7F5C', margin: '12px 0' }}>€96,12</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>(9% van €1.068 jaarlijks)</div>
          <button onClick={() => setView('payment')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>Betaal en krijg toegang →</button>
        </div>
      </div>
    )
  }

  // Payment view
  if (view === 'payment') {
    const handlePayment = async () => {
      // Simulate payment processing
      const transactionId = `TRX-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      const paymentAmount = 96.12
      
      // Save configuration to localStorage (later: API)
      const savedConfig = {
        id: Date.now().toString(),
        configId: configId || `INS-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-6)}`,
        sector: 'insurance',
        status: 'betaald',
        timestamp: new Date().toISOString(),
        transactionId,
        paymentAmount,
        userProfile: {
          firstName,
          lastName,
          email,
          phone,
          postcode,
          houseNumber,
          street,
          city
        },
        parameters: {
          filterType,
          insuranceType,
          kenteken,
          coverage,
          bonusMalus,
          age,
          annualMileage,
          parkingLocation
        },
        results: [
          { name: 'Zilveren Kruis Basis', price: '€89/mnd', url: 'https://www.zilverenkruis.nl' },
          { name: 'FBTO Compleet', price: '€112/mnd', url: 'https://www.fbto.nl' },
          { name: 'Centraal Beheer Premium', price: '€135/mnd', url: 'https://www.centraalbeheer.nl' }
        ]
      }
      
      // Save to localStorage
      const existingConfigs = JSON.parse(localStorage.getItem('userConfigurations') || '[]')
      existingConfigs.push(savedConfig)
      localStorage.setItem('userConfigurations', JSON.stringify(existingConfigs))
      
      // Move to unlocked view
      setView('unlocked')
    }
    
    return (
      <div>
        <button onClick={() => setView('results')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>💳 Betaling</h2>
        <div style={{ background: '#E6F4EE', border: '2px solid #1E7F5C', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '16px', color: '#374151', marginBottom: '12px' }}>Totaal te betalen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E7F5C', margin: '12px 0' }}>€96,12</div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>9% commissie voor toegang tot 3 beste deals</div>
          <button onClick={handlePayment} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>Betaal met Stripe →</button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#6B7280' }}>🔒 Veilige betaling via Stripe</div>
      </div>
    )
  }

  // Unlocked view
  if (view === 'unlocked') {
    return (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>✅ Toegang verkregen!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Je hebt nu toegang tot de 3 beste deals</p>
        {[{name: '🛡️ Zilveren Kruis Basis', price: '€89/mnd', coverage: 'WA + Beperkt Casco', rating: '⭐ 4.6/5 (8.234 reviews)', trust: '🛡️ Betrouwbaar 9/10', badge: 'BESTE DEAL - BESPAAR €420/jaar', url: 'https://www.zilverenkruis.nl', best: true}, {name: '🛡️ FBTO Compleet', price: '€112/mnd', coverage: 'All-risk dekking', rating: '⭐ 4.4/5 (5.891 reviews)', trust: '🛡️ Betrouwbaar 8/10', url: 'https://www.fbto.nl'}, {name: '🛡️ Centraal Beheer Premium', price: '€135/mnd', coverage: 'All-risk + extra\'s', rating: '⭐ 4.5/5 (12.456 reviews)', trust: '🛡️ Betrouwbaar 9/10', url: 'https://www.centraalbeheer.nl'}].map((ins, i) => (
          <div key={i} style={{ background: ins.best ? '#E6F4EE' : 'white', border: `2px solid ${ins.best ? '#1E7F5C' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{ins.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#1E7F5C' }}>{ins.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{ins.coverage}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{ins.rating}</span>
              <span>{ins.trust}</span>
            </div>
            {ins.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#1E7F5C', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{ins.badge}</span>}
            <button onClick={() => window.open(ins.url, '_blank')} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#1E7F5C', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🌐 Bekijk aanbieding</button>
          </div>
        ))}
      </div>
    )
  }

  // Configurator view (default)
  // Force rebuild: 2026-03-18 07:23
  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><ShieldCheck size={24} strokeWidth={2} /> Verzekering Configurator</h2>

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

      <form onSubmit={handleSubmit} autoComplete="off">
        
        {/* FILTER OPTIONS */}
        <FilterOptions 
          selectedFilter={filterType}
          onFilterChange={(filter) => { setFilterType(filter); validateAndMark('filterType', filter); }}
          disabled={isLocked}
        />
        
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

        {/* 2. DEKKING - Only for Auto/Motor */}
        {(insuranceType === 'auto' || insuranceType === 'motor') && (
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
        )}

        {/* AUTO/MOTOR SPECIFIC FIELDS */}
        {(insuranceType === 'auto' || insuranceType === 'motor') && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
              {insuranceType === 'auto' ? '3. Auto gegevens' : '3. Motor gegevens'}
            </div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Kenteken</label>
              <input 
                type="text" 
                value={kenteken} 
                onChange={(e) => {
                  const val = e.target.value.toUpperCase()
                  setKenteken(val)
                  validateAndMark('kenteken', val, (v) => v.length >= 6)
                }} 
                disabled={isLocked} 
                placeholder="AB-123-C" 
                maxLength={8}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('kenteken') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('kenteken') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('kenteken') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Vul het kenteken van je {insuranceType === 'auto' ? 'auto' : 'motor'} in</div>
            </div>

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
                disabled={isLocked} 
                placeholder="35" 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('age') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('age') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('age') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
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
                disabled={isLocked} 
                placeholder="1234 AB" 
                maxLength={7}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('postcode') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('postcode') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('postcode') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Schadevrije jaren (Bonus-Malus)</label>
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
                disabled={isLocked} 
                placeholder="0" 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('bonusMalus') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('bonusMalus') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('bonusMalus') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Meer jaren = lagere premie</div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Kilometers per jaar</label>
              <input 
                type="number" 
                min="1000" 
                max="100000" 
                step="1000"
                value={annualMileage} 
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : ''
                  setAnnualMileage(val)
                  if (val) validateAndMark('annualMileage', val, (v) => v >= 1000)
                }} 
                disabled={isLocked} 
                placeholder="15000" 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('annualMileage') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('annualMileage') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('annualMileage') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Gemiddeld: 10.000-20.000 km/jaar</div>
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
                disabled={isLocked} 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('parkingLocation') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('parkingLocation') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('parkingLocation') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
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
          </div>
        )}

        {/* LEVENSVERZEKERING SPECIFIC FIELDS */}
        {insuranceType === 'leven' && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Persoonlijke gegevens</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Leeftijd (jaar)</label>
              <input 
                type="number" 
                min="18" 
                max="75" 
                value={age} 
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : ''
                  setAge(val)
                  if (val) validateAndMark('age', val, (v) => validators.age(v, 18, 75))
                }} 
                disabled={isLocked} 
                placeholder="35" 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('age') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('age') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('age') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Geslacht</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {value: 'man', label: '👨 Man'},
                  {value: 'vrouw', label: '👩 Vrouw'}
                ].map(g => (
                  <div key={g.value} onClick={() => { if (!isLocked) { setGender(g.value); validateAndMark('gender', g.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: gender === g.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: gender === g.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="gender" value={g.value} checked={gender === g.value} onChange={() => { if (!isLocked) { setGender(g.value); validateAndMark('gender', g.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{g.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Rookgedrag</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {value: 'niet-roker', label: '🚭 Niet-roker', desc: 'Extra korting!'},
                  {value: 'roker', label: '🚬 Roker', desc: 'Hogere premie'}
                ].map(s => (
                  <div key={s.value} onClick={() => { if (!isLocked) { setSmoker(s.value); validateAndMark('smoker', s.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: smoker === s.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: smoker === s.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="smoker" value={s.value} checked={smoker === s.value} onChange={() => { if (!isLocked) { setSmoker(s.value); validateAndMark('smoker', s.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{s.label}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Verzekerd bedrag (€)</label>
              <select 
                value={insuredAmount} 
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  setInsuredAmount(val)
                  validateAndMark('insuredAmount', val)
                }} 
                disabled={isLocked} 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('insuredAmount') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('insuredAmount') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('insuredAmount') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'pointer', 
                  transition: 'all 0.2s' 
                }}>
                <option value="">Kies bedrag...</option>
                <option value="50000">€ 50.000</option>
                <option value="100000">€ 100.000</option>
                <option value="200000">€ 200.000</option>
                <option value="300000">€ 300.000</option>
                <option value="500000">€ 500.000</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Looptijd (jaren)</label>
              <input 
                type="number" 
                min="1" 
                max="30" 
                value={duration} 
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : ''
                  setDuration(val)
                  if (val) validateAndMark('duration', val, (v) => v >= 1 && v <= 30)
                }} 
                disabled={isLocked} 
                placeholder="20" 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('duration') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('duration') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('duration') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Bijvoorbeeld voor hypotheek: 20-30 jaar</div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Verzekeringsvorm</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {value: 'gelijkblijvend', label: '📊 Gelijkblijvend', desc: 'Vast bedrag gedurende looptijd'},
                  {value: 'annuitair', label: '📉 Annuïtair dalend', desc: 'Voor annuïtaire hypotheek'},
                  {value: 'lineair', label: '📉 Lineair dalend', desc: 'Voor lineaire hypotheek'}
                ].map(f => (
                  <div key={f.value} onClick={() => { if (!isLocked) { setInsuranceForm(f.value); validateAndMark('insuranceForm', f.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: insuranceForm === f.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: insuranceForm === f.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="insuranceForm" value={f.value} checked={insuranceForm === f.value} onChange={() => { if (!isLocked) { setInsuranceForm(f.value); validateAndMark('insuranceForm', f.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{f.label}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ZORGVERZEKERING SPECIFIC FIELDS */}
        {insuranceType === 'zorg' && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Persoonlijke gegevens</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Leeftijd (jaar)</label>
              <input 
                type="number" 
                min="18" 
                max="100" 
                value={age} 
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : ''
                  setAge(val)
                  if (val) validateAndMark('age', val, (v) => validators.age(v, 18, 100))
                }} 
                disabled={isLocked} 
                placeholder="35" 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('age') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('age') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('age') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
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
                disabled={isLocked} 
                placeholder="1234 AB" 
                maxLength={7}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('postcode') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('postcode') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('postcode') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Eigen risico 2026</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {value: 385, label: '€ 385 (Verplicht)', desc: 'Standaard eigen risico'},
                  {value: 500, label: '€ 500 (Vrijwillig)', desc: 'Lagere premie'},
                  {value: 885, label: '€ 885 (Vrijwillig)', desc: 'Laagste premie'}
                ].map(er => (
                  <div key={er.value} onClick={() => { if (!isLocked) { setEigenRisico(er.value); validateAndMark('eigenRisico', er.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: eigenRisico === er.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: eigenRisico === er.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="eigenRisico" value={er.value} checked={eigenRisico === er.value} onChange={() => { if (!isLocked) { setEigenRisico(er.value); validateAndMark('eigenRisico', er.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{er.label}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{er.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Polissoort</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {value: 'natura', label: '🏥 Naturapolis', desc: 'Alleen bij contractzorg'},
                  {value: 'restitutie', label: '💰 Restitutiepolis', desc: 'Vrije keuze zorgverlener'},
                  {value: 'combinatie', label: '🔄 Combinatiepolis', desc: 'Mix van beide'}
                ].map(p => (
                  <div key={p.value} onClick={() => { if (!isLocked) { setPolissoort(p.value); validateAndMark('polissoort', p.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: polissoort === p.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: polissoort === p.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="polissoort" value={p.value} checked={polissoort === p.value} onChange={() => { if (!isLocked) { setPolissoort(p.value); validateAndMark('polissoort', p.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{p.label}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{p.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gezinssamenstelling</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {value: 'alleenstaand', label: '👤 Alleenstaand'},
                  {value: 'gezin', label: '👨‍👩‍👧‍👦 Gezin met kinderen'},
                  {value: 'samenwonend', label: '👫 Samenwonend (2 personen)'}
                ].map(g => (
                  <div key={g.value} onClick={() => { if (!isLocked) { setGezinssamenstelling(g.value); validateAndMark('gezinssamenstelling', g.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: gezinssamenstelling === g.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: gezinssamenstelling === g.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="gezinssamenstelling" value={g.value} checked={gezinssamenstelling === g.value} onChange={() => { if (!isLocked) { setGezinssamenstelling(g.value); validateAndMark('gezinssamenstelling', g.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>{g.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* WOONVERZEKERING SPECIFIC FIELDS */}
        {insuranceType === 'woon' && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Woning gegevens</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Type woning</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {value: 'koop', label: '🏠 Koopwoning', desc: 'Ik ben eigenaar'},
                  {value: 'huur', label: '🏘️ Huurwoning', desc: 'Ik huur de woning'}
                ].map(t => (
                  <div key={t.value} onClick={() => { if (!isLocked) { setPropertyType(t.value); validateAndMark('propertyType', t.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: propertyType === t.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: propertyType === t.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="propertyType" value={t.value} checked={propertyType === t.value} onChange={() => { if (!isLocked) { setPropertyType(t.value); validateAndMark('propertyType', t.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{t.label}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{t.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
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
                disabled={isLocked} 
                placeholder="1234 AB" 
                maxLength={7}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('postcode') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('postcode') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('postcode') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bouwjaar</label>
              <input 
                type="number" 
                min="1900" 
                max="2026" 
                value={buildYear} 
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : ''
                  setBuildYear(val)
                  if (val) validateAndMark('buildYear', val, (v) => v >= 1900 && v <= 2026)
                }} 
                disabled={isLocked} 
                placeholder="1990" 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('buildYear') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('buildYear') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('buildYear') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Woningwaarde (€)</label>
              <input 
                type="number" 
                min="50000" 
                max="2000000" 
                step="10000" 
                value={propertyValue} 
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : ''
                  setPropertyValue(val)
                  if (val) validateAndMark('propertyValue', val, (v) => v >= 50000)
                }} 
                disabled={isLocked} 
                placeholder="350000" 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('propertyValue') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('propertyValue') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('propertyValue') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Voor opstalverzekering</div>
            </div>
          </div>
        )}

        {/* REISVERZEKERING SPECIFIC FIELDS */}
        {insuranceType === 'reis' && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Reis gegevens</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Aantal personen</label>
              <input 
                type="number" 
                min="1" 
                max="10" 
                value={numberOfPersons} 
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : ''
                  setNumberOfPersons(val)
                  if (val) validateAndMark('numberOfPersons', val, (v) => v >= 1)
                }} 
                disabled={isLocked} 
                placeholder="2" 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('numberOfPersons') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('numberOfPersons') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('numberOfPersons') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Reisduur (dagen)</label>
              <input 
                type="number" 
                min="1" 
                max="365" 
                value={travelDuration} 
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : ''
                  setTravelDuration(val)
                  if (val) validateAndMark('travelDuration', val, (v) => v >= 1)
                }} 
                disabled={isLocked} 
                placeholder="14" 
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('travelDuration') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('travelDuration') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('travelDuration') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bestemming</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {value: 'europa', label: '🇪🇺 Europa', desc: 'Binnen Europa'},
                  {value: 'wereld', label: '🌍 Wereldwijd', desc: 'Wereldwijde dekking'}
                ].map(d => (
                  <div key={d.value} onClick={() => { if (!isLocked) { setDestination(d.value); validateAndMark('destination', d.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: destination === d.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: destination === d.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="destination" value={d.value} checked={destination === d.value} onChange={() => { if (!isLocked) { setDestination(d.value); validateAndMark('destination', d.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{d.label}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{d.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AANSPRAKELIJKHEIDSVERZEKERING (AVP) SPECIFIC FIELDS */}
        {insuranceType === 'aansprakelijkheid' && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Gezinssamenstelling</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Samenstelling</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  {value: 'alleenstaand', label: '� Alleenstaand', desc: 'Voor 1 persoon'},
                  {value: 'gezin', label: '👨‍👩‍👧‍� Gezin', desc: 'Voor gezin met kinderen'},
                  {value: 'samenwonend', label: '👫 Samenwonend', desc: 'Voor 2 personen'}
                ].map(f => (
                  <div key={f.value} onClick={() => { if (!isLocked) { setFamilyComposition(f.value); validateAndMark('familyComposition', f.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: familyComposition === f.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: familyComposition === f.value ? '#1E7F5C' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                    <input type="radio" name="familyComposition" value={f.value} checked={familyComposition === f.value} onChange={() => { if (!isLocked) { setFamilyComposition(f.value); validateAndMark('familyComposition', f.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: 500 }}>{f.label}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postcode</label>
              <input 
                type="text" 
                value={postcode} 
                onChange={(e) => {
                  const formatted = formatters.postcode(e.target.value)
                  setPostcode(formatted)
                  validateAndMark('postcode', formatted, validators.postcode)
                }} 
                disabled={isLocked} 
                placeholder="1234 AB" 
                maxLength={7}
                style={{ 
                  width: '100%', 
                  padding: '10px 14px', 
                  border: validFields.has('postcode') ? '2px solid #1E7F5C' : '2px solid #E5E7EB',
                  borderRadius: '10px', 
                  fontSize: '14px', 
                  fontWeight: 500, 
                  color: '#111827', 
                  background: isLocked ? '#F3F4F6' : (validFields.has('postcode') ? '#E6F4EE' : 'white'), 
                  boxShadow: validFields.has('postcode') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none',
                  cursor: isLocked ? 'not-allowed' : 'text', 
                  transition: 'all 0.2s' 
                }} />
            </div>
          </div>
        )}

        {!insuranceType && (
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

