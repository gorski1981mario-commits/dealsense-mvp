'use client'

import { useState } from 'react'
import Scanner from '../components/Scanner'

export default function VacationsPage() {
  const [destination, setDestination] = useState('')
  const [dates, setDates] = useState('')
  const [travelers, setTravelers] = useState('2')
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      alert(`Zoeken naar vakanties naar ${destination} voor ${travelers} personen`)
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
        ✈️ Vakanties
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Vergelijk vakantieaanbiedingen van 50+ reisorganisaties. Bespaar tot €500 per vakantie.
      </p>

      <Scanner type="pro" />

      <form onSubmit={handleSearch} style={{ marginTop: '32px' }}>
        <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              Bestemming
            </label>
            <input
              type="text"
              placeholder="Bijv. Spanje, Griekenland, Frankrijk"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              Data
            </label>
            <input
              type="text"
              placeholder="Bijv. Juli 2026"
              value={dates}
              onChange={(e) => setDates(e.target.value)}
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

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              Aantal reizigers
            </label>
            <select
              value={travelers}
              onChange={(e) => setTravelers(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                fontSize: '16px',
                background: 'white'
              }}
            >
              <option value="1">1 persoon</option>
              <option value="2">2 personen</option>
              <option value="3">3 personen</option>
              <option value="4">4 personen</option>
              <option value="5">5+ personen</option>
            </select>
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
          {loading ? '🔍 Zoeken...' : 'Vergelijk vakanties'}
        </button>
      </form>

      <div style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Populaire bestemmingen
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
          {['Spanje', 'Griekenland', 'Italië', 'Frankrijk', 'Turkije', 'Portugal'].map(dest => (
            <div
              key={dest}
              style={{
                padding: '16px',
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                textAlign: 'center',
                cursor: 'pointer'
              }}
              onClick={() => setDestination(dest)}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏖️</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{dest}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
