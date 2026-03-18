'use client'

import { useState } from 'react'
import PaymentButton from '../../../app/components/PaymentButton'

export default function ZakelijkCheckoutPage() {
  const [userId] = useState('demo-user') // TODO: Get from auth

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '8px'
          }}>
            ZAKELIJK B2B Pakket
          </h1>
          
          <div style={{
            fontSize: '48px',
            fontWeight: 900,
            color: '#1e40af',
            marginBottom: '24px'
          }}>
            €59,99<span style={{ fontSize: '24px', fontWeight: 600, color: '#6b7280' }}>/maand</span>
          </div>

          <div style={{
            padding: '20px',
            background: '#eff6ff',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#1e40af' }}>
              Wat krijg je:
            </div>
            <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>
              ✓ B2B Procurement Platform - 10 industrieën<br />
              ✓ Metale, Chemicaliën, Energie, Granen, Bouwmaterialen<br />
              ✓ Machines, Elektronika, Transport, Verpakking, Gereedschap<br />
              ✓ Vergelijk 1000+ Nederlandse leveranciers<br />
              ✓ 10% commissie op B2B transacties<br />
              ✓ RFQ (Request for Quote) systeem<br />
              ✓ Dedicated account manager<br />
              ✓ Certificaten & documentatie (MSDS, COA, ISO)
            </div>
          </div>

          <PaymentButton
            packageType="zakelijk"
            userId={userId}
            price={59.99}
          />

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            💳 Betaal veilig met iDEAL of creditcard via Stripe<br />
            🔒 Je gegevens zijn veilig - SSL encrypted<br />
            ✓ Opzeggen kan altijd
          </div>
        </div>
      </div>
    </div>
  )
}
