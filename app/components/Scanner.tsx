'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'
import { BiometricAuth } from '../_lib/biometric'

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
        // Success - show results
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
        setError(result.error || 'Scan mislukt')
      }
    } catch (err) {
      console.error('[Scan Error]', err)
      setError('Netwerk fout - probeer opnieuw')
    } finally {
      setProcessing(false)
    }
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
    </div>
  )
}


