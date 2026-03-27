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

  // ⚠️ PRO/FINANCE KONFIGURATORY ODPIĘTE - backup w _BACKUP_PRO_FINANCE
  // Przywrócimy gdy dostaniemy więcej API (Travelpayouts, Independer, etc.)
  const configurators: Array<{
    href: string
    Icon: any
    title: string
    desc: string
    package: string
    requiredPackage: 'pro' | 'finance'
  }> = [
    // PRO configurators - ODPIĘTE (brak API)
    // { href: '/vacations', Icon: Sun, title: 'Vakanties', desc: 'Vergelijk vakantieaanbiedingen', package: 'PRO', requiredPackage: 'pro' as const },
    // { href: '/insurance', Icon: ShieldCheck, title: 'Verzekeringen', desc: 'Vind de beste verzekering', package: 'PRO', requiredPackage: 'pro' as const },
    // { href: '/energy', Icon: Zap, title: 'Energie', desc: 'Bespaar op stroom & gas', package: 'PRO', requiredPackage: 'pro' as const },
    // { href: '/telecom', Icon: Smartphone, title: 'Telecom', desc: 'Mobiel, internet & TV', package: 'PRO', requiredPackage: 'pro' as const },
    
    // FINANCE configurators - ODPIĘTE (brak API)
    // { href: '/mortgage', Icon: Home, title: 'Hypotheek', desc: 'Beste hypotheek rente', package: 'FINANCE', requiredPackage: 'finance' as const },
    // { href: '/leasing', Icon: Car, title: 'Leasing', desc: 'Auto leasing vergelijken', package: 'FINANCE', requiredPackage: 'finance' as const },
    // { href: '/loan', Icon: Banknote, title: 'Lening', desc: 'Persoonlijke lening', package: 'FINANCE', requiredPackage: 'finance' as const },
    // { href: '/creditcard', Icon: CreditCard, title: 'Creditcard', desc: 'Beste creditcard deals', package: 'FINANCE', requiredPackage: 'finance' as const }
  ]

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Vaste lasten configurators
      </h1>
      
      <p style={{ fontSize: '16px', color: '#111827', marginBottom: '24px', lineHeight: '1.6' }}>
        Binnenkort beschikbaar: geavanceerde configurators voor vakanties, verzekeringen, energie en meer.
      </p>

      {configurators.length === 0 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #E6F4EE 0%, #E6F4EE 100%)', 
          border: '2px solid #86efac',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#166534', marginBottom: '8px' }}>
            🚧 Configurators binnenkort beschikbaar
          </div>
          <div style={{ fontSize: '14px', color: '#166534', lineHeight: '1.6' }}>
            We werken aan geavanceerde configurators voor vakanties, verzekeringen, energie, telecom en financiële diensten.
            <br />
            Gebruik nu onze <strong>Scanner</strong> om producten te vergelijken!
          </div>
        </div>
      )}

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
              e.currentTarget.style.borderColor = '#15803d'
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
              <config.Icon size={32} strokeWidth={2} color="#15803d" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                  {config.title}
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: config.package === 'PRO' ? '#15803d' : '#15803d', background: config.package === 'PRO' ? '#E6F4EE' : 'rgba(37,139,82,0.12)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                  {config.package}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#111827', margin: 0 }}>
              {config.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}





