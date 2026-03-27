'use client'

import { useState } from 'react'

export default function DocumentInboxPanel() {
  const [active, setActive] = useState(false)

  return (
    <div style={{
      padding: '20px',
      background: 'white',
      border: '1px solid #E2E8F0',
      borderRadius: '12px'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
        Document inbox management
      </h3>
      <button
        onClick={() => setActive(!active)}
        style={{
          padding: '8px 16px',
          background: active ? '#15803d' : '#E2E8F0',
          color: active ? 'white' : '#374151',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer'
        }}
      >
        {active ? 'Active' : 'Inactive'}
      </button>
    </div>
  )
}





