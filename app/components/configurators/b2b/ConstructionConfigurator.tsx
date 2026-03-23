'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock, Download, ArrowLeft } from 'lucide-react'
import { useConfigurationLock } from '../../../_lib/hooks/useConfigurationLock'
import { FlowTracker } from '../../../_lib/flow-tracker'
import AgentEchoLogo from '../../AgentEchoLogo'
import ProgressTracker from '../../shared/ProgressTracker'
import LockPanel from '../../shared/LockPanel'
import { validators } from '../../../utils/validators'
import { 
  B2BDisclaimer, 
  B2BReferencePrice, 
  VolumePricingTable, 
  RFQButton, 
  ApprovalWorkflowDisplay
} from './B2BFeatures'

interface ConstructionConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function ConstructionConfigurator({ packageType = 'zakelijk', userId }: ConstructionConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [formData, setFormData] = useState({
    material: '',
    specification: '',
    quantity: '',
    unit: 'tons',
    delivery: '',
    paymentTerms: 'net30',
    urgency: 'standard'
  })
  
  const [quoteData, setQuoteData] = useState<any>(null)
  
  const {
    isLocked,
    saving,
    configId,
    configTimestamp,
    handleLockConfiguration: lockConfig,
    handleUnlockConfiguration: unlockConfig,
    handleDownloadPDF: downloadPDF
  } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'construction-b2b' })
  
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
    const uid = userId || 'anonymous'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-construction-b2b', 'view', 'zakelijk')
  }, [])

  const materials = [
    { id: 'cement', name: 'Cement', specs: ['Portland CEM I', 'CEM II', 'CEM III', 'White cement'], units: ['tons', 'bags'] },
    { id: 'steel', name: 'Constructiestaal', specs: ['Rebar 8mm', 'Rebar 12mm', 'Rebar 16mm', 'Mesh'], units: ['tons', 'pieces'] },
    { id: 'timber', name: 'Hout & Balken', specs: ['C24 timber', 'Glulam', 'CLT panels', 'Plywood'], units: ['m³', 'sheets'] },
    { id: 'insulation', name: 'Isolatie', specs: ['Mineral wool', 'EPS', 'XPS', 'PIR'], units: ['m²', 'pallets'] },
    { id: 'bricks', name: 'Bakstenen', specs: ['Clay bricks', 'Concrete blocks', 'AAC blocks'], units: ['pieces', 'pallets'] }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const uid = userId || 'anonymous'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-construction-b2b', 'action', 'zakelijk', formData)
    if (!isLocked) await lockConfig(formData)
    setView('results')
  }
  
  const handleLockConfiguration = async () => {
    await lockConfig(formData)
  }
  
  const handleUnlockConfiguration = () => {
    unlockConfig()
  }
  
  const handleDownloadPDF = () => {
    downloadPDF(formData)
  }

  const selectedMaterial = materials.find(m => m.id === formData.material)

  if (view === 'results') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
          
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>📊 3 beste B2B quotes gevonden!</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>{formData.material} - {formData.quantity} {formData.unit}</p>

          <B2BDisclaimer category="construction" />
          <B2BReferencePrice price={28000} label="Referentie (hoogste marktprijs)" />
          
          <VolumePricingTable tiers={[
            { tier: 'Small order (1-10 tons)', minQty: 1, maxQty: 10, discount: '0%', unitPrice: '€120', sampleTotal: '€1,200 (10 tons)' },
            { tier: 'Medium order (11-50 tons)', minQty: 11, maxQty: 50, discount: '10%', unitPrice: '€108', sampleTotal: '€5,400 (50 tons)' },
            { tier: 'Large order (51-200 tons)', minQty: 51, maxQty: 200, discount: '18%', unitPrice: '€98', sampleTotal: '€19,600 (200 tons)' },
            { tier: 'Bulk order (201+ tons)', minQty: 201, maxQty: '∞', discount: '25%', unitPrice: '€90', sampleTotal: '€18,000 (200 tons)' }
          ]} />

          <ApprovalWorkflowDisplay workflow={{ required: true, level: 'manager', approvers: ['Department Manager'], message: 'Requires manager approval (€5,000 - €25,000)' }} totalValue={12000} />
          
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>🏆 Top 5 Providers (Estimated Prices)</h3>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ padding: '16px', background: i === 1 ? '#F0FDF4' : '#F9FAFB', border: `2px solid ${i === 1 ? '#15803D' : '#E5E7EB'}`, borderRadius: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '💎'} Provider #{i}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Rating: {(9.0 - (i * 0.2)).toFixed(1)} ⭐ | Trust: {94 - (i * 2)}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803D' }}>€{(24000 - (i * 1500)).toLocaleString('nl-NL')}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Save €{(4000 - (i * 500)).toLocaleString('nl-NL')} ({Math.round((4000 - (i * 500)) / 28000 * 100)}%)</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <RFQButton onClick={() => setView('payment')} />
          <div style={{ fontSize: '11px', color: '#6B7280', textAlign: 'center', marginTop: '16px' }}>🔒 Provider names will be revealed after payment confirmation</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <AgentEchoLogo />
        
        <button onClick={() => window.location.href = '/business'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}>
          <ArrowLeft size={16} />
          Terug
        </button>

        <ProgressTracker percentage={progress} validCount={validFields.size} totalFields={totalFields} showWarning={validFields.size < totalFields} />
        
        <LockPanel isLocked={isLocked} configId={configId} onUnlock={handleUnlockConfiguration} onDownloadPDF={handleDownloadPDF} />

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Bouwmaterialen</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Cement, staal, hout, isolatie en meer</p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Materiaal</label>
            <div style={{ display: 'grid', gap: '12px' }}>
              {materials.map((m) => (
                <button key={m.id} onClick={() => setFormData({ ...formData, material: m.id, specification: '', unit: m.units[0] })} style={{ padding: '16px', background: formData.material === m.id ? '#E6F4EE' : 'white', border: `2px solid ${formData.material === m.id ? '#1E7F5C' : '#e5e7eb'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>{m.name}</button>
              ))}
            </div>
          </div>

          {selectedMaterial && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Specificatie</label>
                <select value={formData.specification} onChange={(e) => setFormData({ ...formData, specification: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  {selectedMaterial.specs.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Hoeveelheid</label>
                  <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="Bijv. 100" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Eenheid</label>
                  <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                    {selectedMaterial.units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Leveringslocatie</label>
                <input type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} placeholder="Bijv. Amsterdam" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Betaling</label>
                <select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="prepaid">Vooruitbetaling</option>
                  <option value="net30">Net 30</option>
                  <option value="net60">Net 60</option>
                </select>
              </div>

              <button onClick={handleSubmit} disabled={!formData.specification || !formData.quantity || !formData.delivery || !formData.paymentTerms} style={{ width: '100%', padding: '16px', background: formData.specification && formData.quantity && formData.delivery && formData.paymentTerms ? '#1E7F5C' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: formData.specification && formData.quantity && formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed' }}>🔍 Request for Quote (RFQ)</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

