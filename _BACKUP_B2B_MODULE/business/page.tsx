'use client'

import { useState } from 'react'
import { Building2, TrendingUp, Globe, Shield } from 'lucide-react'

export default function BusinessPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null)

  const industries = [
    {
      id: 'metals',
      name: 'Metale & Stal',
      icon: '🔩',
      tam: '€1.8T',
      examples: 'Stal, aluminium, miedź, cynk',
      savings: '10-15%'
    },
    {
      id: 'energy',
      name: 'Energia & Paliwa',
      icon: '⚡',
      tam: '€4.5T',
      examples: 'Ropa, gaz, diesel, LNG',
      savings: '5-12%'
    },
    {
      id: 'grain',
      name: 'Zboże & Żywność',
      icon: '🌾',
      tam: '€1.2T',
      examples: 'Pszenica, kukurydza, soja',
      savings: '8-14%'
    },
    {
      id: 'chemicals',
      name: 'Chemikalia',
      icon: '🧪',
      tam: '€3.5T',
      examples: 'Tworzywa, polimery, kwasy',
      savings: '7-13%'
    },
    {
      id: 'machinery',
      name: 'Maszyny Przemysłowe',
      icon: '⚙️',
      tam: '€2.2T',
      examples: 'CNC, roboty, prasy',
      savings: '12-18%'
    },
    {
      id: 'construction',
      name: 'Materiały Budowlane',
      icon: '🏗️',
      tam: '€1.5T',
      examples: 'Cement, drewno, izolacja',
      savings: '9-15%'
    },
    {
      id: 'electronics',
      name: 'Elektronika Przemysłowa',
      icon: '💻',
      tam: '€2.8T',
      examples: 'Półprzewodniki, PCB, sensory',
      savings: '10-16%'
    },
    {
      id: 'transport',
      name: 'Transport & Logistyka',
      icon: '🚛',
      tam: '€1.8T',
      examples: 'Ciężarówki, kontenery, palety',
      savings: '8-14%'
    },
    {
      id: 'packaging',
      name: 'Opakowania Przemysłowe',
      icon: '📦',
      tam: '€900B',
      examples: 'Kartony, palety, folie',
      savings: '11-17%'
    },
    {
      id: 'tools',
      name: 'Narzędzia & Wyposażenie',
      icon: '🔧',
      tam: '€800B',
      examples: 'Narzędzia, odzież BHP',
      savings: '10-15%'
    }
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
      padding: '40px 20px'
    }}>
      {/* Header */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '40px', textAlign: 'center' }}>
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
            DEALSENSE BUSINESS
          </span>
        </div>

        <h1 style={{
          fontSize: '48px',
          fontWeight: 800,
          color: 'white',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Procurement Intelligence<br />voor Industrie
        </h1>

        <p style={{
          fontSize: '20px',
          color: 'rgba(255,255,255,0.9)',
          maxWidth: '800px',
          margin: '0 auto 32px',
          lineHeight: '1.6'
        }}>
          Professioneel vergelijkingsplatform voor bulk procurement.<br />
          Bespaar 5-18% op industriële inkoop met slimme sourcing.
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
              €21T
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
              Global Market
            </div>
          </div>
          <div style={{
            padding: '20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
              10-15%
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
              Avg. Savings
            </div>
          </div>
          <div style={{
            padding: '20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981', marginBottom: '4px' }}>
              1000+
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
              Global Suppliers
            </div>
          </div>
        </div>
      </div>

      {/* Industries Grid */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          gap: '20px'
        }}>
          {industries.map((industry) => (
            <button
              key={industry.id}
              onClick={() => window.location.href = `/business/${industry.id}`}
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
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                {industry.name}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
                {industry.examples}
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>
                    Market Size
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e40af' }}>
                    {industry.tam}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>
                    Avg. Savings
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#10b981' }}>
                    {industry.savings}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '60px',
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
            Start met een gratis analyse van uw huidige inkoop
          </p>
          <button
            onClick={() => window.location.href = '/business/demo'}
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
            Plan een demo →
          </button>
        </div>
      </div>
    </div>
  )
}
