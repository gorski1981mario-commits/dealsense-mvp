'use client'

import { useState, useEffect } from 'react'
import { Storage, ScanRecord } from '../_lib/storage'

interface ScanHistoryProps {
  userId: string
  packageType: 'free' | 'plus' | 'pro' | 'finance' | 'zakelijk'
}

export default function ScanHistory({ userId, packageType }: ScanHistoryProps) {
  const [scans, setScans] = useState<ScanRecord[]>([])
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    loadScans()
  }, [userId])

  const loadScans = () => {
    const history = Storage.getScanHistory(userId)
    setScans(history)
  }

  const displayScans = showAll ? scans : scans.slice(0, 5)
  const totalSavings = scans.reduce((sum, scan) => sum + (scan.savings || 0), 0)

  if (scans.length === 0) {
    return (
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: '#111827' }}>
          Nog geen scans
        </div>
        <div style={{ fontSize: '13px', color: '#111827' }}>
          Start met scannen om je geschiedenis te zien
        </div>
      </div>
    )
  }

  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #E2E8F0'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
            Scan Geschiedenis
          </div>
          <div style={{ fontSize: '12px' }}>
            <span style={{ color: '#3b82f6', fontWeight: 600 }}>{scans.length} scans</span> • <span style={{ color: '#15803d', fontWeight: 600 }}>€{totalSavings.toFixed(2)} totaal bespaard</span>
          </div>
        </div>
        <div style={{
          padding: '6px 12px',
          background: 'rgba(37,139,82,0.12)',
          color: '#258b52',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>
          {packageType.toUpperCase()}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {displayScans.map((scan) => (
          <div
            key={scan.id}
            style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#3b82f6' }}>
                  {scan.category}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>
                  {new Date(scan.timestamp).toLocaleDateString('nl-NL', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              {scan.savings && scan.savings > 0 && (
                <div style={{
                  padding: '4px 8px',
                  background: '#dcfce7',
                  color: '#15803d',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700
                }}>
                  -€{scan.savings.toFixed(2)}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
              <div>
                <span style={{ color: '#64748b' }}>Jouw prijs:</span>{' '}
                <span style={{ fontWeight: 600 }}>€{scan.basePrice.toFixed(2)}</span>
              </div>
              {scan.bestOffer && (
                <div>
                  <span style={{ color: '#64748b' }}>Beste:</span>{' '}
                  <span style={{ fontWeight: 600, color: '#15803d' }}>€{scan.bestOffer.price.toFixed(2)}</span>
                </div>
              )}
            </div>

            {scan.bestOffer && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#64748b' }}>
                bij {scan.bestOffer.seller}
              </div>
            )}
          </div>
        ))}
      </div>

      {scans.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '10px',
            background: 'transparent',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#258b52',
            cursor: 'pointer'
          }}
        >
          {showAll ? 'Toon minder' : `Toon alle ${scans.length} scans`}
        </button>
      )}

      <button
        onClick={() => {
          const data = Storage.exportData(userId)
          const blob = new Blob([data], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `dealsense-data-${new Date().toISOString().split('T')[0]}.json`
          a.click()
        }}
        style={{
          width: '100%',
          marginTop: '12px',
          padding: '10px',
          background: '#f1f5f9',
          border: 'none',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#1e1e1e',
          cursor: 'pointer'
        }}
      >
        📥 Exporteer data
      </button>
    </div>
  )
}



