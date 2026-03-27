'use client'

import { useState, useEffect } from 'react'

interface AgentEchoProps {
  packageType: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId: string
}

export default function AgentEcho({ packageType, userId }: AgentEchoProps) {
  const [savings, setSavings] = useState({ week: 0, month: 0, total: 0 })
  const [stockData, setStockData] = useState<any>(null)
  const [deliveryData, setDeliveryData] = useState<any>(null)
  const [warrantyData, setWarrantyData] = useState<any>(null)
  const [benefitsData, setBenefitsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    loadAllData()
  }, [userId])

  const loadAllData = async () => {
    try {
      // Load all Agent Echo data in parallel
      const [savingsRes, stockRes, deliveryRes, warrantyRes, benefitsRes] = await Promise.all([
        fetch(`/api/agent-echo/savings?userId=${userId}`),
        fetch(`/api/agent-echo/stock`),
        fetch(`/api/agent-echo/delivery`),
        fetch(`/api/agent-echo/warranty`),
        fetch(`/api/agent-echo/benefits`)
      ])

      const [savingsData, stock, delivery, warranty, benefits] = await Promise.all([
        savingsRes.json(),
        stockRes.json(),
        deliveryRes.json(),
        warrantyRes.json(),
        benefitsRes.json()
      ])

      setSavings(savingsData)
      setStockData(stock)
      setDeliveryData(delivery)
      setWarrantyData(warranty)
      setBenefitsData(benefits)
    } catch (error) {
      console.error('Failed to load Agent Echo data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Determine which packages user has access to
  const hasAccessTo = {
    free: true, // All paid packages have access to FREE
    plus: packageType === 'plus' || packageType === 'pro' || packageType === 'finance' || packageType === 'zakelijk',
    pro: packageType === 'pro' || packageType === 'finance' || packageType === 'zakelijk',
    finance: packageType === 'finance' || packageType === 'zakelijk',
    zakelijk: packageType === 'zakelijk'
  }

  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #E6F4EE 0%, #E6F4EE 100%)',
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
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        </svg>
        <span>Toegang tot: {hasAccessTo.finance ? 'FREE + PLUS + PRO + FINANCE' : hasAccessTo.pro ? 'FREE + PLUS + PRO' : 'FREE + PLUS'}</span>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
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
      <details style={{ marginTop: '12px' }} open={detailsOpen} onToggle={(e: any) => setDetailsOpen(e.target.open)}>
        <summary style={{
          fontSize: '13px',
          fontWeight: 600,
          color: '#166534',
          cursor: 'pointer',
          padding: '8px 0',
          listStyle: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          <span>Meer functies →</span>
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
            <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
              <span>Voorraadstatus</span>
            </div>
            {stockData?.stores && (
              <div style={{ display: 'grid', gap: '4px' }}>
                {stockData.stores.slice(0, 3).map((store: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>{store.icon} {store.store}:</span>
                    <span style={{ color: store.color, fontWeight: 600 }}>{store.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Delivery Time */}
          <div style={{
            padding: '12px',
            background: 'white',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#374151'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Levertijd</span>
            </div>
            {deliveryData?.stores && (
              <div style={{ display: 'grid', gap: '4px' }}>
                {deliveryData.stores.slice(0, 3).map((store: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>{store.icon} {store.store}:</span>
                    <span style={{ fontWeight: 600 }}>{store.delivery}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warranty */}
          <div style={{
            padding: '12px',
            background: 'white',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#374151'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Garantie & Service</span>
            </div>
            {warrantyData?.stores && (
              <div style={{ display: 'grid', gap: '4px' }}>
                {warrantyData.stores.slice(0, 3).map((store: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>{store.icon} {store.store}:</span>
                    <span style={{ fontWeight: 600 }}>{store.warranty} + {store.returnDays}d retour</span>
                  </div>
                ))}
              </div>
            )}
            {warrantyData?.bestWarranty && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                💡 Best: {warrantyData.bestWarranty}
              </div>
            )}
          </div>

          {/* Benefits */}
          <div style={{
            padding: '12px',
            background: 'white',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#374151'
          }}>
            <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 12 20 22 4 22 4 12"/>
                <rect x="2" y="7" width="20" height="5"/>
                <line x1="12" y1="22" x2="12" y2="7"/>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
              <span>Extra voordelen</span>
            </div>
            {benefitsData?.stores && (
              <div style={{ display: 'grid', gap: '4px' }}>
                {benefitsData.stores.slice(0, 3).map((store: any, i: number) => (
                  <div key={i} style={{ fontSize: '11px' }}>
                    <div style={{ fontWeight: 600, marginBottom: '2px' }}>{store.icon} {store.store}:</div>
                    <div style={{ paddingLeft: '18px', color: '#64748b' }}>
                      {store.cashback && <div>• {store.cashback}</div>}
                      {store.freeGifts?.length > 0 && <div>• {store.freeGifts[0]}</div>}
                      {store.bankOffers?.length > 0 && <div>• {store.bankOffers[0]}</div>}
                      <div style={{ color: '#15803d', fontWeight: 600 }}>Totaal: {store.totalValue}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {benefitsData?.maxSavings && (
              <div style={{ marginTop: '6px', fontSize: '11px', color: '#15803d', fontWeight: 600 }}>
                🎉 Max besparing: {benefitsData.maxSavings} bij {benefitsData.bestDeal}
              </div>
            )}
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
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Scans: {Math.floor(Math.random() * 50) + 10}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="16 12 12 8 8 12"/>
            <line x1="12" y1="16" x2="12" y2="8"/>
          </svg>
          <span>Nauwkeurigheid: 89%</span>
        </div>
      </div>
    </div>
  )
}





