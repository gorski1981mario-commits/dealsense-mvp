'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function GrainConfiguratorPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    commodity: '',
    quantity: '',
    unit: 'tons',
    quality: '',
    origin: '',
    delivery: '',
    packaging: '',
    paymentTerms: '',
    inspection: false
  })

  const commodities = [
    { 
      id: 'wheat', 
      name: 'Pszenica', 
      qualities: ['Milling wheat', 'Feed wheat', 'Durum wheat'],
      origins: ['Ukraine', 'Poland', 'France', 'Germany', 'Russia']
    },
    { 
      id: 'corn', 
      name: 'Kukurydza',
      qualities: ['Yellow corn', 'White corn', 'Feed grade'],
      origins: ['Ukraine', 'Romania', 'Hungary', 'USA', 'Brazil']
    },
    { 
      id: 'soybean', 
      name: 'Soja',
      qualities: ['GMO', 'Non-GMO', 'Organic'],
      origins: ['Brazil', 'USA', 'Argentina', 'Ukraine']
    },
    { 
      id: 'barley', 
      name: 'Jęczmień',
      qualities: ['Malting barley', 'Feed barley'],
      origins: ['France', 'Germany', 'Ukraine', 'Russia']
    },
    { 
      id: 'rice', 
      name: 'Ryż',
      qualities: ['Long grain', 'Medium grain', 'Short grain', 'Basmati'],
      origins: ['India', 'Thailand', 'Vietnam', 'Pakistan']
    }
  ]

  const packagingOptions = [
    { id: 'bulk', name: 'Bulk (luzem)', min: 1000 },
    { id: 'bigbag', name: 'Big Bags (1 ton)', min: 20 },
    { id: 'bags50', name: 'Worki 50kg', min: 20 },
    { id: 'bags25', name: 'Worki 25kg', min: 40 }
  ]

  const handleSubmit = async () => {
    const response = await fetch('/api/crawler/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${formData.commodity} ${formData.quality} ${formData.quantity} tons`,
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
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
              ZBOŻE & ŻYWNOŚĆ
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Agricultural Commodities
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              Vergelijk prijzen van graan en voedselgrondstoffen wereldwijd
            </p>
          </div>

          {/* Progress */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '32px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '10px'
          }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '4px',
                  background: s <= step ? '#1E7F5C' : '#e5e7eb',
                  borderRadius: '2px'
                }}
              />
            ))}
          </div>

          {/* Step 1: Commodity & Quality */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Grondstof & Kwaliteit
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {commodities.map((commodity) => (
                  <button
                    key={commodity.id}
                    onClick={() => setFormData({ ...formData, commodity: commodity.id, quality: '', origin: '' })}
                    style={{
                      padding: '16px',
                      background: formData.commodity === commodity.id ? '#E6F4EE' : 'white',
                      border: `2px solid ${formData.commodity === commodity.id ? '#1E7F5C' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 600,
                      color: formData.commodity === commodity.id ? '#1E7F5C' : '#374151'
                    }}
                  >
                    {commodity.name}
                  </button>
                ))}
              </div>

              {selectedCommodity && (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Kwaliteit
                    </label>
                    <select
                      value={formData.quality}
                      onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="">Selecteer kwaliteit</option>
                      {selectedCommodity.qualities.map((quality) => (
                        <option key={quality} value={quality}>{quality}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                      Herkomst (voorkeur)
                    </label>
                    <select
                      value={formData.origin}
                      onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '16px'
                      }}
                    >
                      <option value="">Geen voorkeur</option>
                      {selectedCommodity.origins.map((origin) => (
                        <option key={origin} value={origin}>{origin}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!formData.commodity || !formData.quality}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: formData.commodity && formData.quality ? '#1E7F5C' : '#e5e7eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: formData.commodity && formData.quality ? 'pointer' : 'not-allowed'
                }}
              >
                Volgende →
              </button>
            </div>
          )}

          {/* Step 2: Quantity & Packaging */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Hoeveelheid & Verpakking
              </h2>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Hoeveelheid (ton)
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Bijv. 500"
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
                  Verpakking
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {packagingOptions.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setFormData({ ...formData, packaging: pkg.id })}
                      style={{
                        padding: '16px',
                        background: formData.packaging === pkg.id ? '#E6F4EE' : 'white',
                        border: `2px solid ${formData.packaging === pkg.id ? '#1E7F5C' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: formData.packaging === pkg.id ? '#1E7F5C' : '#374151' }}>
                        {pkg.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        Min. {pkg.min} ton
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
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
                  disabled={!formData.quantity || !formData.packaging}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: formData.quantity && formData.packaging ? '#1E7F5C' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: formData.quantity && formData.packaging ? 'pointer' : 'not-allowed'
                  }}
                >
                  Volgende →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Delivery & Terms */}
          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Levering & Voorwaarden
              </h2>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Leveringslocatie
                </label>
                <input
                  type="text"
                  value={formData.delivery}
                  onChange={(e) => setFormData({ ...formData, delivery: e.target.value })}
                  placeholder="Bijv. Rotterdam Haven"
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
                  <option value="lc">Letter of Credit</option>
                  <option value="cad">Cash Against Documents</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.inspection}
                    onChange={(e) => setFormData({ ...formData, inspection: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>
                    Pre-shipment inspection vereist (SGS/Bureau Veritas)
                  </span>
                </label>
              </div>

              {/* Summary */}
              <div style={{
                padding: '20px',
                background: '#E6F4EE',
                borderRadius: '10px',
                marginBottom: '24px',
                border: '2px solid #86efac'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#065f46' }}>
                  Samenvatting
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#047857' }}>Grondstof:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {commodities.find(c => c.id === formData.commodity)?.name} ({formData.quality})
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#047857' }}>Hoeveelheid:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.quantity} ton</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#047857' }}>Verpakking:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {packagingOptions.find(p => p.id === formData.packaging)?.name}
                    </span>
                  </div>
                  {formData.origin && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', color: '#047857' }}>Herkomst:</span>
                      <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.origin}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
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
                  onClick={handleSubmit}
                  disabled={!formData.delivery || !formData.paymentTerms}
                  style={{
                    flex: 2,
                    padding: '16px',
                    background: formData.delivery && formData.paymentTerms ? '#1E7F5C' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed',
                    boxShadow: formData.delivery && formData.paymentTerms ? '0 4px 12px rgba(30,127,92,0.3)' : 'none'
                  }}
                >
                  🔍 Zoek beste prijzen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

