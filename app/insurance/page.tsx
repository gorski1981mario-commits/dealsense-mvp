'use client'

import { useState } from 'react'
import Scanner from '../components/Scanner'

export default function InsurancePage() {
  const [insuranceType, setInsuranceType] = useState('health')
  const [currentPrice, setCurrentPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      alert(`Vergelijken ${insuranceType} verzekering - huidige prijs: €${currentPrice}`)
    }, 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: '#2563eb',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>PRO</span>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        🛡️ Verzekeringen
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Vergelijk verzekeringen en bespaar tot €400 per jaar door over te stappen.
      </p>

      <Scanner type="pro" />

      <form onSubmit={handleCompare} style={{ marginTop: '32px' }}>
        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              Type verzekering
            </label>
            <select
              value={insuranceType}
              onChange={(e) => setInsuranceType(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '16px',
                background: 'white'
              }}
            >
              <option value="health">Zorgverzekering</option>
              <option value="car">Autoverzekering</option>
              <option value="home">Woonverzekering</option>
              <option value="life">Levensverzekering</option>
              <option value="travel">Reisverzekering</option>
              <option value="liability">Aansprakelijkheidsverzekering</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              Huidige prijs per maand (€)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="120.00"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '16px'
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#9ca3af' : '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🔍 Vergelijken...' : 'Vergelijk verzekeringen'}
        </button>
      </form>

      <div style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Gemiddelde besparingen
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {[
            { type: 'Zorgverzekering', savings: '€180/jaar' },
            { type: 'Autoverzekering', savings: '€250/jaar' },
            { type: 'Woonverzekering', savings: '€120/jaar' },
            { type: 'Levensverzekering', savings: '€300/jaar' }
          ].map(item => (
            <div
              key={item.type}
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
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.type}</span>
              <span style={{ fontSize: '14px', color: '#258b52', fontWeight: 700 }}>{item.savings}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
