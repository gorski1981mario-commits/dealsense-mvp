'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function PackagingConfiguratorPage() {
  const [formData, setFormData] = useState({ type: '', size: '', quantity: '', printing: false, delivery: '', paymentTerms: '' })

  const types = [
    { id: 'cardboard', name: 'Kartonnen dozen', sizes: ['Small (20x15x10)', 'Medium (40x30x30)', 'Large (60x40x40)', 'Custom'] },
    { id: 'pallets', name: 'Pallets', sizes: ['Euro (120x80)', 'Block (100x120)', 'Custom'] },
    { id: 'stretch', name: 'Stretchfolie', sizes: ['500mm x 300m', '500mm x 1500m', 'Machine roll'] },
    { id: 'bags', name: 'Zakken & Tassen', sizes: ['Small', 'Medium', 'Large', 'Custom'] }
  ]

  const handleSubmit = async () => {
    await fetch('/api/crawler/search', { method: 'POST', body: JSON.stringify({ query: `${formData.type} ${formData.size} ${formData.quantity}`, category: 'packaging', packageType: 'business', metadata: formData }) })
    window.location.href = `/business/packaging/results?data=${encodeURIComponent(JSON.stringify(formData))}`
  }

  const selected = types.find(t => t.id === formData.type)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/business'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}><ArrowLeft size={16} />Terug</button>
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Verpakkingsmaterialen</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Dozen, pallets, folie en meer</p>
          <div style={{ marginBottom: '24px' }}>
            {types.map((t) => (
              <button key={t.id} onClick={() => setFormData({ ...formData, type: t.id, size: '' })} style={{ padding: '16px', background: formData.type === t.id ? '#fce7f3' : 'white', border: `2px solid ${formData.type === t.id ? '#ec4899' : '#e5e7eb'}`, borderRadius: '12px', cursor: 'pointer', marginBottom: '12px', width: '100%', textAlign: 'left', fontWeight: 600 }}>{t.name}</button>
            ))}
          </div>
          {selected && (
            <>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Maat</label>
                <select value={formData.size} onChange={(e) => setFormData({ ...formData, size: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  {selected.sizes.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Hoeveelheid</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="Bijv. 1000" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}>
                <input type="checkbox" checked={formData.printing} onChange={(e) => setFormData({ ...formData, printing: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                <span>Bedrukt met logo</span>
              </label>
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
              <button onClick={handleSubmit} disabled={!formData.size || !formData.quantity || !formData.delivery || !formData.paymentTerms} style={{ width: '100%', padding: '16px', background: formData.size && formData.quantity && formData.delivery && formData.paymentTerms ? '#10b981' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 600, cursor: formData.size && formData.quantity && formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed' }}>🔍 Zoek beste prijzen</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
