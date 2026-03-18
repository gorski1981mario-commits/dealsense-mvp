'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, Tv } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import FilterOptions, { FilterType } from '../shared/FilterOptions'
import { validators } from '../../utils/validators'

interface SubscriptionsConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function SubscriptionsConfigurator({ packageType, userId }: SubscriptionsConfiguratorProps) {
  const [view, setView] = useState<ViewState>('configurator')
  const [filterType, setFilterType] = useState<FilterType | ''>('')
  const [subscriptionType, setSubscriptionType] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [searching, setSearching] = useState(false)
  
  // Lock/unlock state
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 3 // filterType, subscriptionType, services (at least one)
  const validateAndMark = (f: string, v: any, customValidator?: (v: any) => boolean) => { setTouchedFields(p => new Set(p).add(f)); const ok = customValidator ? customValidator(v) : validators.required(v); setValidFields(p => { const n = new Set(p); ok ? n.add(f) : n.delete(f); return n }) }
  const progress = Math.round((validFields.size / totalFields) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLocked) {
      await handleLockConfiguration()
    }
    setView('results')
  }

  const handleLockConfiguration = async () => {
    try {
      setSaving(true)
      const configData = {
        userId: userId || 'anonymous',
        sector: 'subscriptions',
        parameters: { subscriptionType, services },
        timestamp: new Date().toISOString()
      }
      const response = await fetch('/api/configurations/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configData) })
      const result = await response.json()
      if (result.success) { setConfigId(result.configId); setConfigTimestamp(configData.timestamp); setIsLocked(true) }
    } catch (error) { console.error('Error:', error) } finally { setSaving(false) }
  }

  const handleUnlockConfiguration = () => { setIsLocked(false) }

  const handleDownloadPDF = () => {
    if (!configId || !configTimestamp) return
    generateConfigurationPDF({ configId, userId: userId || 'anonymous', sector: 'subscriptions', parameters: { subscriptionType, services }, timestamp: configTimestamp })
  }

  const toggleService = (service: string) => {
    if (isLocked) return
    const newServices = services.includes(service) ? services.filter(s => s !== service) : [...services, service]
    setServices(newServices)
    validateAndMark('services', newServices, (v) => v.length > 0)
  }
  
  useEffect(() => {
    if (services.length > 0) {
      validateAndMark('services', services, (v) => v.length > 0)
    }
  }, [services])

  if (view === 'results') {
    return (
      <div>
        <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>🎉 3 beste aanbiedingen gevonden!</h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>We doorzochten de markt met Deal Score</p>
        <div style={{ fontSize: '32px', textAlign: 'center', margin: '20px 0' }}>🔒</div>
        {[{name: '📺 Netflix + Spotify Bundle', price: '€19,99/mnd', plan: 'Premium 4K + Unlimited Music', rating: '⭐ 4.8/5', trust: '🛡️ 9/10', score: 'Score: 9.4', badge: 'BESTE DEAL', best: true}, {name: '📺 Disney+ Trio', price: '€24,99/mnd', plan: 'Disney+ | Hulu | ESPN+', rating: '⭐ 4.6/5', trust: '🛡️ 9/10', score: 'Score: 9.0'}, {name: '📺 YouTube Premium Family', price: '€22,99/mnd', plan: 'Tot 6 gebruikers | Ad-free', rating: '⭐ 4.7/5', trust: '🛡️ 8/10', score: 'Score: 8.9'}].map((sub, i) => (
          <div key={i} style={{ background: sub.best ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${sub.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{sub.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{sub.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{sub.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{sub.rating}</span>
              <span>{sub.trust}</span>
              <span>{sub.score}</span>
            </div>
            {sub.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{sub.badge}</span>}
          </div>
        ))}
        <div style={{ background: '#E6F4EE', border: '2px solid #15803d', borderRadius: '12px', padding: '20px', textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>Betaal 9% commissie om toegang te krijgen</div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€21,59</div>
          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '16px' }}>(9% van €239,88 jaarlijks)</div>
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
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', margin: '12px 0' }}>€21,59</div>
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
        {[{name: '📺 Netflix + Spotify Bundle', price: '€19,99/mnd', plan: 'Premium 4K + Unlimited Music', rating: '⭐ 4.8/5 (45.234 reviews)', trust: '🛡️ Betrouwbaar 9/10', badge: 'BESTE DEAL - BESPAAR €120/jaar', url: 'https://www.netflix.com', best: true}, {name: '📺 Disney+ Trio', price: '€24,99/mnd', plan: 'Disney+ | Hulu | ESPN+', rating: '⭐ 4.6/5 (32.891 reviews)', trust: '🛡️ Betrouwbaar 9/10', url: 'https://www.disneyplus.com'}, {name: '📺 YouTube Premium Family', price: '€22,99/mnd', plan: 'Tot 6 gebruikers | Ad-free', rating: '⭐ 4.7/5 (38.456 reviews)', trust: '🛡️ Betrouwbaar 8/10', url: 'https://www.youtube.com'}].map((sub, i) => (
          <div key={i} style={{ background: sub.best ? '#E6F4EE' : 'white', border: `2px solid ${sub.best ? '#15803d' : '#E5E7EB'}`, borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{sub.name}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d' }}>{sub.price}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>{sub.plan}</div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6B7280' }}>
              <span>{sub.rating}</span>
              <span>{sub.trust}</span>
            </div>
            {sub.badge && <span style={{ display: 'inline-block', padding: '4px 10px', background: '#15803d', color: 'white', borderRadius: '6px', fontSize: '11px', fontWeight: 600, marginTop: '8px' }}>{sub.badge}</span>}
            <button onClick={() => window.open(sub.url, '_blank')} style={{ width: '100%', marginTop: '12px', padding: '10px', background: '#15803d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>🌐 Abonneren</button>
          </div>
        ))}
      </div>
    )
  }

  const streamingServices = [
    { id: 'netflix', name: '🎬 Netflix', price: '€13.99' },
    { id: 'disney', name: '🏰 Disney+', price: '€10.99' },
    { id: 'prime', name: '📦 Amazon Prime Video', price: '€8.99' },
    { id: 'spotify', name: '🎵 Spotify', price: '€10.99' },
    { id: 'youtube', name: '▶️ YouTube Premium', price: '€11.99' },
    { id: 'apple', name: '🍎 Apple TV+', price: '€6.99' },
    { id: 'hbo', name: '🎭 HBO Max', price: '€9.99' },
    { id: 'paramount', name: '⭐ Paramount+', price: '€7.99' }
  ]

  const softwareServices = [
    { id: 'office', name: '📊 Microsoft 365', price: '€6.99' },
    { id: 'adobe', name: '🎨 Adobe Creative Cloud', price: '€60.49' },
    { id: 'dropbox', name: '☁️ Dropbox', price: '€11.99' },
    { id: 'canva', name: '🖼️ Canva Pro', price: '€11.99' },
    { id: 'notion', name: '📝 Notion', price: '€8.00' },
    { id: 'github', name: '💻 GitHub Pro', price: '€4.00' }
  ]

  const newsServices = [
    { id: 'nytimes', name: '📰 New York Times', price: '€4.00' },
    { id: 'fd', name: '💼 Het Financieele Dagblad', price: '€29.00' },
    { id: 'telegraaf', name: '📰 De Telegraaf', price: '€14.99' },
    { id: 'medium', name: '✍️ Medium', price: '€5.00' }
  ]

  const getServicesByType = () => {
    switch(subscriptionType) {
      case 'streaming': return streamingServices
      case 'software': return softwareServices
      case 'news': return newsServices
      case 'all': return [...streamingServices, ...softwareServices, ...newsServices]
      default: return streamingServices
    }
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Tv size={24} strokeWidth={2} /> Abonnementen Configurator</h2>

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
        
        {/* 1. TYPE ABONNEMENT */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Type abonnementen</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Categorie</label>
            <select value={subscriptionType} onChange={(e) => { const val = e.target.value; setSubscriptionType(val); validateAndMark('subscriptionType', val); }} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: `2px solid ${validFields.has('subscriptionType') ? '#15803d' : '#E5E7EB'}`, borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : (validFields.has('subscriptionType') ? '#E6F4EE' : 'white'), boxShadow: validFields.has('subscriptionType') ? '0 0 0 3px rgba(30, 127, 92, 0.1)' : 'none', cursor: isLocked ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
              <option value="">Kies categorie...</option>
              <option value="streaming">🎬 Streaming (Video & Muziek)</option>
              <option value="software">💻 Software & Tools</option>
              <option value="news">📰 Nieuws & Media</option>
              <option value="all">🌐 Alles</option>
            </select>
          </div>
        </div>

        {/* 2. DIENSTEN SELECTIE */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Selecteer diensten</div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
            {getServicesByType().map(service => (
              <div 
                key={service.id} 
                onClick={() => !isLocked && toggleService(service.id)} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '4px',
                  padding: '12px', 
                  border: '2px solid #E5E7EB', 
                  borderRadius: '8px', 
                  cursor: isLocked ? 'not-allowed' : 'pointer', 
                  background: services.includes(service.id) ? '#E6F4EE' : (isLocked ? '#F3F4F6' : 'white'), 
                  borderColor: services.includes(service.id) ? '#15803d' : '#E5E7EB',
                  opacity: isLocked ? 0.6 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={services.includes(service.id)} 
                    onChange={() => !isLocked && toggleService(service.id)} 
                    disabled={isLocked}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }} 
                  />
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{service.name}</div>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginLeft: '24px' }}>{service.price}/maand</div>
              </div>
            ))}
          </div>
          
          {services.length > 0 && (
            <div style={{ marginTop: '12px', padding: '12px', background: '#F3F4F6', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                Geselecteerd: {services.length} dienst{services.length !== 1 ? 'en' : ''}
              </div>
            </div>
          )}
        </div>

        <button type="submit" disabled={isLocked || progress !== 100} style={{ width: '100%', padding: '14px', background: (isLocked || progress !== 100) ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: (isLocked || progress !== 100) ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {isLocked ? 'Configuratie vergrendeld' : (progress === 100 ? 'Vergelijk abonnementen →' : `Vul alle velden in (${progress}%)`)}
        </button>
        {isLocked && <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>👆 Klik op het vinger-icoon hierboven om te wijzigen</div>}
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste abonnementen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}



