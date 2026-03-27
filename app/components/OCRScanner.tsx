'use client'

import { useState } from 'react'
import { Camera, Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import OCRReviewScreen from './OCRReviewScreen'

interface OCRResult {
  success: boolean
  confidence: number
  documentType: 'energy' | 'telecom' | 'insurance' | 'mortgage' | 'loan' | 'unknown'
  fields: Record<string, any>
  rawText: string
  method: 'tesseract' | 'google-vision'
  error?: string
}

interface OCRScannerProps {
  onScanComplete?: (result: OCRResult) => void
  packageType?: 'pro' | 'finance'
}

export default function OCRScanner({ onScanComplete, packageType = 'finance' }: OCRScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showReview, setShowReview] = useState(false)

  const handleFileUpload = async (file: File) => {
    setScanning(true)
    setError(null)
    setResult(null)

    try {
      // STEP 1: Validate image quality FIRST
      const validationFormData = new FormData()
      validationFormData.append('file', file)

      const validationResponse = await fetch('/api/ocr/validate-image', {
        method: 'POST',
        body: validationFormData
      })

      const validation = await validationResponse.json()

      // Reject if quality too low
      if (!validation.isValid) {
        setError(
          `Zdjęcie zbyt słabej jakości (${validation.score}/100)\n\n` +
          `Problemy:\n${validation.issues.map((i: string) => `• ${i}`).join('\n')}\n\n` +
          `Wskazówki:\n${validation.suggestions.map((s: string) => `• ${s}`).join('\n')}`
        )
        setScanning(false)
        return
      }

      // Show warning if quality is poor but acceptable
      if (validation.quality === 'poor' || validation.quality === 'acceptable') {
        console.warn(`⚠️ Image quality: ${validation.quality} (${validation.score}/100)`)
        console.warn('Issues:', validation.issues)
      }

      // STEP 2: Proceed with OCR
      const formData = new FormData()
      formData.append('file', file)
      formData.append('userId', getDeviceId())

      const response = await fetch('/api/ocr/scan', {
        method: 'POST',
        body: formData
      })

      const data: OCRResult = await response.json()

      if (!data.success) {
        setError(data.error || 'OCR scan failed')
        setScanning(false)
        return
      }

      setResult(data)
      setScanning(false)
      
      // Show review screen instead of auto-redirecting
      setShowReview(true)

      if (onScanComplete) {
        onScanComplete(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error')
      setScanning(false)
    }
  }

  const handleReviewConfirm = (correctedFields: Record<string, any>) => {
    if (!result) return

    // Redirect to configurator with corrected fields
    const configuratorURLs: Record<string, string> = {
      energy: '/configurators/energy',
      telecom: '/configurators/telecom',
      insurance: '/configurators/insurance',
      mortgage: '/configurators/mortgage',
      loan: '/configurators/loan'
    }

    const baseURL = configuratorURLs[result.documentType]
    if (baseURL) {
      const params = new URLSearchParams({
        ocr: 'true',
        ...correctedFields
      })
      window.location.href = `${baseURL}?${params.toString()}`
    }
  }

  const handleReviewCancel = () => {
    setShowReview(false)
    setResult(null)
  }

  const handleCameraCapture = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleFileUpload(file)
    }
    input.click()
  }

  const handleFileSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*,application/pdf'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) handleFileUpload(file)
    }
    input.click()
  }

  const getDocumentTypeLabel = (type: OCRResult['documentType']) => {
    const labels = {
      energy: 'Energiefactuur',
      telecom: 'Telefoon/Internet',
      insurance: 'Verzekering',
      mortgage: 'Hypotheek',
      loan: 'Lening',
      unknown: 'Onbekend document'
    }
    return labels[type] || 'Onbekend'
  }

  const getDocumentTypeIcon = (type: OCRResult['documentType']) => {
    return '📄'
  }

  // Show review screen if scan is complete
  if (showReview && result && result.success) {
    return (
      <OCRReviewScreen
        documentType={result.documentType}
        fields={result.fields}
        rawText={result.rawText}
        confidence={result.confidence}
        onConfirm={handleReviewConfirm}
        onCancel={handleReviewCancel}
      />
    )
  }

  return (
    <div style={{
      padding: '24px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} />
          Scan je factuur
        </h3>
        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
          Upload een foto of PDF van je factuur. We vullen automatisch alle velden in.
        </p>
      </div>

      {!scanning && !result && (
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <button
            onClick={handleCameraCapture}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              background: '#15803d',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#166534'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#15803d'}
          >
            <Camera size={20} />
            Maak foto
          </button>

          <button
            onClick={handleFileSelect}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              background: '#E6F4EE',
              color: '#15803d',
              border: '2px solid #15803d',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#d1f0e0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#E6F4EE'
            }}
          >
            <Upload size={20} />
            Upload bestand
          </button>
        </div>
      )}

      {scanning && (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          background: '#E6F4EE',
          borderRadius: '12px'
        }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#15803d', margin: '0 auto 16px' }} />
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#15803d', marginBottom: '8px' }}>
            Scannen...
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            We lezen je document. Dit kan 5-10 seconden duren.
          </div>
        </div>
      )}

      {error && (
        <div style={{
          padding: '16px',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <AlertCircle size={20} style={{ color: '#c00', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#c00', marginBottom: '4px' }}>
              Scan mislukt
            </div>
            <div style={{ fontSize: '13px', color: '#666' }}>
              {error}
            </div>
          </div>
        </div>
      )}

      {result && result.success && (
        <div style={{
          padding: '20px',
          background: '#E6F4EE',
          borderRadius: '12px',
          border: '2px solid #15803d'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <CheckCircle size={24} style={{ color: '#15803d' }} />
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#15803d', marginBottom: '4px' }}>
                {getDocumentTypeIcon(result.documentType)} {getDocumentTypeLabel(result.documentType)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {result.confidence}% zekerheid • {result.method === 'tesseract' ? 'Tesseract OCR' : 'Google Vision'}
              </div>
            </div>
          </div>

          {/* Penalty Warning (if exists) */}
          {result.fields.penaltyWarning && (
            <div style={{
              background: '#fee',
              border: '2px solid #fcc',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <div style={{ fontSize: '20px', flexShrink: 0 }}>⚠️</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#c00', marginBottom: '4px' }}>
                  Opzegkosten gevonden!
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {result.fields.penaltyWarning}
                </div>
              </div>
            </div>
          )}

          <div style={{
            background: 'white',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px', color: '#15803d' }}>
              Gevonden gegevens:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Object.entries(result.fields)
                .filter(([key]) => !key.includes('penalty') && !key.includes('Warning') && !key.includes('notice'))
                .map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#666', textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      {typeof value === 'number' && key.includes('Price') ? `€${value.toFixed(2)}` : value}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <button
            onClick={() => {
              // Auto-fill configurator based on document type
              if (result.documentType === 'energy') {
                window.location.href = '/configurators/energy?ocr=true&' + new URLSearchParams(result.fields as any).toString()
              } else if (result.documentType === 'telecom') {
                window.location.href = '/configurators/telecom?ocr=true&' + new URLSearchParams(result.fields as any).toString()
              } else if (result.documentType === 'insurance') {
                window.location.href = '/configurators/insurance?ocr=true&' + new URLSearchParams(result.fields as any).toString()
              }
            }}
            style={{
              width: '100%',
              padding: '16px',
              background: '#15803d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#166534'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#15803d'}
          >
            Zoek betere deal 🔍
          </button>

          <button
            onClick={() => {
              setResult(null)
              setError(null)
            }}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#666',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Scan opnieuw
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'
  
  let deviceId = localStorage.getItem('device_id')
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2, 15)
    localStorage.setItem('device_id', deviceId)
  }
  return deviceId
}

