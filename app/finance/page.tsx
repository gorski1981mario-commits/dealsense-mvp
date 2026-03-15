'use client'

import { useState, useEffect } from 'react'
import Scanner from '../components/Scanner'
import AgentEcho from '../components/AgentEcho'
import BiometricAuth from '../components/BiometricAuth'
import GhostMode from '../components/GhostMode'
import ScanHistory from '../components/ScanHistory'
import PaymentButton from '../components/PaymentButton'
import BillsOptimizer from '../components/BillsOptimizer'
import VacationConfigurator from '../components/configurators/VacationConfigurator'
import InsuranceConfigurator from '../components/configurators/InsuranceConfigurator'
import EnergyConfigurator from '../components/configurators/EnergyConfigurator'
import TelecomConfigurator from '../components/configurators/TelecomConfigurator'
import MortgageConfigurator from '../components/configurators/MortgageConfigurator'
import LeasingConfigurator from '../components/configurators/LeasingConfigurator'
import LoanConfigurator from '../components/configurators/LoanConfigurator'
import CreditCardConfigurator from '../components/configurators/CreditCardConfigurator'
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
        Voor complete financiële controle. Alle tools, geen commissie.
      </p>

      {/* Agent Echo */}
      <AgentEcho packageType="finance" userId={userId} />

      {/* Ghost Mode */}
      <GhostMode packageType="finance" userId={userId} />

      {/* QR Scanner */}
      <Scanner type="finance" />

      <div style={{
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: 900, color: '#258b52' }}>€39,99</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>Per maand - annuleer wanneer je wilt</div>
        </div>
        <PaymentButton packageType="finance" userId={userId} price={39.99} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>Wat krijg je:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Alles inclusief</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Shopping + Services</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Hypotheken</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Leningen</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ Leasing</div>
          <div style={{ fontSize: '13px', color: '#374151' }}>✓ 0% commissie</div>
        </div>
      </div>

      {/* Bills Optimizer - FINANCE Exclusive */}
      <BillsOptimizer userId={userId} />

      {/* FINANCE Configurators - All 8 (4 PRO + 4 FINANCE) */}
      <div style={{ marginTop: '32px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#15803d' }}>
          💰 Finance Configurators (FINANCE)
        </h3>
        <p style={{ fontSize: '14px', color: '#374151', marginBottom: '24px' }}>
          Alle configurators: services (4) + finance (4). Volledige financiële controle.
        </p>

        {/* PRO Configurators (4) */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
            Services (van PRO)
          </h4>
          <VacationConfigurator packageType="finance" userId={userId} />
          <InsuranceConfigurator packageType="finance" userId={userId} />
          <EnergyConfigurator packageType="finance" userId={userId} />
          <TelecomConfigurator packageType="finance" userId={userId} />
        </div>

        {/* FINANCE Configurators (4) */}
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#374151' }}>
            Finance (exclusief)
          </h4>
          <MortgageConfigurator packageType="finance" userId={userId} />
          <LeasingConfigurator packageType="finance" userId={userId} />
          <LoanConfigurator packageType="finance" userId={userId} />
          <CreditCardConfigurator packageType="finance" userId={userId} />
        </div>
      </div>

      {/* Scan History */}
      <ScanHistory userId={userId} packageType="finance" />
    </div>
  )
}
