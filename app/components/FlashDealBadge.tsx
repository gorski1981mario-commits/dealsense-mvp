'use client'

import { useEffect, useState } from 'react'
import { FlashDeals, FlashDeal } from '../_lib/flash-deals'

interface FlashDealBadgeProps {
  ean: string
  onDealExpired?: () => void
}

export default function FlashDealBadge({ ean, onDealExpired }: FlashDealBadgeProps) {
  const [deal, setDeal] = useState<FlashDeal | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [urgency, setUrgency] = useState<'high' | 'medium' | 'low'>('low')

  useEffect(() => {
    // Check if product has Flash Deal
    const flashDeal = FlashDeals.getFlashDealForProduct(ean)
    setDeal(flashDeal)

    if (!flashDeal) return

    // Update timer every second
    const interval = setInterval(() => {
      const remaining = FlashDeals.getTimeRemaining(flashDeal.expiresAt)
      const urgencyLevel = FlashDeals.getUrgencyLevel(flashDeal.expiresAt)
      
      setTimeRemaining(remaining)
      setUrgency(urgencyLevel)

      // Check if expired
      if (flashDeal.expiresAt < Date.now()) {
        setDeal(null)
        if (onDealExpired) onDealExpired()
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [ean, onDealExpired])

  if (!deal) return null

  // Colors based on urgency
  const colors = {
    high: {
      bg: '#fee2e2',
      border: '#ef4444',
      text: '#991b1b',
      pulse: '#dc2626'
    },
    medium: {
      bg: '#fed7aa',
      border: '#f97316',
      text: '#9a3412',
      pulse: '#ea580c'
    },
    low: {
      bg: '#fef3c7',
      border: '#eab308',
      text: '#854d0e',
      pulse: '#ca8a04'
    }
  }

  const color = colors[urgency]

  return (
    <div
      style={{
        background: color.bg,
        border: `2px solid ${color.border}`,
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Pulsing animation for high urgency */}
      {urgency === 'high' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: color.pulse,
            opacity: 0.1,
            animation: 'pulse 2s infinite'
          }}
        />
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Flash Deal Header */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: 700, 
            color: color.text,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            ⚡ FLASH DEAL
          </div>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: 600, 
            color: color.text,
            background: 'white',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            ⏰ {timeRemaining}
          </div>
        </div>

        {/* Savings */}
        <div style={{ 
          fontSize: '16px', 
          fontWeight: 700, 
          color: color.text,
          marginBottom: '4px'
        }}>
          Bespaar €{deal.savings.toFixed(0)} ({deal.savingsPercent}%)
        </div>

        {/* Quantity Left */}
        <div style={{ 
          fontSize: '12px', 
          color: color.text,
          opacity: 0.8
        }}>
          🔥 Nog maar {deal.quantityLeft} van {deal.quantityTotal} beschikbaar!
        </div>

        {/* Progress Bar */}
        <div style={{
          marginTop: '8px',
          height: '4px',
          background: 'rgba(0,0,0,0.1)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            width: `${(deal.quantityLeft / deal.quantityTotal) * 100}%`,
            background: color.border,
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
      `}</style>
    </div>
  )
}
