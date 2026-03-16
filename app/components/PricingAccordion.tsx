'use client'

import { useState } from 'react'

interface Package {
  id: string
  name: string
  price: string
  features: string[]
  color: string
}

const packages: Package[] = [
  {
    id: 'free',
    name: 'FREE',
    price: '€0',
    features: [
      '✓ 3 gratis scans',
      '✓ 10 categorieën',
      '✓ Basis resultaten'
    ],
    color: '#6B7280'
  },
  {
    id: 'plus',
    name: 'PLUS',
    price: '€19,99',
    features: [
      '✓ Eenmalige betaling',
      '✓ Onbeperkt scans',
      '✓ 10 categorieën',
      '✓ 10% commissie',
      '✓ Fast Mode (24h)'
    ],
    color: '#1E7F5C'
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '€29,99',
    features: [
      '✓ Eenmalige betaling',
      '✓ Onbeperkt scans',
      '✓ 16 categorieën',
      '✓ Vakanties, Verzekeringen',
      '✓ 10% commissie'
    ],
    color: '#1E7F5C'
  },
  {
    id: 'finance',
    name: 'FINANCE',
    price: '€39,99',
    features: [
      '✓ Eenmalige betaling',
      '✓ Alles inclusief',
      '✓ Hypotheken, Leningen',
      '✓ Ghost Mode (5 min)',
      '✓ 10% commissie'
    ],
    color: '#D97706'
  }
]

export default function PricingAccordion() {
  const [openPackage, setOpenPackage] = useState<string | null>(null)

  const togglePackage = (id: string) => {
    setOpenPackage(openPackage === id ? null : id)
  }

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '16px'
    }}>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 600,
        color: '#111827',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        Pakiety
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            onClick={() => togglePackage(pkg.id)}
            style={{
              background: 'white',
              border: `1px solid ${openPackage === pkg.id ? pkg.color : '#E5E7EB'}`,
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {/* Header - zawsze widoczny */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B7280',
                  letterSpacing: '0.5px'
                }}>
                  {pkg.name}
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#111827'
                }}>
                  {pkg.price}
                </div>
              </div>
              
              <div style={{
                fontSize: '16px',
                color: '#6B7280',
                transition: 'transform 0.15s ease',
                transform: openPackage === pkg.id ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </div>
            </div>

            {/* Rozwijana zawartość */}
            {openPackage === pkg.id && (
              <div style={{
                marginTop: '12px',
                paddingTop: '12px',
                borderTop: '1px solid #E5E7EB'
              }}>
                {pkg.features.map((feature, idx) => (
                  <div
                    key={idx}
                    style={{
                      fontSize: '14px',
                      color: '#374151',
                      marginBottom: '6px',
                      lineHeight: '1.5'
                    }}
                  >
                    {feature}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
