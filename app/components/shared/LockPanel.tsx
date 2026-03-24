'use client'

import { Lock, Download } from 'lucide-react'

interface LockPanelProps {
  isLocked: boolean
  configId: string | null
  onUnlock: () => void
  onDownloadPDF: () => void
}

export default function LockPanel({ 
  isLocked, 
  configId, 
  onUnlock, 
  onDownloadPDF 
}: LockPanelProps) {
  if (!isLocked || !configId) return null

  return (
    <div style={{
      background: '#E6F4EE',
      border: '1px solid #15803d',
      borderRadius: '8px',
      padding: '12px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <Lock size={16} color="#15803d" />
        <div>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: '#15803d'
          }}>
            Configuratie opgeslagen
          </div>
          <div style={{
            fontSize: '11px',
            color: '#6B7280'
          }}>
            ID: {configId}
          </div>
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        gap: '8px'
      }}>
        <button
          type="button"
          onClick={onUnlock}
          title="Ontgrendelen"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: 'white',
            border: '2px solid #15803d',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          👆
        </button>
        <button
          type="button"
          onClick={onDownloadPDF}
          title="Download PDF"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            background: '#15803d',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <Download size={18} color="white" />
        </button>
      </div>
    </div>
  )
}




