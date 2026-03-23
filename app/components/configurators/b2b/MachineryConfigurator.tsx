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

interface MachineryConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function MachineryConfigurator({ packageType = 'zakelijk', userId }: MachineryConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    model: '',
    condition: 'new',
    quantity: '1',
    warranty: '',
    installation: false,
    training: false,
    delivery: '',
    paymentTerms: 'net30',
    urgency: 'standard'
  })
  const [quoteData, setQuoteData] = useState<any>(null)
  
  const { isLocked, saving, configId, configTimestamp, handleLockConfiguration: lockConfig, handleUnlockConfiguration: unlockConfig, handleDownloadPDF: downloadPDF } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'machinery-b2b' })
  
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
    FlowTracker.getInstance().trackEvent(userId || 'anonymous', 'configurator-machinery-b2b', 'view', 'zakelijk')
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    FlowTracker.getInstance().trackEvent(userId || 'anonymous', 'configurator-machinery-b2b', 'action', 'zakelijk', formData)
    if (!isLocked) await lockConfig(formData)
    setView('results')
  }
  
  const handleLockConfiguration = async () => { await lockConfig(formData) }
  const handleUnlockConfiguration = () => { unlockConfig() }
  const handleDownloadPDF = () => { downloadPDF(formData) }

  const types = [
    { id: 'cnc', name: 'CNC Machines', brands: ['Haas', 'DMG Mori', 'Mazak', 'Fanuc'] },
    { id: 'robots', name: 'Industrial Robots', brands: ['ABB', 'Fanuc', 'Kuka', 'Yaskawa'] },
    { id: 'presses', name: 'Hydraulic Presses', brands: ['Schuler', 'Aida', 'Komatsu'] },
    { id: 'lathes', name: 'Lathes & Mills', brands: ['Haas', 'Doosan', 'Okuma'] },
    { id: 'packaging', name: 'Packaging Machines', brands: ['Bosch', 'IMA', 'Tetra Pak'] }
  ]

  const selectedType = types.find(t => t.id === formData.type)

  if (view === 'results') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>📊 3 beste B2B quotes gevonden!</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>{formData.type} - {formData.brand} - {formData.quantity} units</p>
          <B2BDisclaimer category="machinery" />
          <B2BReferencePrice price={450000} label="Referentie (hoogste marktprijs)" />
          <VolumePricingTable tiers={[{ tier: '1 unit', minQty: 1, maxQty: 1, discount: '0%', unitPrice: '€450,000', sampleTotal: '€450,000' }, { tier: '2-3 units', minQty: 2, maxQty: 3, discount: '5%', unitPrice: '€427,500', sampleTotal: '€1,282,500' }, { tier: '4-10 units', minQty: 4, maxQty: 10, discount: '12%', unitPrice: '€396,000', sampleTotal: '€3,960,000' }, { tier: '10+ units', minQty: 11, maxQty: '∞', discount: '18%', unitPrice: '€369,000', sampleTotal: '€4,059,000' }]} />
          <ApprovalWorkflowDisplay workflow={{ required: true, level: 'board', approvers: ['Board of Directors'], message: 'Requires board approval (€100,000+)' }} totalValue={425000} />
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>🏆 Top 5 Providers</h3>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ padding: '16px', background: i === 1 ? '#F0FDF4' : '#F9FAFB', border: `2px solid ${i === 1 ? '#15803D' : '#E5E7EB'}`, borderRadius: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '💎'} Provider #{i}</div><div style={{ fontSize: '12px', color: '#6B7280' }}>Rating: {(9.5 - (i * 0.1)).toFixed(1)} ⭐</div></div>
                  <div style={{ textAlign: 'right' }}><div style={{ fontSize: '18px', fontWeight: 700, color: '#15803D' }}>€{(420000 - (i * 15000)).toLocaleString('nl-NL')}</div><div style={{ fontSize: '12px', color: '#6B7280' }}>Save €{(30000 - (i * 3000)).toLocaleString('nl-NL')}</div></div>
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
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Industrial Machinery</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>CNC, robots, presses en meer</p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Type machine</label>
            <div style={{ display: 'grid', gap: '12px' }}>
              {types.map((t) => (
                <button key={t.id} onClick={() => setFormData({ ...formData, type: t.id, brand: '' })} style={{ padding: '16px', background: formData.type === t.id ? '#E6F4EE' : 'white', border: `2px solid ${formData.type === t.id ? '#1E7F5C' : '#e5e7eb'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>{t.name}</button>
              ))}
            </div>
          </div>

          {selectedType && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Merk</label>
                <select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer merk</option>
                  {selectedType.brands.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Model/Specificatie</label>
                <input type="text" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} placeholder="Bijv. VF-2SS" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Conditie</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {['new', 'refurbished', 'used'].map((c) => (
                    <button key={c} onClick={() => setFormData({ ...formData, condition: c })} style={{ padding: '12px', background: formData.condition === c ? '#E6F4EE' : 'white', border: `2px solid ${formData.condition === c ? '#1E7F5C' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                      {c === 'new' ? 'Nieuw' : c === 'refurbished' ? 'Gereviseerd' : 'Gebruikt'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Aantal</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Garantie</label>
                <select value={formData.warranty} onChange={(e) => setFormData({ ...formData, warranty: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="12m">12 maanden</option>
                  <option value="24m">24 maanden</option>
                  <option value="36m">36 maanden</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '12px' }}>
                  <input type="checkbox" checked={formData.installation} onChange={(e) => setFormData({ ...formData, installation: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  <span>Installatie & commissioning</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.training} onChange={(e) => setFormData({ ...formData, training: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  <span>Operator training</span>
                </label>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Leveringslocatie</label>
                <input type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} placeholder="Bijv. Eindhoven" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Betaling</label>
                <select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="prepaid">Vooruitbetaling</option>
                  <option value="lease">Lease/Huur</option>
                  <option value="installments">Termijnen</option>
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

