'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sun, ShieldCheck, Zap, Smartphone, Home, Car, Banknote, CreditCard, Lock } from 'lucide-react'
import { PackageType, hasConfiguratorAccess } from '../_lib/package-access'
import { getDeviceId } from '../_lib/utils'
import PaywallMessage from '../components/PaywallMessage'

export default function VasteLastenPage() {
  const [userPackage, setUserPackage] = useState<PackageType>('free')
  const userId = typeof window !== 'undefined' ? getDeviceId() : 'user_demo'

  useEffect(() => {
    // Get user package from localStorage
    if (typeof window !== 'undefined') {
      const savedPackage = localStorage.getItem(`package_${userId}`) as PackageType
      setUserPackage(savedPackage || 'free')
    }
  }, [userId])

  const configurators = [
    { href: '/vacations', Icon: Sun, title: 'Vakanties', desc: 'Vergelijk vakantieaanbiedingen', package: 'PRO', requiredPackage: 'pro' as const },
    { href: '/insurance', Icon: ShieldCheck, title: 'Verzekeringen', desc: 'Vind de beste verzekering', package: 'PRO', requiredPackage: 'pro' as const },
    { href: '/energy', Icon: Zap, title: 'Energie', desc: 'Bespaar op stroom & gas', package: 'PRO', requiredPackage: 'pro' as const },
    { href: '/telecom', Icon: Smartphone, title: 'Telecom', desc: 'Mobiel, internet & TV', package: 'PRO', requiredPackage: 'pro' as const },
    { href: '/mortgage', Icon: Home, title: 'Hypotheek', desc: 'Beste hypotheek rente', package: 'FINANCE', requiredPackage: 'finance' as const },
    { href: '/leasing', Icon: Car, title: 'Leasing', desc: 'Auto leasing vergelijken', package: 'FINANCE', requiredPackage: 'finance' as const },
    { href: '/loan', Icon: Banknote, title: 'Lening', desc: 'Persoonlijke lening', package: 'FINANCE', requiredPackage: 'finance' as const },
    { href: '/creditcard', Icon: CreditCard, title: 'Creditcard', desc: 'Beste creditcard deals', package: 'FINANCE', requiredPackage: 'finance' as const }
  ]

  const hasProAccess = hasConfiguratorAccess(userPackage, 'pro')
  const hasFinanceAccess = hasConfiguratorAccess(userPackage, 'finance')

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Vaste lasten configurators
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Gebruik onze geavanceerde configurators om de beste deals te vinden en te besparen op je vaste lasten.
      </p>

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
              <config.Icon size={32} strokeWidth={2} color="#1E7F5C" />
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
