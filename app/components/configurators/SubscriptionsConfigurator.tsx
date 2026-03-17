'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download } from 'lucide-react'
import AgentEchoLogo from '../AgentEchoLogo'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'
import ProgressTracker from '../shared/ProgressTracker'
import LockPanel from '../shared/LockPanel'
import { validators } from '../../utils/validators'

interface SubscriptionsConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function SubscriptionsConfigurator({ packageType = 'pro', userId }: SubscriptionsConfiguratorProps = {}) {
  const [subscriptionType, setSubscriptionType] = useState('streaming')
  const [services, setServices] = useState<string[]>([])
  const [budget, setBudget] = useState(50)
  const [users, setUsers] = useState(1)
  const [quality, setQuality] = useState('hd')
  const [bundlePreference, setBundlePreference] = useState('separate')
  const [studentDiscount, setStudentDiscount] = useState(false)
  const [familyPlan, setFamilyPlan] = useState(false)
  const [annualPayment, setAnnualPayment] = useState(false)
  const [searching, setSearching] = useState(false)
  
  // Lock/unlock state
  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeField, setActiveField] = useState<string | null>(null)
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 1
  const validateAndMark = (f: string, v: any, val?: (v: any) => boolean) => { setTouchedFields(p => new Set(p).add(f)); const ok = val ? val(v) : validators.required(v); setValidFields(p => { const n = new Set(p); ok ? n.add(f) : n.delete(f); return n }) }
  const progress = Math.round((validFields.size / totalFields) * 100)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    
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
        sector: 'subscriptions',
        parameters: { subscriptionType, services, budget, users, quality, bundlePreference, studentDiscount, familyPlan, annualPayment },
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
    generateConfigurationPDF({ configId, userId: userId || 'anonymous', sector: 'subscriptions', parameters: { subscriptionType, services, budget, users, quality, bundlePreference, studentDiscount, familyPlan, annualPayment }, timestamp: configTimestamp })
  }

  const toggleService = (service: string) => {
    if (isLocked) return
    setServices(prev => prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service])
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
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>� Abonnementen Configurator</h2>

      <ProgressTracker percentage={progress} validCount={validFields.size} totalFields={totalFields} showWarning={validFields.size < totalFields} />
      <LockPanel isLocked={isLocked} configId={configId} onUnlock={handleUnlockConfiguration} onDownloadPDF={handleDownloadPDF} />

      {false && isLocked && configId && (
        <div style={{ background: '#E6F4EE', border: '1px solid #1E7F5C', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Lock size={16} color="#1E7F5C" /><div><div style={{ fontSize: '13px', fontWeight: 600, color: '#1E7F5C' }}>Configuratie opgeslagen</div><div style={{ fontSize: '11px', color: '#6B7280' }}>ID: {configId}</div></div></div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={handleUnlockConfiguration} title="Ontgrendelen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'white', border: '2px solid #1E7F5C', borderRadius: '8px', cursor: 'pointer' }}>👆</button>
            <button type="button" onClick={handleDownloadPDF} title="Download PDF" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#1E7F5C', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Download size={18} color="white" /></button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        {/* 1. TYPE SUBSCRIPTIONS */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Type abonnementen</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Categorie</label>
            <select value={subscriptionType} onChange={(e) => setSubscriptionType(e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
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
                  borderColor: services.includes(service.id) ? '#1E7F5C' : '#E5E7EB',
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

        {/* 3. BUDGET */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Budget</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Maximaal budget per maand: €{budget}
            </label>
            <input 
              type="range" 
              min="10" 
              max="200" 
              step="5" 
              value={budget} 
              onChange={(e) => setBudget(parseInt(e.target.value))} 
              disabled={isLocked}
              style={{ width: '100%', cursor: isLocked ? 'not-allowed' : 'pointer' }} 
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
              <span>€10</span>
              <span>€200</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Aantal gebruikers</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#F3F4F6', borderRadius: '10px', padding: '8px 12px', width: 'fit-content' }}>
              <button type="button" onClick={() => !isLocked && users > 1 && setUsers(users - 1)} disabled={users <= 1 || isLocked} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'white', color: '#111827', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>−</button>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', minWidth: '25px', textAlign: 'center' }}>{users}</div>
              <button type="button" onClick={() => !isLocked && users < 6 && setUsers(users + 1)} disabled={users >= 6 || isLocked} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: 'white', color: '#111827', fontSize: '16px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>+</button>
            </div>
          </div>
        </div>

        {/* 4. VOORKEUREN */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Voorkeuren</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Kwaliteit (streaming)</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
              <option value="sd">📺 SD (Standard Definition)</option>
              <option value="hd">🎬 HD (High Definition)</option>
              <option value="4k">✨ 4K Ultra HD</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bundle voorkeur</label>
            <select value={bundlePreference} onChange={(e) => setBundlePreference(e.target.value)} disabled={isLocked} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: isLocked ? '#F3F4F6' : 'white', cursor: isLocked ? 'not-allowed' : 'pointer' }}>
              <option value="separate">📦 Losse abonnementen</option>
              <option value="bundle">🎁 Bundel deals (goedkoper)</option>
              <option value="both">🔄 Beide opties tonen</option>
            </select>
          </div>
        </div>

        {/* 5. EXTRA OPTIES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>5. Extra opties</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {value: studentDiscount, setter: setStudentDiscount, label: '🎓 Studentenkorting', desc: 'Ik ben student'},
              {value: familyPlan, setter: setFamilyPlan, label: '👨‍👩‍👧‍👦 Familie abonnement', desc: 'Voor meerdere gebruikers'},
              {value: annualPayment, setter: setAnnualPayment, label: '💰 Jaarlijks betalen', desc: 'Vaak goedkoper dan maandelijks'}
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

        <button type="submit" disabled={isLocked} style={{ width: '100%', padding: '14px', background: isLocked ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: isLocked ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {isLocked ? 'Configuratie vergrendeld' : 'Vergelijk abonnementen →'}
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
