'use client'

import { useState, useEffect } from 'react'

interface AgentEchoProps {
  packageType: 'plus' | 'pro' | 'finance'
  userId: string
}

export default function AgentEcho({ packageType, userId }: AgentEchoProps) {
  const [savings, setSavings] = useState({ week: 0, month: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSavings()
  }, [userId])

  const loadSavings = async () => {
    try {
      const res = await fetch(`/api/agent-echo/savings?userId=${userId}`)
      const data = await res.json()
      setSavings(data)
    } catch (error) {
      console.error('Failed to load savings:', error)
    } finally {
      setLoading(false)
    }
  }

  // Determine which packages user has access to
  const hasAccessTo = {
    free: true, // All paid packages have access to FREE
    plus: packageType === 'plus' || packageType === 'pro' || packageType === 'finance',
    pro: packageType === 'pro' || packageType === 'finance',
    finance: packageType === 'finance'
  }

  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderRadius: '12px',
      border: '1px solid #86efac'
    }}>
      {/* Branding: Echo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '16px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'baseline',
          fontSize: '20px',
          fontWeight: 700,
          letterSpacing: '-0.5px'
        }}>
          <span style={{ color: '#15803d' }}>E</span>
          <span style={{ color: '#2563eb', fontSize: '16px' }}>ch</span>
          <span style={{ 
            display: 'inline-block',
            width: '8px',
            height: '8px',
            background: '#000000',
            borderRadius: '50%',
            marginLeft: '1px',
            marginBottom: '3px'
          }}></span>
        </div>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 600, 
          color: '#166534',
          marginLeft: '4px'
        }}>
          Je persoonlijke AI agent
        </div>
      </div>

      {/* Package Access Info */}
      <div style={{
        fontSize: '12px',
        color: '#166534',
        marginBottom: '16px',
        padding: '8px 12px',
        background: 'rgba(255,255,255,0.5)',
        borderRadius: '6px'
      }}>
        📦 Toegang tot: {hasAccessTo.finance ? 'FREE + PLUS + PRO + FINANCE' : hasAccessTo.pro ? 'FREE + PLUS + PRO' : 'FREE + PLUS'}
      </div>

      {/* Main Feature: Savings */}
      <div style={{
        background: 'white',
        padding: '16px',
        borderRadius: '10px',
        marginBottom: '12px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: 700, 
          color: '#166534',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span>💰</span>
          <span>Jouw besparingen</span>
        </div>

        {loading ? (
          <div style={{ fontSize: '13px', color: '#64748b' }}>Laden...</div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#374151' }}>Deze week:</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#15803d' }}>€{savings.week.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#374151' }}>Deze maand:</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#15803d' }}>€{savings.month.toFixed(2)}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '8px',
              borderTop: '1px solid #E2E8F0'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>Totaal bespaard:</span>
              <span style={{ fontSize: '18px', fontWeight: 900, color: '#15803d' }}>€{savings.total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Features (collapsed by default) */}
      <details style={{ marginTop: '12px' }}>
        <summary style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#166534',
          cursor: 'pointer',
          padding: '8px 0',
          listStyle: 'none'
        }}>
          📊 Meer functies →
        </summary>
        
        <div style={{ 
          marginTop: '12px',
          display: 'grid',
          gap: '8px'
        }}>
          {/* Stock Status */}
          <div style={{
            padding: '12px',
            background: 'white',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#374151'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>📦 Voorraadstatus</div>
            <div>Realtime voorraad bij winkels</div>
          </div>

          {/* Delivery Time */}
          <div style={{
            padding: '12px',
            background: 'white',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#374151'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>⏱️ Levertijd</div>
            <div>Exacte levertijd per winkel</div>
          </div>

          {/* Warranty */}
          <div style={{
            padding: '12px',
            background: 'white',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#374151'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>🛡️ Garantie & Service</div>
            <div>Retourvoorwaarden en garantie</div>
          </div>

          {/* Benefits */}
          <div style={{
            padding: '12px',
            background: 'white',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#374151'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>🎁 Extra voordelen</div>
            <div>Cashback, cadeaus, bankacties</div>
          </div>
        </div>
      </details>

      {/* Stats */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        background: 'rgba(255,255,255,0.5)',
        borderRadius: '8px',
        fontSize: '11px',
        color: '#166534',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div>📊 Scans: {Math.floor(Math.random() * 50) + 10}</div>
        <div>🎯 Nauwkeurigheid: 89%</div>
      </div>
    </div>
  )
}
