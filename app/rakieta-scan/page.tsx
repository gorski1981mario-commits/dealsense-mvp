'use client'

import { useState } from 'react'
import Scanner from '../components/Scanner'

export default function RakietaScanPage() {
  const [scanMode, setScanMode] = useState<'url' | 'qr'>('url')
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      alert(`Rakieta scan: ${url}`)
    }, 1000)
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        🚀 Rakieta Scan
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Bliksemsnelle scan met QR code of URL. Kies je methode.
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
        <button
          onClick={() => setScanMode('url')}
          style={{
            flex: 1,
            padding: '12px',
            background: scanMode === 'url' ? '#2563eb' : 'white',
            color: scanMode === 'url' ? 'white' : '#374151',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🔗 URL Scan
        </button>
        <button
          onClick={() => setScanMode('qr')}
          style={{
            flex: 1,
            padding: '12px',
            background: scanMode === 'qr' ? '#2563eb' : 'white',
            color: scanMode === 'qr' ? 'white' : '#374151',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          📷 QR Scan
        </button>
      </div>

      {scanMode === 'url' ? (
        <form onSubmit={handleScan}>
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
              background: loading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '🚀 Scannen...' : '🚀 Start Rakieta Scan'}
          </button>
        </form>
      ) : (
        <Scanner type="pro" />
      )}

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '12px',
        border: '1px solid #fbbf24'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          ⚡ Snelheidsrecord
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          Rakieta Scan is onze snelste scan methode. Gemiddelde scan tijd: 1-2 seconden.
        </div>
      </div>
    </div>
  )
}
