'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, ArrowLeft } from 'lucide-react'
import { useConfigurationLock } from '../../../_lib/hooks/useConfigurationLock'
import { FlowTracker } from '../../../_lib/flow-tracker'
import AgentEchoLogo from '../../AgentEchoLogo'
import ProgressTracker from '../../shared/ProgressTracker'
import LockPanel from '../../shared/LockPanel'
import { validators } from '../../../utils/validators'
import { B2BDisclaimer, B2BReferencePrice, VolumePricingTable, RFQButton, ApprovalWorkflowDisplay } from './B2BFeatures'

interface TransportConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function TransportConfigurator({ packageType = 'zakelijk', userId }: TransportConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [formData, setFormData] = useState({ type: '', route: '', cargo: '', weight: '', frequency: '', delivery: '', paymentTerms: 'net30', urgency: 'standard' })
  const [quoteData, setQuoteData] = useState<any>(null)
  
  const { isLocked, saving, configId, configTimestamp, handleLockConfiguration: lockConfig, handleUnlockConfiguration: unlockConfig, handleDownloadPDF: downloadPDF } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'transport-b2b' })
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 5
  
  const validateAndMark = (fieldName: string, value: any, customValidator?: (val: any) => boolean) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
    const isValid = customValidator ? customValidator(value) : validators.required(value)
    setValidFields(prev => { const newSet = new Set(prev); isValid ? newSet.add(fieldName) : newSet.delete(fieldName); return newSet })
  }
  const progress = Math.round((validFields.size / totalFields) * 100)
  
  useEffect(() => {
    FlowTracker.getInstance().trackEvent(userId || 'anonymous', 'configurator-transport-b2b', 'view', 'zakelijk')
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    FlowTracker.getInstance().trackEvent(userId || 'anonymous', 'configurator-transport-b2b', 'action', 'zakelijk', formData)
    if (!isLocked) await lockConfig(formData)
    setView('results')
  }
  const handleLockConfiguration = async () => { await lockConfig(formData) }
  const handleUnlockConfiguration = () => { unlockConfig() }
  const handleDownloadPDF = () => { downloadPDF(formData) }

  const types = [
    { id: 'trucks', name: 'Vrachtwagens', brands: ['Volvo', 'MAN', 'Scania', 'Mercedes'] },
    { id: 'trailers', name: 'Trailers', brands: ['Krone', 'Schmitz', 'Kögel'] },
    { id: 'forklifts', name: 'Heftrucks', brands: ['Toyota', 'Linde', 'Jungheinrich'] },
    { id: 'containers', name: 'Containers', brands: ['20ft', '40ft', '40ft HC'] }
  ]

  const selected = types.find(t => t.id === formData.type)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/business'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}><ArrowLeft size={16} />Terug</button>
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Transport & Logistiek</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Vrachtwagens, trailers, heftrucks en containers</p>
          <div style={{ marginBottom: '24px' }}>
            {types.map((t) => (
              <button key={t.id} onClick={() => setFormData({ ...formData, type: t.id, brand: '' })} style={{ padding: '16px', background: formData.type === t.id ? '#E6F4EE' : 'white', border: `2px solid ${formData.type === t.id ? '#1E7F5C' : '#e5e7eb'}`, borderRadius: '10px', cursor: 'pointer', marginBottom: '12px', width: '100%', textAlign: 'left', fontWeight: 600 }}>{t.name}</button>
            ))}
          </div>
          {selected && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Type/Merk</label>
                <select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  {selected.brands.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Conditie</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {['new', 'used'].map((c) => (
                    <button key={c} onClick={() => setFormData({ ...formData, condition: c })} style={{ padding: '12px', background: formData.condition === c ? '#E6F4EE' : 'white', border: `2px solid ${formData.condition === c ? '#1E7F5C' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{c === 'new' ? 'Nieuw' : 'Gebruikt'}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Aantal</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Levering</label>
                <input type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} placeholder="Locatie" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Betaling</label>
                <select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="lease">Lease</option>
                  <option value="finance">Financiering</option>
                  <option value="cash">Contant</option>
                </select>
              </div>
              <button onClick={handleSubmit} disabled={!formData.brand || !formData.delivery || !formData.paymentTerms} style={{ width: '100%', padding: '16px', background: formData.brand && formData.delivery && formData.paymentTerms ? '#1E7F5C' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: formData.brand && formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed' }}>🔍 Zoek beste prijzen</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

