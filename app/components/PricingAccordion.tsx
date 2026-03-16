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
      '✓ 3 Gratis Kans - probeer DealSense gratis',
      '✓ Scan tot 3 producten zonder kosten',
      '✓ Toegang tot 10 productcategorieën',
      '✓ Basis prijsvergelijking',
      '⚠️ Na 3 scans: 10% commissie op besparingen'
    ],
    color: '#6B7280'
  },
  {
    id: 'plus',
    name: 'PLUS',
    price: '€19,99/mnd',
    features: [
      '✓ Maandelijks abonnement - opzegbaar',
      '✓ Onbeperkt producten scannen',
      '✓ Toegang tot 10 productcategorieën',
      '✓ Slechts 10% commissie op besparingen',
      '✓ Fast Mode - resultaten binnen 24 uur',
      '✓ Prioriteit support'
    ],
    color: '#1E7F5C'
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '€29,99/mnd',
    features: [
      '✓ Maandelijks abonnement - opzegbaar',
      '✓ Onbeperkt scans - producten én diensten',
      '✓ 16 categorieën inclusief Vakanties & Verzekeringen',
      '✓ Vergelijk energie, internet, mobiel, TV',
      '✓ Slechts 10% commissie op besparingen',
      '✓ Fast Mode - resultaten binnen 24 uur',
      '✓ Prioriteit support'
    ],
    color: '#1E7F5C'
  },
  {
    id: 'finance',
    name: 'FINANCE',
    price: '€39,99/mnd',
    features: [
      '✓ Maandelijks abonnement - opzegbaar',
      '✓ Alles inclusief - alle 20+ categorieën',
      '✓ Hypotheken, Leningen, Leasing, Creditcards',
      '✓ Vergelijk alle financiële producten',
      '✓ Ghost Mode - anonieme vergelijking (5 min)',
      '✓ Slechts 10% commissie op besparingen',
      '✓ Fast Mode - resultaten binnen 24 uur',
      '✓ VIP support - directe hulp'
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
