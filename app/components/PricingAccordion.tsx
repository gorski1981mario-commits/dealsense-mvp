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
      '✓ 1000+ Nederlandse webshops',
      '⚠️ Na 3 scans: 10% commissie op besparingen',
      '🎁 Referral: deel je unieke code, vrienden krijgen 2% korting op hun eerste aankoop, jij krijgt 2% korting bij verlenging - win-win!'
    ],
    color: '#1E7F5C'
  },
  {
    id: 'plus',
    name: 'PLUS',
    price: '€19,99/mnd',
    features: [
      '✓ Onbeperkt producten scannen',
      '✓ 10 productcategorieën',
      '✓ Slechts 9% commissie op besparingen',
      '✓ Ghost Mode - prijsmonitoring (10 dagen)',
      '✓ Prioriteit support',
      '✓ 1000+ Nederlandse webshops',
      '✓ Echo - AI productadvies & garanties',
      '🎁 Referral PLUS2026: deel code, vrienden -2% op eerste maand, jij -2% bij verlenging. Onbeperkt delen!'
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
      '✓ Slechts 9% commissie op besparingen',
      '✓ Ghost Mode - prijsmonitoring (20 dagen)',
      '✓ Prioriteit support',
      '✓ 1000+ Nederlandse webshops',
      '✓ Echo - volledige AI assistent',
      '🎁 Referral PRO2026: deel code, vrienden -2% op eerste maand, jij -2% bij verlenging. Onbeperkt delen!'
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
      '✓ Slechts 9% commissie op besparingen',
      '✓ Ghost Mode - anonieme vergelijking (30 dagen)',
      '✓ VIP support - directe hulp',
      '✓ 1000+ Nederlandse webshops',
      '✓ Echo - premium AI assistent + financieel advies',
      '💬 Extra Echo prompts: koop 10.000 prompts voor €9,99 (zelfkostenprijs)',
      '🎁 Referral FINANCE2026: deel code, vrienden -2% op eerste maand, jij -2% bij verlenging. Onbeperkt delen!'
    ],
    color: '#1E7F5C'
  },
  {
    id: 'zakelijk',
    name: 'ZAKELIJK B2B',
    price: '€59,99/mnd',
    features: [
      '✓ B2B Procurement - alle 10 industrieën',
      '✓ Metale, Chemicaliën, Energie, Granen, Bouwmaterialen',
      '✓ Machines, Elektronika, Transport, Verpakking, Gereedschap',
      '✓ Vergelijk alle B2B leveranciers',
      '✓ Slechts 10% commissie op transacties',
      '✓ RFQ (Request for Quote) systeem',
      '✓ Dedicated account manager',
      '✓ Certificaten & documentatie (MSDS, COA, ISO)',
      '✓ 1000+ Nederlandse leveranciers',
      '🎁 Referral B2B2026: deel code, andere bedrijven -2% op eerste maand, jij -2% bij verlenging!'
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

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId)
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageType: packageId,
          userId: 'demo-user' // TODO: Get from auth
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        router.push(data.checkoutUrl)
      }
    } catch (err) {
      console.error('Purchase failed:', err)
    } finally {
      setLoading(null)
    }
  }

  const handlePromptsPurchase = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productType: 'echo-prompts',
          userId: 'demo-user' // TODO: Get from auth
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        router.push(data.checkoutUrl)
      }
    } catch (err) {
      console.error('Prompts purchase failed:', err)
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
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '2px solid #86efac',
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
                  color: '#111827',
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
                  <>
                    <button
                      onClick={() => handlePurchase(pkg.id)}
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
                    
                    {(pkg.id === 'plus' || pkg.id === 'pro' || pkg.id === 'finance' || pkg.id === 'zakelijk') && (
                      <button
                        onClick={() => handlePromptsPurchase()}
                        style={{
                          width: '100%',
                          marginTop: '8px',
                          padding: '10px',
                          background: 'white',
                          color: '#1E7F5C',
                          border: '2px solid #1E7F5C',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f0fdf4'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white'
                        }}
                      >
                        💬 Koop 10.000 extra Echo prompts (€9,99)
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div style={{
        marginTop: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)',
        borderRadius: '16px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          margin: 0
        }}>
          Upgrade en begin vandaag met besparen
        </h3>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '48px',
        paddingTop: '24px',
        paddingBottom: '32px',
        borderTop: '1px solid #E5E7EB',
        textAlign: 'center',
        fontSize: '13px',
        color: '#64748b'
      }}>
        <a href="/voorwaarden" style={{ color: '#1E7F5C', textDecoration: 'none', display: 'block', marginBottom: '8px' }}>
          Algemene Voorwaarden
        </a>
        <div>
          © 2026 DealSense.nl
        </div>
      </div>
    </div>
  )
}
