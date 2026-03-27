'use client'

import { useState } from 'react'

export default function ScanPanel() {
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      alert(`Scan: ${url} - €${price}`)
    }, 2000)
  }

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '12px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
        Product Scan
      </h3>
      
      <form onSubmit={handleScan}>
        <input
          type="url"
          placeholder="Product URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            marginBottom: '12px',
            fontSize: '14px'
          }}
        />
        
        <input
          type="number"
          step="0.01"
          placeholder="Prijs (€)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px'
          }}
        />
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#9ca3af' : '#15803d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Scannen...' : 'Scan Product'}
        </button>
      </form>
    </div>
  )
}





