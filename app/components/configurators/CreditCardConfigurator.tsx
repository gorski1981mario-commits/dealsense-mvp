'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, CreditCard } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { useConfigurationLock } from '../../_lib/hooks/useConfigurationLock'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators } from '../../utils/validators'

interface CreditCardConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function CreditCardConfigurator({ packageType = 'pro', userId }: CreditCardConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  const [cardType, setCardType] = useState('')
  const [limit, setLimit] = useState<number | ''>('')
  const [usage, setUsage] = useState('')
  const [rewards, setRewards] = useState('')
  const [income, setIncome] = useState<number | ''>('')
  const [travelInsurance, setTravelInsurance] = useState(false)
  const [purchaseProtection, setPurchaseProtection] = useState(false)
  const [contactless, setContactless] = useState(false)
  const [secondCard, setSecondCard] = useState(false)
  const [searching, setSearching] = useState(false)
  
  const {
    isLocked,
    saving,
    configId,
    configTimestamp,
    handleLockConfiguration: lockConfig,
    handleUnlockConfiguration: unlockConfig,
    handleDownloadPDF: downloadPDF
  } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'creditcard' })
  const [activeField, setActiveField] = useState<string | null>(null)
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 5 // filterType, cardType, limit, usage, income
  const validateAndMark = (f: string, v: any, customValidator?: (v: any) => boolean) => { setTouchedFields(p => new Set(p).add(f)); const ok = customValidator ? customValidator(v) : validators.required(v); setValidFields(p => { const n = new Set(p); ok ? n.add(f) : n.delete(f); return n }) }
  const progress = Math.round((validFields.size / totalFields) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLocked) {
      const parameters = { cardType, limit, usage, rewards, income, travelInsurance, purchaseProtection, contactless, secondCard }
      await lockConfig(parameters)
    }
    setView('results')
  }

  const handleLockConfiguration = async () => {
    const parameters = { cardType, limit, usage, rewards, income, travelInsurance, purchaseProtection, contactless, secondCard }
    await lockConfig(parameters)
  }

  const handleUnlockConfiguration = () => { unlockConfig() }

  const handleDownloadPDF = () => {
    const parameters = { cardType, limit, usage, rewards, income, travelInsurance, purchaseProtection, contactless, secondCard }
    downloadPDF(parameters)
  }

  if (view === 'results') {
    return (
      <div>
        <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>🎉 3 beste aanbiedingen gevonden!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>We doorzochten de markt met Deal Score</p>
        <div style={{ fontSize: '32px', textAlign: 'center', margin: '20px 0' }}>🔒</div>
        {[{name: '💳 ING Gold Card', price: '€0/jaar', rewards: 'Cashback 1% + Reisverzekering', rating: '⭐ 4.7/5', trust: '🛡️ 9/10', score: 'Score: 9.3', badge: 'BESTE DEAL', best: true}, {name: '💳 ABN AMRO Premium', price: '€45/jaar', rewards: 'Miles 2% + Lounge toegang', rating: '⭐ 4.5/5', trust: '🛡️ 9/10', score: 'Score: 8.9'}, {name: '💳 Rabobank Platinum', price: '€75/jaar', rewards: 'Cashback 2% + Concierge', rating: '⭐ 4.6/5', trust: '🛡️ 8/10', score: 'Score: 8.7'}].map((card, i) => (
          <div key={i} style={{ background: card.best ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${card.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{card.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{card.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{card.rewards}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{card.rating}</span>
              <span>{card.trust}</span>
              <span>{card.score}</span>
            </div>
            {card.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{card.badge}</span>}
          </div>
        ))}
        <div style={{ background: '#E6F4EE', border: '2px solid #15803d', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Betaal 9% commissie om toegang te krijgen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€0</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>(Gratis kaart - geen commissie)</div>
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€0</div>
          <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>Gratis kaart - geen commissie</div>
          <button onClick={() => setView('unlocked')} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #15803d 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>Bekijk deals →</button>
        </div>
      </div>
    )
  }

  if (view === 'unlocked') {
    return (
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>✅ Toegang verkregen!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>Je hebt nu toegang tot de 3 beste deals</p>
        {[{name: '💳 ING Gold Card', price: '€0/jaar', rewards: 'Cashback 1% + Reisverzekering', rating: '⭐ 4.7/5 (18.234 reviews)', trust: '🛡️ Betrouwbaar 9/10', badge: 'BESTE DEAL - GRATIS', url: 'https://www.ing.nl', best: true}, {name: '💳 ABN AMRO Premium', price: '€45/jaar', rewards: 'Miles 2% + Lounge toegang', rating: '⭐ 4.5/5 (12.891 reviews)', trust: '🛡️ Betrouwbaar 9/10', url: 'https://www.abnamro.nl'}, {name: '💳 Rabobank Platinum', price: '€75/jaar', rewards: 'Cashback 2% + Concierge', rating: '⭐ 4.6/5 (15.456 reviews)', trust: '🛡️ Betrouwbaar 8/10', url: 'https://www.rabobank.nl'}].map((card, i) => (
          <div key={i} style={{ background: card.best ? '#E6F4EE' : 'white', border: `2px solid ${card.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{card.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{card.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{card.rewards}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{card.rating}</span>
              <span>{card.trust}</span>
            </div>
            {card.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{card.badge}</span>}
            <button onClick={() => window.open(card.url, '_blank')} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🌐 Aanvragen</button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={24} strokeWidth={2} /> Creditcard Configurator</h2>

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
        
        {/* 1. KAART TYPE */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Kaart type</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Netwerk</label>
            <select value={cardType} onChange={(e) => { const val = e.target.value; setCardType(val); validateAndMark('cardType', val); }} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('cardType') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('cardType') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('cardType') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              <option value="">Kies netwerk...</option>
              <option value="visa">� Visa</option>
              <option value="mastercard">🔴 Mastercard</option>
              <option value="amex">🔵 American Express</option>
              <option value="vpay">V Pay (alleen Europa)</option>
              <option value="maestro">Maestro</option>
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gewenste limiet (€)</label>
            <input type="number" min="500" max="15000" step="500" value={limit} onChange={(e) => { const val = parseInt(e.target.value); setLimit(val); validateAndMark('limit', val, (v) => v > 0); }} disabled={isLocked} placeholder="2000" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('limit') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('limit') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('limit') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gebruik</label>
            <select value={usage} onChange={(e) => { const val = e.target.value; setUsage(val); validateAndMark('usage', val); }} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('usage') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('usage') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('usage') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              <option value="">Kies gebruik...</option>
              <option value="dagelijks">�️ Dagelijkse aankopen</option>
              <option value="reizen">✈️ Reizen & vakanties</option>
              <option value="zakelijk">💼 Zakelijk gebruik</option>
              <option value="online">💻 Online shopping</option>
              <option value="noodgeval">🆘 Noodgevallen/reserve</option>
            </select>
          </div>
        </div>

        {/* 2. REWARDS & VOORDELEN */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Rewards & voordelen</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Rewards programma</label>
            <select value={rewards} onChange={(e) => setRewards(e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${rewards ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (rewards ? '#E6F4EE' : 'white'), boxShadow: rewards ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              <option value="cashback">💵 Cashback (geld terug)</option>
              <option value="miles">✈️ Vliegtuig miles</option>
              <option value="punten">⭐ Spaarpunten</option>
              <option value="korting">🎫 Kortingen bij partners</option>
              <option value="geen">❌ Geen rewards (goedkoper)</option>
            </select>
          </div>

        </div>

        {/* 3. PERSOONLIJKE INFO */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Persoonlijke informatie</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bruto jaarinkomen (€)</label>
            <input type="number" min="15000" max="100000" step="5000" value={income} onChange={(e) => { const val = parseInt(e.target.value); setIncome(val); validateAndMark('income', val, (v) => v > 0); }} disabled={isLocked} placeholder="30000" style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('income') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('income') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('income') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'text', transition: 'all 0.2s' }} />
          </div>
        </div>

        {/* 4. EXTRA OPTIES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Extra opties</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[{value: travelInsurance, setter: setTravelInsurance, label: '✈️ Reisverzekering', desc: 'Gratis verzekering bij reizen'}, {value: purchaseProtection, setter: setPurchaseProtection, label: '🛡️ Aankoopbescherming', desc: 'Bescherming tegen schade/diefstal'}, {value: contactless, setter: setContactless, label: '📶 Contactloos betalen', desc: 'NFC/tap-to-pay functie'}, {value: secondCard, setter: setSecondCard, label: '👥 Tweede kaart', desc: 'Extra kaart voor partner/kind'}].map((item, i) => (
              <div key={i} onClick={() => !isLocked && item.setter(!item.value)} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: isLocked ? 'not-allowed' : 'pointer', background: item.value ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), borderColor: item.value ? '#15803d' : '#E5E7EB', opacity: isLocked ? 0.6 : 1 }}>
                <input type="checkbox" checked={item.value} onChange={() => !isLocked && item.setter(!item.value)} disabled={isLocked} style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!cardType && (
          <div style={{ padding: '12px', background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '8px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', color: '#92400e' }}>💡 <strong>Tip:</strong> Vul meer gegevens in voor nauwkeurigere aanbiedingen!</div>
          </div>
        )}

        <button type="submit" disabled={isLocked || progress !== 100} style={{ width: '100%', padding: '14px', background: (isLocked || progress !== 100) ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (isLocked || progress !== 100) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {isLocked ? 'Configuratie vergrendeld' : (progress === 100 ? 'Vergelijk creditcards →' : `Vul alle velden in (${progress}%)`)}
        </button>
        {isLocked && <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>👆 Klik op het vinger-icoon hierboven om te wijzigen</div>}
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste creditcards voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}




