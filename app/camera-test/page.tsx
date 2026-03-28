'use client'

import { useEffect, useRef, useState } from 'react'

export default function CameraTestPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [browserStatus, setBrowserStatus] = useState('⏳ Checking...')
  const [browserDetails, setBrowserDetails] = useState<string[]>([])
  const [permissionStatus, setPermissionStatus] = useState('⏳ Waiting...')
  const [streamStatus, setStreamStatus] = useState('⏳ Waiting...')
  const [scanStatus, setScanStatus] = useState('⏳ Waiting for camera...')
  const [scanResult, setScanResult] = useState('')
  const [logs, setLogs] = useState<string[]>([])
  const [cameraActive, setCameraActive] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  const log = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'
    const logMessage = `[${timestamp}] ${prefix} ${message}`
    setLogs(prev => [...prev, logMessage])
    console.log(logMessage)
  }

  // Test 1: Browser Support
  useEffect(() => {
    log('Camera Test Suite initialized')
    checkBrowserSupport()
  }, [])

  const checkBrowserSupport = () => {
    log('Checking browser support...')
    
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    const hasCanvas = !!document.createElement('canvas').getContext
    
    const details = [
      `User Agent: ${navigator.userAgent}`,
      `getUserMedia: ${hasGetUserMedia ? '✅' : '❌'}`,
      `Canvas API: ${hasCanvas ? '✅' : '❌'}`
    ]
    
    setBrowserDetails(details)
    
    if (hasGetUserMedia && hasCanvas) {
      setBrowserStatus('✅ Browser fully supported')
      log('Browser support: OK', 'success')
    } else {
      setBrowserStatus('❌ Browser not supported')
      log('Browser support: FAILED', 'error')
    }
  }

  // Test 2: Request Permission
  const requestPermission = async () => {
    log('Requesting camera permission...')
    setPermissionStatus('⏳ Requesting permission...')
    
    try {
      const testStream = await navigator.mediaDevices.getUserMedia({ video: true })
      testStream.getTracks().forEach(track => track.stop())
      
      setPermissionStatus('✅ Permission granted')
      setPermissionGranted(true)
      log('Camera permission: GRANTED', 'success')
    } catch (err: any) {
      setPermissionStatus(`❌ Permission denied: ${err.message}`)
      log(`Camera permission: DENIED - ${err.message}`, 'error')
    }
  }

  // Test 3: Start Camera
  const startCamera = async () => {
    log('Starting camera stream...')
    setStreamStatus('⏳ Starting camera...')
    
    try {
      log('Requesting getUserMedia...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      streamRef.current = stream
      
      log('Stream obtained, setting srcObject...')
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        log('Attempting to play video...')
        videoRef.current.play().then(() => {
          log('Video playing successfully!', 'success')
          setCameraActive(true)
          setStreamStatus('✅ Camera active')
          setScanStatus('⏳ Scanning for barcodes...')
          log('Camera stream: ACTIVE', 'success')
          
          videoRef.current?.addEventListener('loadedmetadata', () => {
            log(`Video dimensions: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`)
            scanBarcode()
          })
        }).catch(playErr => {
          log(`Video play error: ${playErr.message}`, 'error')
          setStreamStatus(`❌ Play failed: ${playErr.message}`)
        })
      }
    } catch (err: any) {
      setStreamStatus(`❌ Camera failed: ${err.message}`)
      log(`Camera stream: FAILED - ${err.name}: ${err.message}`, 'error')
      
      if (err.name === 'NotAllowedError') {
        log('Permission denied by user', 'error')
      } else if (err.name === 'NotFoundError') {
        log('No camera found on device', 'error')
      } else if (err.name === 'NotReadableError') {
        log('Camera already in use', 'error')
      }
    }
  }

  // Test 4: Scan Barcode (simplified - no jsQR for now)
  const scanBarcode = () => {
    if (!streamRef.current || !videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (ctx && video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Simplified - just show that scanning is active
      // Real barcode detection would use jsQR here
    }
    
    animationFrameRef.current = requestAnimationFrame(scanBarcode)
  }

  // Stop Camera
  const stopCamera = () => {
    log('Stopping camera...')
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    
    setCameraActive(false)
    setStreamStatus('⏳ Camera stopped')
    setScanStatus('⏳ Waiting for camera...')
    log('Camera stopped', 'success')
  }

  return (
    <div style={{ padding: '20px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '24px', color: '#15803d', fontSize: '24px' }}>
          🎥 Camera Test Suite
        </h1>

        {/* Test 1: Browser Support */}
        <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>1️⃣ Browser Support Check</h2>
          <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '14px', marginBottom: '8px', background: browserStatus.includes('✅') ? '#d1fae5' : '#fef3c7', color: browserStatus.includes('✅') ? '#065f46' : '#92400e' }}>
            {browserStatus}
          </div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>
            {browserDetails.map((detail, i) => (
              <div key={i}>{detail}</div>
            ))}
          </div>
        </div>

        {/* Test 2: Permissions */}
        <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>2️⃣ Camera Permission</h2>
          <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '14px', marginBottom: '8px', background: permissionStatus.includes('✅') ? '#d1fae5' : '#fef3c7', color: permissionStatus.includes('✅') ? '#065f46' : '#92400e' }}>
            {permissionStatus}
          </div>
          <button
            onClick={requestPermission}
            style={{ width: '100%', padding: '14px', background: '#15803d', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
          >
            Request Camera Permission
          </button>
        </div>

        {/* Test 3: Camera Stream */}
        <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>3️⃣ Camera Stream Test</h2>
          <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '14px', marginBottom: '8px', background: streamStatus.includes('✅') ? '#d1fae5' : '#fef3c7', color: streamStatus.includes('✅') ? '#065f46' : '#92400e' }}>
            {streamStatus}
          </div>
          
          {!cameraActive ? (
            <button
              onClick={startCamera}
              disabled={!permissionGranted}
              style={{ width: '100%', padding: '14px', background: permissionGranted ? '#15803d' : '#9ca3af', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: permissionGranted ? 'pointer' : 'not-allowed' }}
            >
              Start Camera
            </button>
          ) : (
            <div>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{ width: '100%', maxHeight: '400px', borderRadius: '12px', background: '#000' }}
                />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '250px', height: '250px', border: '3px solid #15803d', borderRadius: '12px', pointerEvents: 'none' }} />
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <button
                onClick={stopCamera}
                style={{ width: '100%', padding: '14px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
              >
                Stop Camera
              </button>
            </div>
          )}
        </div>

        {/* Test 4: Barcode Scanning */}
        <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>4️⃣ Barcode/QR Scanning Test</h2>
          <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '14px', marginBottom: '8px', background: '#fef3c7', color: '#92400e' }}>
            {scanStatus}
          </div>
          {scanResult && (
            <div style={{ marginTop: '12px', padding: '12px', background: '#d1fae5', borderRadius: '8px', color: '#065f46', fontWeight: 600 }}>
              📱 Scanned: {scanResult}
            </div>
          )}
        </div>

        {/* Test 5: Console Log */}
        <div style={{ marginBottom: '24px', padding: '16px', background: '#f9fafb', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '16px', marginBottom: '12px', color: '#374151' }}>5️⃣ Console Log</h2>
          <div style={{ background: '#1f2937', color: '#10b981', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {logs.length === 0 ? 'Waiting for events...' : logs.join('\n')}
          </div>
        </div>
      </div>
    </div>
  )
}
