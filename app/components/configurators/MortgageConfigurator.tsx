'use client'

import { useState } from 'react'
import AgentEchoLogo from '../AgentEchoLogo'

interface MortgageConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function MortgageConfigurator({ packageType = 'finance', userId }: MortgageConfiguratorProps = {}) {
  const [mortgageAmount, setMortgageAmount] = useState(250000)
  const [houseValue, setHouseValue] = useState(350000)
  const [duration, setDuration] = useState(30)
  const [mortgageType, setMortgageType] = useState('annuitair')
  const [income, setIncome] = useState(50000)
  const [partnerIncome, setPartnerIncome] = useState(0)
  const [postcode, setPostcode] = useState('')
  const [firstTimeBuyer, setFirstTimeBuyer] = useState(false)
  const [nhg, setNhg] = useState(false)
  const [fixedRate, setFixedRate] = useState('10')
  const [searching, setSearching] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>🏠 Hypotheek Configurator</h2>

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        
        {/* 1. HYPOTHEEK BEDRAGEN */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Hypotheek bedragen</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Waarde woning (€)</label>
            <input type="number" min="100000" max="2000000" step="10000" value={houseValue} onChange={(e) => setHouseValue(parseInt(e.target.value))} placeholder="350000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Hypotheekbedrag (€)</label>
            <input type="number" min="50000" max="1500000" step="10000" value={mortgageAmount} onChange={(e) => setMortgageAmount(parseInt(e.target.value))} placeholder="250000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Loan-to-Value: {Math.round((mortgageAmount / houseValue) * 100)}%</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Looptijd (jaren)</label>
            <select value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="10">10 jaar</option>
              <option value="15">15 jaar</option>
              <option value="20">20 jaar</option>
              <option value="25">25 jaar</option>
              <option value="30">30 jaar</option>
            </select>
          </div>
        </div>

        {/* 2. TYPE HYPOTHEEK */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Type hypotheek</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              {value: 'annuitair', label: '📊 Annuïtair', desc: 'Gelijke maandlasten'},
              {value: 'lineair', label: '📉 Lineair', desc: 'Dalende maandlasten'},
              {value: 'aflossingsvrij', label: '💰 Aflossingsvrij', desc: 'Alleen rente betalen'}
            ].map(t => (
              <div key={t.value} onClick={() => setMortgageType(t.value)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: mortgageType === t.value ? '#E6F4EE' : 'white', borderColor: mortgageType === t.value ? '#1E7F5C' : '#E5E7EB' }}>
                <input type="radio" name="mortgageType" value={t.value} checked={mortgageType === t.value} onChange={() => setMortgageType(t.value)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{t.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. INKOMEN */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Inkomen</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bruto jaarinkomen (€)</label>
            <input type="number" min="20000" max="200000" step="5000" value={income} onChange={(e) => setIncome(parseInt(e.target.value))} placeholder="50000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Partner inkomen (€, optioneel)</label>
            <input type="number" min="0" max="200000" step="5000" value={partnerIncome} onChange={(e) => setPartnerIncome(parseInt(e.target.value))} placeholder="0" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Totaal inkomen: €{(income + partnerIncome).toLocaleString()}</div>
          </div>
        </div>

        {/* 4. RENTEVASTE PERIODE */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Rentevaste periode</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Hoelang wil je de rente vastzetten?</label>
            <select value={fixedRate} onChange={(e) => setFixedRate(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="1">1 jaar</option>
              <option value="5">5 jaar</option>
              <option value="10">10 jaar</option>
              <option value="15">15 jaar</option>
              <option value="20">20 jaar</option>
              <option value="30">30 jaar (hele looptijd)</option>
            </select>
          </div>
        </div>

        {/* 5. EXTRA INFORMATIE */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>5. Extra informatie</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postcode woning</label>
            <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="1234 AB" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {value: firstTimeBuyer, setter: setFirstTimeBuyer, label: '🏡 Starter', desc: 'Dit is mijn eerste woning'},
              {value: nhg, setter: setNhg, label: '🛡️ NHG', desc: 'Nationale Hypotheek Garantie (tot €435.000)'}
            ].map((item, i) => (
              <div key={i} onClick={() => item.setter(!item.value)} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: item.value ? '#E6F4EE' : 'white', borderColor: item.value ? '#1E7F5C' : '#E5E7EB' }}>
                <input type="checkbox" checked={item.value} onChange={() => item.setter(!item.value)} style={{ width: '16px', height: '16px', cursor: 'pointer', marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={searching} style={{ width: '100%', padding: '14px', background: searching ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {searching ? 'Zoeken...' : 'Zoek beste hypotheek →'}
        </button>
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste hypotheken voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
