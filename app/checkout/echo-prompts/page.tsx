'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const price = searchParams.get('price') || '9.99'
  const quantity = searchParams.get('quantity') || '10000'
  const userId = searchParams.get('userId')

  useEffect(() => {
    // TODO: Integrate with Stripe Checkout
    console.log('Echo Prompts Checkout:', { price, quantity, userId })
  }, [price, quantity, userId])

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Checkout - Extra Echo Prompts
      </h1>
      
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        marginBottom: '24px'
      }}>
        <div style={{ fontSize: '16px', color: '#374151', marginBottom: '16px' }}>
          Je gaat {quantity} extra Echo prompts kopen voor:
        </div>
        <div style={{ fontSize: '32px', fontWeight: 700, color: '#15803d', marginBottom: '16px' }}>
          €{price}
        </div>
        
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #E6F4EE 0%, #bbf7d0 100%)',
          borderRadius: '12px',
          border: '1px solid #86efac',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            💬 {quantity} Echo prompts
          </div>
          <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
            ✓ Zelfkostenprijs - geen winst voor DealSense
          </div>
          <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
            ✓ Geldig voor 12 maanden
          </div>
          <div style={{ fontSize: '13px', color: '#374151' }}>
            ✓ Werkt met alle abonnementen (PLUS/PRO/FINANCE)
          </div>
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
            background: '#15803d',
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

export default function EchoPromptsCheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>Laden...</div>}>
      <CheckoutContent />
    </Suspense>
  )
}




