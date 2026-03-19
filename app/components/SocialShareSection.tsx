'use client'

import { useState } from 'react'
import { SocialShare, ShareData } from '../_lib/social-share'

interface SocialShareSectionProps {
  productName: string
  basePrice: number
  selectedOffer: {
    price: number
    shop: string
  } | null
  isActive: boolean // true = aktywny (po wyborze oferty), false = półaktywny
}

export default function SocialShareSection({
  productName,
  basePrice,
  selectedOffer,
  isActive
}: SocialShareSectionProps) {
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0)

  // Oblicz oszczędności
  const savings = selectedOffer ? basePrice - selectedOffer.price : 0

  // Przygotuj dane do share
  const shareData: ShareData | null = selectedOffer ? {
    productName,
    basePrice,
    finalPrice: selectedOffer.price,
    savings,
    shop: selectedOffer.shop
  } : null

  // Generuj 3 prompty
  const messages = shareData ? SocialShare.generateMessages(shareData) : [
    'Selecteer een aanbieding om bericht te zien...',
    'Selecteer een aanbieding om bericht te zien...',
    'Selecteer een aanbieding om bericht te zien...'
  ]

  // Share functions
  const handleShare = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'linkedin') => {
    if (!isActive || !shareData) return

    switch (platform) {
      case 'whatsapp':
        SocialShare.shareToWhatsApp(shareData, selectedMessageIndex)
        break
      case 'facebook':
        SocialShare.shareToFacebook(shareData, selectedMessageIndex)
        break
      case 'twitter':
        SocialShare.shareToTwitter(shareData, selectedMessageIndex)
        break
      case 'linkedin':
        SocialShare.shareToLinkedIn(shareData, selectedMessageIndex)
        break
    }
  }

  return (
    <div 
      className={`mt-4 p-4 rounded-xl border-2 transition-all duration-300 ${
        isActive 
          ? 'bg-green-50 border-green-300' 
          : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{isActive ? '🎉' : '💬'}</span>
        <h3 className="font-semibold text-lg text-gray-800">
          {isActive 
            ? `Je hebt €${savings.toFixed(0)} bespaard!` 
            : 'Deel je besparing!'
          }
        </h3>
      </div>

      {/* Message Selection */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-2">
          {isActive ? 'Kies een bericht:' : 'Selecteer aanbieding om te delen...'}
        </p>
        <div className="space-y-2">
          {messages.map((message, index) => (
            <label
              key={index}
              className={`flex items-start gap-2 p-2 rounded-lg border-2 cursor-pointer transition-all ${
                isActive
                  ? selectedMessageIndex === index
                    ? 'bg-white border-green-400'
                    : 'bg-white border-green-200 hover:border-green-300'
                  : 'bg-gray-100 border-gray-200 cursor-not-allowed'
              }`}
            >
              <input
                type="radio"
                name="shareMessage"
                value={index}
                checked={selectedMessageIndex === index}
                onChange={() => isActive && setSelectedMessageIndex(index)}
                disabled={!isActive}
                className="mt-1"
              />
              <span className={`text-sm ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                {message.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < message.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => handleShare('whatsapp')}
          disabled={!isActive}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
            isActive
              ? 'bg-[#25D366] text-white hover:bg-[#20BA5A] active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span className="text-xl">📱</span>
          WhatsApp
        </button>

        <button
          onClick={() => handleShare('facebook')}
          disabled={!isActive}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
            isActive
              ? 'bg-[#1877F2] text-white hover:bg-[#1664D8] active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span className="text-xl">📘</span>
          Facebook
        </button>

        <button
          onClick={() => handleShare('twitter')}
          disabled={!isActive}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
            isActive
              ? 'bg-[#1DA1F2] text-white hover:bg-[#1A8CD8] active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span className="text-xl">🐦</span>
          Twitter
        </button>

        <button
          onClick={() => handleShare('linkedin')}
          disabled={!isActive}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold transition-all ${
            isActive
              ? 'bg-[#0A66C2] text-white hover:bg-[#095399] active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span className="text-xl">💼</span>
          LinkedIn
        </button>
      </div>

      {/* Helper text */}
      {!isActive && (
        <p className="text-xs text-gray-500 text-center mt-2">
          Klik "Toevoegen aan winkelwagen" om delen te activeren
        </p>
      )}
    </div>
  )
}
