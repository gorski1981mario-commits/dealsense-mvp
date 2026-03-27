'use client'

import Scanner from '../../components/Scanner'

export default function LabScanPage() {
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
        🔬 Lab - Scan
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Experimentele scan functie. Test nieuwe features voordat ze live gaan.
      </p>

      <Scanner type="pro" />

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '12px',
        border: '1px solid #fbbf24'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          ⚠️ Experimenteel
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          Deze functie is in beta. Resultaten kunnen afwijken.
        </div>
      </div>
    </div>
  )
}





