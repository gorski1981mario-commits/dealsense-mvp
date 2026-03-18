'use client'

import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'

interface ReferralShareProps {
  tokenId: string
  shareUrl: string
  packageType: 'plus' | 'pro' | 'finance'
}

export default function ReferralShare({ tokenId, shareUrl, packageType }: ReferralShareProps) {
  const [copied, setCopied] = useState(false)

  const packageNames = {
    plus: 'PLUS',
    pro: 'PRO',
    finance: 'FINANCE'
  }

  const shareMessage = `🎉 Ik gebruik DealSense ${packageNames[packageType]} en bespaar geld!

🎁 Gebruik mijn code voor 2% korting op je eerste maand:
${tokenId}

Of klik hier: ${shareUrl}

💰 DealSense helpt je de beste deals vinden!`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Code: ${tokenId}\nLink: ${shareUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Kopiëren mislukt')
    }
  }

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`
    window.open(url, '_blank')
  }

  const handleSMS = () => {
    const url = `sms:?body=${encodeURIComponent(shareMessage)}`
    window.location.href = url
  }

  const handleEmail = () => {
    const subject = encodeURIComponent('🎁 DealSense Referral Code - 2% Korting!')
    const body = encodeURIComponent(shareMessage)
    const url = `mailto:?subject=${subject}&body=${body}`
    window.location.href = url
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🎁 DealSense Referral Code',
          text: shareMessage,
          url: shareUrl
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  return (
    <div style={{
      padding: '20px',
      background: '#F0FDF4',
      borderRadius: '12px',
      border: '2px solid #10B981',
      marginTop: '20px'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎁</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#065F46', marginBottom: '4px' }}>
          Jouw Referral Code
        </div>
        <div style={{ fontSize: '13px', color: '#047857' }}>
          Deel met vrienden en help ze besparen!
        </div>
      </div>

      {/* Code Display */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #D1FAE5',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '12px', color: '#047857', marginBottom: '4px' }}>
          Code (geldig 7 dagen)
        </div>
        <div style={{ 
          fontSize: '20px', 
          fontWeight: 700, 
          color: '#065F46',
          fontFamily: 'monospace',
          letterSpacing: '1px'
        }}>
          {tokenId}
        </div>
      </div>

      {/* Share Buttons */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#065F46', marginBottom: '8px' }}>
          Deel via:
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            style={{
              padding: '12px',
              background: '#25D366',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '18px' }}>💬</span>
            WhatsApp
          </button>

          {/* SMS */}
          <button
            onClick={handleSMS}
            style={{
              padding: '12px',
              background: '#0EA5E9',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '18px' }}>📱</span>
            SMS
          </button>

          {/* Email */}
          <button
            onClick={handleEmail}
            style={{
              padding: '12px',
              background: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span style={{ fontSize: '18px' }}>✉️</span>
            Email
          </button>

          {/* Native Share (if available) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              style={{
                padding: '12px',
                background: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={16} />
              Delen
            </button>
          )}
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={handleCopy}
        style={{
          width: '100%',
          padding: '12px',
          background: copied ? '#10B981' : 'white',
          color: copied ? 'white' : '#065F46',
          border: `2px solid ${copied ? '#10B981' : '#D1FAE5'}`,
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        {copied ? (
          <>
            <Check size={18} />
            Gekopieerd!
          </>
        ) : (
          <>
            <Copy size={18} />
            Kopieer Code & Link
          </>
        )}
      </button>

      {/* Info */}
      <div style={{
        marginTop: '12px',
        padding: '12px',
        background: 'white',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#047857'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>💡 Hoe werkt het?</div>
        <div style={{ lineHeight: '1.5' }}>
          1. Deel je code met vrienden<br />
          2. Zij gebruiken de code bij aanmelding<br />
          3. Zij krijgen 2% korting op eerste maand<br />
          4. Jij helpt DealSense groeien! 🚀
        </div>
      </div>
    </div>
  )
}
