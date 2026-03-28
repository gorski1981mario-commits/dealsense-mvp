'use client'

import { useEffect, useRef, useState } from 'react'

export default function SimpleCameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [status, setStatus] = useState('Kliknij przycisk żeby uruchomić kamerę')
  const [error, setError] = useState('')

  const startCamera = async () => {
    setStatus('Próbuję uruchomić kamerę...')
    setError('')
    
    try {
      console.log('Starting camera...')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        }
      })
      
      console.log('Camera stream obtained:', stream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded')
          videoRef.current?.play()
          setStatus('✅ KAMERA DZIAŁA!')
        }
      }
      
    } catch (err: any) {
      console.error('Camera error:', err)
      setError(`❌ BŁĄD: ${err.name} - ${err.message}`)
      setStatus('Kamera nie działa')
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>
        🎥 Test Kamery
      </h1>
      
      <div style={{ 
        padding: '16px', 
        background: '#f3f4f6', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <p style={{ fontSize: '16px', fontWeight: 600 }}>
          {status}
        </p>
        {error && (
          <p style={{ fontSize: '14px', color: '#dc2626', marginTop: '8px' }}>
            {error}
          </p>
        )}
      </div>

      <button
        onClick={startCamera}
        style={{
          width: '100%',
          padding: '16px',
          background: '#15803d',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 700,
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        🎥 Uruchom Kamerę
      </button>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          borderRadius: '8px',
          background: '#000',
          minHeight: '300px'
        }}
      />

      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        background: '#fef3c7',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        <p><strong>Instrukcja:</strong></p>
        <ol style={{ marginLeft: '20px', marginTop: '8px' }}>
          <li>Kliknij przycisk "Uruchom Kamerę"</li>
          <li>Przeglądarka zapyta o dostęp - kliknij "Zezwól"</li>
          <li>Jeśli działa - zobaczysz obraz z kamery</li>
          <li>Jeśli nie działa - zobaczysz dokładny błąd</li>
        </ol>
      </div>
    </div>
  )
}
