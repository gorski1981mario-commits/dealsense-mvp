'use client'

import { useState } from 'react'

export default function GoldPage() {
  const [goldType, setGoldType] = useState('bars')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      alert(`Vergelijken ${goldType} - hoeveelheid: ${amount}g`)
    }, 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: '#15803d',
          color: '#92400e',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>GOLD</span>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Goud & Edelmetalen
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Vergelijk prijzen voor goudstaven, munten en andere edelmetalen bij Nederlandse dealers.
      </p>

      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: '12px',
        border: '1px solid #86efac',
        marginBottom: '32px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          💰 Huidige goudprijs
        </div>
        <div style={{ fontSize: '24px', fontWeight: 900, color: '#15803d', marginBottom: '8px' }}>
          €65,50/gram
        </div>
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          Laatste update: vandaag 14:00
        </div>
      </div>

      <form onSubmit={handleCompare}>
        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              Type
            </label>
            <select
              value={goldType}
              onChange={(e) => setGoldType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '16px',
                background: 'white'
              }}
            >
              <option value="bars">Goudstaven</option>
              <option value="coins">Gouden munten</option>
              <option value="silver">Zilver</option>
              <option value="platinum">Platina</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              Hoeveelheid (gram)
            </label>
            <select
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '16px',
                background: 'white'
              }}
            >
              <option value="">Selecteer...</option>
              <option value="1">1 gram</option>
              <option value="5">5 gram</option>
              <option value="10">10 gram</option>
              <option value="31.1">1 troy ounce (31.1g)</option>
              <option value="50">50 gram</option>
              <option value="100">100 gram</option>
              <option value="250">250 gram</option>
              <option value="500">500 gram</option>
              <option value="1000">1 kilogram</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !amount}
          style={{
            width: '100%',
            padding: '14px',
            background: loading || !amount ? '#9ca3af' : '#15803d',
            color: '#92400e',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading || !amount ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Vergelijken...' : 'Vergelijk prijzen'}
        </button>
      </form>

      <div style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Populaire producten
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            { name: 'Goudstaaf 1 oz', price: '€2.035', premium: '+2.5%' },
            { name: 'Goudstaaf 100g', price: '€6.550', premium: '+1.8%' },
            { name: 'Krugerrand 1 oz', price: '€2.045', premium: '+3.0%' },
            { name: 'Maple Leaf 1 oz', price: '€2.040', premium: '+2.8%' }
          ].map(item => (
            <div
              key={item.name}
              style={{
                padding: '16px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Premium: {item.premium}</div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#15803d' }}>{item.price}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: '12px',
        border: '1px solid #86efac'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
          Tips voor goud kopen
        </h3>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
          <li>Let op de premium (opslag boven goudprijs)</li>
          <li>Grotere staven hebben vaak lagere premium</li>
          <li>Koop alleen bij erkende dealers</li>
          <li>Vergelijk altijd meerdere aanbieders</li>
        </ul>
      </div>
    </div>
  )
}



