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

interface ElectronicsConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function ElectronicsConfigurator({ packageType = 'zakelijk', userId }: ElectronicsConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [formData, setFormData] = useState({ category: '', product: '', quantity: '', packaging: '', delivery: '', paymentTerms: 'net30', urgency: 'standard' })
  const [quoteData, setQuoteData] = useState<any>(null)
  
  const { isLocked, saving, configId, configTimestamp, handleLockConfiguration: lockConfig, handleUnlockConfiguration: unlockConfig, handleDownloadPDF: downloadPDF } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'electronics-b2b' })
  
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
    FlowTracker.getInstance().trackEvent(userId || 'anonymous', 'configurator-electronics-b2b', 'view', 'zakelijk')
  }, [])

  const categories = [
    { id: 'semiconductors', name: 'Halfgeleiders', products: ['MCU', 'FPGA', 'Memory chips', 'Power ICs'] },
    { id: 'pcb', name: 'PCB & Assemblies', products: ['Single-layer PCB', 'Multi-layer PCB', 'Flex PCB', 'PCBA'] },
    { id: 'sensors', name: 'Sensoren', products: ['Temperature', 'Pressure', 'Proximity', 'Optical'] },
    { id: 'connectors', name: 'Connectoren', products: ['USB', 'HDMI', 'RJ45', 'Terminal blocks'] }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    FlowTracker.getInstance().trackEvent(userId || 'anonymous', 'configurator-electronics-b2b', 'action', 'zakelijk', formData)
    if (!isLocked) await lockConfig(formData)
    setView('results')
  }
  
  const handleLockConfiguration = async () => { await lockConfig(formData) }
  const handleUnlockConfiguration = () => { unlockConfig() }
  const handleDownloadPDF = () => { downloadPDF(formData) }

  const selected = categories.find(c => c.id === formData.category)

  if (view === 'results') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>📊 3 beste B2B quotes gevonden!</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>{formData.product} - {formData.quantity} stuks</p>
          <B2BDisclaimer category="electronics" />
          <B2BReferencePrice price={35000} label="Referentie (hoogste marktprijs)" />
          <VolumePricingTable tiers={[{ tier: 'Small (1-1K)', minQty: 1, maxQty: 1000, discount: '0%', unitPrice: '€3.50', sampleTotal: '€3,500' }, { tier: 'Medium (1K-10K)', minQty: 1001, maxQty: 10000, discount: '15%', unitPrice: '€2.98', sampleTotal: '€29,800' }, { tier: 'Large (10K-100K)', minQty: 10001, maxQty: 100000, discount: '25%', unitPrice: '€2.63', sampleTotal: '€263,000' }, { tier: 'Bulk (100K+)', minQty: 100001, maxQty: '∞', discount: '35%', unitPrice: '€2.28', sampleTotal: '€228,000' }]} />
          <ApprovalWorkflowDisplay workflow={{ required: true, level: 'director', approvers: ['Finance Director'], message: 'Requires director approval (€25,000+)' }} totalValue={28000} />
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>🏆 Top 5 Providers</h3>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ padding: '16px', background: i === 1 ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${i === 1 ? '#15803D' : '#E5E7EB'}`, borderRadius: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '💎'} Provider #{i}</div><div style={{ fontSize: '12px', color: '#6B7280' }}>Rating: {(9.2 - (i * 0.2)).toFixed(1)} ⭐</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#15803D' }}>€{(30000 - (i * 2000)).toLocaleString('nl-NL')}</div><div style={{ fontSize: '12px', color: '#6B7280' }}>Save €{(5000 - (i * 500)).toLocaleString('nl-NL')}</div></div>
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
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Industrial Electronics</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Semiconductors, PCB, sensors en meer</p>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Categorie</label>
            <div style={{ display: 'grid', gap: '12px' }}>
              {categories.map((c) => (
                <button key={c.id} onClick={() => setFormData({ ...formData, category: c.id, product: '' })} style={{ padding: '16px', background: formData.category === c.id ? '#E6F4EE' : 'white', border: `2px solid ${formData.category === c.id ? '#1E7F5C' : '#e5e7eb'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>{c.name}</button>
              ))}
            </div>
          </div>
          {selected && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Product</label>
                <select value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  {selected.products.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Hoeveelheid (stuks)</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="Bijv. 10000" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Verpakking</label>
                <select value={formData.packaging} onChange={(e) => setFormData({ ...formData, packaging: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="reel">Reel/Tape</option>
                  <option value="tray">Tray</option>
                  <option value="tube">Tube</option>
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Levering</label>
                <input type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} placeholder="Bijv. Eindhoven" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Betaling</label>
                <select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="prepaid">Vooruitbetaling</option>
                  <option value="net30">Net 30</option>
                </select>
              </div>
              <button onClick={handleSubmit} disabled={!formData.product || !formData.quantity || !formData.delivery || !formData.paymentTerms} style={{ width: '100%', padding: '16px', background: formData.product && formData.quantity && formData.delivery && formData.paymentTerms ? '#1E7F5C' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: formData.product && formData.quantity && formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed' }}>🔍 Request for Quote (RFQ)</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}



