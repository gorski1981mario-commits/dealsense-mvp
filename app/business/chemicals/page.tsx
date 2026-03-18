'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function ChemicalsConfiguratorPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    category: '',
    product: '',
    quantity: '',
    unit: 'kg',
    purity: '',
    packaging: '',
    delivery: '',
    msds: false,
    paymentTerms: ''
  })

  const categories = [
    { 
      id: 'polymers', 
      name: 'Polimery & Tworzywa',
      products: ['Polyethylene (PE)', 'Polypropylene (PP)', 'PVC', 'PET', 'ABS'],
      units: ['kg', 'tons', 'pallets']
    },
    { 
      id: 'solvents', 
      name: 'Rozpuszczalniki',
      products: ['Ethanol', 'Methanol', 'Acetone', 'Toluene', 'MEK'],
      units: ['liters', 'm³', 'drums']
    },
    { 
      id: 'acids', 
      name: 'Kwasy & Zasady',
      products: ['Sulfuric acid', 'Hydrochloric acid', 'Nitric acid', 'Caustic soda', 'Ammonia'],
      units: ['kg', 'tons', 'IBC']
    },
    { 
      id: 'additives', 
      name: 'Dodatki & Pigmenty',
      products: ['Titanium dioxide', 'Carbon black', 'Stabilizers', 'Plasticizers'],
      units: ['kg', 'tons', 'bags']
    }
  ]

  const purities = ['Technical grade', 'Industrial grade', 'Pharma grade', 'Food grade', 'Analytical grade']
  
  const packagingOptions = [
    { id: 'bulk', name: 'Bulk (tanker)', min: 10000 },
    { id: 'ibc', name: 'IBC (1000L)', min: 1000 },
    { id: 'drums', name: 'Drums (200L)', min: 200 },
    { id: 'bags', name: 'Bags (25kg)', min: 500 }
  ]

  const handleSubmit = async () => {
    await fetch('/api/crawler/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `${formData.product} ${formData.purity} ${formData.quantity} ${formData.unit}`,
        category: 'chemicals',
        packageType: 'business',
        metadata: formData
      })
    })
    window.location.href = `/business/chemicals/results?data=${encodeURIComponent(JSON.stringify(formData))}`
  }

  const selectedCategory = categories.find(c => c.id === formData.category)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/business'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px', fontSize: '14px', color: '#6b7280' }}>
          <ArrowLeft size={16} />
          Terug
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>CHEMIKALIA</div>
            <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Chemical Procurement</h1>
            <p style={{ fontSize: '16px', color: '#6b7280' }}>Vergelijk prijzen van industriële chemicaliën wereldwijd</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', padding: '16px', background: '#f9fafb', borderRadius: '12px' }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ flex: 1, height: '4px', background: s <= step ? '#8b5cf6' : '#e5e7eb', borderRadius: '2px' }} />
            ))}
          </div>

          {step === 1 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Categorie & Product</h2>
              <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => setFormData({ ...formData, category: cat.id, product: '', unit: cat.units[0] })} style={{ padding: '16px', background: formData.category === cat.id ? '#f5f3ff' : 'white', border: `2px solid ${formData.category === cat.id ? '#8b5cf6' : '#e5e7eb'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontSize: '16px', fontWeight: 600, color: formData.category === cat.id ? '#8b5cf6' : '#374151' }}>
                    {cat.name}
                  </button>
                ))}
              </div>

              {selectedCategory && (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Product</label>
                    <select value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}>
                      <option value="">Selecteer product</option>
                      {selectedCategory.products.map((prod) => (
                        <option key={prod} value={prod}>{prod}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Zuiverheid</label>
                    <select value={formData.purity} onChange={(e) => setFormData({ ...formData, purity: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}>
                      <option value="">Selecteer zuiverheid</option>
                      {purities.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button onClick={() => setStep(2)} disabled={!formData.product || !formData.purity} style={{ width: '100%', padding: '16px', background: formData.product && formData.purity ? '#8b5cf6' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: formData.product && formData.purity ? 'pointer' : 'not-allowed' }}>
                Volgende →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Hoeveelheid & Verpakking</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Hoeveelheid</label>
                  <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="Bijv. 5000" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Eenheid</label>
                  <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}>
                    {selectedCategory?.units.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Verpakking</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {packagingOptions.map((pkg) => (
                    <button key={pkg.id} onClick={() => setFormData({ ...formData, packaging: pkg.id })} style={{ padding: '12px', background: formData.packaging === pkg.id ? '#f5f3ff' : 'white', border: `2px solid ${formData.packaging === pkg.id ? '#8b5cf6' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: formData.packaging === pkg.id ? '#8b5cf6' : '#374151' }}>
                      <div>{pkg.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Min. {pkg.min} kg</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(1)} style={{ flex: 1, padding: '16px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>← Terug</button>
                <button onClick={() => setStep(3)} disabled={!formData.quantity || !formData.packaging} style={{ flex: 1, padding: '16px', background: formData.quantity && formData.packaging ? '#8b5cf6' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: formData.quantity && formData.packaging ? 'pointer' : 'not-allowed' }}>Volgende →</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>Levering & Documentatie</h2>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Leveringslocatie</label>
                <input type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} placeholder="Bijv. Rotterdam" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }} />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Betalingsvoorwaarden</label>
                <select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}>
                  <option value="">Selecteer</option>
                  <option value="prepaid">Vooruitbetaling</option>
                  <option value="net30">Net 30</option>
                  <option value="lc">L/C</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}>
                <input type="checkbox" checked={formData.msds} onChange={(e) => setFormData({ ...formData, msds: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                <span style={{ fontSize: '14px', fontWeight: 500' }}>MSDS & COA vereist</span>
              </label>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep(2)} style={{ flex: 1, padding: '16px', background: 'white', color: '#374151', border: '1px solid #d1d5db', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}>← Terug</button>
                <button onClick={handleSubmit} disabled={!formData.delivery || !formData.paymentTerms} style={{ flex: 2, padding: '16px', background: formData.delivery && formData.paymentTerms ? '#10b981' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed', boxShadow: formData.delivery && formData.paymentTerms ? '0 4px 12px rgba(16,185,129,0.3)' : 'none' }}>🔍 Zoek beste prijzen</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
