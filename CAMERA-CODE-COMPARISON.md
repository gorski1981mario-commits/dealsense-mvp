# 🔍 PORÓWNANIE KODU KAMERY: OBECNY vs IDEALNY

## ❌ KOD KTÓRY JEST TERAZ (ScanForm.tsx)

```tsx
// startCamera function
const startCamera = async () => {
  try {
    console.log('[Camera] Requesting getUserMedia...')
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' }
    })
    
    console.log('[Camera] Stream obtained')
    if (videoRef.current) {
      videoRef.current.srcObject = stream
      
      // CRITICAL: Set cameraActive FIRST so video element is in DOM
      setCameraActive(true)
      
      // Wait for next tick to ensure video is in DOM
      setTimeout(() => {
        if (!videoRef.current) return
        
        console.log('[Camera] Starting video playback...')
        videoRef.current.play().then(() => {
          console.log('[Camera] Video playing successfully!')
          
          // Wait for video metadata
          videoRef.current?.addEventListener('loadedmetadata', () => {
            console.log(`[Camera] Video ready: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`)
            scanQRCode()
          })
        }).catch(playErr => {
          console.error('[Camera] Play error:', playErr)
          showToast(`⚠️ Video afspelen mislukt: ${playErr.message}`)
          setCameraActive(false)
        })
      }, 100)
    }
  } catch (err: any) {
    console.error('[Camera] Error:', err)
    showToast(`⚠️ Camera toegang geweigerd: ${err.message}`)
  }
}

// Video element (w modal)
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
  </div>
) : (
  <div>Camera wordt gestart...</div>
)}
```

## ✅ KOD KTÓRY POWINIEN BYĆ (WORKING MOBILE)

```tsx
// startCamera function - POPRAWIONY
const startCamera = async () => {
  try {
    console.log('[Camera] Requesting getUserMedia...')
    
    // Step 1: Request camera permission
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    })
    
    console.log('[Camera] Stream obtained:', stream.id)
    
    if (videoRef.current) {
      // Step 2: Assign stream to video element
      videoRef.current.srcObject = stream
      console.log('[Camera] Stream assigned to video element')
      
      // Step 3: Show video element in DOM IMMEDIATELY
      setCameraActive(true)
      console.log('[Camera] Video element shown in DOM')
      
      // Step 4: Wait for React to render video element
      // CRITICAL: Use requestAnimationFrame instead of setTimeout
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!videoRef.current) {
            console.error('[Camera] Video ref lost after render')
            return
          }
          
          console.log('[Camera] Attempting to play video...')
          
          // Step 5: Play video
          const playPromise = videoRef.current.play()
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('[Camera] ✅ Video playing successfully!')
                console.log('[Camera] Video dimensions:', 
                  videoRef.current?.videoWidth, 'x', 
                  videoRef.current?.videoHeight)
                
                // Step 6: Wait for metadata and start scanning
                if (videoRef.current?.readyState >= 2) {
                  // Video is ready, start scanning immediately
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
                console.error('[Camera] ❌ Play error:', playErr)
                console.error('[Camera] Error name:', playErr.name)
                console.error('[Camera] Error message:', playErr.message)
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
    console.error('[Camera] ❌ getUserMedia error:', err)
    console.error('[Camera] Error name:', err.name)
    console.error('[Camera] Error message:', err.message)
    
    // Better error messages
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

// Video element - UNCHANGED (already correct)
{cameraActive ? (
  <div style={{ marginBottom: '20px', position: 'relative' }}>
    <video
      ref={videoRef}
      autoPlay        // ✅ Required for mobile
      playsInline     // ✅ Required for iOS
      muted           // ✅ Required for autoplay on mobile
      style={{
        width: '100%',
        maxHeight: '400px',
        borderRadius: '16px',
        objectFit: 'cover'
      }}
    />
    <canvas ref={canvasRef} style={{ display: 'none' }} />
    
    {/* Scanning indicator */}
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
  </div>
) : (
  <div style={{ 
    padding: '32px 20px', 
    background: 'linear-gradient(135deg, #E6F4EE 0%, #F0F9FF 100%)', 
    borderRadius: '16px',
    border: '2px dashed #15803d',
    textAlign: 'center'
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
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
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
```

## 🔍 KLUCZOWE RÓŻNICE:

### ❌ CO BRAKUJE W OBECNYM KODZIE:

1. **requestAnimationFrame zamiast setTimeout**
   - `setTimeout(100)` może być za szybki lub za wolny
   - `requestAnimationFrame` czeka na faktyczny render

2. **Sprawdzenie playPromise !== undefined**
   - Niektóre przeglądarki nie zwracają Promise

3. **Sprawdzenie video.readyState**
   - Jeśli video jest już gotowe, nie czekamy na event

4. **{ once: true } w addEventListener**
   - Zapobiega memory leaks

5. **Lepsze error handling**
   - Szczegółowe komunikaty dla każdego typu błędu
   - Cleanup stream on error

6. **Lepszy placeholder UI**
   - Gradient background
   - Ikona SVG
   - Lepsze komunikaty

7. **Video constraints**
   - width/height ideal dla lepszej jakości

8. **Więcej console.log**
   - Dokładne śledzenie każdego kroku
   - Łatwiejszy debugging

## 📊 CHECKLIST - CO MUSI BYĆ:

- ✅ `autoPlay` attribute
- ✅ `playsInline` attribute  
- ✅ `muted` attribute
- ✅ `setCameraActive(true)` PRZED `video.play()`
- ✅ `requestAnimationFrame` zamiast `setTimeout`
- ✅ Sprawdzenie `playPromise !== undefined`
- ✅ Sprawdzenie `video.readyState`
- ✅ `{ once: true }` w event listener
- ✅ Cleanup on error
- ✅ Szczegółowe error messages
- ✅ Dokładne console.log na każdym kroku

## 🎯 NASTĘPNE KROKI:

1. Zastąpić `setTimeout` → `requestAnimationFrame`
2. Dodać sprawdzenie `playPromise !== undefined`
3. Dodać sprawdzenie `video.readyState`
4. Dodać `{ once: true }` do event listener
5. Ulepszyć error handling
6. Ulepszyć placeholder UI
7. Deploy i test
