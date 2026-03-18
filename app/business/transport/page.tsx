'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function TransportConfiguratorPage() {
  const [formData, setFormData] = useState({ type: '', brand: '', model: '', condition: 'new', quantity: '1', delivery: '', paymentTerms: '' })

  const types = [
    { id: 'trucks', name: 'Vrachtwagens', brands: ['Volvo', 'MAN', 'Scania', 'Mercedes'] },
    { id: 'trailers', name: 'Trailers', brands: ['Krone', 'Schmitz', 'Kögel'] },
    { id: 'forklifts', name: 'Heftrucks', brands: ['Toyota', 'Linde', 'Jungheinrich'] },
    { id: 'containers', name: 'Containers', brands: ['20ft', '40ft', '40ft HC'] }
  ]

  const handleSubmit = async () => {
    await fetch('/api/crawler/search', { method: 'POST', body: JSON.stringify({ query: `${formData.type} ${formData.brand}`, category: 'transport', packageType: 'business', metadata: formData }) })
    window.location.href = `/business/transport/results?data=${encodeURIComponent(JSON.stringify(formData))}`
  }

  const selected = types.find(t => t.id === formData.type)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/business'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}><ArrowLeft size={16} />Terug</button>
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Transport & Logistiek</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Vrachtwagens, trailers, heftrucks en containers</p>
          <div style={{ marginBottom: '24px' }}>
            {types.map((t) => (
              <button key={t.id} onClick={() => setFormData({ ...formData, type: t.id, brand: '' })} style={{ padding: '16px', background: formData.type === t.id ? '#fef3c7' : 'white', border: `2px solid ${formData.type === t.id ? '#f59e0b' : '#e5e7eb'}`, borderRadius: '12px', cursor: 'pointer', marginBottom: '12px', width: '100%', textAlign: 'left', fontWeight: 600 }}>{t.name}</button>
            ))}
          </div>
          {selected && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Type/Merk</label>
                <select value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  {selected.brands.map((b) => (<option key={b} value={b}>{b}</option>))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Conditie</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {['new', 'used'].map((c) => (
                    <button key={c} onClick={() => setFormData({ ...formData, condition: c })} style={{ padding: '12px', background: formData.condition === c ? '#fef3c7' : 'white', border: `2px solid ${formData.condition === c ? '#f59e0b' : '#e5e7eb'}`, borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>{c === 'new' ? 'Nieuw' : 'Gebruikt'}</button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Aantal</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Levering</label>
                <input type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} placeholder="Locatie" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Betaling</label>
                <select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="lease">Lease</option>
                  <option value="finance">Financiering</option>
                  <option value="cash">Contant</option>
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
