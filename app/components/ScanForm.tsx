'use client'

import { useState } from 'react'
import { EyeOff } from 'lucide-react'
import OCRScanner from './OCRScanner'
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

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const priceNum = parseFloat(price.replace(',', '.'))
    if (!url || !price || isNaN(priceNum)) {
      showToast('⚠️ Vul alle velden in')
      return
    }

    // Check if user can continue (anti-abuse)
    const userId = getDeviceId()
    const canContinue = await FlowTracker.getInstance().canContinue(userId, 'scanner', packageType)
    
    if (!canContinue.allowed) {
      showToast(`⚠️ ${canContinue.reason}`)
      return
    }

    // Track scan action
    FlowTracker.getInstance().trackEvent(userId, 'scanner', 'action', packageType, { price: priceNum, category })

    setLoading(true)

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: priceNum,
          url: url,
          session_id: getDeviceId(),
          fingerprint: getDeviceId(),
          category: category
        })
      })

      const data = await res.json()

      if (res.ok && data) {
        showToast('✓ Vergelijking voltooid!')
        if (onScanComplete) {
          onScanComplete(data)
        }
      } else {
        showToast(data.error || 'Er is iets misgegaan')
      }
    } catch (err) {
      console.error('Scan error:', err)
      showToast('Netwerkfout - probeer opnieuw')
    } finally {
      setLoading(false)
    }
  }

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
            
            <div style={{ marginBottom: '20px', padding: '20px', background: '#F3F4F6', borderRadius: '12px' }}>
              <p style={{ fontSize: '14px', color: '#374151', marginBottom: '12px' }}>
                Richt je camera op de barcode/QR code van het product
              </p>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
              <p style={{ fontSize: '12px', color: '#6B7280' }}>
                Barcode scanner wordt binnenkort toegevoegd
              </p>
            </div>

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

