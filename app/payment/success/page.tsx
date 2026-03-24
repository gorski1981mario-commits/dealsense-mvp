'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { AuthService } from '../../_lib/auth'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const packageType = searchParams.get('package') as 'plus' | 'pro' | 'finance' | null

  useEffect(() => {
    // Update user package
    if (packageType) {
      AuthService.updatePackage(packageType)
      localStorage.setItem('dealsense_package', packageType)
    }

    // Redirect after 5 seconds
    const timer = setTimeout(() => {
      router.push('/' + (packageType || ''))
    }, 5000)

    return () => clearTimeout(timer)
  }, [packageType, router])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #E6F4EE 0%, #E6F4EE 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '48px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #E6F4EE 0%, #E6F4EE 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <CheckCircle size={48} color="#15803d" strokeWidth={2} />
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '12px'
        }}>
          Betaling geslaagd!
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Welkom bij {packageType?.toUpperCase() || 'DealSense'}! Je account is succesvol geüpgraded.
        </p>

        <div style={{
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '12px' }}>
            <strong>Wat kun je nu doen:</strong>
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.8', textAlign: 'left' }}>
            {packageType === 'plus' && (
              <>
                ✓ Onbeperkt producten scannen<br />
                ✓ Ghost Mode (24 uur)<br />
                ✓ Echo AI assistent<br />
                ✓ Slechts 9% commissie
              </>
            )}
            {packageType === 'pro' && (
              <>
                ✓ Onbeperkt scans - producten én diensten<br />
                ✓ Ghost Mode (48 uur)<br />
                ✓ Echo AI assistent (uitgebreid)<br />
                ✓ 16 categorieën<br />
                ✓ Slechts 9% commissie
              </>
            )}
            {packageType === 'finance' && (
              <>
                ✓ Alles inclusief - alle 20+ categorieën<br />
                ✓ Ghost Mode (7 dagen)<br />
                ✓ Echo AI assistent (premium)<br />
                ✓ Hypotheken, Leningen, Leasing<br />
                ✓ Slechts 9% commissie
              </>
            )}
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: '#E6F4EE',
          borderRadius: '12px',
          fontSize: '13px',
          color: '#15803d',
          marginBottom: '24px'
        }}>
          💡 <strong>Tip:</strong> Schakel biometrische authenticatie in voor sneller inloggen!
        </div>

        <button
          onClick={() => router.push('/' + (packageType || ''))}
          style={{
            width: '100%',
            padding: '14px',
            background: '#258b52',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '12px'
          }}
        >
          Start met scannen →
        </button>

        <button
          onClick={() => router.push('/settings')}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: '#6B7280',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Ga naar instellingen
        </button>

        {sessionId && (
          <div style={{
            marginTop: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #E5E7EB',
            fontSize: '12px',
            color: '#9CA3AF'
          }}>
            Sessie ID: {sessionId}
          </div>
        )}
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}




