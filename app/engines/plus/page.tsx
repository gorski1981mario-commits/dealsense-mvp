'use client'

import Scanner from '../../components/Scanner'

export default function EnginePlusPage() {
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
        }}>ENGINE</span>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        ⚙️ Engine - PLUS
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        PLUS scan engine met geoptimaliseerde performance.
      </p>

      <Scanner type="pro" />

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
        borderRadius: '12px',
        border: '1px solid #fca5a5'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Performance
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          Deze engine is geoptimaliseerd voor plus pakket.
        </div>
      </div>
    </div>
  )
}





