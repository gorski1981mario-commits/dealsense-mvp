'use client'

import Scanner from '../components/Scanner'
import AgentEcho from '../components/AgentEcho'

export default function PlusPage() {
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
        }}>PLUS</span>
      </div>
      
      <p style={{ fontSize: '18px', color: '#374151', marginBottom: '32px' }}>
        Voor snelle checks. Je krijgt overzicht en context, maar jij beslist.
      </p>

      {/* Agent Echo */}
      <AgentEcho packageType="plus" userId={userId} />

      {/* QR Scanner */}
      <Scanner type="plus" />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#258b52' }}>€19,99</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>Eenmalige betaling</div>
        </div>
        <button style={{
          padding: '10px 20px',
          background: '#15803d',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(21, 128, 61, 0.3)'
        }}>Upgrade nu</button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Wat krijg je:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Onbeperkt scans</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Shopping</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Ghost Mode (24h)</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ 5% commissie</div>
        </div>
      </div>
    </div>
  )
}
