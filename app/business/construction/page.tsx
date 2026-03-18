'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function ConstructionConfiguratorPage() {
  const [formData, setFormData] = useState({
    material: '',
    specification: '',
    quantity: '',
    unit: 'tons',
    delivery: '',
    paymentTerms: ''
  })

  const materials = [
    { id: 'cement', name: 'Cement', specs: ['Portland CEM I', 'CEM II', 'CEM III', 'White cement'], units: ['tons', 'bags'] },
    { id: 'steel', name: 'Constructiestaal', specs: ['Rebar 8mm', 'Rebar 12mm', 'Rebar 16mm', 'Mesh'], units: ['tons', 'pieces'] },
    { id: 'timber', name: 'Hout & Balken', specs: ['C24 timber', 'Glulam', 'CLT panels', 'Plywood'], units: ['m³', 'sheets'] },
    { id: 'insulation', name: 'Isolatie', specs: ['Mineral wool', 'EPS', 'XPS', 'PIR'], units: ['m²', 'pallets'] },
    { id: 'bricks', name: 'Bakstenen', specs: ['Clay bricks', 'Concrete blocks', 'AAC blocks'], units: ['pieces', 'pallets'] }
  ]

  const handleSubmit = async () => {
    await fetch('/api/crawler/search', {
      method: 'POST',
      body: JSON.stringify({ query: `${formData.material} ${formData.specification} ${formData.quantity}`, category: 'construction', packageType: 'business', metadata: formData })
    })
    window.location.href = `/business/construction/results?data=${encodeURIComponent(JSON.stringify(formData))}`
  }

  const selected = materials.find(m => m.id === formData.material)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/business'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}>
          <ArrowLeft size={16} />
          Terug
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Bouwmaterialen</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Cement, staal, hout, isolatie en meer</p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Materiaal</label>
            <div style={{ display: 'grid', gap: '12px' }}>
              {materials.map((m) => (
                <button key={m.id} onClick={() => setFormData({ ...formData, material: m.id, specification: '', unit: m.units[0] })} style={{ padding: '16px', background: formData.material === m.id ? '#fef3c7' : 'white', border: `2px solid ${formData.material === m.id ? '#f59e0b' : '#e5e7eb'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>{m.name}</button>
              ))}
            </div>
          </div>

          {selected && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Specificatie</label>
                <select value={formData.specification} onChange={(e) => setFormData({ ...formData, specification: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  {selected.specs.map((s) => (
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
                    {selected.units.map((u) => (
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

              <button onClick={handleSubmit} disabled={!formData.specification || !formData.quantity || !formData.delivery || !formData.paymentTerms} style={{ width: '100%', padding: '16px', background: formData.specification && formData.quantity && formData.delivery && formData.paymentTerms ? '#10b981' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: formData.specification && formData.quantity && formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed' }}>🔍 Zoek beste prijzen</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
