'use client'

import Link from 'next/link'

export default function VasteLastenPage() {
  const configurators = [
    { href: '/vacations', icon: '🏖️', title: 'Vakanties', desc: 'Vergelijk vakantieaanbiedingen', package: 'PRO' },
    { href: '/insurance', icon: '🛡️', title: 'Verzekeringen', desc: 'Vind de beste verzekering', package: 'PRO' },
    { href: '/energy', icon: '⚡', title: 'Energie', desc: 'Bespaar op stroom & gas', package: 'PRO' },
    { href: '/telecom', icon: '📱', title: 'Telecom', desc: 'Mobiel, internet & TV', package: 'PRO' },
    { href: '/mortgage', icon: '🏠', title: 'Hypotheek', desc: 'Beste hypotheek rente', package: 'FINANCE' },
    { href: '/leasing', icon: '🚗', title: 'Leasing', desc: 'Auto leasing vergelijken', package: 'FINANCE' },
    { href: '/loan', icon: '💰', title: 'Lening', desc: 'Persoonlijke lening', package: 'FINANCE' },
    { href: '/creditcard', icon: '💳', title: 'Creditcard', desc: 'Beste creditcard deals', package: 'FINANCE' }
  ]

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Vaste lasten configurators
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Gebruik onze geavanceerde configurators om de beste deals te vinden en te besparen op je vaste lasten.
      </p>

      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '12px',
        border: '1px solid #fbbf24',
        marginBottom: '32px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          💡 Gemiddelde besparing: €150-300 per jaar
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          De meeste mensen kunnen 15-25% besparen op hun vaste lasten door over te stappen.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {configurators.map((config) => (
          <Link
            key={config.href}
            href={config.href}
            style={{
              display: 'block',
              padding: '20px',
              background: 'white',
              border: '2px solid #E5E7EB',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#1E7F5C'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 127, 92, 0.15)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#E5E7EB'
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '32px' }}>{config.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                  {config.title}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: config.package === 'PRO' ? '#1E7F5C' : '#258b52', background: config.package === 'PRO' ? '#E6F4EE' : 'rgba(37,139,82,0.12)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                  {config.package}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
              {config.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
