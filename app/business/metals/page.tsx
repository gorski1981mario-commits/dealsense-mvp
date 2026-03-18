'use client'

import { useState } from 'react'
import { ArrowLeft, TrendingDown, Globe, Shield, CheckCircle } from 'lucide-react'

export default function MetalsConfiguratorPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    material: '',
    quantity: '',
    unit: 'tons',
    grade: '',
    delivery: '',
    paymentTerms: '',
    certification: [] as string[],
    destination: '',
    urgency: 'standard',
    deliveryMethod: '',
    surfaceTreatment: '',
    dimensions: ''
  })

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

  const handleSubmit = async () => {
    // Call crawler API for B2B search
    const response = await fetch('/api/crawler/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${formData.material} ${formData.grade} ${formData.quantity} ${formData.unit}`,
        category: 'metals',
        packageType: 'business',
        metadata: formData
      })
    })

    const results = await response.json()
    console.log('B2B Results:', results)
    
    // Navigate to results
    window.location.href = `/business/metals/results?data=${encodeURIComponent(JSON.stringify(formData))}`
  }

  const selectedMaterial = materials.find(m => m.id === formData.material)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
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

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
              METALE & STAL
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Bulk Procurement Configurator
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              Vind de beste prijzen voor industriële metalen wereldwijd
            </p>
          </div>

          {/* Progress */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '32px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '12px'
          }}>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '4px',
                  background: s <= step ? '#1e40af' : '#e5e7eb',
                  borderRadius: '2px',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </div>

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
                    onClick={() => setFormData({ ...formData, material: material.id, grade: '' })}
                    style={{
                      padding: '16px',
                      background: formData.material === material.id ? '#eff6ff' : 'white',
                      border: `2px solid ${formData.material === material.id ? '#1e40af' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: formData.material === material.id ? '#1e40af' : '#374151',
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
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
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
                  background: formData.material && formData.grade ? '#1e40af' : '#e5e7eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
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
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
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
                      onClick={() => setFormData({ ...formData, urgency: urg })}
                      style={{
                        padding: '12px',
                        background: formData.urgency === urg ? '#eff6ff' : 'white',
                        border: `2px solid ${formData.urgency === urg ? '#1e40af' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: formData.urgency === urg ? '#1e40af' : '#374151'
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
                    borderRadius: '12px',
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
                    background: formData.quantity ? '#1e40af' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
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
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, deliveryMethod: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
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
                    borderRadius: '12px',
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
                    background: formData.destination && formData.paymentTerms && formData.deliveryMethod ? '#1e40af' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
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
                borderRadius: '12px',
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
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  ← Terug
                </button>
                <button
                  onClick={handleSubmit}
                  style={{
                    flex: 2,
                    padding: '16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                  }}
                >
                  � Request for Quote (RFQ)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
