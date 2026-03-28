'use client'

import { useRef, useState } from 'react'
import jsQR from 'jsqr'

interface SimpleScannerProps {
  onScan: (code: string) => void
  onClose: () => void
}

export default function SimpleScanner({ onScan, onClose }: SimpleScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const scanningRef = useRef(false)

  const startScanning = async () => {
    try {
      setError(null)
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play()
          setScanning(true)
          scanningRef.current = true
          requestAnimationFrame(scanFrame)
        }
      }
    } catch (err: any) {
      console.error('Camera error:', err)
      setError(`Camera fout: ${err.message}`)
    }
  }

  const scanFrame = () => {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanFrame)
      return
    }
    
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData.data, imageData.width, imageData.height)
    
    if (code) {
      scanningRef.current = false
      stopCamera()
      onScan(code.data)
    } else {
      requestAnimationFrame(scanFrame)
    }
  }

  const stopCamera = () => {
    scanningRef.current = false
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  // Start camera when component mounts
  if (!scanning && !error && !streamRef.current) {
    startScanning()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.95)',
      zIndex: 99999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>
            📱 Scan Barcode/QR
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '32px',
              cursor: 'pointer',
              padding: '0',
              color: '#666',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {error ? (
          <div style={{
            padding: '40px 20px',
            background: '#fee',
            borderRadius: '12px',
            color: '#c00',
            fontSize: '16px'
          }}>
            {error}
          </div>
        ) : scanning ? (
          <div style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                maxHeight: '400px',
                borderRadius: '16px',
                background: '#000'
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '60%',
              height: '60%',
              border: '3px solid #15803d',
              borderRadius: '16px',
              pointerEvents: 'none',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
            }} />
            <div style={{
              marginTop: '16px',
              fontSize: '14px',
              color: '#666'
            }}>
              Richt de camera op de barcode/QR code
            </div>
          </div>
        ) : (
          <div style={{
            padding: '40px 20px',
            background: '#f0f9ff',
            borderRadius: '12px'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              📷
            </div>
            <div style={{ fontSize: '16px', color: '#666' }}>
              Camera wordt gestart...
            </div>
          </div>
        )}

        <button
          onClick={handleClose}
          style={{
            width: '100%',
            padding: '14px',
            background: '#e5e7eb',
            color: '#374151',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Sluiten
        </button>
      </div>
    </div>
  )
}
