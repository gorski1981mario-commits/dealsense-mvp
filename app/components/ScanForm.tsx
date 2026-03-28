'use client'

import { useState, useRef, useEffect } from 'react'
import { EyeOff } from 'lucide-react'
import OCRScanner from './OCRScanner'
import jsQR from 'jsqr'
import { getDeviceId, showToast } from '../_lib/utils'
import { FlowTracker } from '../_lib/flow-tracker'

interface ScanFormProps {
  packageType: 'free' | 'plus' | 'pro' | 'finance'
  scansRemaining?: number
  onScanComplete?: (result: any) => void
}

function ScanForm({ packageType, scansRemaining = 999, onScanComplete }: ScanFormProps) {
  const [url, setUrl] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOCRScanner, setShowOCRScanner] = useState(false)
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameId = useRef<number | null>(null)

  const startCamera = async () => {
    try {
      console.log('[Camera] Requesting getUserMedia...')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      console.log('[Camera] Stream obtained:', stream.id)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        console.log('[Camera] Stream assigned to video element')
        
        // Show video element in DOM IMMEDIATELY
        console.log('[Camera] Setting cameraActive to TRUE...')
        setCameraActive(true)
        console.log('[Camera] setCameraActive(true) called')
        console.log('[Camera] Current cameraActive state:', cameraActive)
        
        // Wait for React to render video element (double RAF for safety)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!videoRef.current) {
              console.error('[Camera] Video ref lost after render')
              return
            }
            
            console.log('[Camera] Attempting to play video...')
            
            const playPromise = videoRef.current.play()
            
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  console.log('[Camera] ✅ Video playing successfully!')
                  console.log('[Camera] Video dimensions:', 
                    videoRef.current?.videoWidth, 'x', 
                    videoRef.current?.videoHeight)
                  
                  // Check if video is already ready
                  if (videoRef.current && videoRef.current.readyState >= 2) {
                    console.log('[Camera] Video ready, starting scan...')
                    scanQRCode()
                  } else {
                    // Wait for loadedmetadata event
                    videoRef.current?.addEventListener('loadedmetadata', () => {
                      console.log('[Camera] Metadata loaded, starting scan...')
                      scanQRCode()
                    }, { once: true })
                  }
                })
                .catch(playErr => {
                  console.error('[Camera] ❌ Play error:', playErr.name, playErr.message)
                  showToast(`⚠️ Video afspelen mislukt: ${playErr.message}`)
                  
                  // Cleanup on error
                  setCameraActive(false)
                  if (videoRef.current?.srcObject) {
                    const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
                    tracks.forEach(track => track.stop())
                  }
                })
            }
          })
        })
      }
    } catch (err: any) {
      console.error('[Camera] ❌ getUserMedia error:', err.name, err.message)
      
      let errorMessage = 'Camera toegang geweigerd'
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Camera toegang geweigerd door gebruiker'
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Geen camera gevonden op dit apparaat'
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera wordt al gebruikt door een andere app'
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera voldoet niet aan de vereisten'
      }
      
      showToast(`⚠️ ${errorMessage}`)
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
    setCameraActive(false)
  }

  const scanQRCode = (): void => {
    if (!videoRef.current || !canvasRef.current) return

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
      handleBarcodeDetected(code.data)
      stopCamera()
    } else {
      animationFrameId.current = requestAnimationFrame(scanQRCode)
    }
  }

  const handleBarcodeDetected = async (ean: string) => {
    setScanning(true)
    showToast(`📱 Code gescand: ${ean}`)
    
    try {
      const response = await fetch('/api/crawler/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ean,
          category: 'electronics',
          packageType,
          userId: getDeviceId()
        })
      })

      const result = await response.json()

      if (result.paywall) {
        showToast(`⚠️ ${result.message}`)
        setTimeout(() => {
          if (confirm(`${result.message}\n\nUpgrade nu naar PLUS?`)) {
            window.location.href = '/packages'
          }
        }, 1000)
      } else if (result.offers && result.offers.length > 0) {
        showToast('✓ Producten gevonden!')
        if (onScanComplete) {
          onScanComplete(result)
        }
      } else {
        showToast('⚠️ Geen aanbiedingen gevonden')
      }
    } catch (err) {
      showToast('⚠️ Netwerkfout - probeer opnieuw')
    } finally {
      setScanning(false)
      setShowBarcodeScanner(false)
    }
  }

  useEffect(() => {
    console.log('[Camera] cameraActive state changed to:', cameraActive)
  }, [cameraActive])

  useEffect(() => {
    if (showBarcodeScanner) {
      console.log('[Camera] Modal opened, starting camera...')
      // Small delay to ensure video element is in DOM
      setTimeout(() => {
        startCamera()
      }, 100)
    }
    return () => {
      stopCamera()
    }
  }, [showBarcodeScanner])

  // Manual scan form removed - scanner works via barcode only

  const isDisabled = loading || (packageType === 'free' && scansRemaining === 0)

  return (
    <>
      {/* Barcode/QR Scanner Button - WSZYSTKIE PAKIETY */}
      <div style={{ marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setShowBarcodeScanner(true)}
          style={{
            width: '100%',
            padding: '16px',
            background: '#15803d',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 6px rgba(21, 128, 61, 0.3)'
          }}
        >
          Scan Barcode/QR
        </button>
      </div>

      {/* OCR Scanner Button - TYLKO FINANCE */}
      {packageType === 'finance' && (
        <div style={{ marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setShowOCRScanner(true)}
            style={{
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(21, 128, 61, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            💎 Scan Document (OCR)
          </button>
        </div>
      )}

      <form onSubmit={handleScan} style={{ marginBottom: '24px' }}>
        <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: 600,
        marginBottom: '6px'
      }}>Categorie</label>
      <input
        type="text"
        value={category}
        readOnly
        placeholder="Automatisch ingevuld via QR-scan"
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #1e40af',
          borderRadius: '10px',
          fontSize: '16px',
          marginBottom: '8px',
          background: '#f1f5f9',
          cursor: 'not-allowed',
          color: '#6b7280'
        }}
      />
      <div style={{ fontSize: '11px', color: '#111827', marginBottom: '16px' }}>
        ⚠️ Niet ondersteund: voedsel en tweedehands/refurbished producten
      </div>

      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: 600,
        marginBottom: '6px'
      }}>Product URL</label>
      <input
        type="url"
        placeholder="Automatisch ingevuld via QR-scan"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        readOnly
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #1e40af',
          borderRadius: '10px',
          fontSize: '16px',
          marginBottom: '16px',
          background: '#f1f5f9',
          cursor: 'not-allowed',
          color: '#111827'
        }}
      />

      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: 600,
        marginBottom: '6px'
      }}>Prijs (€)</label>
      <input
        type="text"
        placeholder="Automatisch ingevuld via QR-scan"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        readOnly
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #1e40af',
          borderRadius: '10px',
          fontSize: '16px',
          marginBottom: '16px',
          background: '#f1f5f9',
          cursor: 'not-allowed',
          color: '#111827'
        }}
      />

      <button 
        type="submit" 
        disabled={isDisabled}
        style={{
          width: '100%',
          padding: '14px',
          background: isDisabled ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #15803d 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '10px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: isDisabled ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Scannen...' : packageType === 'free' && scansRemaining === 0 ? 'Upgrade voor meer scans' : 'Vergelijk prijzen'}
      </button>
    </form>

      {/* Barcode Scanner Modal - WSZYSTKIE PAKIETY */}
      {showBarcodeScanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Scan Barcode/QR</h3>
              <button
                onClick={() => setShowBarcodeScanner(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  color: '#6B7280'
                }}
              >
                ×
              </button>
            </div>
            
            {cameraActive ? (
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    borderRadius: '16px',
                    objectFit: 'cover'
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '200px',
                  height: '200px',
                  border: '3px solid #15803d',
                  borderRadius: '12px',
                  pointerEvents: 'none'
                }} />
                {scanning && (
                  <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(21, 128, 61, 0.9)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    Scannen...
                  </div>
                )}
              </div>
            ) : (
              <div style={{ 
                marginBottom: '20px', 
                padding: '32px 20px', 
                background: 'linear-gradient(135deg, #E6F4EE 0%, #F0F9FF 100%)', 
                borderRadius: '16px',
                border: '2px dashed #15803d'
              }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  margin: '0 auto 16px',
                  background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 16px rgba(21, 128, 61, 0.3)'
                }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <path d="M9 3v18"/>
                    <path d="M15 3v18"/>
                  </svg>
                </div>
                <p style={{ fontSize: '16px', color: '#15803d', marginBottom: '8px', fontWeight: 600 }}>
                  Camera wordt gestart...
                </p>
                <p style={{ fontSize: '13px', color: '#6B7280' }}>
                  Sta camera toegang toe
                </p>
              </div>
            )}

            <button
              onClick={() => setShowBarcodeScanner(false)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#E5E7EB',
                color: '#374151',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* OCR Scanner Modal - TYLKO FINANCE */}
      {showOCRScanner && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Scan Product Label</h3>
              <button
                onClick={() => setShowOCRScanner(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '0',
                  color: '#6B7280'
                }}
              >
                ×
              </button>
            </div>
            <OCRScanner
              packageType={packageType === 'free' ? 'pro' : packageType as 'pro' | 'finance'}
              onScanComplete={(result) => {
                if (result.success && result.fields) {
                  if (result.fields.url) setUrl(result.fields.url)
                  if (result.fields.price) setPrice(result.fields.price.toString())
                  if (result.fields.category) setCategory(result.fields.category)
                  
                  showToast('✓ Product gescand!')
                  setShowOCRScanner(false)
                } else {
                  showToast('⚠️ Scan mislukt - probeer opnieuw')
                }
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ScanForm

