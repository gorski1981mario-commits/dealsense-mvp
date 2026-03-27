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

interface MetalsConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function MetalsConfigurator({ packageType = 'zakelijk', userId }: MetalsConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    material: '',
    quantity: '',
    unit: 'tons',
    grade: '',
    destination: '',
    paymentTerms: '',
    certification: [] as string[],
    urgency: 'standard',
    deliveryMethod: '',
    surfaceTreatment: '',
    dimensions: ''
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
  } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'metals-b2b' })
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 7
  
  const validateAndMark = (fieldName: string, value: any, customValidator?: (val: any) => boolean) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
    const isValid = customValidator ? customValidator(value) : validators.required(value)
    setValidFields(prev => { const newSet = new Set(prev); isValid ? newSet.add(fieldName) : newSet.delete(fieldName); return newSet })
  }
  const progress = Math.round((validFields.size / totalFields) * 100)
  
  useEffect(() => {
    const uid = userId || 'anonymous'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-metals-b2b', 'view', 'zakelijk')
  }, [])

  const materials = [
    { id: 'steel', name: 'Stal', grades: ['S235', 'S355', 'Stainless 304', 'Stainless 316'] },
    { id: 'aluminum', name: 'Aluminium', grades: ['1000 series', '3000 series', '5000 series', '6000 series'] },
    { id: 'copper', name: 'Miedź', grades: ['C11000', 'C12200', 'Brass', 'Bronze'] },
    { id: 'zinc', name: 'Cynk', grades: ['SHG', 'HG', 'Galvanizing grade'] },
    { id: 'nickel', name: 'Nikiel', grades: ['Nickel 200', 'Nickel 201', 'Monel'] }
  ]

  const certifications = [
    'ISO 9001', 'ISO 14001', 'EN 10204 3.1', 'EN 10204 3.2', 'REACH', 'RoHS'
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const uid = userId || 'anonymous'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-metals-b2b', 'action', 'zakelijk', formData)
    
    if (!isLocked) {
      await lockConfig(formData)
    }
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
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
            {formData.material} - {formData.quantity} {formData.unit} - {formData.grade}
          </p>

          <B2BDisclaimer category="metals" />
          <B2BReferencePrice price={quoteData?.referencePrice?.price || 25000} label="Referentie (hoogste marktprijs)" />
          
          <VolumePricingTable tiers={quoteData?.tieredPricing || [
            { tier: 'Small order (1-10 tons)', minQty: 1, maxQty: 10, discount: '0%', unitPrice: '€850', sampleTotal: '€8,500 (10 tons)' },
            { tier: 'Medium order (11-50 tons)', minQty: 11, maxQty: 50, discount: '10%', unitPrice: '€765', sampleTotal: '€38,250 (50 tons)' },
            { tier: 'Large order (51-200 tons)', minQty: 51, maxQty: 200, discount: '18%', unitPrice: '€697', sampleTotal: '€139,400 (200 tons)' },
            { tier: 'Bulk order (201+ tons)', minQty: 201, maxQty: '∞', discount: '25%', unitPrice: '€638', sampleTotal: '€127,600 (200 tons)' }
          ]} />

          <ApprovalWorkflowDisplay 
            workflow={quoteData?.approvalWorkflow || { required: true, level: 'director', approvers: ['Finance Director'], message: 'Requires director approval (€25,000+)' }}
            totalValue={quoteData?.summary?.bestPrice || 85000}
          />

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>🏆 Top 5 Providers (Estimated Prices)</h3>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ padding: '16px', background: i === 1 ? '#E6F4EE' : '#F9FAFB', border: `2px solid ${i === 1 ? '#15803D' : '#E5E7EB'}`, borderRadius: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '💎'} Provider #{i}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Rating: {(9.1 - (i * 0.2)).toFixed(1)} ⭐ | Trust: {94 - (i * 2)}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803D' }}>€{(22000 - (i * 1000)).toLocaleString('nl-NL')}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Save €{(3000 - (i * 300)).toLocaleString('nl-NL')} ({Math.round((3000 - (i * 300)) / 25000 * 100)}%)</div>
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
        
        <button
          onClick={() => window.location.href = '/business'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '24px',
            fontSize: '14px',
            color: '#6b7280'
          }}
        >
          <ArrowLeft size={16} />
          Terug
        </button>

        <ProgressTracker
          percentage={progress}
          validCount={validFields.size}
          totalFields={totalFields}
          showWarning={validFields.size < totalFields}
        />

        <LockPanel
          isLocked={isLocked}
          configId={configId}
          onUnlock={handleUnlockConfiguration}
          onDownloadPDF={handleDownloadPDF}
        />

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>

        {isLocked && configId && (
          <div style={{ background: '#E6F4EE', border: '1px solid #1E7F5C', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={16} color="#1E7F5C" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E7F5C' }}>Configuratie opgeslagen</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>ID: {configId}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" onClick={handleUnlockConfiguration} title="Ontgrendelen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'white', border: '2px solid #1E7F5C', borderRadius: '8px', cursor: 'pointer' }}>👆</button>
              <button type="button" onClick={handleDownloadPDF} title="Download PDF" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: '#1E7F5C', border: 'none', borderRadius: '8px', cursor: 'pointer' }}><Download size={18} color="white" /></button>
            </div>
          </div>
        )}

          <form onSubmit={handleSubmit}>

          {/* Step 1: Material Selection */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Selecteer materiaal
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                {materials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => {
                      if (!isLocked) {
                        setFormData({ ...formData, material: material.id, grade: '' })
                        validateAndMark('material', material.id)
                      }
                    }}
                    disabled={isLocked}
                    style={{
                      padding: '16px',
                      background: formData.material === material.id ? '#E6F4EE' : 'white',
                      border: `2px solid ${formData.material === material.id ? '#1E7F5C' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: formData.material === material.id ? '#1E7F5C' : '#374151',
                      transition: 'all 0.2s'
                    }}
                  >
                    {material.name}
                  </button>
                ))}
              </div>

              {selectedMaterial && (
                <div style={{ marginTop: '24px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Grade/Kwaliteit
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => {
                      setFormData({ ...formData, grade: e.target.value })
                      validateAndMark('grade', e.target.value)
                    }}
                    disabled={isLocked}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="">Selecteer grade</option>
                    {selectedMaterial.grades.map((grade) => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!formData.material || !formData.grade}
                style={{
                  marginTop: '24px',
                  width: '100%',
                  padding: '16px',
                  background: formData.material && formData.grade ? '#1E7F5C' : '#e5e7eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: formData.material && formData.grade ? 'pointer' : 'not-allowed'
                }}
              >
                Volgende →
              </button>
            </div>
          )}

          {/* Step 2: Quantity */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Hoeveelheid
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Aantal
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => {
                      setFormData({ ...formData, quantity: e.target.value })
                      validateAndMark('quantity', e.target.value)
                    }}
                    disabled={isLocked}
                    placeholder="Bijv. 100"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Eenheid
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="tons">Ton</option>
                    <option value="kg">Kilogram</option>
                    <option value="sheets">Platen</option>
                    <option value="coils">Rollen</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Urgentie
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {['standard', 'urgent', 'spot'].map((urg) => (
                    <button
                      key={urg}
                      onClick={() => {
                        if (!isLocked) {
                          setFormData({ ...formData, urgency: urg })
                          validateAndMark('urgency', urg)
                        }
                      }}
                      disabled={isLocked}
                      style={{
                        padding: '12px',
                        background: formData.urgency === urg ? '#E6F4EE' : 'white',
                        border: `2px solid ${formData.urgency === urg ? '#1E7F5C' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: formData.urgency === urg ? '#1E7F5C' : '#374151'
                      }}
                    >
                      {urg === 'standard' ? 'Standaard (30d)' : urg === 'urgent' ? 'Urgent (7d)' : 'Spot (24h)'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => setStep(1)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ← Terug
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.quantity}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: formData.quantity ? '#1E7F5C' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: formData.quantity ? 'pointer' : 'not-allowed'
                  }}
                >
                  Volgende →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Delivery & Payment */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Levering & Betaling
              </h2>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Leveringslocatie
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) => {
                    setFormData({ ...formData, destination: e.target.value })
                    validateAndMark('destination', e.target.value)
                  }}
                  disabled={isLocked}
                  placeholder="Bijv. Rotterdam, Nederland"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Leveringsmethode
                </label>
                <select
                  value={formData.deliveryMethod}
                  onChange={(e) => {
                    setFormData({ ...formData, deliveryMethod: e.target.value })
                    validateAndMark('deliveryMethod', e.target.value)
                  }}
                  disabled={isLocked}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Selecteer</option>
                  <option value="truck">Vrachtwagen</option>
                  <option value="rail">Trein</option>
                  <option value="barge">Binnenvaart</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Betalingsvoorwaarden
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => {
                    setFormData({ ...formData, paymentTerms: e.target.value })
                    validateAndMark('paymentTerms', e.target.value)
                  }}
                  disabled={isLocked}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Selecteer voorwaarden</option>
                  <option value="prepaid">Vooruitbetaling</option>
                  <option value="net30">Net 30 dagen</option>
                  <option value="net60">Net 60 dagen</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Oppervlaktebehandeling (optioneel)
                </label>
                <select
                  value={formData.surfaceTreatment}
                  onChange={(e) => setFormData({ ...formData, surfaceTreatment: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Geen</option>
                  <option value="galvanized">Gegalvaniseerd</option>
                  <option value="painted">Gelakt</option>
                  <option value="polished">Gepolijst</option>
                  <option value="anodized">Geanodiseerd</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Afmetingen (optioneel)
                </label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="Bijv. 2000x1000x3mm"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  onClick={() => setStep(2)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ← Terug
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={!formData.destination || !formData.paymentTerms || !formData.deliveryMethod}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: formData.destination && formData.paymentTerms && formData.deliveryMethod ? '#1E7F5C' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: formData.destination && formData.paymentTerms && formData.deliveryMethod ? 'pointer' : 'not-allowed'
                  }}
                >
                  Volgende →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Certifications & Submit */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Certificeringen (optioneel)
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
                {certifications.map((cert) => (
                  <label
                    key={cert}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.certification.includes(cert)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({ ...formData, certification: [...formData.certification, cert] })
                        } else {
                          setFormData({ ...formData, certification: formData.certification.filter(c => c !== cert) })
                        }
                      }}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{cert}</span>
                  </label>
                ))}
              </div>

              {/* Summary */}
              <div style={{
                padding: '20px',
                background: '#f9fafb',
                borderRadius: '10px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#6b7280' }}>
                  Samenvatting
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Materiaal:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {materials.find(m => m.id === formData.material)?.name} ({formData.grade})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Hoeveelheid:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {formData.quantity} {formData.unit}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Levering:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.destination}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Betaling:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.paymentTerms}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setStep(3)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ← Terug
                </button>
                <button
                  type="submit"
                  disabled={isLocked || validFields.size < totalFields}
                  style={{
                    flex: 2,
                    padding: '16px',
                    background: (isLocked || validFields.size < totalFields) ? '#e5e7eb' : '#1E7F5C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: (isLocked || validFields.size < totalFields) ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(30,127,92,0.3)'
                  }}
                >
                  🔍 Request for Quote (RFQ)
                </button>
              </div>
            </div>
          )}
          </form>
        </div>
      </div>
    </div>
  )
}


