'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { PackageType } from '../_lib/package-access'

interface PaywallMessageProps {
  currentPackage: PackageType
  requiredPackage: 'pro' | 'finance'
  featureName: string
}

export default function PaywallMessage({ currentPackage, requiredPackage, featureName }: PaywallMessageProps) {
  const upgradeInfo = {
    pro: {
      price: '€29.99',
      features: [
        'Onbeperkt scans - producten én diensten',
        'Ghost Mode (20 dagen)',
        '4 Diensten Configurators',
        'Slechts 9% commissie'
      ]
    },
    finance: {
      price: '€39.99',
      features: [
        'Alles inclusief - alle 20+ categorieën',
        'Ghost Mode (30 dagen)',
        '8 Configurators (diensten + finance)',
        'Bills Optimizer',
        'Slechts 9% commissie'
      ]
    }
  }

  const info = upgradeInfo[requiredPackage]

  return (
    <div style={{
      background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
      border: '2px solid #F59E0B',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      marginTop: '32px',
      marginBottom: '32px'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: '#F59E0B',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px'
      }}>
        <Lock size={32} color="white" strokeWidth={2} />
      </div>

      <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#92400E', marginBottom: '12px' }}>
        {featureName} is vergrendeld
      </h3>

      <p style={{ fontSize: '16px', color: '#78350F', marginBottom: '24px', lineHeight: '1.6' }}>
        Je hebt momenteel het <strong>{currentPackage.toUpperCase()}</strong> pakket.
        <br />
        Upgrade naar <strong>{requiredPackage.toUpperCase()}</strong> voor toegang tot deze functie.
      </p>

      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        textAlign: 'left'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#92400E', marginBottom: '12px' }}>
          {requiredPackage.toUpperCase()} pakket - {info.price}/maand:
        </div>
        {info.features.map((feature, index) => (
          <div key={index} style={{ fontSize: '14px', color: '#78350F', marginBottom: '8px' }}>
            ✓ {feature}
          </div>
        ))}
      </div>

      <Link
        href={`/${requiredPackage}`}
        style={{
          display: 'inline-block',
          padding: '14px 32px',
          background: '#F59E0B',
          color: 'white',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 700,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)'
        }}
      >
        Upgrade naar {requiredPackage.toUpperCase()} →
      </Link>

      <div style={{ fontSize: '12px', color: '#92400E', marginTop: '16px', opacity: 0.8 }}>
        30 dagen geld-terug-garantie
      </div>
    </div>
  )
}
