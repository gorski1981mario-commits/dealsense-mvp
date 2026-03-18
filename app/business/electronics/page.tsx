'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'

export default function ElectronicsConfiguratorPage() {
  const [formData, setFormData] = useState({ category: '', product: '', quantity: '', packaging: '', delivery: '', paymentTerms: '' })

  const categories = [
    { id: 'semiconductors', name: 'Halfgeleiders', products: ['MCU', 'FPGA', 'Memory chips', 'Power ICs'] },
    { id: 'pcb', name: 'PCB & Assemblies', products: ['Single-layer PCB', 'Multi-layer PCB', 'Flex PCB', 'PCBA'] },
    { id: 'sensors', name: 'Sensoren', products: ['Temperature', 'Pressure', 'Proximity', 'Optical'] },
    { id: 'connectors', name: 'Connectoren', products: ['USB', 'HDMI', 'RJ45', 'Terminal blocks'] }
  ]

  const handleSubmit = async () => {
    await fetch('/api/crawler/search', { method: 'POST', body: JSON.stringify({ query: `${formData.product} ${formData.quantity}`, category: 'electronics', packageType: 'business', metadata: formData }) })
    window.location.href = `/business/electronics/results?data=${encodeURIComponent(JSON.stringify(formData))}`
  }

  const selected = categories.find(c => c.id === formData.category)

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '40px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={() => window.location.href = '/business'} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', marginBottom: '24px' }}><ArrowLeft size={16} />Terug</button>
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '8px' }}>Industrial Electronics</h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '32px' }}>Semiconductors, PCB, sensors en meer</p>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Categorie</label>
            <div style={{ display: 'grid', gap: '12px' }}>
              {categories.map((c) => (
                <button key={c.id} onClick={() => setFormData({ ...formData, category: c.id, product: '' })} style={{ padding: '16px', background: formData.category === c.id ? '#E6F4EE' : 'white', border: `2px solid ${formData.category === c.id ? '#1E7F5C' : '#e5e7eb'}`, borderRadius: '10px', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>{c.name}</button>
              ))}
            </div>
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
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Hoeveelheid (stuks)</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} placeholder="Bijv. 10000" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Verpakking</label>
                <select value={formData.packaging} onChange={(e) => setFormData({ ...formData, packaging: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="reel">Reel/Tape</option>
                  <option value="tray">Tray</option>
                  <option value="tube">Tube</option>
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Levering</label>
                <input type="text" value={formData.delivery} onChange={(e) => setFormData({ ...formData, delivery: e.target.value })} placeholder="Bijv. Eindhoven" style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Betaling</label>
                <select value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px' }}>
                  <option value="">Selecteer</option>
                  <option value="prepaid">Vooruitbetaling</option>
                  <option value="net30">Net 30</option>
                </select>
              </div>
              <button onClick={handleSubmit} disabled={!formData.product || !formData.quantity || !formData.delivery || !formData.paymentTerms} style={{ width: '100%', padding: '16px', background: formData.product && formData.quantity && formData.delivery && formData.paymentTerms ? '#1E7F5C' : '#e5e7eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: formData.product && formData.quantity && formData.delivery && formData.paymentTerms ? 'pointer' : 'not-allowed' }}>🔍 Zoek beste prijzen</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

