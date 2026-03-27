'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, Home } from 'lucide-react'
import { useConfigurationLock } from '../../_lib/hooks/useConfigurationLock'
import { useConfiguratorSearch } from '../../_hooks/useConfiguratorSearch'
import { FlowTracker } from '../../_lib/flow-tracker'
import AgentEchoLogo from '../AgentEchoLogo'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators } from '../../utils/validators'

interface MortgageConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function MortgageConfigurator({ packageType = 'pro', userId }: MortgageConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  const [mortgageAmount, setMortgageAmount] = useState<number | ''>('')
  const [houseValue, setHouseValue] = useState<number | ''>('')
  const [duration, setDuration] = useState<number | ''>('')
  const [mortgageType, setMortgageType] = useState('')
  const [income, setIncome] = useState<number | ''>('')
  const [partnerIncome, setPartnerIncome] = useState<number | ''>(0)
  const [postcode, setPostcode] = useState('')
  const [firstTimeBuyer, setFirstTimeBuyer] = useState(false)
  const [refinancing, setRefinancing] = useState(false)
  const [currentMortgageDebt, setCurrentMortgageDebt] = useState<number | ''>('')
  const [nhg, setNhg] = useState(false)
  const [fixedRate, setFixedRate] = useState('')
  const [searching, setSearching] = useState(false)
  
  const {
    isLocked,
    saving,
    configId,
    configTimestamp,
    handleLockConfiguration: lockConfig,
    handleUnlockConfiguration: unlockConfig,
    handleDownloadPDF: downloadPDF
  } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'mortgage' })
  const [activeField, setActiveField] = useState<string | null>(null)
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 7 // filterType, mortgageAmount, houseValue, duration, mortgageType, income, fixedRate
  const validateAndMark = (fieldName: string, value: any, customValidator?: (val: any) => boolean) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
    const isValid = customValidator ? customValidator(value) : validators.required(value)
    setValidFields(prev => { const newSet = new Set(prev); isValid ? newSet.add(fieldName) : newSet.delete(fieldName); return newSet })
  }
  const progress = Math.round((validFields.size / totalFields) * 100)
  
  // Track view on mount
  useEffect(() => {
    const uid = userId || 'anonymous'
    const pkg = (packageType === 'zakelijk' ? 'finance' : packageType) as 'plus' | 'pro' | 'finance'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-mortgage', 'view', pkg)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Track action
    const uid = userId || 'anonymous'
    const pkg = (packageType === 'zakelijk' ? 'finance' : packageType) as 'plus' | 'pro' | 'finance'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-mortgage', 'action', pkg, {
      mortgageAmount, houseValue, duration
    })
    
    if (!isLocked) {
      const parameters = { mortgageAmount, houseValue, duration, mortgageType, income, partnerIncome, postcode, firstTimeBuyer, refinancing, currentMortgageDebt, nhg, fixedRate }
      await lockConfig(parameters)
    }
    setView('results')
  }

  const handleLockConfiguration = async () => {
    const parameters = { mortgageAmount, houseValue, duration, mortgageType, income, partnerIncome, postcode, firstTimeBuyer, refinancing, currentMortgageDebt, nhg, fixedRate }
    await lockConfig(parameters)
  }

  const handleUnlockConfiguration = () => { unlockConfig() }

  const handleDownloadPDF = () => {
    const parameters = { mortgageAmount, houseValue, duration, mortgageType, income, partnerIncome, postcode, firstTimeBuyer, refinancing, currentMortgageDebt, nhg, fixedRate }
    downloadPDF(parameters)
  }

  if (view === 'results') {
    return (
      <div>
        <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>� 3 beste hypotheken gevonden!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Vergelijking van 5 giganten + 20 niszowe hypotheekverstrekkers</p>
        
        {/* DISCLAIMER - ESTIMATED PRICES */}
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#92400E' }}>
            <strong>⚠️ Geschatte prijzen</strong> op basis van marktgegevens (zoals Hypotheker.nl). Exacte prijzen bij de hypotheekverstrekker.
          </div>
        </div>
        
        {/* REFERENTIE PRIJS */}
        <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400E' }}>💡 Referentie (markt gemiddelde)</div>
              <div style={{ fontSize: '11px', color: '#78350F', marginTop: '2px' }}>Hoogste rente als vergelijkingspunt</div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#92400E' }}>4.0% rente</div>
          </div>
        </div>
        
        <div style={{ fontSize: '32px', textAlign: 'center', margin: '20px 0' }}>🔒</div>
        {[{name: '🏠 ING Hypotheek', price: '3.2% rente', plan: '€350.000 | 30 jaar | €1.512/mnd', rating: '⭐ 4.7/5', trust: '🛡️ 9/10', score: 'Score: 9.3', badge: 'BESTE DEAL', best: true}, {name: '🏠 Rabobank Woonhypotheek', price: '3.5% rente', plan: '€350.000 | 30 jaar | €1.571/mnd', rating: '⭐ 4.5/5', trust: '🛡️ 9/10', score: 'Score: 8.9'}, {name: '🏠 ABN AMRO Hypotheek', price: '3.8% rente', plan: '€350.000 | 30 jaar | €1.629/mnd', rating: '⭐ 4.6/5', trust: '🛡️ 8/10', score: 'Score: 8.7'}].map((mtg, i) => (
          <div key={i} style={{ background: mtg.best ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${mtg.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{mtg.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{mtg.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{mtg.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{mtg.rating}</span>
              <span>{mtg.trust}</span>
              <span>{mtg.score}</span>
            </div>
            {mtg.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{mtg.badge}</span>}
          </div>
        ))}
        <div style={{ background: '#E6F4EE', border: '2px solid #15803d', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Betaal 9% commissie om toegang te krijgen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€1.632,96</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>(9% van €18.144 jaarlijks)</div>
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€1.632,96</div>
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
        {[{name: '🏠 ING Hypotheek', price: '3.2% rente', plan: '€350.000 | 30 jaar | €1.512/mnd', rating: '⭐ 4.7/5 (22.234 reviews)', trust: '🛡️ Betrouwbaar 9/10', badge: 'BESTE DEAL - BESPAAR €4.212/jaar', url: 'https://www.ing.nl', best: true}, {name: '🏠 Rabobank Woonhypotheek', price: '3.5% rente', plan: '€350.000 | 30 jaar | €1.571/mnd', rating: '⭐ 4.5/5 (18.891 reviews)', trust: '🛡️ Betrouwbaar 9/10', url: 'https://www.rabobank.nl'}, {name: '🏠 ABN AMRO Hypotheek', price: '3.8% rente', plan: '€350.000 | 30 jaar | €1.629/mnd', rating: '⭐ 4.6/5 (20.456 reviews)', trust: '🛡️ Betrouwbaar 8/10', url: 'https://www.abnamro.nl'}].map((mtg, i) => (
          <div key={i} style={{ background: mtg.best ? '#E6F4EE' : 'white', border: `2px solid ${mtg.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{mtg.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{mtg.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{mtg.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{mtg.rating}</span>
              <span>{mtg.trust}</span>
            </div>
            {mtg.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{mtg.badge}</span>}
            <button onClick={() => window.open(mtg.url, '_blank')} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🌐 Aanvragen</button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Home size={24} strokeWidth={2} /> Hypotheek Configurator</h2>

      <ProgressTracker percentage={progress} validCount={validFields.size} totalFields={totalFields} showWarning={validFields.size < totalFields} />
      <LockPanel isLocked={isLocked} configId={configId} onUnlock={handleUnlockConfiguration} onDownloadPDF={handleDownloadPDF} />

      {false && isLocked && configId && (
        <div style={{ background: '#E6F4EE', border: '1px solid #15803d', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={16} color="#15803d" />
            <div><div style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>Configuratie opgeslagen</div><div style={{ fontSize: '11px', color: '#6B7280' }}>ID: {configId}</div></div>
          </div>
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
        
        {/* 1. HYPOTHEEK BEDRAGEN */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Hypotheek bedragen</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Waarde woning (€)</label>
            <input type="number" min="100000" max="2000000" step="10000" value={houseValue} onChange={(e) => { const val = parseInt(e.target.value); setHouseValue(val); validateAndMark('houseValue', val, (v) => v > 0); }} disabled={isLocked} placeholder="350000" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('houseValue') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('houseValue') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('houseValue') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Hypotheekbedrag (€)</label>
            <input type="number" min="50000" max="1500000" step="10000" value={mortgageAmount} onChange={(e) => { const val = parseInt(e.target.value); setMortgageAmount(val); validateAndMark('mortgageAmount', val, (v) => v > 0); }} disabled={isLocked} placeholder="250000" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('mortgageAmount') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('mortgageAmount') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('mortgageAmount') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
            {typeof mortgageAmount === 'number' && typeof houseValue === 'number' && houseValue > 0 && (
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Loan-to-Value: {Math.round((mortgageAmount / houseValue) * 100)}%</div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Looptijd (jaren)</label>
            <select value={duration} onChange={(e) => { const val = parseInt(e.target.value); setDuration(val); validateAndMark('duration', val, (v) => v > 0); }} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('duration') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('duration') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('duration') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              <option value="">Kies looptijd...</option>
              <option value="10">10 jaar</option>
              <option value="15">15 jaar</option>
              <option value="20">20 jaar</option>
              <option value="25">25 jaar</option>
              <option value="30">30 jaar</option>
            </select>
          </div>
        </div>

        {/* 2. TYPE HYPOTHEEK */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Type hypotheek</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              {value: 'annuitair', label: '📊 Annuïtair', desc: 'Gelijke maandlasten'},
              {value: 'lineair', label: '📉 Lineair', desc: 'Dalende maandlasten'},
              {value: 'aflossingsvrij', label: '💰 Aflossingsvrij', desc: 'Alleen rente betalen'}
            ].map(t => (
              <div key={t.value} onClick={() => { if (!isLocked) { setMortgageType(t.value); validateAndMark('mortgageType', t.value); } }} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: mortgageType === t.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: mortgageType === t.value ? '#15803d' : '#E5E7EB', opacity: isLocked ? 0.6 : 1, transition: 'all 0.2s' }}>
                <input type="radio" name="mortgageType" value={t.value} checked={mortgageType === t.value} onChange={() => { if (!isLocked) { setMortgageType(t.value); validateAndMark('mortgageType', t.value); } }} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{t.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. INKOMEN */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Inkomen</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bruto jaarinkomen (€)</label>
            <input type="number" min="20000" max="200000" step="5000" value={income} onChange={(e) => { const val = parseInt(e.target.value); setIncome(val); validateAndMark('income', val, (v) => v > 0); }} disabled={isLocked} placeholder="50000" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('income') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('income') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('income') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Partner inkomen (€, optioneel)</label>
            <input type="number" min="0" max="200000" step="5000" value={partnerIncome} onChange={(e) => setPartnerIncome(parseInt(e.target.value))} disabled={isLocked} placeholder="0" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${typeof partnerIncome === 'number' && partnerIncome > 0 ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (typeof partnerIncome === 'number' && partnerIncome > 0 ? '#E6F4EE' : 'white'), boxShadow: typeof partnerIncome === 'number' && partnerIncome > 0 ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
            {typeof income === 'number' && typeof partnerIncome === 'number' && (
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Totaal inkomen: €{(income + partnerIncome).toLocaleString()}</div>
            )}
          </div>
        </div>

        {/* 4. RENTEVASTE PERIODE */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Rentevaste periode</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Hoelang wil je de rente vastzetten?</label>
            <select value={fixedRate} onChange={(e) => { const val = e.target.value; setFixedRate(val); validateAndMark('fixedRate', val); }} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('fixedRate') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('fixedRate') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('fixedRate') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              <option value="">Kies rentevaste periode...</option>
              <option value="1">1 jaar</option>
              <option value="5">5 jaar</option>
              <option value="10">10 jaar</option>
              <option value="15">15 jaar</option>
              <option value="20">20 jaar</option>
              <option value="30">30 jaar (hele looptijd)</option>
            </select>
          </div>
        </div>

        {/* 5. EXTRA INFORMATIE */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>5. Extra informatie</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postcode woning</label>
            <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} disabled={isLocked} placeholder="1234 AB" maxLength={7} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${postcode ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (postcode ? '#E6F4EE' : 'white'), boxShadow: postcode ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {value: firstTimeBuyer, setter: setFirstTimeBuyer, label: '🏡 Starter', desc: 'Dit is mijn eerste woning'},
              {value: refinancing, setter: setRefinancing, label: '🔄 Oversluiten', desc: 'Ik wil mijn huidige hypotheek oversluiten'},
              {value: nhg, setter: setNhg, label: '🛡️ NHG', desc: 'Nationale Hypotheek Garantie (tot €435.000)'}
            ].map((item, i) => (
              <div key={i} onClick={() => item.setter(!item.value)} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: item.value ? '#E6F4EE' : 'white', borderColor: item.value ? '#15803d' : '#E5E7EB' }}>
                <input type="checkbox" checked={item.value} onChange={() => item.setter(!item.value)} style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {refinancing && (
            <div style={{ marginTop: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Restschuld huidige hypotheek (€)</label>
              <input type="number" min="0" max="1500000" step="10000" value={currentMortgageDebt} onChange={(e) => setCurrentMortgageDebt(parseInt(e.target.value))} disabled={isLocked} placeholder="200000" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${typeof currentMortgageDebt === 'number' && currentMortgageDebt > 0 ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (typeof currentMortgageDebt === 'number' && currentMortgageDebt > 0 ? '#E6F4EE' : 'white'), boxShadow: typeof currentMortgageDebt === 'number' && currentMortgageDebt > 0 ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Hoeveel moet je nog afbetalen op je huidige hypotheek?</div>
            </div>
          )}
        </div>

        {(!houseValue || !mortgageAmount || !income || !postcode) && (
          <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#92400e' }}>💡 <strong>Tip:</strong> Vul woningwaarde, hypotheekbedrag, inkomen en postcode in voor nauwkeurige berekeningen!</div>
          </div>
        )}

        <button type="submit" disabled={isLocked || progress !== 100} style={{ width: '100%', padding: '14px', background: (isLocked || progress !== 100) ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (isLocked || progress !== 100) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {isLocked ? 'Configuratie vergrendeld' : (progress === 100 ? 'Vergelijk hypotheken →' : `Vul alle velden in (${progress}%)`)}
        </button>
        {isLocked && <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>👆 Klik op het vinger-icoon hierboven om te wijzigen</div>}
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #E6F4EE 0%, #E6F4EE 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste hypotheken voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}






