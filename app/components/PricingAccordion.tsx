'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      '✓ 3 Gratis scans om DealSense te proberen',
      '✓ Toegang tot 10 productcategorieën',
      '✓ Basis prijsvergelijking (top 3 deals)',
      '✓ 100+ Nederlandse webshops',
      '⚠️ Na 3 scans: 10% commissie op besparingen',
      '🎁 Referral: 3% korting - deel je code, ontvang korting, help vrienden besparen'
    ],
    color: '#6B7280'
  },
  {
    id: 'plus',
    name: 'PLUS',
    price: '€19,99/mnd',
    features: [
      '✓ Onbeperkt producten scannen',
      '✓ 10 productcategorieën',
      '✓ Slechts 10% commissie op besparingen',
      '✓ Ghost Mode - prijsmonitoring (24u)',
      '✓ Prioriteit support',
      '✓ 100+ Nederlandse webshops',
      '✓ Echo - AI productadvies & garanties',
      '🎁 Referral: 3% korting - deel code PLUS2026, krijg korting bij verlenging'
    ],
    color: '#1E7F5C'
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '€29,99/mnd',
    features: [
      '✓ Onbeperkt scans - producten én diensten',
      '✓ 16 categorieën (Vakanties, Verzekeringen, Energie, Telecom)',
      '✓ Slechts 10% commissie op besparingen',
      '✓ Ghost Mode - prijsmonitoring (24u)',
      '✓ Prioriteit support',
      '✓ 100+ Nederlandse webshops',
      '✓ Echo - volledige AI assistent',
      '🎁 Referral: 3% korting - deel code PRO2026, krijg korting bij verlenging'
    ],
    color: '#1E7F5C'
  },
  {
    id: 'finance',
    name: 'FINANCE',
    price: '€39,99/mnd',
    features: [
      '✓ Alles inclusief - alle 20+ categorieën',
      '✓ Hypotheken, Leningen, Leasing, Creditcards',
      '✓ Vergelijk alle financiële producten',
      '✓ Slechts 10% commissie op besparingen',
      '✓ Ghost Mode - anonieme vergelijking (5 min)',
      '✓ VIP support - directe hulp',
      '✓ 100+ Nederlandse webshops',
      '✓ Echo - premium AI assistent + financieel advies',
      '🎁 Referral: 3% korting - deel code FINANCE2026, krijg korting bij verlenging'
    ],
    color: '#1E7F5C'
  }
]

export default function PricingAccordion() {
  const [openPackage, setOpenPackage] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const togglePackage = (id: string) => {
    setOpenPackage(openPackage === id ? null : id)
  }

  const handlePurchase = async (packageType: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(packageType)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType, userId: 'guest' })
      })
      
      const data = await response.json()
      
      if (data.success && data.checkoutUrl) {
        router.push(data.checkoutUrl)
      }
    } catch (error) {
      console.error('Purchase error:', error)
    } finally {
      setLoading(null)
    }
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
                
                {/* Przycisk zakupu dla płatnych pakietów */}
                {pkg.id !== 'free' && (
                  <button
                    onClick={(e) => handlePurchase(pkg.id, e)}
                    disabled={loading === pkg.id}
                    style={{
                      width: '100%',
                      marginTop: '16px',
                      padding: '12px',
                      background: loading === pkg.id ? '#9ca3af' : pkg.color,
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: loading === pkg.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (loading !== pkg.id) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 127, 92, 0.3)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {loading === pkg.id ? 'Laden...' : 'Koop nu →'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
