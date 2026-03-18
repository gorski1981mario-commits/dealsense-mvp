'use client'

import { useState } from 'react'
import AgentEchoLogo from './AgentEchoLogo'
import { COMMISSION } from '../_lib/constants'

interface BillsOptimizerProps {
  userId?: string
}

interface Bill {
  id: string
  type: string
  amount: number
  file?: File
}

interface OptimizationResult {
  type: string
  currentCost: number
  newCost: number
  savings: number
  penalty: number
}

export default function BillsOptimizer({ userId }: BillsOptimizerProps = {}) {
  const [bills, setBills] = useState<Bill[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<OptimizationResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newBills: Bill[] = Array.from(files).map((file, index) => ({
      id: `bill-${Date.now()}-${index}`,
      type: 'Onbekend',
      amount: 0,
      file
    }))

    setBills([...bills, ...newBills])
  }

  const updateBill = (id: string, updates: Partial<Bill>) => {
    setBills(bills.map(bill => bill.id === id ? { ...bill, ...updates } : bill))
  }

  const removeBill = (id: string) => {
    setBills(bills.filter(bill => bill.id !== id))
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    
    // Simulate API call
    setTimeout(() => {
      const mockResults: OptimizationResult[] = [
        { type: 'Energie', currentCost: 100, newCost: 75, savings: 25, penalty: 0 },
        { type: 'Telefoon', currentCost: 50, newCost: 35, savings: 15, penalty: 50 },
        { type: 'Internet', currentCost: 40, newCost: 30, savings: 10, penalty: 0 }
      ]
      setResults(mockResults)
      setAnalyzing(false)
      setShowResults(true)
    }, 3000)
  }

  const totalCurrent = results.reduce((sum, r) => sum + r.currentCost, 0)
  const totalNew = results.reduce((sum, r) => sum + r.newCost, 0)
  const totalSavings = results.reduce((sum, r) => sum + r.savings, 0)
  const totalPenalties = results.reduce((sum, r) => sum + r.penalty, 0)
  const netSavings = (totalSavings * 12) - totalPenalties
  const commissionRate = parseFloat(COMMISSION.zakelijk.replace('%', '')) / 100
  const commission = Math.round(netSavings * commissionRate)

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <AgentEchoLogo />

      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        📄 Optimaliseer al je rekeningen met één klik
      </h2>

      {/* Upload Section */}
      {!showResults && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '16px' }}>
            <div style={{
              border: '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '40px',
              textAlign: 'center',
              cursor: 'pointer',
              background: '#f9fafb'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📄</div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                Upload je rekeningen (PDF/Foto)
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Energie, telefoon, internet, verzekering, etc.
              </p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>

          {/* Bills List */}
          {bills.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                Toegevoegd:
              </h3>
              {bills.map((bill) => (
                <div key={bill.id} style={{
                  background: '#f9fafb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}>
                  <div style={{ flex: 1 }}>
                    <select
                      value={bill.type}
                      onChange={(e) => updateBill(bill.id, { type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px',
                        marginBottom: '8px'
                      }}
                    >
                      <option value="Onbekend">Type selecteren...</option>
                      <option value="Energie">Energie</option>
                      <option value="Telefoon">Telefoon</option>
                      <option value="Internet">Internet</option>
                      <option value="Verzekering">Verzekering</option>
                      <option value="Anders">Anders</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Bedrag per maand (€)"
                      value={bill.amount || ''}
                      onChange={(e) => updateBill(bill.id, { amount: parseFloat(e.target.value) })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #d1d5db',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeBill(bill.id)}
                    style={{
                      padding: '8px 12px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <div style={{
                background: '#f0fdf4',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '16px'
              }}>
                <p style={{ fontSize: '14px', color: '#166534', fontWeight: 600 }}>
                  Totaal: €{bills.reduce((sum, b) => sum + (b.amount || 0), 0)}/mnd = €{bills.reduce((sum, b) => sum + (b.amount || 0), 0) * 12}/jaar
                </p>
              </div>

              <button
                onClick={handleAnalyze}
                disabled={analyzing || bills.length === 0}
                style={{
                  width: '100%',
                  padding: '16px',
                  background: analyzing ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: analyzing ? 'not-allowed' : 'pointer',
                  marginTop: '16px'
                }}
              >
                {analyzing ? 'Analyseren...' : 'Zoek optimalisatie'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Analyzing State */}
      {analyzing && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{
            border: '5px solid #f3f3f3',
            borderTop: '5px solid #15803d',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p style={{ color: '#166534', fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
            Echo analyseert je rekeningen...
          </p>
          <div style={{ fontSize: '14px', color: '#166534', textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ marginBottom: '8px' }}>✓ Contracten analyseren</div>
            <div style={{ marginBottom: '8px' }}>✓ Boetes berekenen</div>
            <div style={{ marginBottom: '8px' }}>⏳ Beste aanbiedingen zoeken...</div>
          </div>
        </div>
      )}

      {/* Results - PRE-PAYWALL (NO COMPANY NAMES!) */}
      {showResults && !analyzing && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#15803d', marginBottom: '24px' }}>
            💰 Optimalisatie gevonden!
          </h3>

          {results.map((result, index) => (
            <div key={index} style={{
              background: '#f9fafb',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px'
            }}>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '12px' }}>
                {index + 1}️⃣ {result.type.toUpperCase()}
              </h4>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <div style={{ marginBottom: '4px' }}>Huidige kosten: €{result.currentCost}/mnd</div>
                <div style={{ marginBottom: '4px' }}>Nieuwe kosten: €{result.newCost}/mnd</div>
                <div style={{ borderTop: '1px solid #d1d5db', margin: '8px 0' }}></div>
                <div style={{ fontWeight: 600, color: '#15803d' }}>Besparing: €{result.savings}/mnd</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                  Boete: €{result.penalty} (inbegrepen)
                </div>
              </div>
            </div>
          ))}

          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '24px'
          }}>
            <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#166534', marginBottom: '16px' }}>
              📊 TOTAAL
            </h4>
            <div style={{ fontSize: '14px', color: '#166534' }}>
              <div style={{ marginBottom: '4px' }}>Huidige kosten: €{totalCurrent}/mnd = €{totalCurrent * 12}/jaar</div>
              <div style={{ marginBottom: '4px' }}>Nieuwe kosten: €{totalNew}/mnd = €{totalNew * 12}/jaar</div>
              <div style={{ borderTop: '2px solid #86efac', margin: '12px 0' }}></div>
              <div style={{ fontWeight: 600, fontSize: '16px' }}>Besparing brutto: €{totalSavings * 12}/jaar</div>
              <div style={{ fontSize: '14px' }}>Boetes: -€{totalPenalties}</div>
              <div style={{ borderTop: '2px solid #86efac', margin: '12px 0' }}></div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: '#15803d' }}>
                Besparing netto: €{netSavings}/jaar
              </div>
              <div style={{ fontSize: '16px', marginTop: '12px', fontWeight: 600 }}>
                💳 COMMISSIE (10%): €{commission}/jaar
              </div>
            </div>
          </div>

          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '20px'
          }}>
            <p style={{ fontSize: '14px', color: '#166534', marginBottom: '12px' }}>
              ✅ Na bevestiging zal Echo:
            </p>
            <ul style={{ fontSize: '13px', color: '#166534', paddingLeft: '20px' }}>
              <li>Alle opzeggingen versturen</li>
              <li>Alle nieuwe contracten tekenen</li>
              <li>Alle leveranciers overschakelen</li>
              <li>Boetes betalen</li>
            </ul>
          </div>

          <button
            style={{
              width: '100%',
              padding: '18px',
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 700,
              cursor: 'pointer',
              marginTop: '24px'
            }}
          >
            BEVESTIG - BETAAL €{commission}
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}


