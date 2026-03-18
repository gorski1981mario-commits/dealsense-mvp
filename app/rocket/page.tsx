'use client'

import { useState } from 'react'
import { Rocket, Zap, Target, Smartphone } from 'lucide-react'

export default function RocketPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRocketScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      alert(`🚀 Rocket scan voor: ${url}`)
    }, 1500)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: '#dc2626',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>ROCKET</span>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Rocket size={28} strokeWidth={2} color="#15803d" /> Rocket Scan
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Ultra-snelle scan in 3 seconden. Voor als je haast hebt.
      </p>

      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        borderRadius: '12px',
        border: '1px solid #fca5a5',
        marginBottom: '32px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={16} strokeWidth={2} color="#15803d" /> Supersnel
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          Rocket Scan scant alleen de top 10 winkels voor maximale snelheid. Resultaat in 3 seconden gegarandeerd.
        </div>
      </div>

      <form onSubmit={handleRocketScan}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
            Product URL
          </label>
          <input
            type="url"
            placeholder="https://www.bol.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#9ca3af' : '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🚀 Scannen...' : '🚀 Rocket Scan (3s)'}
        </button>
      </form>

      <div style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Wanneer gebruiken?
        </h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              ⚡ Snel resultaat nodig
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Je hebt haast en wilt binnen 3 seconden weten waar het goedkoopst is.
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Target size={16} strokeWidth={2} color="#15803d" /> Populaire producten
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Voor bekende merken en producten die overal verkocht worden.
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Smartphone size={16} strokeWidth={2} color="#15803d" /> Mobiel
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Ideaal voor onderweg - snel scannen in de winkel.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


