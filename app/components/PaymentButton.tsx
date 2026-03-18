'use client'

import { useState } from 'react'
import { COMMISSION } from '../_lib/constants'

interface PaymentButtonProps {
  packageType: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId: string
  price: number
}

export default function PaymentButton({ packageType, userId, price }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [codeValidated, setCodeValidated] = useState(false)
  const [codeError, setCodeError] = useState('')
  const [validatingCode, setValidatingCode] = useState(false)

  // Price calculation with referral code and commission
  const basePrice = price
  const referralDiscount = codeValidated ? basePrice * 0.02 : 0 // -2% if code valid
  const priceAfterDiscount = basePrice - referralDiscount
  const commissionRate = parseFloat((COMMISSION[packageType as keyof typeof COMMISSION] || '10%').replace('%', '')) / 100
  const commission = priceAfterDiscount * commissionRate
  const finalPrice = priceAfterDiscount + commission

  const handleValidateCode = async () => {
    if (!referralCode.trim()) {
      setCodeError('Voer een code in')
      return
    }

    setValidatingCode(true)
    setCodeError('')

    try {
      const deviceId = localStorage.getItem('device_id') || 'unknown'
      const response = await fetch('/api/referral/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tokenId: referralCode,
          deviceId,
          userId 
        })
      })

      const data = await response.json()

      if (data.valid) {
        setCodeValidated(true)
        setCodeError('')
      } else {
        setCodeError(data.error || 'Code ongeldig')
        setCodeValidated(false)
      }
    } catch (error) {
      setCodeError('Fout bij validatie')
      setCodeValidated(false)
    } finally {
      setValidatingCode(false)
    }
  }

  const handlePayment = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packageType, 
          userId,
          referralCode: codeValidated ? referralCode : null,
          finalPrice: finalPrice.toFixed(2)
        })
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
    finance: 'FINANCE',
    zakelijk: 'ZAKELIJK B2B'
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      style={{
        padding: '16px 24px',
        background: loading ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #15803d 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '16px',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)',
        width: '100%',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(30, 127, 92, 0.4)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 127, 92, 0.3)'
      }}
    >
      {loading ? 'Verwerken...' : `Activeer ${packageNames[packageType]} - €${price.toFixed(2)}/maand`}
    </button>
  )
}


