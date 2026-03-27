'use client'

import { useState, useEffect } from 'react'
import { Wishlist } from '../_lib/wishlist'

interface WishlistButtonProps {
  userId: string
  ean: string
  productName: string
  currentPrice: number
  shopHidden: string
  category: string
}

export default function WishlistButton({
  userId,
  ean,
  productName,
  currentPrice,
  shopHidden,
  category
}: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [showTargetPrice, setShowTargetPrice] = useState(false)
  const [targetPrice, setTargetPrice] = useState(currentPrice * 0.9) // Default: 10% mniej

  useEffect(() => {
    // Check if already in wishlist
    const inWishlist = Wishlist.isInWishlist(userId, ean)
    setIsInWishlist(inWishlist)
  }, [userId, ean])

  const handleAddToWishlist = () => {
    if (isInWishlist) {
      // Remove from wishlist
      const wishlist = Wishlist.getUserWishlist(userId)
      const item = wishlist.find(i => i.productEAN === ean)
      if (item) {
        Wishlist.removeItem(item.id)
        setIsInWishlist(false)
      }
    } else {
      // Show target price input
      setShowTargetPrice(true)
    }
  }

  const handleConfirmTargetPrice = () => {
    Wishlist.addItem(
      userId,
      ean,
      productName,
      currentPrice,
      targetPrice,
      shopHidden,
      category
    )
    setIsInWishlist(true)
    setShowTargetPrice(false)
  }

  if (showTargetPrice) {
    return (
      <div
        style={{
          background: '#E6F4EE',
          border: '2px solid #86efac',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '12px'
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#166534', marginBottom: '8px' }}>
          💝 Voeg toe aan verlanglijst
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
          Waarschuw me wanneer de prijs daalt tot:
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
            style={{
              flex: 1,
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            (nu: €{currentPrice.toFixed(2)})
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleConfirmTargetPrice}
            style={{
              flex: 1,
              padding: '10px',
              background: '#15803d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ✓ Bevestig
          </button>
          <button
            onClick={() => setShowTargetPrice(false)}
            style={{
              padding: '10px 16px',
              background: 'white',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Annuleer
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleAddToWishlist}
      style={{
        width: '100%',
        padding: '10px',
        background: isInWishlist ? '#15803d' : 'white',
        color: isInWishlist ? 'white' : '#15803d',
        border: `2px solid #15803d`,
        borderRadius: '6px',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px'
      }}
    >
      {isInWishlist ? '✓ In verlanglijst' : '💝 Voeg toe aan verlanglijst'}
    </button>
  )
}


