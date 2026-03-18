'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Lock, Download } from 'lucide-react'
import ProgressTracker from '../../components/shared/ProgressTracker'
import LockPanel from '../../components/shared/LockPanel'
import { generateConfigurationPDF } from '../../components/ConfigurationPDFGenerator'
import { validators } from '../../utils/validators'

export default function GrainConfiguratorPage() {
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

  const [isLocked, setIsLocked] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)
  const [configTimestamp, setConfigTimestamp] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set())
  const [validFields, setValidFields] = useState<Set<string>>(new Set())

  const totalFields = 9 // commodity, quality, moisture, protein, quantity, packaging, destination, deliveryMethod, paymentTerms (urgency ma default)

  const markFieldTouched = (fieldName: string) => {
    setTouchedFields(prev => new Set(prev).add(fieldName))
  }

  const markFieldValid = (fieldName: string, isValid: boolean) => {
    setValidFields(prev => {
      const newSet = new Set(prev)
      if (isValid) {
        newSet.add(fieldName)
      } else {
        newSet.delete(fieldName)
      }
      return newSet
    })
  }

  const validateAndMark = (fieldName: string, value: any) => {
    markFieldTouched(fieldName)
    const isValid = validators.required(value)
    markFieldValid(fieldName, isValid)
    return isValid
  }

  const progress = Math.round((validFields.size / totalFields) * 100)

  const commodities = [
    { id: 'wheat', name: 'Tarwe', qualities: ['Milling wheat', 'Feed wheat', 'Durum wheat'] },
    { id: 'corn', name: 'Maïs', qualities: ['Yellow corn', 'White corn', 'Feed grade'] },
    { id: 'soybean', name: 'Soja', qualities: ['GMO', 'Non-GMO', 'Biologisch'] },
    { id: 'barley', name: 'Gerst', qualities: ['Mouterij gerst', 'Voedergerst'] },
    { id: 'rice', name: 'Rijst', qualities: ['Langkorrelig', 'Middellang', 'Kortkorrelig'] }
  ]

  const packagingOptions = ['Bulk (los)', 'Big Bags (1 ton)', 'Zakken 50kg', 'Zakken 25kg']
  const certificates = ['Phytosanitary', 'Quality Certificate', 'Origin Certificate', 'Non-GMO Certificate']

  const handleLockConfiguration = async () => {
    try {
      setSaving(true)
      const configData = {
        userId: 'business_user',
        sector: 'grain',
        parameters: formData,
        timestamp: new Date().toISOString()
      }
      const response = await fetch('/api/configurations/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      })
      const result = await response.json()
      if (result.success) {
        setConfigId(result.configId)
        setConfigTimestamp(configData.timestamp)
        setIsLocked(true)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleUnlockConfiguration = () => {
    setIsLocked(false)
  }

  const handleDownloadPDF = () => {
    if (!configId || !configTimestamp) return
    generateConfigurationPDF({
      configId,
      userId: 'business_user',
      sector: 'grain',
      parameters: formData,
      timestamp: configTimestamp
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLocked) {
      await handleLockConfiguration()
    }
    const response = await fetch('/api/crawler/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${formData.commodity} ${formData.quality} ${formData.quantity} ${formData.unit}`,
        category: 'grain',
        packageType: 'business',
        metadata: formData
      })
    })
    const results = await response.json()
    window.location.href = `/business/grain/results?data=${encodeURIComponent(JSON.stringify(formData))}`
  }

  const selectedCommodity = commodities.find(c => c.id === formData.commodity)

  return (
    <div style={{ minHeight: '100vh' }}>
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
          Terug naar overzicht
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          🌾 Granen & Voedselgrondstoffen Configurator
        </h2>

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
  )
}
