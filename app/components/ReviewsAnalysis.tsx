'use client'

/**
 * REVIEWS ANALYSIS COMPONENT
 * Wyświetla AI-analizę opinii z wielu źródeł
 * 
 * Features:
 * - Tabela z % pozytywnych/negatywnych
 * - Top pros/cons
 * - Critical issues
 * - DealSense verdict (red/yellow/green)
 */

import { useEffect, useState } from 'react'

interface ReviewsAnalysisProps {
  ean: string
  productName?: string
}

interface Analysis {
  positive_percent: number
  negative_percent: number
  neutral_percent: number
  total_reviews: number
  top_pros: string[]
  top_cons: string[]
  critical_issues: string[]
  verdict: {
    color: 'red' | 'yellow' | 'green'
    text: string
    score: number
  }
  fallback?: boolean
}

interface ReviewsData {
  ean: string
  productName: string
  category: string
  totalReviews: number
  sources: Record<string, { count: number }>
  analysis: Analysis
  cached?: boolean
  responseTime: number
}

export default function ReviewsAnalysis({ ean, productName }: ReviewsAnalysisProps) {
  const [data, setData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReviews()
  }, [ean])

  const fetchReviews = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/reviews/${ean}`)
      const result = await response.json()

      if (response.ok) {
        setData(result)
      } else {
        setError(result.error || 'Geen reviews gevonden')
      }
    } catch (err: any) {
      setError(err.message || 'Netwerkfout')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', background: '#F9FAFB', borderRadius: '12px', marginTop: '24px' }}>
        <div style={{ fontSize: '14px', color: '#6B7280' }}>💭 Gebruikerservaringen laden...</div>
      </div>
    )
  }

  if (error) {
    return null // Nie pokazuj błędu - po prostu ukryj komponent
  }

  if (!data) return null

  const { analysis, sources, totalReviews, cached, responseTime } = data
  const verdictColor = {
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444'
  }[analysis.verdict.color]

  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: '#FFF',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Header with DealScore Badge */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>
            💡 Gebruikerservaringen
          </h2>
          <div style={{
            padding: '4px 10px',
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#FFF',
            letterSpacing: '0.5px'
          }}>
            DEALSCORE™
          </div>
        </div>
        <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>
          Gebaseerd op {totalReviews} reviews van {Object.keys(sources).length} bronnen
        </p>
      </div>

      {/* DealScore Verdict - BIG */}
      <div style={{
        padding: '20px',
        background: verdictColor,
        borderRadius: '12px',
        marginBottom: '20px',
        color: '#FFF',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px', opacity: 0.9, letterSpacing: '1px' }}>
          DEALSCORE™ KWALITEIT
        </div>
        <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '8px', lineHeight: '1' }}>
          {analysis.verdict.score}/10
        </div>
        <div style={{ fontSize: '16px', fontWeight: '500', opacity: 0.95 }}>
          {analysis.verdict.text}
        </div>
      </div>

      {/* Stats Table */}
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '20px'
      }}>
        <thead>
          <tr style={{ background: '#F3F4F6' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #E5E7EB', fontSize: '13px', fontWeight: 600 }}>
              Beoordeling
            </th>
            <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #E5E7EB', fontSize: '13px', fontWeight: 600 }}>
              %
            </th>
            <th style={{ padding: '12px', textAlign: 'right', borderBottom: '2px solid #E5E7EB', fontSize: '13px', fontWeight: 600 }}>
              Aantal
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB', fontSize: '14px' }}>
              ✅ Positief
            </td>
            <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB', fontWeight: 'bold', color: '#10B981' }}>
              {analysis.positive_percent}%
            </td>
            <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>
              {Math.round(totalReviews * analysis.positive_percent / 100)}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px', borderBottom: '1px solid #E5E7EB', fontSize: '14px' }}>
              ⚠️ Negatief
            </td>
            <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB', fontWeight: 'bold', color: '#EF4444' }}>
              {analysis.negative_percent}%
            </td>
            <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>
              {Math.round(totalReviews * analysis.negative_percent / 100)}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '12px', fontSize: '14px' }}>
              ⚪ Neutraal
            </td>
            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#6B7280' }}>
              {analysis.neutral_percent}%
            </td>
            <td style={{ padding: '12px', textAlign: 'right' }}>
              {Math.round(totalReviews * analysis.neutral_percent / 100)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Top Pros */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#10B981' }}>
          ✅ Meest gewaardeerd
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {analysis.top_pros.map((pro, i) => (
            <li key={i} style={{ marginBottom: '8px', fontSize: '14px' }}>
              {pro}
            </li>
          ))}
        </ul>
      </div>

      {/* Top Cons */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#EF4444' }}>
          ⚠️ Aandachtspunten
        </h3>
        <ul style={{ margin: 0, paddingLeft: '20px' }}>
          {analysis.top_cons.map((con, i) => (
            <li key={i} style={{ marginBottom: '8px', fontSize: '14px' }}>
              {con}
            </li>
          ))}
        </ul>
      </div>

      {/* Critical Issues */}
      {analysis.critical_issues && analysis.critical_issues.length > 0 && (
        <div style={{
          padding: '16px',
          background: '#FEE',
          borderRadius: '8px',
          border: '2px solid #EF4444'
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#DC2626' }}>
            🚨 Belangrijke waarschuwingen
          </h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {analysis.critical_issues.map((issue, i) => (
              <li key={i} style={{ marginBottom: '8px', fontSize: '14px', color: '#C00' }}>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Sources */}
      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #E5E7EB' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#6B7280' }}>
          Bronnen
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {Object.entries(sources).map(([source, stats]) => (
            <div key={source} style={{
              padding: '6px 12px',
              background: '#F3F4F6',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              {source}: {stats.count}
            </div>
          ))}
        </div>
      </div>

      {/* DealScore Info Footer */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #E5E7EB'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px'
        }}>
          <div style={{
            padding: '4px 10px',
            background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: 700,
            color: '#FFF',
            letterSpacing: '0.5px'
          }}>
            DEALSCORE™
          </div>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>
            Kwaliteitssysteem
          </span>
        </div>
        <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', lineHeight: '1.5' }}>
          DealScore analyseert productkwaliteit op basis van echte gebruikerservaringen. 
          Ons unieke systeem combineert reviews van meerdere bronnen voor een betrouwbaar oordeel.
        </p>
      </div>

      {/* Fallback warning */}
      {analysis.fallback && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#FEF3C7',
          borderRadius: '4px',
          fontSize: '12px',
          color: '#92400E'
        }}>
          ℹ️ Basis analyse - AI analyse tijdelijk niet beschikbaar
        </div>
      )}
    </div>
  )
}
