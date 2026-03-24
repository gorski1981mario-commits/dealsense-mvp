'use client'

import Scanner from '../../components/Scanner'

export default function LabWaApiPage() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: '#25D366',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>LAB-WA</span>
      </div>

      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        💬 Lab WhatsApp - Api
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        WhatsApp integratie voor api functie.
      </p>

      <Scanner type="pro" />

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'linear-gradient(135deg, #E6F4EE 0%, #bbf7d0 100%)',
        borderRadius: '12px',
        border: '1px solid #86efac'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          💬 WhatsApp Integration
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          Stuur resultaten direct naar WhatsApp.
        </div>
      </div>
    </div>
  )
}




