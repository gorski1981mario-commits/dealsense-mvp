'use client'

import { useState } from 'react'
import { COMMISSION } from '../_lib/constants'

interface PaymentButtonProps {
  packageType: 'plus' | 'pro' | 'finance'
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
  const commissionRate = parseFloat(COMMISSION[packageType].replace('%', '')) / 100
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
    finance: 'FINANCE'
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Referral Code Input */}
      <div style={{ 
        marginBottom: '16px', 
        padding: '16px', 
        background: '#F9FAFB', 
        borderRadius: '8px',
        border: '1px solid #E5E7EB'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
          🎁 Heb je een referral code?
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={referralCode}
            onChange={(e) => {
              setReferralCode(e.target.value)
              setCodeValidated(false)
              setCodeError('')
            }}
            placeholder="Voer code in..."
            disabled={codeValidated}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: `1px solid ${codeError ? '#EF4444' : codeValidated ? '#10B981' : '#D1D5DB'}`,
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              background: codeValidated ? '#F0FDF4' : 'white'
            }}
          />
          <button
            onClick={handleValidateCode}
            disabled={validatingCode || codeValidated || !referralCode.trim()}
            style={{
              padding: '10px 16px',
              background: codeValidated ? '#10B981' : validatingCode ? '#9CA3AF' : '#1E7F5C',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: (validatingCode || codeValidated || !referralCode.trim()) ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {validatingCode ? '...' : codeValidated ? '✓ Geldig' : 'Gebruik'}
          </button>
        </div>
        {codeError && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#EF4444' }}>
            ⚠️ {codeError}
          </div>
        )}
        {codeValidated && (
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
            ✓ Code geactiveerd! Je krijgt 2% korting
          </div>
        )}
      </div>

      {/* Price Breakdown */}
      <div style={{
        marginBottom: '16px',
        padding: '16px',
        background: '#FFFBEB',
        borderRadius: '8px',
        border: '1px solid #FCD34D'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#92400E', marginBottom: '12px' }}>
          💰 Prijsoverzicht
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', color: '#78350F' }}>Pakket {packageNames[packageType]}</span>
          <span style={{ fontSize: '13px', color: '#78350F' }}>€{basePrice.toFixed(2)}</span>
        </div>

        {codeValidated && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>🎁 Referral korting (-2%)</span>
            <span style={{ fontSize: '13px', color: '#10B981', fontWeight: 600 }}>-€{referralDiscount.toFixed(2)}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '13px', color: '#78350F' }}>Commissie (+9%)</span>
          <span style={{ fontSize: '13px', color: '#78350F' }}>+€{commission.toFixed(2)}</span>
        </div>

        <div style={{ 
          borderTop: '1px solid #FCD34D', 
          marginTop: '8px', 
          paddingTop: '8px',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#92400E' }}>Totaal</span>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#92400E' }}>€{finalPrice.toFixed(2)}/maand</span>
        </div>

        {codeValidated && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#10B981', fontStyle: 'italic' }}>
            ✨ Je bespaart €{referralDiscount.toFixed(2)} met deze code!
          </div>
        )}
      </div>

      {/* Payment Button */}
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
        {loading ? 'Verwerken...' : `Betaal €${finalPrice.toFixed(2)}/maand`}
      </button>
    </div>
  )
}
