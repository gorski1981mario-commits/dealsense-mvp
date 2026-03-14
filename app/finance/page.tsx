'use client'

import Scanner from '../components/Scanner'
import AgentEcho from '../components/AgentEcho'

export default function FinancePage() {
  const userId = typeof window !== 'undefined' ? (localStorage.getItem('dealsense_device_id') || 'user_demo') : 'user_demo'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: 'rgba(37,139,82,0.12)',
          color: '#258b52',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>FINANCE</span>
      </div>
      
      <p style={{ fontSize: '18px', color: '#374151', marginBottom: '32px' }}>
        Voor complete financiële controle. Alle tools, geen commissie.
      </p>

      {/* Agent Echo */}
      <AgentEcho packageType="finance" userId={userId} />

      {/* QR Scanner */}
      <Scanner type="finance" />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#6b21a8' }}>€39,99</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>Eenmalige betaling</div>
        </div>
        <button style={{
          padding: '10px 20px',
          background: '#258b52',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>Upgrade nu</button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Wat krijg je:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Alles inclusief</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Shopping + Services</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Hypotheken</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Leningen</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Leasing</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ 0% commissie</div>
        </div>
      </div>
    </div>
  )
}
