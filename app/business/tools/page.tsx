'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function ToolsConfiguratorPage() {
  const [formData, setFormData] = useState({ category: '', product: '', brand: '', quantity: '', delivery: '', paymentTerms: '' })

  const categories = [
    { id: 'power', name: 'Elektrisch gereedschap', products: ['Boormachines', 'Slijpmachines', 'Zaagmachines', 'Schroefmachines'], brands: ['Bosch', 'Makita', 'DeWalt', 'Hilti'] },
    { id: 'hand', name: 'Handgereedschap', products: ['Hamers', 'Schroevendraaiers', 'Tangen', 'Sleutels'], brands: ['Stanley', 'Bahco', 'Knipex'] },
    { id: 'safety', name: 'Veiligheid & BHP', products: ['Helmen', 'Handschoenen', 'Veiligheidsbrillen', 'Werkschoenen'], brands: ['3M', 'Uvex', 'Honeywell'] },
    { id: 'measuring', name: 'Meetgereedschap', products: ['Lasers', 'Meters', 'Waterpassen'], brands: ['Bosch', 'Leica', 'Stanley'] }
  ]

  const handleSubmit = async () => {
    await fetch('/api/crawler/search', { method: 'POST', body: JSON.stringify({ query: `${formData.product} ${formData.brand} ${formData.quantity}`, category: 'tools', packageType: 'business', metadata: formData }) })
    window.location.href = `/business/tools/results?data=${encodeURIComponent(JSON.stringify(formData))}`
  }

  const selected = categories.find(c => c.id === formData.category)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/business'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}><ArrowLeft size={16} />Terug</button>
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Gereedschap & Uitrusting</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Elektrisch, hand, veiligheid en meetgereedschap</p>
          <div style={{ marginBottom: '24px' }}>
            {categories.map((c) => (
              <button key={c.id} onClick={() => setFormData({ ...formData, category: c.id, product: '', brand: '' })} style={{ padding: '16px', background: formData.category === c.id ? '#fef2f2' : 'white', border: `2px solid ${formData.category === c.id ? '#ef4444' : '#e5e7eb'}`, borderRadius: '12px', cursor: 'pointer', marginBottom: '12px', width: '100%', textAlign: 'left', fontWeight: 600 }}>{c.name}</button>
            ))}
          </div>
          {selected && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Product</label>
                <select value={formData.product} onChange={(e) => setFormData({ ...formData, product: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  {selected.products.map((p) => (<option key={p} value={p}>{p}</option>))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Merk</label>
                <select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  {selected.brands.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Aantal</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="Bijv. 50" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Levering</label>
                <input type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} placeholder="Locatie" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Betaling</label>
                <select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="prepaid">Vooruitbetaling</option>
                  <option value="net30">Net 30</option>
                </select>
              </div>
              <button onClick={handleSubmit} disabled={!formData.product || !formData.brand || !formData.quantity || !formData.delivery || !formData.paymentTerms} style={{ width: '100%', padding: '16px', background: formData.product && formData.brand && formData.quantity && formData.delivery && formData.paymentTerms ? '#10b981' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: formData.product && formData.brand && formData.quantity && formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed' }}>🔍 Zoek beste prijzen</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
