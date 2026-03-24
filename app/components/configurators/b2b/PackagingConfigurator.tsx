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

interface PackagingConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function PackagingConfigurator({ packageType = 'zakelijk', userId }: PackagingConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [formData, setFormData] = useState({ type: '', size: '', quantity: '', printing: false, delivery: '', paymentTerms: 'net30', urgency: 'standard' })
  const [quoteData, setQuoteData] = useState<any>(null)
  
  const { isLocked, saving, configId, configTimestamp, handleLockConfiguration: lockConfig, handleUnlockConfiguration: unlockConfig, handleDownloadPDF: downloadPDF } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'packaging-b2b' })
  
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
    FlowTracker.getInstance().trackEvent(userId || 'anonymous', 'configurator-packaging-b2b', 'view', 'zakelijk')
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    FlowTracker.getInstance().trackEvent(userId || 'anonymous', 'configurator-packaging-b2b', 'action', 'zakelijk', formData)
    if (!isLocked) await lockConfig(formData)
    setView('results')
  }
  
  const handleLockConfiguration = async () => { await lockConfig(formData) }
  const handleUnlockConfiguration = () => { unlockConfig() }
  const handleDownloadPDF = () => { downloadPDF(formData) }

  const types = [
    { id: 'cardboard', name: 'Kartonnen dozen', sizes: ['Small (20x15x10)', 'Medium (40x30x30)', 'Large (60x40x40)', 'Custom'] },
    { id: 'pallets', name: 'Pallets', sizes: ['Euro (120x80)', 'Block (100x120)', 'Custom'] },
    { id: 'stretch', name: 'Stretchfolie', sizes: ['500mm x 300m', '500mm x 1500m', 'Machine roll'] },
    { id: 'bags', name: 'Zakken & Tassen', sizes: ['Small', 'Medium', 'Large', 'Custom'] }
  ]

  const selected = types.find(t => t.id === formData.type)

  if (view === 'results') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>📊 3 beste B2B quotes gevonden!</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>{formData.type} - {formData.quantity} units</p>
          <B2BDisclaimer category="packaging" />
          <B2BReferencePrice price={18000} label="Referentie (hoogste marktprijs)" />
          <VolumePricingTable tiers={[{ tier: 'Small (100-1K)', minQty: 100, maxQty: 1000, discount: '0%', unitPrice: '€0.18', sampleTotal: '€180' }, { tier: 'Medium (1K-10K)', minQty: 1001, maxQty: 10000, discount: '15%', unitPrice: '€0.15', sampleTotal: '€1,500' }, { tier: 'Large (10K-100K)', minQty: 10001, maxQty: 100000, discount: '25%', unitPrice: '€0.14', sampleTotal: '€14,000' }, { tier: 'Bulk (100K+)', minQty: 100001, maxQty: '∞', discount: '35%', unitPrice: '€0.12', sampleTotal: '€12,000' }]} />
          <ApprovalWorkflowDisplay workflow={{ required: false, level: 'auto-approved', approvers: [], message: 'Order auto-approved (under €5,000)' }} totalValue={3500} />
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>🏆 Top 5 Providers</h3>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ padding: '16px', background: i === 1 ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${i === 1 ? '#15803D' : '#E5E7EB'}`, borderRadius: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '💎'} Provider #{i}</div><div style={{ fontSize: '12px', color: '#6B7280' }}>Rating: {(9.1 - (i * 0.2)).toFixed(1)} ⭐</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#15803D' }}>€{(16000 - (i * 1000)).toLocaleString('nl-NL')}</div><div style={{ fontSize: '12px', color: '#6B7280' }}>Save €{(2000 - (i * 200)).toLocaleString('nl-NL')}</div></div>
                </div>
              </div>
            ))}
          </div>
          <RFQButton onClick={() => setView('payment')} />
          <div style={{ fontSize: '11px', color: '#6B7280', textAlign: 'center', marginTop: '16px' }}>🔒 Provider names revealed after payment</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <AgentEchoLogo />
        <button onClick={() => window.location.href = '/business'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}><ArrowLeft size={16} />Terug</button>
        <ProgressTracker percentage={progress} validCount={validFields.size} totalFields={totalFields} showWarning={validFields.size < totalFields} />
        <LockPanel isLocked={isLocked} configId={configId} onUnlock={handleUnlockConfiguration} onDownloadPDF={handleDownloadPDF} />
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Verpakkingsmaterialen</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Dozen, pallets, folie en meer</p>
          <div style={{ marginBottom: '24px' }}>
            {types.map((t) => (
              <button key={t.id} onClick={() => setFormData({ ...formData, type: t.id, size: '' })} style={{ padding: '16px', background: formData.type === t.id ? '#E6F4EE' : 'white', border: `2px solid ${formData.type === t.id ? '#1E7F5C' : '#e5e7eb'}`, borderRadius: '10px', cursor: 'pointer', marginBottom: '12px', width: '100%', textAlign: 'left', fontWeight: 600 }}>{t.name}</button>
            ))}
          </div>
          {selected && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Maat</label>
                <select value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  {selected.sizes.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Hoeveelheid</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="Bijv. 1000" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}>
                <input type="checkbox" checked={formData.printing} onChange={(e) => setFormData({ ...formData, printing: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                <span>Bedrukt met logo</span>
              </label>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Levering</label>
                <input type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} placeholder="Locatie" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Betaling</label>
                <select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="prepaid">Vooruitbetaling</option>
                  <option value="net30">Net 30</option>
                </select>
              </div>
              <button onClick={handleSubmit} disabled={!formData.size || !formData.quantity || !formData.delivery || !formData.paymentTerms} style={{ width: '100%', padding: '16px', background: formData.size && formData.quantity && formData.delivery && formData.paymentTerms ? '#1E7F5C' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: formData.size && formData.quantity && formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed' }}>🔍 Zoek beste prijzen</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


