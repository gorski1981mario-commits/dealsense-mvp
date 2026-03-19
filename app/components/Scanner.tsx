'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { BiometricAuth } from '../_lib/biometric'
import SocialShareSection from './SocialShareSection'
import GhostModeButton from './GhostModeButton'
import FlashDealBadge from './FlashDealBadge'
import WishlistButton from './WishlistButton'

type ScannerType = 'free' | 'plus' | 'pro' | 'finance' | 'zakelijk'

interface ScannerProps {
  type: ScannerType
}

export default function Scanner({ type }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [biometricRequired, setBiometricRequired] = useState(false)
  const animationFrameId = useRef<number | null>(null)
  
  // New state for offers and social share
  const [offers, setOffers] = useState<any[]>([])
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [productName, setProductName] = useState<string>('')
  const [basePrice, setBasePrice] = useState<number>(0)
  const [scannedEAN, setScannedEAN] = useState<string>('')
  const [scansRemaining, setScansRemaining] = useState<number>(3) // FREE: 3 scans

  const startCamera = async () => {
    try {
      setError(null)
      
      // Biometric auth required for PLUS/PRO/FINANCE/ZAKELIJK
      if (type !== 'free') {
        setBiometricRequired(true)
        const verified = await BiometricAuth.authenticate()
        setBiometricRequired(false)
        
        if (!verified) {
          setError('Biometrische verificatie vereist voor dit pakket')
          return
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setScanning(true)
        scanQRCode()
      }
    } catch (err) {
      setError('Camera toegang geweigerd')
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
    }
    setScanning(false)
  }

  const scanQRCode = (): void => {
    if (!videoRef.current || !canvasRef.current || !scanning) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameId.current = requestAnimationFrame(scanQRCode)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)

    if (code) {
      handleScan(code.data)
      stopCamera()
    } else {
      animationFrameId.current = requestAnimationFrame(scanQRCode)
    }
  }

  const handleScan = async (data: string) => {
    setProcessing(true)
    setResult(data)

    // Get userId for FREE package scan tracking
    const userId = localStorage.getItem('dealsense_device_id') || 'anonymous'

    try {
      // Use NEW crawler API
      const response = await fetch('/api/crawler/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ean: data, // Scanned barcode = EAN
          category: 'electronics', // Default for scanner
          packageType: type,
          userId
        })
      })

      const result = await response.json()

      // Handle FREE paywall (after 3 scans)
      if (result.paywall) {
        setError(`${result.message}`)
        setProcessing(false)
        
        // Show upgrade prompt
        setTimeout(() => {
          if (confirm(`${result.message}\n\nUpgrade nu naar PLUS?`)) {
            window.location.href = '/packages'
          }
        }, 1000)
        return
      }

      if (response.ok && result.offers) {
        // Success - save offers to state
        setOffers(result.offers)
        setScannedEAN(data)
        setProductName(result.productName || `Product ${data}`)
        setBasePrice(result.basePrice || 0)
        setScansRemaining(result.scansRemaining || 0) // Update scans remaining (FREE)
        
        let message = type === 'free' 
          ? `✅ Gevonden! ${result.offers.length} aanbiedingen. Scans: ${result.scansRemaining || 0}/3 over. Commissie: ${result.commission}`
          : `✅ Gevonden! ${result.offers.length} aanbiedingen (TOP ${result.offers.length})`
        
        // Show proactive warning after 2nd scan
        if (result.warning) {
          message += `\n\n${result.warning}`
          
          // Show upgrade prompt after short delay
          setTimeout(() => {
            if (confirm(`${result.warning}\n\nUpgrade nu naar PLUS voor €19,99/mnd?`)) {
              window.location.href = '/packages'
            }
          }, 2000)
        }
        
        setError(message)
        
        // Store scan result
        const scanRecord = {
          timestamp: Date.now(),
          ean: data,
          type,
          offers: result.offers,
          commission: result.commission,
          scansRemaining: result.scansRemaining
        }

        const history = JSON.parse(localStorage.getItem('scan_history') || '[]')
        history.unshift(scanRecord)
        localStorage.setItem('scan_history', JSON.stringify(history.slice(0, 50)))
        
        // Show results (could navigate to results page)
        console.log('Scan results:', result.offers)
      } else {
        // No offers found - clear state
        setOffers([])
        setScannedEAN(data)
        setProductName(result.productName || `Product ${data}`)
        setBasePrice(result.basePrice || 0)
        setError(result.error || 'Geen aanbiedingen gevonden')
      }
    } catch (err) {
      console.error('[Scan Error]', err)
      setError('Netwerk fout - probeer opnieuw')
    } finally {
      setProcessing(false)
    }
  }

  const handleAddToCart = (offer: any) => {
    setSelectedOffer(offer)
    console.log('[Add to Cart]', offer)
    // TODO: Implement actual cart logic
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderRadius: '12px',
      border: '1px solid #86efac'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
        QR Code Scanner
      </h3>

      {!scanning && !result && (
        <button
          onClick={startCamera}
          style={{
            width: '100%',
            padding: '12px',
            background: 'linear-gradient(135deg, #15803d 0%, #059669 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(21, 128, 61, 0.3)'
          }}
        >
          Start Camera
        </button>
      )}

      {scanning && (
        <div>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              maxWidth: '400px',
              borderRadius: '8px',
              marginBottom: '12px'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button
            onClick={stopCamera}
            style={{
              width: '100%',
              padding: '12px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Stop Camera
          </button>
        </div>
      )}

      {processing && (
        <div style={{ textAlign: 'center', color: '#374151' }}>
          Verwerken...
        </div>
      )}

      {result && !processing && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: '#dcfce7',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#166534'
        }}>
          ✓ QR Code gescand: {result}
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: '#fee2e2',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#991b1b'
        }}>
          {error}
        </div>
      )}

      {/* Flash Deal Badge */}
      {scannedEAN && (
        <FlashDealBadge ean={scannedEAN} />
      )}

      {/* Offers List */}
      {offers.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#166534' }}>
            📦 Gevonden Aanbiedingen:
          </h4>
          {offers.map((offer, index) => (
            <div
              key={index}
              style={{
                marginBottom: '12px',
                padding: '12px',
                background: index === 0 ? '#dcfce7' : 'white',
                border: index === 0 ? '2px solid #86efac' : '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            >
              {index === 0 && (
                <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, marginBottom: '4px' }}>
                  ⭐ REKOMENDACJA
                </div>
              )}
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#166534', marginBottom: '4px' }}>
                €{offer.price.toFixed(2)}
              </div>
              {/* CORE VALUE: Sklepy pokazujemy TYLKO dla FREE (pierwsze 3 scany) */}
              {/* Po 3 skanach FREE: paywall + ukrywamy sklepy */}
              {/* PLUS/PRO/FINANCE: NIGDY nie pokazujemy sklepów przed biometric */}
              {type === 'free' && scansRemaining > 0 && (
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                  📍 {offer.seller || offer.shop}
                </div>
              )}
              {basePrice > 0 && (
                <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '8px' }}>
                  Oszczędność: €{(basePrice - offer.price).toFixed(2)}
                </div>
              )}
              <button
                onClick={() => handleAddToCart(offer)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: selectedOffer === offer ? '#15803d' : 'linear-gradient(135deg, #15803d 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {selectedOffer === offer ? '✓ Toegevoegd aan winkelwagen' : 'Toevoegen aan winkelwagen'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Wishlist Button */}
      {scannedEAN && offers.length > 0 && type !== 'free' && (
        <WishlistButton
          userId={localStorage.getItem('dealsense_device_id') || 'anonymous'}
          ean={scannedEAN}
          productName={productName}
          currentPrice={offers[0]?.price || basePrice}
          shopHidden={offers[0]?.seller || offers[0]?.shop || 'Unknown'}
          category="electronics"
        />
      )}

      {/* Social Share Section - always visible, active after selecting offer */}
      {offers.length > 0 && (
        <SocialShareSection
          productName={productName}
          basePrice={basePrice}
          selectedOffer={selectedOffer ? {
            price: selectedOffer.price,
            shop: 'Verified Shop' // CORE VALUE: nie pokazujemy prawdziwego sklepu przed paywallem!
          } : null}
          isActive={selectedOffer !== null}
        />
      )}

      {/* Ghost Mode Button - only when NO offers found */}
      {scannedEAN && offers.length === 0 && type !== 'free' && (
        <GhostModeButton
          userId={localStorage.getItem('dealsense_device_id') || 'anonymous'}
          ean={scannedEAN}
          productName={productName}
          basePrice={basePrice}
          packageType={type as 'plus' | 'pro' | 'finance'}
          hasOffers={false}
        />
      )}
    </div>
  )
}



