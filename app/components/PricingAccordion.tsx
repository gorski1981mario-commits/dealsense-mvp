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
    price: '',
    features: [
      '✓ 3 Gratis scans om DealSense te proberen',
      '✓ Toegang tot 10 productcategorieën',
      '✓ Basis prijsvergelijking'
    ],
    color: '#6B7280'
  },
  {
    id: 'plus',
    name: 'PLUS',
    price: '',
    features: [
      '✓ Onbeperkt producten scannen',
      '✓ 10 productcategorieën',
      '✓ Ghost Mode (24u)',
      '✓ Prioriteit support'
    ],
    color: '#1E7F5C'
  },
  {
    id: 'pro',
    name: 'PRO',
    price: '',
    features: [
      '✓ Onbeperkt scans - producten én diensten',
      '✓ 16 categorieën (Vakanties, Verzekeringen, Energie, Telecom)',
      '✓ Ghost Mode (24u)',
      '✓ Prioriteit support'
    ],
    color: '#1E7F5C'
  },
  {
    id: 'finance',
    name: 'FINANCE',
    price: '',
    features: [
      '✓ Alles inclusief - alle 20+ categorieën',
      '✓ Hypotheken, Leningen, Leasing, Creditcards',
      '✓ Ghost Mode (5 min - anoniem)',
      '✓ VIP support - directe hulp'
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
              <div style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#111827',
                letterSpacing: '0.5px'
              }}>
                {pkg.name}
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
