'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function MachineryConfiguratorPage() {
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
    paymentTerms: ''
  })

  const types = [
    { id: 'cnc', name: 'CNC Machines', brands: ['Haas', 'DMG Mori', 'Mazak', 'Fanuc'] },
    { id: 'robots', name: 'Industrial Robots', brands: ['ABB', 'Fanuc', 'Kuka', 'Yaskawa'] },
    { id: 'presses', name: 'Hydraulic Presses', brands: ['Schuler', 'Aida', 'Komatsu'] },
    { id: 'lathes', name: 'Lathes & Mills', brands: ['Haas', 'Doosan', 'Okuma'] },
    { id: 'packaging', name: 'Packaging Machines', brands: ['Bosch', 'IMA', 'Tetra Pak'] }
  ]

  const handleSubmit = async () => {
    await fetch('/api/crawler/search', {
      method: 'POST',
      body: JSON.stringify({ query: `${formData.type} ${formData.brand} ${formData.model}`, category: 'machinery', packageType: 'business', metadata: formData })
    })
    window.location.href = `/business/machinery/results?data=${encodeURIComponent(JSON.stringify(formData))}`
  }

  const selectedType = types.find(t => t.id === formData.type)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/business'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}>
          <ArrowLeft size={16} />
          Terug
        </button>

        <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Industrial Machinery</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>CNC, robots, presses en meer</p>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Type machine</label>
            <div style={{ display: 'grid', gap: '12px' }}>
              {types.map((t) => (
                <button key={t.id} onClick={() => setFormData({ ...formData, type: t.id, brand: '' })} style={{ padding: '16px', background: formData.type === t.id ? '#dbeafe' : 'white', border: `2px solid ${formData.type === t.id ? '#3b82f6' : '#e5e7eb'}`, borderRadius: '12px', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>{t.name}</button>
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
                    <button key={c} onClick={() => setFormData({ ...formData, condition: c })} style={{ padding: '12px', background: formData.condition === c ? '#dbeafe' : 'white', border: `2px solid ${formData.condition === c ? '#3b82f6' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
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

              <button onClick={handleSubmit} disabled={!formData.brand || !formData.delivery || !formData.paymentTerms} style={{ width: '100%', padding: '16px', background: formData.brand && formData.delivery && formData.paymentTerms ? '#10b981' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: formData.brand && formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed' }}>🔍 Zoek beste prijzen</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
