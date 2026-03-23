'use client'

import { useEffect, useState } from 'react'
import { SavingsJournal, MonthlySummary, SavingsEntry } from '../_lib/savings-journal'

interface SavingsJournalProps {
  userId: string
}

export default function SavingsJournalComponent({ userId }: SavingsJournalProps) {
  const [currentMonth, setCurrentMonth] = useState<string>('')
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [recentEntries, setRecentEntries] = useState<SavingsEntry[]>([])
  const [totalSavings, setTotalSavings] = useState<number>(0)

  useEffect(() => {
    const month = SavingsJournal.getCurrentMonth()
    setCurrentMonth(month)

    const monthlySummary = SavingsJournal.getMonthlySummary(userId, month)
    setSummary(monthlySummary)

    const entries = SavingsJournal.getUserJournal(userId).slice(0, 5) // Last 5
    setRecentEntries(entries)

    const total = SavingsJournal.getTotalSavings(userId)
    setTotalSavings(total)
  }, [userId])

  if (!summary) return null

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
        color: '#111827',
        marginBottom: '16px'
      }}>
        Jouw Besparingen
      </div>

      {/* Current Month Summary */}
      <div style={{
        background: 'linear-gradient(135deg, #15803d 0%, #15803d 100%)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
        color: 'white'
      }}>
        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>
          {SavingsJournal.getMonthName(currentMonth)}
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
          €{summary.totalSavings.toFixed(2)}
        </div>
        <div style={{ fontSize: '13px', opacity: 0.9 }}>
          <span style={{ fontWeight: 600 }}>{summary.purchaseCount}</span> {summary.purchaseCount === 1 ? 'aankoop' : 'aankopen'}
        </div>
      </div>

      {/* Total Savings (All Time) */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '12px',
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '13px', color: '#111827', fontWeight: 600 }}>
          Totaal bespaard (altijd)
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#15803d' }}>
          €{totalSavings.toFixed(2)}
        </div>
      </div>

      {/* Biggest Saving This Month */}
      {summary.biggestSaving && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde047',
          borderRadius: '6px',
          padding: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '12px', color: '#854d0e', marginBottom: '4px' }}>
            🏆 Grootste besparing deze maand
          </div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#713f12', marginBottom: '2px' }}>
            {summary.biggestSaving.productName}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>
            €{summary.biggestSaving.savings.toFixed(2)} bespaard
          </div>
        </div>
      )}

      {/* Recent Entries */}
      {recentEntries.length > 0 && (
        <div>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: 600, 
            color: '#374151',
            marginBottom: '8px'
          }}>
            Recente besparingen
          </div>
          {recentEntries.map(entry => (
            <div
              key={entry.id}
              style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '10px',
                marginBottom: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                  {entry.productName}
                </div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>
                  {new Date(entry.purchasedAt).toLocaleDateString('nl-NL')}
                </div>
              </div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 700, 
                color: '#15803d',
                textAlign: 'right'
              }}>
                €{entry.savings.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CALM Message */}
      <div style={{
        marginTop: '16px',
        fontSize: '12px',
        color: '#111827',
        fontWeight: 600,
        fontStyle: 'italic',
        textAlign: 'center',
        padding: '12px',
        background: 'white',
        borderRadius: '6px'
      }}>
        💡 Dit zijn jouw besparingen. Geld dat in jouw portemonnee blijft.
      </div>
    </div>
  )
}
