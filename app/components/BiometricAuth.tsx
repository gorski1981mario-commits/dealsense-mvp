'use client'

import { useState, useEffect } from 'react'
import { BiometricAuth as BiometricService } from '../_lib/biometric'

interface BiometricAuthProps {
  packageType: 'free' | 'plus' | 'pro' | 'finance' | 'zakelijk'
  onSuccess: () => void
  onCancel?: () => void
  actionName?: string
}

export default function BiometricAuth({ packageType, onSuccess, onCancel, actionName = 'deze actie' }: BiometricAuthProps) {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // FREE package doesn't need biometric
  if (packageType === 'free') {
    onSuccess()
    return null
  }

  useEffect(() => {
    checkBiometric()
  }, [])

  const checkBiometric = async () => {
    const available = await BiometricService.isAvailable()
    setIsAvailable(available)
    setIsRegistered(BiometricService.hasRegistered())
  }

  const handleRegister = async () => {
    setIsAuthenticating(true)
    setError(null)

    const userId = localStorage.getItem('dealsense_device_id') || 'user_' + Date.now()
    const success = await BiometricService.register(userId)

    if (success) {
      setIsRegistered(true)
      onSuccess()
    } else {
      setError('Biometrische registratie mislukt. Probeer opnieuw.')
    }
    setIsAuthenticating(false)
  }

  const handleAuthenticate = async () => {
    setIsAuthenticating(true)
    setError(null)

    const success = await BiometricService.authenticate()

    if (success) {
      onSuccess()
    } else {
      setError('Authenticatie mislukt. Probeer opnieuw.')
    }
    setIsAuthenticating(false)
  }

  if (!isAvailable) {
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
        zIndex: 9999
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '12px',
          maxWidth: '400px',
          margin: '20px'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#1e1e1e' }}>
            Biometrische authenticatie niet beschikbaar
          </h3>
          <p style={{ fontSize: '14px', color: '#374151', marginBottom: '20px' }}>
            Je apparaat ondersteunt geen biometrische authenticatie (Face ID, Touch ID, Windows Hello).
          </p>
          <button
            onClick={onCancel || onSuccess}
            style={{
              width: '100%',
              padding: '12px',
              background: '#15803d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Doorgaan zonder biometrie
          </button>
        </div>
      </div>
    )
  }

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
      zIndex: 9999
    }}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '12px',
        maxWidth: '400px',
        margin: '20px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔐</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#1e1e1e' }}>
            Bevestig {actionName}
          </h3>
          <p style={{ fontSize: '14px', color: '#374151' }}>
            {isRegistered 
              ? 'Gebruik je vingerafdruk of gezichtsherkenning om door te gaan.'
              : 'Registreer je vingerafdruk of gezichtsherkenning voor veilige toegang.'}
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

        <button
          onClick={isRegistered ? handleAuthenticate : handleRegister}
          disabled={isAuthenticating}
          style={{
            width: '100%',
            padding: '14px',
            background: '#15803d',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isAuthenticating ? 'not-allowed' : 'pointer',
            opacity: isAuthenticating ? 0.6 : 1,
            marginBottom: '12px',
            boxShadow: '0 4px 6px rgba(21, 128, 61, 0.3)'
          }}
        >
          {isAuthenticating ? 'Bezig...' : (isRegistered ? 'Authenticeren' : 'Registreren')}
        </button>

        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isAuthenticating}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#374151',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isAuthenticating ? 'not-allowed' : 'pointer'
            }}
          >
            Annuleren
          </button>
        )}
      </div>
    </div>
  )
}
