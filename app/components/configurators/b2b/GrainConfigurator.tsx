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

interface GrainConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId?: string
}

type ViewState = 'configurator' | 'results' | 'payment' | 'unlocked'

export default function GrainConfigurator({ packageType = 'zakelijk', userId }: GrainConfiguratorProps = {}) {
  const [view, setView] = useState<ViewState>('configurator')
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    commodity: '',
    quality: '',
    moisture: '',
    protein: '',
    testWeight: '',
    impurities: '',
    quantity: '',
    unit: 'tons',
    urgency: 'standard',
    packaging: '',
    destination: '',
    deliveryMethod: '',
    incoterms: '',
    paymentTerms: '',
    contractType: 'spot',
    inspection: false,
    certificates: [] as string[]
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
  } = useConfigurationLock({ userId: userId || 'anonymous', sector: 'grain-b2b' })
  
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())
  const totalFields = 9
  
  const validateAndMark = (fieldName: string, value: any, customValidator?: (val: any) => boolean) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
    const isValid = customValidator ? customValidator(value) : validators.required(value)
    setValidFields(prev => { const newSet = new Set(prev); isValid ? newSet.add(fieldName) : newSet.delete(fieldName); return newSet })
  }
  const progress = Math.round((validFields.size / totalFields) * 100)
  
  useEffect(() => {
    const uid = userId || 'anonymous'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-grain-b2b', 'view', 'zakelijk')
  }, [])

  const commodities = [
    { id: 'wheat', name: 'Tarwe', qualities: ['Milling wheat', 'Feed wheat', 'Durum wheat'] },
    { id: 'corn', name: 'Maïs', qualities: ['Yellow corn', 'White corn', 'Feed grade'] },
    { id: 'soybean', name: 'Soja', qualities: ['GMO', 'Non-GMO', 'Biologisch'] },
    { id: 'barley', name: 'Gerst', qualities: ['Mouterij gerst', 'Voedergerst'] },
    { id: 'rice', name: 'Rijst', qualities: ['Langkorrelig', 'Middellang', 'Kortkorrelig'] }
  ]

  const packagingOptions = ['Bulk (los)', 'Big Bags (1 ton)', 'Zakken 50kg', 'Zakken 25kg']
  const certificates = ['Phytosanitary', 'Quality Certificate', 'Origin Certificate', 'Non-GMO Certificate']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const uid = userId || 'anonymous'
    FlowTracker.getInstance().trackEvent(uid, 'configurator-grain-b2b', 'action', 'zakelijk', formData)
    
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

  const selectedCommodity = commodities.find(c => c.id === formData.commodity)

  if (view === 'results') {
    return (
      <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={() => setView('configurator')} style={{ padding: '10px 16px', background: '#F3F4F6', color: '#111827', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', marginBottom: '16px' }}>← Terug</button>
          
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>📊 3 beste B2B quotes gevonden!</h2>
          <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '20px' }}>
            {formData.commodity} - {formData.quantity} {formData.unit} - {formData.quality}
          </p>

          <B2BDisclaimer category="grain" />
          <B2BReferencePrice price={quoteData?.referencePrice?.price || 52000} label="Referentie (hoogste marktprijs)" />
          
          <VolumePricingTable tiers={quoteData?.tieredPricing || [
            { tier: 'Small order (1-10 tons)', minQty: 1, maxQty: 10, discount: '0%', unitPrice: '€220', sampleTotal: '€2,200 (10 tons)' },
            { tier: 'Medium order (11-50 tons)', minQty: 11, maxQty: 50, discount: '10%', unitPrice: '€198', sampleTotal: '€9,900 (50 tons)' },
            { tier: 'Large order (51-200 tons)', minQty: 51, maxQty: 200, discount: '18%', unitPrice: '€180', sampleTotal: '€36,000 (200 tons)' },
            { tier: 'Bulk order (201+ tons)', minQty: 201, maxQty: '∞', discount: '25%', unitPrice: '€165', sampleTotal: '€33,000 (200 tons)' }
          ]} />

          <ApprovalWorkflowDisplay 
            workflow={quoteData?.approvalWorkflow || { required: true, level: 'manager', approvers: ['Department Manager'], message: 'Requires manager approval (€5,000 - €25,000)' }}
            totalValue={quoteData?.summary?.bestPrice || 18000}
          />

          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>🏆 Top 5 Providers (Estimated Prices)</h3>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ padding: '16px', background: i === 1 ? '#F0FDF4' : '#F9FAFB', border: `2px solid ${i === 1 ? '#15803D' : '#E5E7EB'}`, borderRadius: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{i === 1 ? '🥇' : i === 2 ? '🥈' : i === 3 ? '🥉' : '💎'} Provider #{i}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Rating: {(9.3 - (i * 0.2)).toFixed(1)} ⭐ | Trust: {96 - (i * 2)}%</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803D' }}>€{(45000 - (i * 2000)).toLocaleString('nl-NL')}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Save €{(7000 - (i * 500)).toLocaleString('nl-NL')} ({Math.round((7000 - (i * 500)) / 52000 * 100)}%)</div>
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

          {/* Step 1: Commodity & Quality Specifications */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Grondstof & Kwaliteitsspecificaties
              </h2>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Grondstof
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  {commodities.map((commodity) => (
                    <button
                      key={commodity.id}
                      type="button"
                      onClick={() => {
                        if (!isLocked) {
                          setFormData({ ...formData, commodity: commodity.id, quality: '' })
                          validateAndMark('commodity', commodity.id)
                        }
                      }}
                      disabled={isLocked}
                      style={{
                        padding: '12px',
                        background: formData.commodity === commodity.id ? '#E6F4EE' : 'white',
                        border: `2px solid ${formData.commodity === commodity.id ? '#1E7F5C' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: formData.commodity === commodity.id ? '#1E7F5C' : '#374151'
                      }}
                    >
                      {commodity.name}
                    </button>
                  ))}
                </div>
              </div>

              {selectedCommodity && (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Kwaliteit
                    </label>
                    <select
                      value={formData.quality}
                      onChange={(e) => {
                        setFormData({ ...formData, quality: e.target.value })
                        validateAndMark('quality', e.target.value)
                      }}
                      disabled={isLocked}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: formData.quality ? '2px solid #1E7F5C' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: formData.quality ? '#E6F4EE' : 'white'
                      }}
                    >
                      <option value="">Selecteer kwaliteit</option>
                      {selectedCommodity.qualities.map((quality) => (
                        <option key={quality} value={quality}>{quality}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                        Vochtgehalte (%) *
                      </label>
                      <input
                        type="number"
                        value={formData.moisture}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormData({ ...formData, moisture: val })
                          validateAndMark('moisture', val)
                        }}
                        disabled={isLocked}
                        placeholder="Bijv. 14.0"
                        step="0.1"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: formData.moisture ? '2px solid #1E7F5C' : '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          background: formData.moisture ? '#E6F4EE' : 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                        Eiwitgehalte (%) *
                      </label>
                      <input
                        type="number"
                        value={formData.protein}
                        onChange={(e) => {
                          const val = e.target.value
                          setFormData({ ...formData, protein: val })
                          validateAndMark('protein', val)
                        }}
                        disabled={isLocked}
                        placeholder="Bijv. 12.5"
                        step="0.1"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: formData.protein ? '2px solid #1E7F5C' : '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          background: formData.protein ? '#E6F4EE' : 'white'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                        Testgewicht (kg/hl)
                      </label>
                      <input
                        type="number"
                        value={formData.testWeight}
                        onChange={(e) => setFormData({ ...formData, testWeight: e.target.value })}
                        placeholder="Bijv. 78"
                        step="0.1"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: formData.testWeight ? '2px solid #1E7F5C' : '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          background: formData.testWeight ? '#E6F4EE' : 'white'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                        Onzuiverheden (%)
                      </label>
                      <input
                        type="number"
                        value={formData.impurities}
                        onChange={(e) => setFormData({ ...formData, impurities: e.target.value })}
                        placeholder="Bijv. 2.0"
                        step="0.1"
                        style={{
                          width: '100%',
                          padding: '12px',
                          border: formData.impurities ? '2px solid #1E7F5C' : '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '16px',
                          background: formData.impurities ? '#E6F4EE' : 'white'
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.commodity || !formData.quality || !formData.moisture || !formData.protein}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '16px',
                  background: (formData.commodity && formData.quality && formData.moisture && formData.protein) ? '#1E7F5C' : '#e5e7eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: (formData.commodity && formData.quality && formData.moisture && formData.protein) ? 'pointer' : 'not-allowed'
                }}
              >
                Volgende →
              </button>
            </div>
          )}

          {/* Step 2: Quantity & Logistics */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Hoeveelheid & Logistiek
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                    Hoeveelheid *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => {
                      const val = e.target.value
                      setFormData({ ...formData, quantity: val })
                      validateAndMark('quantity', val)
                    }}
                    disabled={isLocked}
                    placeholder="Bijv. 100"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: formData.quantity ? '2px solid #1E7F5C' : '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      background: formData.quantity ? '#E6F4EE' : 'white'
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
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Urgentie *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {['standard', 'urgent', 'spot'].map((urg) => (
                    <button
                      key={urg}
                      type="button"
                      onClick={() => {
                        if (!isLocked) {
                          setFormData({ ...formData, urgency: urg })
                        }
                      }}
                      disabled={isLocked}
                      style={{
                        padding: '12px',
                        background: formData.urgency === urg ? '#E6F4EE' : 'white',
                        border: `2px solid ${formData.urgency === urg ? '#1E7F5C' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
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

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Verpakking *
                </label>
                <select
                  value={formData.packaging}
                  onChange={(e) => {
                    setFormData({ ...formData, packaging: e.target.value })
                    validateAndMark('packaging', e.target.value)
                  }}
                  disabled={isLocked}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: formData.packaging ? '2px solid #1E7F5C' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: formData.packaging ? '#E6F4EE' : 'white'
                  }}
                >
                  <option value="">Selecteer verpakking</option>
                  {packagingOptions.map((pkg) => (
                    <option key={pkg} value={pkg}>{pkg}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
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
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!formData.quantity || !formData.packaging}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: (formData.quantity && formData.packaging) ? '#1E7F5C' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: (formData.quantity && formData.packaging) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Volgende →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Delivery & Commercial Terms */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Levering & Handelsvoorwaarden
              </h2>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Leveringslocatie (Nederland) *
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
                    border: formData.destination ? '2px solid #1E7F5C' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: formData.destination ? '#E6F4EE' : 'white'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Leveringsmethode *
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
                    border: formData.deliveryMethod ? '2px solid #1E7F5C' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: formData.deliveryMethod ? '#E6F4EE' : 'white'
                  }}
                >
                  <option value="">Selecteer</option>
                  <option value="truck">Vrachtwagen</option>
                  <option value="rail">Trein</option>
                  <option value="barge">Binnenvaart</option>
                  <option value="container">Container</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Incoterms
                </label>
                <select
                  value={formData.incoterms}
                  onChange={(e) => setFormData({ ...formData, incoterms: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Selecteer Incoterms</option>
                  <option value="FCA">FCA - Free Carrier</option>
                  <option value="DAP">DAP - Delivered At Place</option>
                  <option value="DDP">DDP - Delivered Duty Paid</option>
                  <option value="EXW">EXW - Ex Works</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Betalingsvoorwaarden *
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
                    border: formData.paymentTerms ? '2px solid #1E7F5C' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: formData.paymentTerms ? '#E6F4EE' : 'white'
                  }}
                >
                  <option value="">Selecteer voorwaarden</option>
                  <option value="prepaid">Vooruitbetaling</option>
                  <option value="net30">Net 30 dagen</option>
                  <option value="net60">Net 60 dagen</option>
                  <option value="lc">Letter of Credit</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Contracttype
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {['spot', 'forward', 'longterm'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, contractType: type })}
                      style={{
                        padding: '12px',
                        background: formData.contractType === type ? '#E6F4EE' : 'white',
                        border: `2px solid ${formData.contractType === type ? '#1E7F5C' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: formData.contractType === type ? '#1E7F5C' : '#374151'
                      }}
                    >
                      {type === 'spot' ? 'Spot' : type === 'forward' ? 'Forward' : 'Langetermijn'}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
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
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={!formData.destination || !formData.deliveryMethod || !formData.paymentTerms}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: (formData.destination && formData.deliveryMethod && formData.paymentTerms) ? '#1E7F5C' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: (formData.destination && formData.deliveryMethod && formData.paymentTerms) ? 'pointer' : 'not-allowed'
                  }}
                >
                  Volgende →
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Additional Requirements & Submit */}
          {step === 4 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Aanvullende Eisen
              </h2>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.inspection}
                    onChange={(e) => setFormData({ ...formData, inspection: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>Kwaliteitsinspectie vereist</span>
                </label>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Certificaten (optioneel)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {certificates.map((cert) => (
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
                        checked={formData.certificates.includes(cert)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, certificates: [...formData.certificates, cert] })
                          } else {
                            setFormData({ ...formData, certificates: formData.certificates.filter(c => c !== cert) })
                          }
                        }}
                        style={{ width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{cert}</span>
                    </label>
                  ))}
                </div>
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
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Grondstof:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {commodities.find(c => c.id === formData.commodity)?.name} ({formData.quality})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Specificaties:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {formData.moisture}% vocht, {formData.protein}% eiwit
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
                  type="button"
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
