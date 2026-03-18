'use client'

import { useState, useEffect } from 'react'
import Scanner from '../components/Scanner'
import BiometricAuth from '../components/BiometricAuth'
import GhostMode from '../components/GhostMode'
import ScanHistory from '../components/ScanHistory'
import PaymentButton from '../components/PaymentButton'
import BillsOptimizer from '../components/BillsOptimizer'
import { BiometricAuth as BiometricService } from '../_lib/biometric'
import { getDeviceId } from '../_lib/utils'

export default function FinancePage() {
  const [biometricRegistered, setBiometricRegistered] = useState(false)
  const [showBiometricSetup, setShowBiometricSetup] = useState(false)
  const userId = typeof window !== 'undefined' ? getDeviceId() : 'user_demo'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBiometricRegistered(BiometricService.hasRegistered())
    }
  }, [])

  return (
    <div>
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
          packageType="finance"
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
        }}>FINANCE</span>
      </div>
      
      <p style={{ fontSize: '18px', color: '#374151', marginBottom: '32px' }}>
        Voor complete financiële controle. Alle tools, minimale commissie.
      </p>

      {/* Ghost Mode */}
      <GhostMode packageType="finance" userId={userId} />

      {/* QR Scanner */}
      <Scanner type="finance" />

      <div style={{
        marginTop: '24px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <PaymentButton packageType="finance" userId={userId} price={39.99} />
      </div>

      {/* Bills Optimizer - FINANCE Exclusive */}
      <BillsOptimizer userId={userId} />

      {/* FINANCE Configurators - Redirect to /vaste-lasten */}
      <div style={{
        background: 'linear-gradient(135deg, #E6F4EE 0%, #dcfce7 100%)',
        borderRadius: '16px',
        padding: '24px',
        marginTop: '32px',
        marginBottom: '32px',
        border: '2px solid #1E7F5C'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#15803d' }}>
          💰 Vaste Lasten + Finance Configurators
        </h3>
        <p style={{ fontSize: '14px', color: '#374151', marginBottom: '20px', lineHeight: '1.6' }}>
          Gebruik onze geavanceerde configurators voor alle diensten (vakanties, verzekeringen, energie, telecom) én exclusieve finance opties (hypotheek, leasing, lening, creditcard).
        </p>
        <a
          href="/vaste-lasten"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#1E7F5C',
            color: 'white',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s ease'
          }}
        >
          Open Alle Configurators →
        </a>
      </div>

      {/* Scan History */}
      <ScanHistory userId={userId} packageType="finance" />
    </div>
  )
}
