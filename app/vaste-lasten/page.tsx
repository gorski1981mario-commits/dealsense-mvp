'use client'

import { useState } from 'react'

export default function VasteLastenPage() {
  const [expenses, setExpenses] = useState({
    energy: '',
    internet: '',
    mobile: '',
    insurance: '',
    tv: ''
  })
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/vaste-lasten-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenses)
      })

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalCurrent = Object.values(expenses).reduce((sum, val) => sum + (parseFloat(val) || 0), 0)
  const potentialSavings = totalCurrent * 0.15

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Mijn vaste lasten
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Vul je maandelijkse vaste lasten in. We berekenen hoeveel je kunt besparen.
      </p>

      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '12px',
        border: '1px solid #fbbf24',
        marginBottom: '32px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          💡 Gemiddelde besparing: €150-300 per jaar
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          De meeste mensen kunnen 15-25% besparen op hun vaste lasten door over te stappen.
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              ⚡ Energie (gas + elektra)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="120.00"
              value={expenses.energy}
              onChange={(e) => setExpenses({ ...expenses, energy: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '16px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              🌐 Internet
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="45.00"
              value={expenses.internet}
              onChange={(e) => setExpenses({ ...expenses, internet: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '16px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              📞 Mobiel
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="25.00"
              value={expenses.mobile}
              onChange={(e) => setExpenses({ ...expenses, mobile: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '16px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              🛡️ Verzekeringen
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="80.00"
              value={expenses.insurance}
              onChange={(e) => setExpenses({ ...expenses, insurance: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '16px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              📺 TV / Streaming
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="30.00"
              value={expenses.tv}
              onChange={(e) => setExpenses({ ...expenses, tv: e.target.value })}
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

        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: '12px',
          border: '1px solid #93c5fd',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Totaal per maand:</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#2563eb' }}>
              €{totalCurrent.toFixed(2)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Potentiële besparing (15%):</span>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#258b52' }}>
              €{potentialSavings.toFixed(2)}/maand
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
            = €{(potentialSavings * 12).toFixed(2)} per jaar
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || totalCurrent === 0}
          style={{
            width: '100%',
            padding: '14px',
            background: loading || totalCurrent === 0 ? '#9ca3af' : '#258b52',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading || totalCurrent === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Analyseren...' : 'Analyseer mijn vaste lasten'}
        </button>
      </form>

      {result && (
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '12px',
          border: '1px solid #86efac'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#258b52' }}>
            ✓ Analyse compleet!
          </h3>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
            We hebben je vaste lasten geanalyseerd. Je kunt tot €{(potentialSavings * 12).toFixed(2)} per jaar besparen 
            door over te stappen naar goedkopere aanbieders.
          </p>
        </div>
      )}
    </div>
  )
}
