'use client'

import Scanner from '../../components/Scanner'

export default function LabReportsPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: '#7c3aed',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>LAB</span>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        🔬 Lab - Reports
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Experimentele reports functie voor testing.
      </p>

      <Scanner type="pro" />
    </div>
  )
}



