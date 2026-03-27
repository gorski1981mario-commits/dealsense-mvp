'use client'

import OCRScanner from '../components/OCRScanner'
import { useState } from 'react'
import { FileText, Zap, Shield, TrendingUp } from 'lucide-react'

export default function OCRDemoPage() {
  const [scanResult, setScanResult] = useState<Record<string, any> | null>(null)

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom, #f9fafb, #ffffff)' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <FileText size={24} style={{ color: '#15803d' }} />
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
            OCR Document Scanner
          </h1>
          <div style={{
            marginLeft: 'auto',
            padding: '6px 12px',
            background: '#E6F4EE',
            color: '#15803d',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600
          }}>
            PRO + FINANCE
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', color: '#111' }}>
            Scan je factuur in 10 seconden
          </h2>
          <p style={{ fontSize: '16px', color: '#666', maxWidth: '600px', margin: '0 auto' }}>
            Upload een foto van je energie-, telefoon- of verzekeringsfactuur. 
            Onze AI vult automatisch alle velden in en zoekt betere deals.
          </p>
        </div>

        {/* Features Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '48px'
        }}>
          <div style={{
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <Zap size={32} style={{ color: '#15803d', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
              10 seconden
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Sneller dan typen
            </div>
          </div>

          <div style={{
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <Shield size={32} style={{ color: '#15803d', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
              90%+ nauwkeurig
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              AI-powered OCR
            </div>
          </div>

          <div style={{
            padding: '20px',
            background: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <TrendingUp size={32} style={{ color: '#15803d', margin: '0 auto 12px' }} />
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
              Gemiddeld €300/jaar
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Besparing per factuur
            </div>
          </div>
        </div>

        {/* OCR Scanner Component */}
        <OCRScanner
          onScanComplete={(result) => {
            console.log('Scan complete:', result)
            setScanResult(result)
          }}
          packageType="finance"
        />

        {/* Supported Documents */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          background: 'white',
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>
            📄 Ondersteunde documenten
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              { type: 'Energiefactuur', providers: 'Essent, Eneco, Vattenfall, Greenchoice' },
              { type: 'Telefoon/Internet', providers: 'KPN, Vodafone, T-Mobile, Ziggo, Tele2' },
              { type: 'Verzekering', providers: 'Aegon, Nationale Nederlanden, Achmea, ASR' },
              { type: 'Hypotheek', providers: 'Alle Nederlandse banken' },
              { type: 'Lening', providers: 'Alle Nederlandse kredietverstrekkers' }
            ].map((doc, i) => (
              <div key={i} style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>
                    {doc.type}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {doc.providers}
                  </div>
                </div>
                <div style={{
                  padding: '4px 8px',
                  background: '#E6F4EE',
                  color: '#15803d',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  ✓ Supported
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div style={{
          marginTop: '48px',
          padding: '24px',
          background: '#E6F4EE',
          borderRadius: '12px'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#15803d' }}>
            🔍 Hoe werkt het?
          </h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            {[
              '1. Upload foto of PDF van je factuur',
              '2. AI scant en extraheert alle gegevens (10s)',
              '3. Controleer de gevonden informatie',
              '4. Klik "Zoek betere deal"',
              '5. Ontvang 3 betere aanbiedingen',
              '6. Bespaar gemiddeld €300/jaar'
            ].map((step, i) => (
              <div key={i} style={{
                fontSize: '14px',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  background: '#15803d',
                  borderRadius: '50%'
                }} />
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          fontSize: '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          <strong>Powered by:</strong> Tesseract.js OCR • Sharp Image Processing • NLP Field Extraction • KWANT AI Engine
        </div>
      </div>
    </div>
  )
}
