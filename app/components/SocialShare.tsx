'use client'

import { useState } from 'react'
import { getDeviceId } from '../_lib/utils'

interface SocialShareProps {
  savings: number
  productName?: string
  userPackage: 'free' | 'plus' | 'pro' | 'finance'
}

export default function SocialShare({ 
  savings, 
  productName = 'dit product',
  userPackage 
}: SocialShareProps) {
  const [withCode, setWithCode] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [shareMode, setShareMode] = useState<'text' | 'image'>('text')
  
  const baseUrl = 'https://dealsense.nl'
  const hasPackage = userPackage !== 'free'
  
  const savingsAfterCommission = withCode 
    ? savings * 0.98
    : savings * 0.90
  
  const handleToggleCode = async () => {
    if (!withCode && !referralCode) {
      const cached = localStorage.getItem('dealsense_referral_code')
      if (cached) {
        const { code, expiresAt } = JSON.parse(cached)
        if (new Date(expiresAt) > new Date()) {
          setReferralCode(code)
          setWithCode(true)
          return
        }
      }
      
      try {
        const res = await fetch('/api/referral/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            deviceId: getDeviceId(),
            userPackage
          })
        })
        const data = await res.json()
        
        localStorage.setItem('dealsense_referral_code', JSON.stringify({
          code: data.code,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }))
        
        setReferralCode(data.code)
        setWithCode(true)
      } catch (err) {
        console.error('Failed to generate code:', err)
      }
    } else {
      setWithCode(!withCode)
    }
  }
  
  // Generate mixed hashtags (category-specific + viral)
  const getHashtags = () => {
    const coreHashtags = ['#DealSense', '#Besparen', '#Deals', '#Nederland']
    const viralHashtags = ['#GeldBesparen', '#SmartShoppen', '#Korting', '#Aanbieding']
    
    // Category-specific hashtags based on product name
    let categoryHashtags: string[] = []
    const productLower = productName.toLowerCase()
    
    if (productLower.includes('iphone') || productLower.includes('samsung') || productLower.includes('telefoon')) {
      categoryHashtags = ['#Smartphone', '#Tech', '#Mobiel']
    } else if (productLower.includes('vakantie') || productLower.includes('reis') || productLower.includes('hotel')) {
      categoryHashtags = ['#Vakantie', '#Reizen', '#Zomer']
    } else if (productLower.includes('energie') || productLower.includes('stroom') || productLower.includes('gas')) {
      categoryHashtags = ['#Energie', '#Stroom', '#Duurzaam']
    } else if (productLower.includes('verzekering') || productLower.includes('insurance')) {
      categoryHashtags = ['#Verzekering', '#Financieel', '#Zekerheid']
    } else {
      categoryHashtags = ['#Shopping', '#Online', '#Voordeel']
    }
    
    // Mix category + viral hashtags
    const mixedHashtags = [...categoryHashtags.slice(0, 2), ...viralHashtags.slice(0, 2)]
    return [...coreHashtags, ...mixedHashtags].join(' ')
  }
  
  const shareUrl = (platform: string) => {
    const amount = `€${savingsAfterCommission.toFixed(2)}`
    const url = withCode && referralCode ? `${baseUrl}?ref=${referralCode}` : baseUrl
    const hashtags = getHashtags()
    
    const text = withCode && referralCode
      ? `💰 ${productName} - ${amount} bespaard! 🎉\n🎁 Code: ${referralCode} (2% korting!)\n\n${hashtags}\n\nProbeer: ${url}`
      : `💰 ${productName} - ${amount} bespaard! 🎉\nGevonden met DealSense 🔍\n\n${hashtags}\n\nProbeer gratis: ${url}`
    
    switch(platform) {
      case 'whatsapp':
        return `https://wa.me/?text=${encodeURIComponent(text)}`
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
      case 'x':
        return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`
    }
  }
  
  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderRadius: '12px',
      border: '1px solid #86efac'
    }}>
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#15803d', marginBottom: '4px' }}>
          💰 Gefeliciteerd!
        </div>
        <div style={{ fontSize: '15px', color: '#166534', marginBottom: '4px' }}>
          {productName}
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803d' }}>
          €{savingsAfterCommission.toFixed(2)} bespaard! 🎉
        </div>
      </div>
      
      {/* Share Mode Toggle */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '16px',
        padding: '4px',
        background: 'white',
        borderRadius: '10px',
        border: '1px solid #d1d5db'
      }}>
        <button
          onClick={() => setShareMode('text')}
          style={{
            flex: 1,
            padding: '10px',
            background: shareMode === 'text' ? '#15803d' : 'transparent',
            color: shareMode === 'text' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          📝 Tekst (snel)
        </button>
        <button
          onClick={() => setShareMode('image')}
          style={{
            flex: 1,
            padding: '10px',
            background: shareMode === 'image' ? '#15803d' : 'transparent',
            color: shareMode === 'image' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          🖼️ Afbeelding (opvallend)
        </button>
      </div>
      
      {/* Screenshot Preview (if image mode) */}
      {shareMode === 'image' && (
        <div style={{
          marginBottom: '16px',
          padding: '20px',
          background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
          borderRadius: '12px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '14px', marginBottom: '8px', opacity: 0.9 }}>DealSense</div>
          <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '4px' }}>
            €{savingsAfterCommission.toFixed(2)}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
            BESPAARD! 🎉
          </div>
          <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>
            {productName}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.8 }}>
            dealsense.nl
          </div>
        </div>
      )}
      
      {/* Share Buttons */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '10px',
        marginBottom: hasPackage ? '16px' : '0'
      }}>
        <a 
          href={shareUrl('whatsapp')}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '14px 12px',
            background: withCode ? '#fbbf24' : '#25D366',
            color: 'white',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.1s, background 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          WhatsApp
        </a>
        
        <a 
          href={shareUrl('facebook')}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '14px 12px',
            background: withCode ? '#fbbf24' : '#1877F2',
            color: 'white',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.1s, background 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </a>
        
        <a 
          href={shareUrl('x')}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '14px 12px',
            background: withCode ? '#fbbf24' : '#000000',
            color: 'white',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.1s, background 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
          X
        </a>
        
        <a 
          href={shareUrl('linkedin')}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '14px 12px',
            background: withCode ? '#fbbf24' : '#0A66C2',
            color: 'white',
            borderRadius: '10px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'transform 0.1s, background 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
          LinkedIn
        </a>
      </div>
      
      {hasPackage && (
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px',
          background: withCode ? '#fef3c7' : 'white',
          borderRadius: '10px',
          border: withCode ? '2px solid #f59e0b' : '1px solid #d1d5db',
          cursor: 'pointer',
          transition: 'all 0.2s',
          userSelect: 'none'
        }}>
          <input
            type="checkbox"
            checked={withCode}
            onChange={handleToggleCode}
            style={{ 
              width: '20px', 
              height: '20px', 
              cursor: 'pointer',
              accentColor: '#f59e0b'
            }}
          />
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: withCode ? '#92400e' : '#374151',
            flex: 1
          }}>
            🎁 Geef vrienden 2% extra korting
          </span>
          {withCode && referralCode && (
            <span style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#15803d',
              background: 'white',
              padding: '4px 8px',
              borderRadius: '6px'
            }}>
              {referralCode}
            </span>
          )}
        </label>
      )}
    </div>
  )
}
