'use client'

import { useRouter } from 'next/navigation'
import { Building2, TrendingUp, Shield, Zap } from 'lucide-react'

export default function ZakelijkPage() {
  const router = useRouter()

  const industries = [
    { id: 'metals', name: 'Metale & Stal', icon: '🔩', path: '/business/metals' },
    { id: 'chemicals', name: 'Chemicaliën', icon: '🧪', path: '/business/chemicals' },
    { id: 'energy', name: 'Energia & Paliwa', icon: '⚡', path: '/business/energy' },
    { id: 'grain', name: 'Zboże & Żywność', icon: '🌾', path: '/business/grain' },
    { id: 'construction', name: 'Bouwmaterialen', icon: '🏗️', path: '/business/construction' },
    { id: 'machinery', name: 'Machines', icon: '⚙️', path: '/business/machinery' },
    { id: 'electronics', name: 'Elektronika', icon: '💻', path: '/business/electronics' },
    { id: 'transport', name: 'Transport', icon: '🚛', path: '/business/transport' },
    { id: 'packaging', name: 'Verpakking', icon: '📦', path: '/business/packaging' },
    { id: 'tools', name: 'Gereedschap', icon: '🔧', path: '/business/tools' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50px',
            marginBottom: '24px'
          }}>
            <Building2 size={24} color="white" />
            <span style={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>
              DEALSENSE ZAKELIJK B2B
            </span>
          </div>

          <h1 style={{
            fontSize: '48px',
            fontWeight: 800,
            color: 'white',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            B2B Procurement Platform
          </h1>

          <p style={{
            fontSize: '20px',
            color: 'rgba(255,255,255,0.9)',
            maxWidth: '800px',
            margin: '0 auto 32px',
            lineHeight: '1.6'
          }}>
            Kwant-powered vergelijkingsplatform voor bulk inkoop.<br />
            Bespaar 5-18% op industriële procurement met AI-driven sourcing.
          </p>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <div style={{
              padding: '20px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                €59,99
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                Per maand
              </div>
            </div>
            <div style={{
              padding: '20px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                10
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                Industrieën
              </div>
            </div>
            <div style={{
              padding: '20px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
                50/50
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
                Giganten/Niche
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: '#111827' }}>
            Wat krijg je?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <TrendingUp size={24} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Kwant AI Sourcing</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Automatisch 50% giganten + 50% niszowi leveranciers</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Shield size={24} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Certificaten & Docs</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>MSDS, COA, ISO certificaten inbegrepen</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Zap size={24} color="#10b981" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>RFQ Systeem</div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>Request for Quote - professioneel procurement</div>
              </div>
            </div>
          </div>
        </div>

        {/* Industries Grid */}
        <h2 style={{
          fontSize: '32px',
          fontWeight: 700,
          color: 'white',
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          Kies uw industrie
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '48px'
        }}>
          {industries.map((industry) => (
            <button
              key={industry.id}
              onClick={() => router.push(industry.path)}
              style={{
                padding: '24px',
                background: 'white',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.15)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {industry.icon}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                {industry.name}
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          padding: '40px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '28px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
            Klaar om te besparen op procurement?
          </h3>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginBottom: '24px' }}>
            Start met ZAKELIJK B2B pakket - €59,99/maand
          </p>
          <button
            onClick={() => router.push('/checkout/zakelijk')}
            style={{
              padding: '16px 32px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16,185,129,0.3)'
            }}
          >
            Activeer nu →
          </button>
        </div>
      </div>
    </div>
  )
}
