'use client'

import { useState, useEffect } from 'react'
import ScanForm from '../components/ScanForm'
import ScanHistory from '../components/ScanHistory'
import PaymentButton from '../components/PaymentButton'
import BiometricAuth from '../components/BiometricAuth'
import { BiometricAuth as BiometricService } from '../_lib/biometric'
import { getDeviceId } from '../_lib/utils'

export default function PlusPage() {
  const [biometricRegistered, setBiometricRegistered] = useState(false)
  const [showBiometricSetup, setShowBiometricSetup] = useState(false)
  const userId = typeof window !== 'undefined' ? getDeviceId() : 'user_demo'

  useEffect(() => {
    // Check if biometric is already registered
    if (typeof window !== 'undefined') {
      setBiometricRegistered(BiometricService.hasRegistered())
    }
  }, [])

  return (
    <div>
      {/* Biometric Setup Prompt */}
      {!biometricRegistered && (
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #E6F4EE 0%, #E6F4EE 100%)',
          border: '1px solid #86efac',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#15803d' }}>
            Beveilig je account met biometrie
          </div>
          <div style={{ fontSize: '13px', color: '#374151', marginBottom: '12px' }}>
            Gebruik Touch ID (vingerafdruk) of Patroon (kropki) als elektronische handtekening voor financiële acties.
          </div>
          <button
            onClick={() => setShowBiometricSetup(true)}
            style={{
              padding: '8px 16px',
              background: '#15803d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Biometrie instellen
          </button>
        </div>
      )}

      {showBiometricSetup && (
        <BiometricAuth
          packageType="plus"
          onSuccess={() => {
            setBiometricRegistered(true)
            setShowBiometricSetup(false)
          }}
          onCancel={() => setShowBiometricSetup(false)}
          actionName="biometrie instellen"
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span style={{
          display: 'inline-block',
          padding: '4px 12px',
          background: '#15803d',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>PLUS</span>
      </div>
      
      <p style={{ fontSize: '18px', color: '#1e40af', fontWeight: 600, marginBottom: '32px' }}>
        Voor snelle checks. Je krijgt overzicht en context, maar jij beslist.
      </p>

      {/* Scan Form */}
      <ScanForm packageType="plus" />

      <div style={{
        marginTop: '24px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <PaymentButton packageType="plus" userId={userId} price={19.99} />
      </div>

      {/* Scan History */}
      <ScanHistory userId={userId} packageType="plus" />
    </div>
  )
}




