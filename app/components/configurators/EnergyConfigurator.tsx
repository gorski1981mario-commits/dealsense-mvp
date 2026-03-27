'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, Zap, Fingerprint } from 'lucide-react'
import { useConfigurationLock } from '../../_lib/hooks/useConfigurationLock'
import { FlowTracker } from '../../_lib/flow-tracker'
import AgentEchoLogo from '../AgentEchoLogo'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators } from '../../utils/validators'

interface EnergyConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'biometric' | 'unlocked'

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
  const [solarReturn, setSolarReturn] = useState<number>(0)
  const [isPaid, setIsPaid] = useState(false)
  const [showBiometric, setShowBiometric] = useState(false)
  const [mockOffers, setMockOffers] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  
  // Lock/unlock state using custom hook
  const {
    isLocked,
    saving,
    configId,
    configTimestamp,
    handleLockConfiguration: lockConfig,
    handleUnlockConfiguration: unlockConfig,
    handleDownloadPDF: downloadPDF
  } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'energy' })
  
  const [activeField, setActiveField] = useState<string | null>(null)
  
  // Progress tracking
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 5 // filterType, energyType, contractType, electricityUsage, gasUsage (postcode i houseNumber są opcjonalne)
  
  // Track view on mount
  useEffect(() => {
    const uid = userId || 'anonymous'
    const pkg = (packageType === 'zakelijk' ? 'finance' : packageType) as 'plus' | 'pro' | 'finance'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-energy', 'view', pkg)
  }, [])
  
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
    
    // Track action
    const uid = userId || 'anonymous'
    const pkg = (packageType === 'zakelijk' ? 'finance' : packageType) as 'plus' | 'pro' | 'finance'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-energy', 'action', pkg, {
      energyType, electricityUsage, gasUsage
    })
    
    if (!isLocked) {
      const parameters = { energyType, electricityUsage, gasUsage, contractType, postcode, houseNumber, greenEnergy, solarPanels, smartMeter, solarReturn }
      await lockConfig(parameters)
    }
    
    // Generate mock offers (will be replaced with real API call)
    const config = {
      electricityUsage: Number(electricityUsage),
      gasUsage: Number(gasUsage),
      greenEnergy,
      solarPanels,
      solarReturn: Number(solarReturn),
      postcode,
      contractType
    }
    
    // Mock: Generate 25 offers (in production, call backend API)
    const offers = generateMockOffers(config, uid)
    setMockOffers(offers)
    
    setView('results')
  }
  
  // Mock function (will be replaced with API call to energy-providers.js)
  const generateMockOffers = (config: any, userId: string) => {
    const providers = [
      { name: 'Budget Energie', multiplier: 0.82, type: 'niche', rating: 7.8, reviews: 5432, trust: 78, green: true },
      { name: 'OXXIO', multiplier: 0.83, type: 'niche', rating: 8.0, reviews: 7654, trust: 80, green: config.greenEnergy },
      { name: 'Mega Energie', multiplier: 0.83, type: 'niche', rating: 7.9, reviews: 4321, trust: 79, green: config.greenEnergy },
      { name: 'United Consumers', multiplier: 0.84, type: 'niche', rating: 8.2, reviews: 6543, trust: 82, green: config.greenEnergy },
      { name: 'Pure Energie', multiplier: 0.85, type: 'niche', rating: 8.2, reviews: 6789, trust: 82, green: true },
      { name: 'Vandebron', multiplier: 0.88, type: 'niche', rating: 8.8, reviews: 12345, trust: 88, green: true },
      { name: 'Greenchoice', multiplier: 1.00, type: 'giant', rating: 9.1, reviews: 18543, trust: 91, green: true },
      { name: 'Essent', multiplier: 1.05, type: 'giant', rating: 8.7, reviews: 11892, trust: 87, green: config.greenEnergy },
      { name: 'Eneco', multiplier: 1.08, type: 'giant', rating: 8.8, reviews: 13456, trust: 88, green: true },
      { name: 'Vattenfall', multiplier: 1.10, type: 'giant', rating: 8.8, reviews: 15234, trust: 88, green: config.greenEnergy },
      { name: 'Nuon', multiplier: 1.12, type: 'giant', rating: 8.5, reviews: 9876, trust: 85, green: config.greenEnergy }
    ]
    
    const baseElectricityPrice = 0.35
    const baseGasPrice = 1.20
    const greenPremium = config.greenEnergy ? 1.05 : 1.0
    const netElectricityUsage = config.solarPanels ? Math.max(0, config.electricityUsage - config.solarReturn) : config.electricityUsage
    
    const offers = providers.map(p => {
      const electricityCost = netElectricityUsage * baseElectricityPrice * greenPremium
      const gasCost = config.gasUsage * baseGasPrice
      const baseCost = electricityCost + gasCost
      const totalCost = Math.round(baseCost * p.multiplier)
      const monthlyCost = Math.round(totalCost / 12)
      
      return {
        provider: p.name,
        type: p.type,
        yearly: totalCost,
        monthly: monthlyCost,
        rating: p.rating,
        reviews: p.reviews,
        trust: p.trust,
        green: p.green,
        contract: '1 jaar vast',
        url: `https://www.${p.name.toLowerCase().replace(/ /g, '')}.nl`,
        savings: 0
      }
    })
    
    offers.sort((a, b) => a.yearly - b.yearly)
    const maxPrice = offers[offers.length - 1].yearly
    offers.forEach(o => { o.savings = maxPrice - o.yearly })
    
    // Simple rotation (swap top 2 based on userId)
    if (userId.charCodeAt(userId.length - 1) % 2 === 0 && offers.length >= 2) {
      [offers[0], offers[1]] = [offers[1], offers[0]]
    }
    
    return offers
  }

  const handleLockConfiguration = async () => {
    const parameters = { energyType, electricityUsage, gasUsage, contractType, postcode, houseNumber, greenEnergy, solarPanels, smartMeter }
    const success = await lockConfig(parameters)
    if (success) {
      alert(`✅ Configuratie vergrendeld!\nConfiguration ID: ${configId}`)
    } else {
      alert('❌ Fout bij opslaan configuratie')
    }
  }

  const handleUnlockConfiguration = () => {
    unlockConfig()
  }

  const handleDownloadPDF = () => {
    const parameters = { energyType, electricityUsage, gasUsage, contractType, postcode, houseNumber, greenEnergy, solarPanels, smartMeter }
    downloadPDF(parameters)
  }

  if (view === 'results') {
    const offers = mockOffers
    const hasOffers = offers.length > 0
    const referencePrice = hasOffers ? offers[offers.length - 1].yearly : 0
    const bestPrice = hasOffers ? offers[0].yearly : 0
    const totalSavings = referencePrice - bestPrice
    
    return (
      <div>
        <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        
        
        
        {hasOffers && (
          <>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>⚡ {offers.length} energieleveranciers gevonden!</h2>
            <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Vergelijking van 5 giganten + 20 niszowe leveranciers • Besparing tot €{totalSavings}/jaar</p>
            
            {/* DISCLAIMER - ESTIMATED PRICES */}
            <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#92400E' }}>
                <strong>⚠️ Geschatte prijzen</strong> op basis van marktgegevens (zoals Gaslicht.com, Energievergelijk.nl). Exacte prijzen bij de leverancier.
              </div>
            </div>
            
            {/* REFERENTIE PRIJS - Market gemiddelde */}
            <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400E' }}>💡 Referentie (markt gemiddelde)</div>
                  <div style={{ fontSize: '11px', color: '#78350F', marginTop: '2px' }}>Duurste aanbieding als vergelijkingspunt</div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#92400E' }}>€{referencePrice}/jaar</div>
              </div>
            </div>

            {/* TOP 3 OFFERS - BEFORE PAYWALL */}
            {offers.slice(0, 3).map((offer, i) => (
              <div key={i} style={{ background: i === 0 ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${i === 0 ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px', position: 'relative' }}>
                {/* BLUR OVERLAY */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(4px)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                  <div style={{ textAlign: 'center' }}>
                    <Lock size={32} color="#6B7280" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>🔒 Verborgen</div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>Betaal om leverancier te zien</div>
                  </div>
                </div>
                
                {/* CONTENT (blurred) */}
                <div style={{ filter: 'blur(3px)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>███████████</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>€{offer.yearly}/jaar</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>€{offer.monthly}/mnd • {offer.contract}</div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280', marginBottom: '12px' }}>
                    <span>⭐ {offer.rating}/10</span>
                    <span>💸 Bespaar €{offer.savings}/jaar</span>
                    {offer.green && <span>🌱 Groen</span>}
                  </div>
                  {i === 0 && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>BESTE PRIJS</span>}
                </div>
              </div>
            ))}

            {/* PAYWALL CTA */}
            <div style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', margin: '20px 0', boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)' }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>💰 Bespaar €{totalSavings}/jaar</div>
              <div style={{ fontSize: '14px', color: '#D1FAE5', marginBottom: '16px' }}>Betaal €{Math.round(totalSavings * 0.09)} (9% commissie) om alle leveranciers te zien</div>
              <button 
                onClick={() => setView('payment')}
                style={{ width: '100%', padding: '14px', background: 'white', color: '#15803d', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
              >
                🔓 Ontgrendel alle aanbiedingen →
              </button>
              <div style={{ fontSize: '11px', color: '#D1FAE5', marginTop: '12px' }}>✓ 25 leveranciers • ✓ Beste prijzen • ✓ Direct overstappen</div>
            </div>
          </>
        )}
        
        {!hasOffers && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Geen aanbiedingen gevonden</div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '8px' }}>Vul alle velden in om te vergelijken</div>
          </div>
        )}
      </div>
    )
  }

  if (view === 'payment') {
    const referencePrice = mockOffers.length > 0 ? mockOffers[mockOffers.length - 1].yearly : 0
    const bestPrice = mockOffers.length > 0 ? mockOffers[0].yearly : 0
    const totalSavings = referencePrice - bestPrice
    const commission = Math.round(totalSavings * 0.09)
    
    return (
      <div>
        <button onClick={() => setView('results')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>💳 Betaling</h2>
        
        {/* SAVINGS BREAKDOWN */}
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Referentie (duurste)</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>€{referencePrice}/jaar</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#6B7280' }}>Beste prijs</span>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>€{bestPrice}/jaar</span>
          </div>
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '8px', marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Jouw besparing</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>€{totalSavings}/jaar</span>
            </div>
          </div>
        </div>
        
        <div style={{ background: '#E6F4EE', border: '2px solid #15803d', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '16px', color: '#374151', marginBottom: '12px' }}>Commissie (9%)</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€{commission}</div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>Eenmalige betaling voor toegang tot alle 25 leveranciers</div>
          <button 
            onClick={() => {
              setIsPaid(true)
              setView('biometric')
            }} 
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)' }}
          >
            💳 Betaal met Stripe →
          </button>
        </div>
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#6B7280' }}>🔒 Veilige betaling via Stripe • 14 dagen bedenktijd</div>
      </div>
    )
  }
  
  if (view === 'biometric') {
    return (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', textAlign: 'center' }}>👆 Biometrische verificatie</h2>
        
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ width: '120px', height: '120px', margin: '0 auto 24px', background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(21, 128, 61, 0.3)' }}>
            <Fingerprint size={64} color="white" />
          </div>
          
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Bevestig je identiteit</h3>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px' }}>Gebruik Face ID, Touch ID of je pincode om toegang te krijgen tot de aanbiedingen</p>
          
          <button 
            onClick={() => {
              setShowBiometric(true)
              setTimeout(() => setView('unlocked'), 1500)
            }}
            style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(21, 128, 61, 0.3)' }}
          >
            👆 Verifieer met biometrie
          </button>
          
          {showBiometric && (
            <div style={{ marginTop: '20px', padding: '12px', background: '#E6F4EE', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>✓ Verificatie geslaagd!</div>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (view === 'unlocked') {
    const referencePrice = mockOffers.length > 0 ? mockOffers[mockOffers.length - 1].yearly : 0
    const bestPrice = mockOffers.length > 0 ? mockOffers[0].yearly : 0
    const totalSavings = referencePrice - bestPrice
    
    return (
      <div>
        <div style={{ background: '#E6F4EE', border: '2px solid #15803d', borderRadius: '12px', padding: '16px', marginBottom: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#15803d', marginBottom: '4px' }}>✅ Toegang verkregen!</div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>Je hebt nu toegang tot alle {mockOffers.length} leveranciers</div>
        </div>
        
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>🏆 Alle aanbiedingen (goedkoopste eerst)</h2>
        
        {mockOffers.map((offer, i) => (
          <div key={i} style={{ background: i === 0 ? '#E6F4EE' : 'white', border: `2px solid ${i === 0 ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>⚡ {offer.provider}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{offer.type === 'niche' ? '💎 Niszowe' : '🏢 Gigant'} {offer.green && '• 🌱 Groen'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>€{offer.yearly}/jaar</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>€{offer.monthly}/mnd</div>
              </div>
            </div>
            
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{offer.contract}</div>
            
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280', marginBottom: '12px', flexWrap: 'wrap' }}>
              <span>⭐ {offer.rating}/10</span>
              <span>👥 {offer.reviews.toLocaleString()} reviews</span>
              <span>🛡️ Trust {offer.trust}/100</span>
              <span style={{ fontWeight: 600, color: '#15803d' }}>💸 Bespaar €{offer.savings}/jaar</span>
            </div>
            
            {i === 0 && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginBottom: '12px' }}>BESTE PRIJS - BESPAAR €{totalSavings}/JAAR</span>}
            
            <button 
              onClick={() => window.open(offer.url, '_blank')} 
              style={{ width: '100%', padding: '12px', background: i === 0 ? 'linear-gradient(135deg, #15803d 0%, #166534 100%)' : '#F3F4F6', color: i === 0 ? 'white' : '#111827', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: i === 0 ? '0 4px 12px rgba(21, 128, 61, 0.3)' : 'none' }}
            >
              🌐 Bekijk aanbieding bij {offer.provider} →
            </button>
          </div>
        ))}
        
        {/* DUAL REVENUE INFO */}
        <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginTop: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>💰 Dual Revenue Model</div>
          <div style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.6' }}>
            • Jouw commissie: €{Math.round(totalSavings * 0.09)} (9% van besparing)<br />
            • Affiliate commissie: €{Math.round(bestPrice * 0.09)} (9% van contract)<br />
            • <strong>Total revenue: €{Math.round(totalSavings * 0.09) + Math.round(bestPrice * 0.09)}</strong>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={24} strokeWidth={2} /> Energie Configurator</h2>
      <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '20px' }}>Vergelijk 25 energieleveranciers • Bespaar tot €800/jaar • 100% onafhankelijk</p>

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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Elektriciteit verbruik (kWh/jaar) *</label>
            <input type="number" min="0" max="20000" step="100" value={electricityUsage} onChange={(e) => { const val = parseInt(e.target.value); setElectricityUsage(val); validateAndMark('electricityUsage', val, (v) => v > 0); }} disabled={isLocked} placeholder="2500" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('electricityUsage') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('electricityUsage') ? '#E6F4EE' : 'white'), cursor: isLocked ? 'not-allowed' : 'text' }} />
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Gemiddeld huishouden: 2500-3500 kWh/jaar</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gas verbruik (m³/jaar) *</label>
            <input type="number" min="0" max="5000" step="50" value={gasUsage} onChange={(e) => { const val = parseInt(e.target.value); setGasUsage(val); validateAndMark('gasUsage', val, (v) => v > 0); }} disabled={isLocked} placeholder="1200" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('gasUsage') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('gasUsage') ? '#E6F4EE' : 'white'), cursor: isLocked ? 'not-allowed' : 'text' }} />
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Gemiddeld huishouden: 1200-1500 m³/jaar</div>
          </div>
        </div>

        {/* 3. CONTRACT TYPE */}
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
        <div style={{ background: 'linear-gradient(135deg, #E6F4EE 0%, #E6F4EE 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste energieleveranciers voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}






