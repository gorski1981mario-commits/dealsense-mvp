'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function CheckoutPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const packageType = params.packageType as string
  const price = searchParams.get('price')
  const userId = searchParams.get('userId')

  useEffect(() => {
    // TODO: Integrate with Stripe Checkout
    console.log('Checkout:', { packageType, price, userId })
  }, [packageType, price, userId])

  const packageNames: Record<string, string> = {
    plus: 'PLUS',
    pro: 'PRO',
    finance: 'FINANCE'
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Checkout - {packageNames[packageType] || packageType.toUpperCase()}
      </h1>
      
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>
          Je gaat {packageNames[packageType] || packageType.toUpperCase()} pakket kopen voor:
        </div>
        <div style={{ fontSize: '32px', fontWeight: 700, color: '#1E7F5C', marginBottom: '24px' }}>
          €{price}/maand
        </div>
        
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '12px',
          border: '1px solid #fbbf24',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            ⚠️ Stripe integratie in ontwikkeling
          </div>
          <div style={{ fontSize: '13px', color: '#374151' }}>
            De betaling via Stripe wordt binnenkort toegevoegd. Neem contact op via info@dealsense.nl voor handmatige activatie.
          </div>
        </div>

        <a
          href="/packages"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#1E7F5C',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          ← Terug naar paketten
        </a>
      </div>
    </div>
  )
}
