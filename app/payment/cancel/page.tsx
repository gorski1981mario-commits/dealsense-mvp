'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { XCircle, ArrowLeft } from 'lucide-react'

function PaymentCancelContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageType = searchParams.get('package') as 'plus' | 'pro' | 'finance' | null

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
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
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <XCircle size={48} color="#DC2626" strokeWidth={2} />
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '12px'
        }}>
          Betaling geannuleerd
        </h1>

        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          marginBottom: '24px',
          lineHeight: '1.6'
        }}>
          Je betaling is geannuleerd. Er is geen bedrag afgeschreven.
        </p>

        <div style={{
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '12px' }}>
            <strong>Wat nu?</strong>
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.8', textAlign: 'left' }}>
            • Je kunt het opnieuw proberen wanneer je wilt<br />
            • Blijf gebruik maken van het FREE pakket<br />
            • Neem contact op als je vragen hebt
          </div>
        </div>

        <div style={{
          padding: '16px',
          background: '#dbeafe',
          borderRadius: '12px',
          fontSize: '13px',
          color: '#1e40af',
          marginBottom: '24px'
        }}>
          💡 <strong>Wist je dat:</strong> Met het FREE pakket krijg je 3 gratis scans om DealSense uit te proberen!
        </div>

        <button
          onClick={() => router.push('/packages')}
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
          Bekijk paketten opnieuw
        </button>

        <button
          onClick={() => router.push('/')}
          style={{
            width: '100%',
            padding: '12px',
            background: 'transparent',
            color: '#6B7280',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <ArrowLeft size={18} />
          Terug naar home
        </button>

        <div style={{
          marginTop: '24px',
          paddingTop: '24px',
          borderTop: '1px solid #E5E7EB',
          fontSize: '13px',
          color: '#6B7280'
        }}>
          Hulp nodig? <a href="mailto:info@dealsense.nl" style={{ color: '#258b52', textDecoration: 'none', fontWeight: 600 }}>
            Neem contact op
          </a>
        </div>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    }>
      <PaymentCancelContent />
    </Suspense>
  )
}




