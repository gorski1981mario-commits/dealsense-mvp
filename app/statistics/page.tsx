'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingDown, ShoppingBag, Clock } from 'lucide-react'
import { Storage, ScanRecord } from '../_lib/storage'
import { getDeviceId } from '../_lib/utils'

export default function StatisticsPage() {
  const [scans, setScans] = useState<ScanRecord[]>([])
  const userId = typeof window !== 'undefined' ? getDeviceId() : 'user_demo'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = Storage.getScanHistory(userId)
      setScans(history)
    }
  }, [userId])

  const totalSavings = scans.reduce((sum, scan) => sum + (scan.savings || 0), 0)
  const totalScans = scans.length
  const avgSavings = totalScans > 0 ? totalSavings / totalScans : 0
  const recentScans = scans.slice(0, 3)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F9F8',
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 600,
        color: '#111827',
        marginBottom: '24px'
      }}>
        Mijn statistieken
      </h1>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          {/* Total Savings */}
          <div style={{
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <TrendingDown size={20} color="#1E7F5C" />
              <div style={{ fontSize: '14px', color: '#6B7280' }}>Totale besparing</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1E7F5C' }}>
              €{totalSavings.toFixed(2)}
            </div>
          </div>

          {/* Total Scans */}
          <div style={{
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <ShoppingBag size={20} color="#6B7280" />
              <div style={{ fontSize: '14px', color: '#6B7280' }}>Aantal scans</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{totalScans}</div>
          </div>

          {/* Avg Savings */}
          <div style={{
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <BarChart3 size={20} color="#6B7280" />
              <div style={{ fontSize: '14px', color: '#6B7280' }}>Gem. besparing</div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>
              €{avgSavings.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={18} color="#6B7280" />
            Recente activiteit
          </div>

          {recentScans.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6B7280',
              fontSize: '14px'
            }}>
              Nog geen scans. Start met scannen om je activiteit te zien.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentScans.map((scan) => (
                <div key={scan.id} style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>
                    {scan.category}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>
                    Bespaard: €{(scan.savings || 0).toFixed(2)} • {
                      (() => {
                        const days = Math.floor((Date.now() - scan.timestamp) / (1000 * 60 * 60 * 24))
                        if (days === 0) return 'vandaag'
                        if (days === 1) return '1 dag geleden'
                        if (days < 7) return `${days} dagen geleden`
                        const weeks = Math.floor(days / 7)
                        return weeks === 1 ? '1 week geleden' : `${weeks} weken geleden`
                      })()
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}
