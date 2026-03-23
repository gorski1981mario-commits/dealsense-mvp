'use client'

import { useEffect, useState } from 'react'
import { SavingsTimeline, PriceAnalysis } from '../_lib/savings-timeline'

interface SavingsTimelineProps {
  ean: string
  currentPrice: number
}

export default function SavingsTimelineComponent({ ean, currentPrice }: SavingsTimelineProps) {
  const [analysis, setAnalysis] = useState<PriceAnalysis | null>(null)
  const [chartData, setChartData] = useState<{ labels: string[], prices: number[] }>({ labels: [], prices: [] })

  useEffect(() => {
    // Add current price to history
    SavingsTimeline.addPricePoint(ean, currentPrice)

    // Get analysis
    const priceAnalysis = SavingsTimeline.analyzePrice(ean, currentPrice)
    setAnalysis(priceAnalysis)

    // Get chart data
    const data = SavingsTimeline.getChartData(ean)
    setChartData(data)
  }, [ean, currentPrice])

  if (!analysis) return null

  // Trend icon
  const trendIcon = analysis.trend === 'up' ? '📈' : analysis.trend === 'down' ? '📉' : '➡️'
  const trendColor = analysis.trend === 'up' ? '#dc2626' : analysis.trend === 'down' ? '#16a34a' : '#6b7280'

  return (
    <div
      style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px'
      }}
    >
      {/* Header */}
      <div style={{ 
        fontSize: '14px', 
        fontWeight: 600, 
        color: '#374151',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        📊 Prijsgeschiedenis (laatste 30 dagen)
      </div>

      {/* Simple ASCII Chart */}
      {chartData.labels.length > 0 && (
        <div style={{
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#6b7280',
          background: 'white',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '12px',
          overflowX: 'auto'
        }}>
          {renderSimpleChart(chartData.prices, analysis)}
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        marginBottom: '12px'
      }}>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          <div style={{ fontWeight: 600, color: '#374151' }}>Huidige prijs</div>
          <div>€{analysis.currentPrice.toFixed(2)}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          <div style={{ fontWeight: 600, color: '#111827' }}>Gemiddelde</div>
          <div style={{ color: '#111827', fontWeight: 600 }}>€{analysis.averagePrice.toFixed(2)}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          <div style={{ fontWeight: 600, color: '#374151' }}>Laagste</div>
          <div style={{ color: '#15803d', fontWeight: 600 }}>€{analysis.lowestPrice.toFixed(2)}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          <div style={{ fontWeight: 600, color: '#374151' }}>Hoogste</div>
          <div style={{ color: '#dc2626' }}>€{analysis.highestPrice.toFixed(2)}</div>
        </div>
      </div>

      {/* Trend */}
      <div style={{
        fontSize: '12px',
        color: trendColor,
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {trendIcon} Trend: {analysis.trend === 'up' ? 'Stijgend' : analysis.trend === 'down' ? 'Dalend' : 'Stabiel'}
      </div>

      {/* CALM Recommendation */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '6px',
        padding: '12px',
        fontSize: '13px',
        color: '#0c4a6e',
        lineHeight: '1.5'
      }}>
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>💡 Informatie</div>
        {analysis.recommendation}
      </div>
    </div>
  )
}

// Simple ASCII chart renderer
function renderSimpleChart(prices: number[], analysis: PriceAnalysis): string {
  if (prices.length === 0) return 'Geen data beschikbaar'

  const max = Math.max(...prices)
  const min = Math.min(...prices)
  const range = max - min
  const height = 5 // 5 rows

  let chart = ''
  
  for (let row = height; row >= 0; row--) {
    const priceLevel = min + (range * row / height)
    chart += `€${priceLevel.toFixed(0).padStart(5)} ┤`
    
    for (let i = 0; i < prices.length; i++) {
      const price = prices[i]
      const normalizedPrice = (price - min) / range
      const normalizedRow = row / height
      
      if (Math.abs(normalizedPrice - normalizedRow) < 0.1) {
        chart += '●'
      } else if (i > 0 && prices[i-1] !== undefined) {
        const prevNormalized = (prices[i-1] - min) / range
        if ((prevNormalized < normalizedRow && normalizedPrice > normalizedRow) ||
            (prevNormalized > normalizedRow && normalizedPrice < normalizedRow)) {
          chart += '─'
        } else {
          chart += ' '
        }
      } else {
        chart += ' '
      }
    }
    chart += '\n'
  }
  
  chart += '      └' + '─'.repeat(prices.length) + '\n'
  chart += `      Nu: €${analysis.currentPrice.toFixed(0)}`

  return chart
}
