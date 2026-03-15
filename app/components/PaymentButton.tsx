'use client'

import { useState } from 'react'

interface PaymentButtonProps {
  packageType: 'plus' | 'pro' | 'finance'
  userId: string
  price: number
}

export default function PaymentButton({ packageType, userId, price }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageType, userId })
      })

      const data = await response.json()

      if (data.success && data.checkoutUrl) {
        // Redirect to Stripe checkout or iDEAL payment page
        window.location.href = data.checkoutUrl
      } else {
        alert('Betaling mislukt. Probeer opnieuw.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Fout bij betaling. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const packageNames = {
    plus: 'PLUS',
    pro: 'PRO',
    finance: 'FINANCE'
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      style={{
        padding: '12px 24px',
        background: loading ? '#9ca3af' : '#15803d',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 6px rgba(21, 128, 61, 0.3)',
        width: '100%'
      }}
    >
      {loading ? 'Verwerken...' : `Upgrade naar ${packageNames[packageType]} - €${price.toFixed(2)}/maand`}
    </button>
  )
}
