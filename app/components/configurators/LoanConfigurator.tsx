'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, Banknote } from 'lucide-react'
import { useConfigurationLock } from '../../_lib/hooks/useConfigurationLock'
import { useConfiguratorSearch } from '../../_hooks/useConfiguratorSearch'
import { FlowTracker } from '../../_lib/flow-tracker'
import AgentEchoLogo from '../AgentEchoLogo'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators } from '../../utils/validators'

interface LoanConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function LoanConfigurator({ packageType = 'pro', userId }: LoanConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  const [amount, setAmount] = useState<number | ''>('')
  const [duration, setDuration] = useState<number | ''>('')
  const [purpose, setPurpose] = useState('')
  const [income, setIncome] = useState<number | ''>('')
  const [employmentType, setEmploymentType] = useState('')
  const [bkr, setBkr] = useState(false)
  const [coApplicant, setCoApplicant] = useState(false)
  const [homeOwner, setHomeOwner] = useState(false)
  const [searching, setSearching] = useState(false)
  
  const {
    isLocked,
    saving,
    configId,
    configTimestamp,
    handleLockConfiguration: lockConfig,
    handleUnlockConfiguration: unlockConfig,
    handleDownloadPDF: downloadPDF
  } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'loan' })
  const [activeField, setActiveField] = useState<string | null>(null)
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 6 // filterType, amount, duration, purpose, income, employmentType
  const validateAndMark = (f: string, v: any, customValidator?: (v: any) => boolean) => { setTouchedFields(p => new Set(p).add(f)); const ok = customValidator ? customValidator(v) : validators.required(v); setValidFields(p => { const n = new Set(p); ok ? n.add(f) : n.delete(f); return n }) }
  const progress = Math.round((validFields.size / totalFields) * 100)
  
  // Track view on mount
  useEffect(() => {
    const uid = userId || 'anonymous'
    const pkg = (packageType === 'zakelijk' ? 'finance' : packageType) as 'plus' | 'pro' | 'finance'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-loan', 'view', pkg)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Track action
    const uid = userId || 'anonymous'
    const pkg = (packageType === 'zakelijk' ? 'finance' : packageType) as 'plus' | 'pro' | 'finance'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-loan', 'action', pkg, {
      amount, duration, purpose
    })
    
    if (!isLocked) {
      const parameters = { amount, duration, purpose, income, employmentType, bkr, coApplicant, homeOwner }
      await lockConfig(parameters)
    }
    setView('results')
  }

  const handleLockConfiguration = async () => {
    const parameters = { amount, duration, purpose, income, employmentType, bkr, coApplicant, homeOwner }
    await lockConfig(parameters)
  }

  const handleUnlockConfiguration = () => { unlockConfig() }

  const handleDownloadPDF = () => {
    const parameters = { amount, duration, purpose, income, employmentType, bkr, coApplicant, homeOwner }
    downloadPDF(parameters)
  }

  if (view === 'results') {
    return (
      <div>
        <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>💰 3 beste leningen gevonden!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Vergelijking van 4 giganten + 16 niszowe kredytodawców</p>
        
        {/* DISCLAIMER */}
        <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: '#92400E' }}>
            <strong>⚠️ Geschatte prijzen</strong> op basis van marktgegevens (zoals Geldshop.nl). Exacte prijzen bij de kredietverstrekker.
          </div>
        </div>
        
        {/* REFERENTIE PRIJS */}
        <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400E' }}>💡 Referentie (markt gemiddelde)</div>
              <div style={{ fontSize: '11px', color: '#78350F', marginTop: '2px' }}>Hoogste rente als vergelijkingspunt</div>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#92400E' }}>7.5% APR</div>
          </div>
        </div>
        
        <div style={{ fontSize: '32px', textAlign: 'center', margin: '20px 0' }}>🔒</div>
        {[{name: '💰 ING Persoonlijke Lening', price: '4.2% rente', plan: '€15.000 | 60 mnd | €276/mnd', rating: '⭐ 4.6/5', trust: '🛡️ 9/10', score: 'Score: 9.2', badge: 'BESTE DEAL', best: true}, {name: '💰 ABN AMRO Doorlopend Krediet', price: '5.1% rente', plan: '€15.000 | 60 mnd | €283/mnd', rating: '⭐ 4.4/5', trust: '🛡️ 8/10', score: 'Score: 8.7'}, {name: '💰 Rabobank Lening', price: '5.8% rente', plan: '€15.000 | 60 mnd | €289/mnd', rating: '⭐ 4.5/5', trust: '🛡️ 9/10', score: 'Score: 8.8'}].map((loan, i) => (
          <div key={i} style={{ background: loan.best ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${loan.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{loan.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{loan.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{loan.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{loan.rating}</span>
              <span>{loan.trust}</span>
              <span>{loan.score}</span>
            </div>
            {loan.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{loan.badge}</span>}
          </div>
        ))}
        <div style={{ background: '#E6F4EE', border: '2px solid #15803d', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Betaal 9% commissie om toegang te krijgen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€149,04</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>(9% van €1.656 jaarlijks)</div>
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€149,04</div>
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
        {[{name: '💰 ING Persoonlijke Lening', price: '4.2% rente', plan: '€15.000 | 60 mnd | €276/mnd', rating: '⭐ 4.6/5 (14.234 reviews)', trust: '🛡️ Betrouwbaar 9/10', badge: 'BESTE DEAL - BESPAAR €780', url: 'https://www.ing.nl', best: true}, {name: '💰 ABN AMRO Doorlopend Krediet', price: '5.1% rente', plan: '€15.000 | 60 mnd | €283/mnd', rating: '⭐ 4.4/5 (11.891 reviews)', trust: '🛡️ Betrouwbaar 8/10', url: 'https://www.abnamro.nl'}, {name: '💰 Rabobank Lening', price: '5.8% rente', plan: '€15.000 | 60 mnd | €289/mnd', rating: '⭐ 4.5/5 (13.456 reviews)', trust: '🛡️ Betrouwbaar 9/10', url: 'https://www.rabobank.nl'}].map((loan, i) => (
          <div key={i} style={{ background: loan.best ? '#E6F4EE' : 'white', border: `2px solid ${loan.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{loan.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{loan.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{loan.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{loan.rating}</span>
              <span>{loan.trust}</span>
            </div>
            {loan.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{loan.badge}</span>}
            <button onClick={() => window.open(loan.url, '_blank')} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🌐 Aanvragen</button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Banknote size={24} strokeWidth={2} /> Lening Configurator</h2>

      <ProgressTracker percentage={progress} validCount={validFields.size} totalFields={totalFields} showWarning={validFields.size < totalFields} />
      <LockPanel isLocked={isLocked} configId={configId} onUnlock={handleUnlockConfiguration} onDownloadPDF={handleDownloadPDF} />

      {false && isLocked && configId && (
        <div style={{ background: '#E6F4EE', border: '1px solid #15803d', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={16} color="#15803d" /><div><div style={{ fontSize: '13px', fontWeight: 600, color: '#15803d' }}>Configuratie opgeslagen</div><div style={{ fontSize: '11px', color: '#6B7280' }}>ID: {configId}</div></div></div>
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
        
        {/* 1. LENING DETAILS */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Lening details</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bedrag (€)</label>
            <input type="number" min="1000" max="75000" step="500" value={amount} onChange={(e) => { const val = parseInt(e.target.value); setAmount(val); validateAndMark('amount', val, (v) => v > 0); }} disabled={isLocked} placeholder="10000" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('amount') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('amount') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('amount') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Looptijd (maanden)</label>
            <input type="number" min="12" max="120" step="12" value={duration} onChange={(e) => { const val = parseInt(e.target.value); setDuration(val); validateAndMark('duration', val, (v) => v > 0); }} disabled={isLocked} placeholder="60" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('duration') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('duration') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('duration') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Doel van de lening</label>
            <select value={purpose} onChange={(e) => { const val = e.target.value; setPurpose(val); validateAndMark('purpose', val); }} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('purpose') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('purpose') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('purpose') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              <option value="">Kies doel...</option>
              <option value="verbouwing">🏗️ Verbouwing/renovatie</option>
              <option value="auto">🚗 Auto aankoop</option>
              <option value="studie">🎓 Studie/opleiding</option>
              <option value="schuld">💳 Schulden samenvoegen</option>
              <option value="bruiloft">💍 Bruiloft</option>
              <option value="vakantie">✈️ Vakantie</option>
              <option value="vrij">🎯 Vrij te besteden</option>
            </select>
          </div>
        </div>

        {/* 2. PERSOONLIJKE SITUATIE */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Persoonlijke situatie</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bruto jaarinkomen (€)</label>
            <input type="number" min="15000" max="150000" step="5000" value={income} onChange={(e) => { const val = parseInt(e.target.value); setIncome(val); validateAndMark('income', val, (v) => v > 0); }} disabled={isLocked} placeholder="40000" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('income') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('income') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('income') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Type dienstverband</label>
            <select value={employmentType} onChange={(e) => { const val = e.target.value; setEmploymentType(val); validateAndMark('employmentType', val); }} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('employmentType') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('employmentType') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('employmentType') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              <option value="">Kies dienstverband...</option>
              <option value="vast">💼 Vast contract</option>
              <option value="tijdelijk">📄 Tijdelijk contract</option>
              <option value="zzp">👨‍💻 ZZP/Zelfstandige</option>
              <option value="pensioen">👴 Pensioen/AOW</option>
              <option value="uitkering">💵 Uitkering</option>
            </select>
          </div>
        </div>

        {/* 3. EXTRA INFORMATIE */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Extra informatie</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[{value: bkr, setter: setBkr, label: '⚠️ BKR registratie', desc: 'Ik heb een BKR-registratie'}, {value: coApplicant, setter: setCoApplicant, label: '👥 Mede-aanvrager', desc: 'Ik vraag samen met partner aan'}, {value: homeOwner, setter: setHomeOwner, label: '🏠 Eigen woning', desc: 'Ik ben eigenaar van een woning'}].map((item, i) => (
              <div key={i} onClick={() => item.setter(!item.value)} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: item.value ? '#E6F4EE' : 'white', borderColor: item.value ? '#15803d' : '#E5E7EB' }}>
                <input type="checkbox" checked={item.value} onChange={() => item.setter(!item.value)} style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {(!amount || !duration || !purpose || !income) && (
          <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#92400e' }}>💡 <strong>Tip:</strong> Vul bedrag, looptijd, doel en inkomen in voor nauwkeurige aanbiedingen!</div>
          </div>
        )}

        <button type="submit" disabled={isLocked || progress !== 100} style={{ width: '100%', padding: '14px', background: (isLocked || progress !== 100) ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (isLocked || progress !== 100) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {isLocked ? 'Configuratie vergrendeld' : (progress === 100 ? 'Vergelijk leningen →' : `Vul alle velden in (${progress}%)`)}
        </button>
        {isLocked && <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>👆 Klik op het vinger-icoon hierboven om te wijzigen</div>}
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste leningen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}




