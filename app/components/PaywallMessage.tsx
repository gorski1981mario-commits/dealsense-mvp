'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { PackageType } from '../_lib/package-access'

interface PaywallMessageProps {
  currentPackage: PackageType
  requiredPackage: 'plus' | 'pro' | 'finance'
  featureName: string
}

export default function PaywallMessage({ currentPackage, requiredPackage, featureName }: PaywallMessageProps) {
  const upgradeInfo = {
    plus: {
      price: '€19,99/mnd',
      features: [
        '✓ Onbeperkt producten scannen',
        '✓ 10 productcategorieën',
        '✓ Slechts 9% commissie op besparingen',
        '✓ Ghost Mode - prijsmonitoring (10 dagen)',
        '✓ Prioriteit support',
        '✓ 1000+ Nederlandse webshops',
        '✓ Echo - AI productadvies & garanties'
      ]
    },
    pro: {
      price: '€29,99/mnd',
      features: [
        '✓ Onbeperkt scans - producten én diensten',
        '✓ 16 categorieën (Vakanties, Verzekeringen, Energie, Telecom)',
        '✓ Slechts 9% commissie op besparingen',
        '✓ Ghost Mode - prijsmonitoring (20 dagen)',
        '✓ Prioriteit support',
        '✓ 1000+ Nederlandse webshops',
        '✓ Echo - volledige AI assistent'
      ]
    },
    finance: {
      price: '€39,99/mnd',
      features: [
        '✓ Alles inclusief - alle 20+ categorieën',
        '✓ Hypotheken, Leningen, Leasing, Creditcards',
        '✓ Vergelijk alle financiële producten',
        '✓ Slechts 9% commissie op besparingen',
        '✓ Ghost Mode - anonieme vergelijking (30 dagen)',
        '✓ VIP support - directe hulp',
        '✓ 1000+ Nederlandse webshops',
        '✓ Echo - premium AI assistent + financieel advies'
      ]
    }
  }

  const info = upgradeInfo[requiredPackage]

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      border: '2px solid #86efac',
      borderRadius: '16px',
      padding: '32px',
      textAlign: 'center',
      marginTop: '32px',
      marginBottom: '32px'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        background: '#1E7F5C',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px'
      }}>
        <Lock size={32} color="white" strokeWidth={2} />
      </div>

      <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#15803d', marginBottom: '12px' }}>
        {featureName} is vergrendeld
      </h3>

      <p style={{ fontSize: '16px', color: '#166534', marginBottom: '24px', lineHeight: '1.6' }}>
        Je hebt momenteel het <strong>{currentPackage.toUpperCase()}</strong> pakket.
        <br />
        Upgrade naar <strong>{requiredPackage.toUpperCase()}</strong> voor toegang tot deze functie.
      </p>

      <div style={{
        background: 'linear-gradient(135deg, #f7f7f7 0%, #e9e9e9 100%)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
        textAlign: 'left'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#15803d', marginBottom: '12px' }}>
          {requiredPackage.toUpperCase()} pakket - {info.price}:
        </div>
        {info.features.map((feature, index) => (
          <div key={index} style={{ fontSize: '14px', color: '#166534', marginBottom: '8px' }}>
            {feature}
          </div>
        ))}
      </div>

      <Link
        href={`/${requiredPackage}`}
        style={{
          display: 'inline-block',
          padding: '14px 32px',
          background: '#1E7F5C',
          color: 'white',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 700,
          textDecoration: 'none',
          boxShadow: '0 4px 6px rgba(30, 127, 92, 0.3)'
        }}
      >
        Upgrade naar {requiredPackage.toUpperCase()} →
      </Link>

      <div style={{ fontSize: '12px', color: '#15803d', marginTop: '16px', opacity: 0.8 }}>
        30 dagen geld-terug-garantie
      </div>
    </div>
  )
}
