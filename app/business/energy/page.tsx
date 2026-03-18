'use client'

import { useState } from 'react'
import { ArrowLeft, Zap } from 'lucide-react'

export default function EnergyConfiguratorPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    fuelType: '',
    quantity: '',
    unit: 'liters',
    deliveryFrequency: '',
    contractLength: '',
    destination: '',
    storageCapacity: '',
    paymentTerms: '',
    deliveryMethod: '',
    tankType: '',
    qualitySpec: ''
  })

  const fuelTypes = [
    { id: 'diesel', name: 'Diesel', units: ['liters', 'm³', 'tons'] },
    { id: 'gasoline', name: 'Benzine', units: ['liters', 'm³'] },
    { id: 'lng', name: 'LNG (Liquid Natural Gas)', units: ['m³', 'tons'] },
    { id: 'crude', name: 'Ruwe Olie', units: ['barrels', 'tons'] },
    { id: 'heating', name: 'Stookolie', units: ['liters', 'm³'] }
  ]

  const frequencies = [
    { id: 'daily', name: 'Dagelijks', min: 1000 },
    { id: 'weekly', name: 'Wekelijks', min: 5000 },
    { id: 'monthly', name: 'Maandelijks', min: 20000 },
    { id: 'spot', name: 'Spot (eenmalig)', min: 10000 }
  ]

  const handleSubmit = async () => {
    const response = await fetch('/api/crawler/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${formData.fuelType} ${formData.quantity} ${formData.unit}`,
        category: 'energy',
        packageType: 'business',
        metadata: formData
      })
    })
    const results = await response.json()
    window.location.href = `/business/energy/results?data=${encodeURIComponent(JSON.stringify(formData))}`
  }

  const selectedFuel = fuelTypes.find(f => f.id === formData.fuelType)

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
              ENERGIE & PALIWA
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Bulk Fuel Procurement
            </h1>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>
              Vergelijk prijzen van diesel, benzine, LNG en ruwe olie wereldwijd
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
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '4px',
                  background: s <= step ? '#f59e0b' : '#e5e7eb',
                  borderRadius: '2px'
                }}
              />
            ))}
          </div>

          {/* Step 1: Fuel Type */}
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Type brandstof
              </h2>
              <div style={{ display: 'grid', gap: '12px' }}>
                {fuelTypes.map((fuel) => (
                  <button
                    key={fuel.id}
                    onClick={() => setFormData({ ...formData, fuelType: fuel.id, unit: fuel.units[0] })}
                    style={{
                      padding: '20px',
                      background: formData.fuelType === fuel.id ? '#fffbeb' : 'white',
                      border: `2px solid ${formData.fuelType === fuel.id ? '#f59e0b' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: formData.fuelType === fuel.id ? '#f59e0b' : '#374151'
                    }}
                  >
                    {fuel.name}
                  </button>
                ))}
              </div>

              {selectedFuel && (
                <div style={{ marginTop: '24px' }}>
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
                    {selectedFuel.units.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              )}

              <button
                onClick={() => setStep(2)}
                disabled={!formData.fuelType}
                style={{
                  marginTop: '24px',
                  width: '100%',
                  padding: '16px',
                  background: formData.fuelType ? '#f59e0b' : '#e5e7eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: formData.fuelType ? 'pointer' : 'not-allowed'
                }}
              >
                Volgende →
              </button>
            </div>
          )}

          {/* Step 2: Quantity & Frequency */}
          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
                Hoeveelheid & Frequentie
              </h2>
              
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Hoeveelheid per levering
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Bijv. 50000"
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
                  Leveringsfrequentie
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {frequencies.map((freq) => (
                    <button
                      key={freq.id}
                      onClick={() => setFormData({ ...formData, deliveryFrequency: freq.id })}
                      style={{
                        padding: '16px',
                        background: formData.deliveryFrequency === freq.id ? '#fffbeb' : 'white',
                        border: `2px solid ${formData.deliveryFrequency === freq.id ? '#f59e0b' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: formData.deliveryFrequency === freq.id ? '#f59e0b' : '#374151'
                      }}
                    >
                      <div>{freq.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                        Min. {freq.min.toLocaleString()} {formData.unit}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Contractduur
                </label>
                <select
                  value={formData.contractLength}
                  onChange={(e) => setFormData({ ...formData, contractLength: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Selecteer duur</option>
                  <option value="spot">Spot (eenmalig)</option>
                  <option value="3m">3 maanden</option>
                  <option value="6m">6 maanden</option>
                  <option value="12m">12 maanden</option>
                  <option value="24m">24 maanden</option>
                </select>
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
                  disabled={!formData.quantity || !formData.deliveryFrequency || !formData.contractLength}
                  style={{
                    flex: 1,
                    padding: '16px',
                    background: formData.quantity && formData.deliveryFrequency && formData.contractLength ? '#f59e0b' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: formData.quantity && formData.deliveryFrequency && formData.contractLength ? 'pointer' : 'not-allowed'
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
                  placeholder="Bijv. Rotterdam Haven, Nederland"
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
                  Opslagcapaciteit (optioneel)
                </label>
                <input
                  type="number"
                  value={formData.storageCapacity}
                  onChange={(e) => setFormData({ ...formData, storageCapacity: e.target.value })}
                  placeholder={`Bijv. 100000 ${formData.unit}`}
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
                  <option value="tanker">Tankwagen</option>
                  <option value="pipeline">Pipeline</option>
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
                  <option value="net15">Net 15 dagen</option>
                  <option value="net30">Net 30 dagen</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Type opslagtank (optioneel)
                </label>
                <select
                  value={formData.tankType}
                  onChange={(e) => setFormData({ ...formData, tankType: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Geen</option>
                  <option value="above">Bovengronds</option>
                  <option value="underground">Ondergronds</option>
                  <option value="mobile">Mobiel</option>
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                  Kwaliteitsspecificatie (optioneel)
                </label>
                <input
                  type="text"
                  value={formData.qualitySpec}
                  onChange={(e) => setFormData({ ...formData, qualitySpec: e.target.value })}
                  placeholder="Bijv. EN 590, ISO 8217"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* Summary */}
              <div style={{
                padding: '20px',
                background: '#fffbeb',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '2px solid #fde68a'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#92400e' }}>
                  Samenvatting
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#78350f' }}>Brandstof:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {fuelTypes.find(f => f.id === formData.fuelType)?.name}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#78350f' }}>Hoeveelheid:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      {formData.quantity} {formData.unit} / {frequencies.find(f => f.id === formData.deliveryFrequency)?.name.toLowerCase()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#78350f' }}>Contract:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.contractLength}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '14px', color: '#78350f' }}>Locatie:</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{formData.destination}</span>
                  </div>
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
                  disabled={!formData.destination || !formData.paymentTerms || !formData.deliveryMethod}
                  style={{
                    flex: 2,
                    padding: '16px',
                    background: formData.destination && formData.paymentTerms && formData.deliveryMethod ? '#10b981' : '#e5e7eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: formData.destination && formData.paymentTerms && formData.deliveryMethod ? 'pointer' : 'not-allowed',
                    boxShadow: formData.destination && formData.paymentTerms && formData.deliveryMethod ? '0 4px 12px rgba(16,185,129,0.3)' : 'none'
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
