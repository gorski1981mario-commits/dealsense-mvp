'use client'

import { BarChart3, TrendingDown, ShoppingBag, Clock } from 'lucide-react'

export default function StatisticsPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F9F8',
      padding: '20px'
    }}>
      <div style={{
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
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E5E7EB'
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
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1E7F5C' }}>€234</div>
          </div>

          {/* Total Scans */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E5E7EB'
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
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>12</div>
          </div>

          {/* Avg Savings */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #E5E7EB'
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
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>€19,50</div>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>
                iPhone 15 Pro
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                Bespaard: €89 • 2 dagen geleden
              </div>
            </div>

            <div style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>
                Samsung TV 55"
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                Bespaard: €145 • 5 dagen geleden
              </div>
            </div>

            <div style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>
                Dyson V15
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                Bespaard: €0 • 1 week geleden
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
