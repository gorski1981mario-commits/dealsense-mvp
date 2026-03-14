'use client'

import { useEffect, useRef, useState } from 'react'
import jsQR from 'jsqr'

type ScannerType = 'free' | 'plus' | 'pro' | 'finance'

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
  const animationFrameId = useRef<number | null>(null)

  const startCamera = async () => {
    try {
      setError(null)
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

    try {
      const response = await fetch('/api/scan-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, type })
      })

      const result = await response.json()

      if (response.ok) {
        switch (type) {
          case 'free':
            alert(`QR gescand! Code: ${data}`)
            break
          case 'plus':
            if (result.action === 'unlock') {
              window.location.href = '/plus?unlocked=true'
            }
            break
          case 'pro':
            if (result.action === 'subscription') {
              window.location.href = '/pro?subscribed=true'
            }
            break
          case 'finance':
            if (result.action === 'premium') {
              window.location.href = '/finance?premium=true'
            }
            break
        }
      } else {
        setError(result.error || 'Scan mislukt')
      }
    } catch (err) {
      setError('Netwerk fout')
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
            background: '#15803d',
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
