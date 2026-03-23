'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Sun, ShieldCheck, Zap, Smartphone } from 'lucide-react'
import Scanner from '../components/Scanner'
import BiometricAuth from '../components/BiometricAuth'
import GhostMode from '../components/GhostMode'
import ScanHistory from '../components/ScanHistory'
import PaymentButton from '../components/PaymentButton'
import PaywallMessage from '../components/PaywallMessage'
import { BiometricAuth as BiometricService } from '../_lib/biometric'
import { getDeviceId } from '../_lib/utils'
import { PackageType, hasConfiguratorAccess } from '../_lib/package-access'
import { checkAccess, FEATURE_FLAGS } from '../_lib/feature-flags'

export default function ProPage() {
  const [biometricRegistered, setBiometricRegistered] = useState(false)
  const [showBiometricSetup, setShowBiometricSetup] = useState(false)
  const [userPackage, setUserPackage] = useState<PackageType>('free')
  const [isLoading, setIsLoading] = useState(true)
  const userId = typeof window !== 'undefined' ? getDeviceId() : 'user_demo'
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setBiometricRegistered(BiometricService.hasRegistered())
      
      // Check user package
      const savedPackage = localStorage.getItem(`package_${userId}`) as PackageType
      setUserPackage(savedPackage || 'free')
      setIsLoading(false)
    }
  }, [userId])

  // Paywall check (respects PAYWALL_ENABLED flag)
  const userHasAccess = hasConfiguratorAccess(userPackage, 'pro')
  const hasAccess = checkAccess(userHasAccess)
  
  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Laden...</div>
  }

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
          packageType="pro"
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
        }}>PRO</span>
      </div>
      
      <p style={{ fontSize: '18px', color: '#1e40af', fontWeight: 600, marginBottom: '32px' }}>
        Voor professionals. Maximale features, minimale commissie.
      </p>


      {/* Ghost Mode */}
      <GhostMode packageType="pro" userId={userId} />

      {/* QR Scanner */}
      <Scanner type="pro" />

      <div style={{
        marginTop: '24px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #E2E8F0'
      }}>
        <PaymentButton packageType="pro" userId={userId} price={29.99} />
      </div>


      {/* PRO Configurators - 4 Cards */}
      <div style={{ marginTop: '32px', marginBottom: '32px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#15803d' }}>
          🎯 Vaste Lasten Configurators
        </h3>
        <p style={{ fontSize: '14px', color: '#374151', marginBottom: '20px', lineHeight: '1.6' }}>
          Gebruik onze geavanceerde configurators om de beste deals te vinden en te besparen op je vaste lasten.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {[
            { href: '/vacations', Icon: Sun, title: 'Vakanties', desc: 'Vergelijk vakantieaanbiedingen' },
            { href: '/insurance', Icon: ShieldCheck, title: 'Verzekeringen', desc: 'Vind de beste verzekering' },
            { href: '/energy', Icon: Zap, title: 'Energie', desc: 'Bespaar op stroom & gas' },
            { href: '/telecom', Icon: Smartphone, title: 'Telecom', desc: 'Mobiel, internet & TV' }
          ].map((config) => (
            hasAccess ? (
              <Link
                key={config.href}
                href={config.href}
              style={{
                display: 'block',
                padding: '20px',
                background: 'white',
                border: '2px solid #1e40af',
                borderRadius: '12px',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#15803d'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(30, 127, 92, 0.15)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#1e40af'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <config.Icon size={32} strokeWidth={2} color="#15803d" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                    {config.title}
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#15803d', background: '#E6F4EE', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                    PRO
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
                {config.desc}
              </p>
            </Link>
            ) : (
              <div
                key={config.href}
                style={{
                  position: 'relative',
                  padding: '20px',
                  background: '#F9FAFB',
                  border: '2px dashed #D1D5DB',
                  borderRadius: '12px',
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <config.Icon size={32} strokeWidth={2} color="#9CA3AF" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#6B7280', marginBottom: '4px' }}>
                      {config.title}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF', background: '#E5E7EB', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                      🔒 PRO
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
                  {config.desc}
                </p>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Scan History */}
      <ScanHistory userId={userId} packageType="pro" />
    </div>
  )
}



