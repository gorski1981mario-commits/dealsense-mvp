'use client'

import { useState } from 'react'
import { BiometricAuth } from '../_lib/biometric'
import { AuthService } from '../_lib/auth'
import { Fingerprint, Copy, Check } from 'lucide-react'

interface BiometricSetupPromptProps {
  onComplete: () => void
  onSkip: () => void
}

export default function BiometricSetupPrompt({ onComplete, onSkip }: BiometricSetupPromptProps) {
  const [step, setStep] = useState<'prompt' | 'setup' | 'codes'>('prompt')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEnable = async () => {
    setLoading(true)
    setError(null)
    setStep('setup')

    // Check if biometric is available
    const available = await BiometricAuth.isAvailable()
    if (!available) {
      setError('Biometrische authenticatie niet beschikbaar op dit apparaat')
      setLoading(false)
      return
    }

    // Register biometric
    const userId = localStorage.getItem('dealsense_device_id') || 'user_' + Date.now()
    const success = await BiometricAuth.register(userId)

    if (!success) {
      setError('Kon biometrie niet activeren. Probeer opnieuw.')
      setLoading(false)
      return
    }

    // Enable in auth system and get backup codes
    const result = await AuthService.enableBiometric()
    
    if (result.success && result.backupCodes) {
      setBackupCodes(result.backupCodes)
      setStep('codes')
    } else {
      setError(result.error || 'Kon backup codes niet genereren')
    }
    
    setLoading(false)
  }

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const copyAllCodes = () => {
    const allCodes = backupCodes.join('\n')
    navigator.clipboard.writeText(allCodes)
    setCopiedIndex(-1)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (step === 'prompt') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '440px',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#E6F4EE',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Fingerprint size={32} color="#15803d" />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>
              Sneller inloggen met biometrie
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
              Gebruik je vingerafdruk of gezichtsherkenning om instant toegang te krijgen tot DealSense. 
              Net zoals je je telefoon ontgrendelt!
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: '#fee2e2',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#991b1b',
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          <div style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '12px' }}>
              <strong>Voordelen:</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.8' }}>
              ✓ Instant toegang met één tik<br />
              ✓ Veiliger dan wachtwoord<br />
              ✓ Werkt offline<br />
              ✓ Je kunt altijd terug naar email/wachtwoord
            </div>
          </div>

          <button
            onClick={handleEnable}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: '#258b52',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              marginBottom: '12px'
            }}
          >
            {loading ? 'Bezig...' : 'Activeer biometrie'}
          </button>

          <button
            onClick={onSkip}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#6B7280',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Misschien later
          </button>
        </div>
      </div>
    )
  }

  if (step === 'setup') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>
            Biometrie instellen...
          </h3>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Volg de instructies op je apparaat
          </p>
        </div>
      </div>
    )
  }

  if (step === 'codes') {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        overflowY: 'auto'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
          margin: '20px auto'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔑</div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>
              Bewaar deze backup codes
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.6' }}>
              Als je toegang verliest tot biometrie, kun je met deze codes inloggen. 
              <strong> Bewaar ze op een veilige plek!</strong>
            </p>
          </div>

          <div style={{
            padding: '16px',
            background: '#fef3c7',
            border: '2px solid #fbbf24',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: 600, marginBottom: '4px' }}>
              ⚠️ Belangrijk
            </div>
            <div style={{ fontSize: '12px', color: '#92400e', lineHeight: '1.6' }}>
              Elke code kan maar 1x gebruikt worden. Download of print deze codes en bewaar ze veilig.
            </div>
          </div>

          <div style={{
            background: '#f9fafb',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}>
              {backupCodes.map((code, index) => (
                <div
                  key={index}
                  onClick={() => copyCode(code, index)}
                  style={{
                    padding: '12px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: '#111827',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#258b52'
                    e.currentTarget.style.background = '#E6F4EE'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB'
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  <span>{code}</span>
                  {copiedIndex === index ? (
                    <Check size={16} color="#15803d" />
                  ) : (
                    <Copy size={16} color="#6B7280" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={copyAllCodes}
            style={{
              width: '100%',
              padding: '12px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#374151',
              cursor: 'pointer',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {copiedIndex === -1 ? (
              <>
                <Check size={18} color="#15803d" />
                Gekopieerd!
              </>
            ) : (
              <>
                <Copy size={18} />
                Kopieer alle codes
              </>
            )}
          </button>

          <button
            onClick={onComplete}
            style={{
              width: '100%',
              padding: '14px',
              background: '#258b52',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Ik heb de codes opgeslagen
          </button>
        </div>
      </div>
    )
  }

  return null
}




