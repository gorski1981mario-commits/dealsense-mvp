'use client'

import { useState, useEffect } from 'react'
import Scanner from '../components/Scanner'
import AgentEcho from '../components/AgentEcho'
import BiometricAuth from '../components/BiometricAuth'
import GhostMode from '../components/GhostMode'
import ScanHistory from '../components/ScanHistory'
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
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #86efac',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#15803d' }}>
            Beveilig je account met biometrie
          </div>
          <div style={{ fontSize: '13px', color: '#374151', marginBottom: '12px' }}>
            Gebruik Face ID, Touch ID of Windows Hello als elektronische handtekening voor financiële acties.
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
          background: 'rgba(37,139,82,0.12)',
          color: '#258b52',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: 700
        }}>PLUS</span>
      </div>
      
      <p style={{ fontSize: '18px', color: '#374151', marginBottom: '32px' }}>
        Voor snelle checks. Je krijgt overzicht en context, maar jij beslist.
      </p>

      {/* Agent Echo */}
      <AgentEcho packageType="plus" userId={userId} />

      {/* Ghost Mode */}
      <GhostMode packageType="plus" userId={userId} />

      {/* QR Scanner */}
      <Scanner type="plus" />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#258b52' }}>€19,99</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>Eenmalige betaling</div>
        </div>
        <button style={{
          padding: '10px 20px',
          background: '#15803d',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(21, 128, 61, 0.3)'
        }}>Upgrade nu</button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Wat krijg je:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Onbeperkt scans</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Shopping</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Ghost Mode (24h)</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ 5% commissie</div>
        </div>
      </div>

      {/* Scan History */}
      <ScanHistory userId={userId} packageType="plus" />
    </div>
  )
}
