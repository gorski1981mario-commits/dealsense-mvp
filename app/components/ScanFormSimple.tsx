'use client'

// Simplified Scan Form - Only "Vergelijk prijzen" button
// Scanner component handles all inputs (URL, QR)

import { useState } from 'react'

interface ScanFormSimpleProps {
  packageType: 'free' | 'plus' | 'pro' | 'finance'
  scansRemaining?: number
  onScanComplete?: (result: any) => void
}

export default function ScanFormSimple({ 
  packageType, 
  scansRemaining = 999, 
  onScanComplete 
}: ScanFormSimpleProps) {
  const [loading, setLoading] = useState(false)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // TODO: Get data from Scanner component (via context or props)
    // For now, this is just a placeholder button
    
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 2000)
  }

  const isDisabled = loading || (packageType === 'free' && scansRemaining === 0)

  return (
    <div style={{ marginBottom: '24px' }}>
      <button 
        onClick={handleScan}
        disabled={isDisabled}
        style={{
          width: '100%',
          padding: '14px',
          background: isDisabled ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #15803d 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          boxShadow: isDisabled ? 'none' : '0 4px 6px rgba(21, 128, 61, 0.3)'
        }}
      >
        {loading ? 'Scannen...' : packageType === 'free' && scansRemaining === 0 ? 'Upgrade voor meer scans' : 'Vergelijk prijzen →'}
      </button>
    </div>
  )
}

