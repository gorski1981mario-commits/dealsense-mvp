'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { BiometricAuth } from '../_lib/biometric'
import SocialShareSection from './SocialShareSection'
import GhostModeButton from './GhostModeButton'
import WishlistButton from './WishlistButton'
import SavingsTimeline from './SavingsTimeline'
import SavingsJournal from './SavingsJournal'
import { parseProductUrl, isValidUrl } from '../_lib/urlParser'

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
  const [userId, setUserId] = useState<string>('')
  const [manualInput, setManualInput] = useState<string>('')
  const [showManualInput, setShowManualInput] = useState<boolean>(true)
  
  // Smart Bundles state
  const [smartBundles, setSmartBundles] = useState<any[]>([])
  const [selectedBundleItems, setSelectedBundleItems] = useState<{[key: string]: any}>({})
  
  // URL parsing state
  const [parsedUrl, setParsedUrl] = useState<any>(null)
  const [autoFilled, setAutoFilled] = useState<boolean>(false)

  useEffect(() => {
    // Get userId only on client side
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('dealsense_device_id') || 'anonymous'
      setUserId(id)
    }
  }, [])

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

    // DEVICE-BOUND TOKEN SECURITY
    // Generate unique token for this scan (deviceId + timestamp)
    const timestamp = Date.now()
    const scanToken = `${userId}-${timestamp}`

    try {
      // Use NEW crawler API with device-bound token
      const response = await fetch('/api/crawler/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ean: data, // Scanned barcode = EAN
          category: 'electronics', // Default for scanner
          packageType: type,
          userId,
          scanToken // Device-bound token (cannot be manipulated)
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
        const offers = Array.isArray(result.offers) ? result.offers : (result.offers?.offers || [])
        setOffers(offers)
        setScannedEAN(data)
        setProductName(result.productName || `Product ${data}`)
        setBasePrice(result.basePrice || 0)
        setScansRemaining(result.scansRemaining || 0) // Update scans remaining (FREE)
        
        // Smart Bundles (jeśli są)
        if (result.smartBundles && result.smartBundles.length > 0) {
          setSmartBundles(result.smartBundles)
          console.log('[Smart Bundles]', result.smartBundles)
        } else if (result.offers?.smartBundles) {
          setSmartBundles(result.offers.smartBundles)
          console.log('[Smart Bundles]', result.offers.smartBundles)
        } else {
          setSmartBundles([])
        }
        
        const offerCount = offers.length
        let message = type === 'free' 
          ? `✅ Gevonden! ${offerCount} aanbiedingen. Scans over: ${result.scansRemaining || 0}/3. Commissie: ${result.commission}`
          : `✅ Gevonden! ${offerCount} aanbiedingen (TOP ${offerCount})`
        
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
      setError('Netwerkfout - probeer opnieuw')
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
        Product Scanner
      </h3>

      {!scanning && !result && (
        <div>
          {/* Manual Input Field */}
          {showManualInput && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                Plak product URL of typ productnaam:
              </label>
              <input
                type="text"
                value={manualInput}
                onChange={(e) => {
                  const value = e.target.value
                  setManualInput(value)
                  
                  // Auto-parse URL
                  if (isValidUrl(value)) {
                    const parsed = parseProductUrl(value)
                    if (parsed && parsed.isValid) {
                      setParsedUrl(parsed)
                      setAutoFilled(true)
                    } else {
                      setParsedUrl(null)
                      setAutoFilled(false)
                    }
                  } else {
                    setParsedUrl(null)
                    setAutoFilled(false)
                  }
                }}
                placeholder="Plak product URL van bol.com, Amazon, Coolblue..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: autoFilled ? '2px solid #86efac' : '2px solid #1e40af',
                  borderRadius: '8px',
                  fontSize: '14px',
                  marginBottom: '12px',
                  boxSizing: 'border-box',
                  background: autoFilled ? '#f0fdf4' : 'white'
                }}
              />
              
              {/* Auto-filled info */}
              {parsedUrl && autoFilled && (
                <div style={{
                  marginBottom: '12px',
                  padding: '12px',
                  background: '#dcfce7',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#166534'
                }}>
                  ✓ Auto-gevuld van {parsedUrl.shop}:<br/>
                  <strong>{parsedUrl.productName}</strong>
                  {parsedUrl.ean && (
                    <><br/>EAN: {parsedUrl.ean}</>
                  )}
                </div>
              )}
              <button
                onClick={() => {
                  if (parsedUrl && autoFilled) {
                    // Auto-filled from URL - use parsed product name
                    handleScan(parsedUrl.productName)
                  } else if (manualInput.trim()) {
                    // Manual input - use as-is
                    handleScan(manualInput.trim())
                  }
                }}
                disabled={!manualInput.trim() || processing}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: manualInput.trim() ? 'linear-gradient(135deg, #15803d 0%, #15803d 100%)' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: manualInput.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: manualInput.trim() ? '0 4px 6px rgba(21, 128, 61, 0.3)' : 'none'
                }}
              >
                {processing ? 'Zoeken...' : (autoFilled ? 'Vind goedkoper →' : 'Scan Product')}
              </button>
            </div>
          )}

          {/* OR Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#1e40af' }}></div>
            <span style={{ padding: '0 12px', fontSize: '12px', color: '#111827', fontWeight: 600 }}>OF</span>
            <div style={{ flex: 1, height: '1px', background: '#1e40af' }}></div>
          </div>

          {/* QR Code Scanner Button */}
          <button
            onClick={startCamera}
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #15803d 0%, #15803d 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(21, 128, 61, 0.3)',
              textAlign: 'center'
            }}
          >
            Scan Barcode/QR
          </button>
        </div>
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
                  💎 REKOMENDACJA
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
                  Besparing: €{(basePrice - offer.price).toFixed(2)}
                </div>
              )}
              <button
                onClick={() => handleAddToCart(offer)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: selectedOffer === offer ? '#15803d' : 'linear-gradient(135deg, #15803d 0%, #15803d 100%)',
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

      {/* Savings Timeline - CALM COMMERCE: informacja, nie presja */}
      {scannedEAN && offers.length > 0 && (
        <SavingsTimeline
          ean={scannedEAN}
          currentPrice={offers[0]?.price || basePrice}
        />
      )}

      {/* Wishlist Button */}
      {scannedEAN && offers.length > 0 && type !== 'free' && userId && (
        <WishlistButton
          userId={userId}
          ean={scannedEAN}
          productName={productName}
          currentPrice={offers[0]?.price || basePrice}
          shopHidden={offers[0]?.seller || offers[0]?.shop || 'Unknown'}
          category="electronics"
        />
      )}

      {/* Savings Journal - CALM COMMERCE: personal, nie competitive */}
      {type !== 'free' && userId && (
        <SavingsJournal
          userId={userId}
        />
      )}

      {/* Smart Bundles Section */}
      {smartBundles.length > 0 && offers.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'white',
          borderRadius: '8px',
          border: '2px solid #86efac'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#166534' }}>
            🎁 Smart Bundle - Bespaar meer!
          </h4>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Selecteer accessoires (tap om te kiezen):
          </p>
          
          {smartBundles.map((bundle, idx) => {
            const isSelected = selectedBundleItems[bundle.type]
            const currentVariant = isSelected || bundle.defaultVariant
            
            return (
              <div
                key={idx}
                style={{
                  marginBottom: '12px',
                  padding: '12px',
                  background: isSelected ? '#f0fdf4' : '#f9fafb',
                  border: isSelected ? '2px solid #86efac' : '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    checked={!!isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBundleItems(prev => ({
                          ...prev,
                          [bundle.type]: bundle.defaultVariant
                        }))
                      } else {
                        setSelectedBundleItems(prev => {
                          const newItems = { ...prev }
                          delete newItems[bundle.type]
                          return newItems
                        })
                      }
                    }}
                    style={{
                      marginRight: '10px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                      {bundle.name}
                    </div>
                    
                    {/* Variant Selector (dropdown) */}
                    {bundle.variants && bundle.variants.length > 1 && (
                      <select
                        value={JSON.stringify(currentVariant)}
                        onChange={(e) => {
                          const newVariant = JSON.parse(e.target.value)
                          setSelectedBundleItems(prev => ({
                            ...prev,
                            [bundle.type]: newVariant
                          }))
                        }}
                        disabled={!isSelected}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#374151',
                          background: 'white',
                          cursor: 'pointer',
                          marginBottom: '8px'
                        }}
                      >
                        {bundle.variants.map((variant: any, vIdx: number) => {
                          const variantLabel = variant.variant?.color || variant.variant?.type || variant.variant?.power || 'Standaard'
                          return (
                            <option key={vIdx} value={JSON.stringify(variant)}>
                              {variantLabel} - €{variant.price.toFixed(2)}
                            </option>
                          )
                        })}
                      </select>
                    )}
                    
                    <div style={{ fontSize: '12px', color: '#374151' }}>
                      💰 €{currentVariant.price.toFixed(2)}<br/>
                      📊 Markt: €{(currentVariant.price * 2).toFixed(2)}<br/>
                      ✅ Besparing: €{(currentVariant.price).toFixed(2)} (50%)<br/>
                      📍 Winkel: <span style={{ color: '#15803d', fontWeight: 600 }}>[🔒 UNLOCK]</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {/* Bundle Total */}
          {Object.keys(selectedBundleItems).length > 0 && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#dcfce7',
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#166534' }}>
                💰 TOTALE BESPARING:
              </div>
              <div style={{ fontSize: '12px', marginTop: '6px', color: '#374151' }}>
                Product: €{basePrice > 0 && offers[0] ? (basePrice - offers[0].price).toFixed(2) : '0.00'}<br/>
                Accessoires: €{Object.values(selectedBundleItems).reduce((sum: number, item: any) => sum + item.price, 0).toFixed(2)} ({Object.keys(selectedBundleItems).length} geselecteerd)<br/>
                <div style={{ borderTop: '1px solid #86efac', margin: '6px 0', paddingTop: '6px', fontSize: '14px', fontWeight: 600, color: '#166534' }}>
                  TOTAAL: €{(
                    (basePrice > 0 && offers[0] ? (basePrice - offers[0].price) : 0) +
                    Object.values(selectedBundleItems).reduce((sum: number, item: any) => sum + item.price, 0)
                  ).toFixed(2)} bespaard! 🎉
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Share Section - always visible, active after selecting offer (including FREE - main source of advertising) */}
      {offers.length > 0 && (
        <SocialShareSection
          productName={productName}
          basePrice={basePrice}
          selectedOffer={selectedOffer ? {
            price: selectedOffer.price,
            shop: selectedOffer.seller || selectedOffer.shop || 'Unknown'
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



