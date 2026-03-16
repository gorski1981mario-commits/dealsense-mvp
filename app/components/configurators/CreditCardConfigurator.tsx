'use client'

import { useState } from 'react'
import AgentEchoLogo from '../AgentEchoLogo'

interface CreditCardConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function CreditCardConfigurator({ packageType = 'finance', userId }: CreditCardConfiguratorProps = {}) {
  const [cardType, setCardType] = useState('visa')
  const [limit, setLimit] = useState(2000)
  const [usage, setUsage] = useState('dagelijks')
  const [rewards, setRewards] = useState('cashback')
  const [annualFee, setAnnualFee] = useState(0)
  const [income, setIncome] = useState(30000)
  const [travelInsurance, setTravelInsurance] = useState(false)
  const [purchaseProtection, setPurchaseProtection] = useState(false)
  const [contactless, setContactless] = useState(true)
  const [secondCard, setSecondCard] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>💳 Creditcard Configurator</h2>

      <form onSubmit={handleSubmit}>
        
        {/* 1. KAART TYPE */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Kaart type</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Netwerk</label>
            <select value={cardType} onChange={(e) => setCardType(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="visa">🟦 Visa</option>
              <option value="mastercard">🔴 Mastercard</option>
              <option value="amex">🔵 American Express</option>
              <option value="vpay">V Pay (alleen Europa)</option>
              <option value="maestro">Maestro</option>
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gewenste limiet (€)</label>
            <input type="number" min="500" max="15000" step="500" value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} placeholder="2000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gebruik</label>
            <select value={usage} onChange={(e) => setUsage(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="dagelijks">🛍️ Dagelijkse aankopen</option>
              <option value="reizen">✈️ Reizen & vakanties</option>
              <option value="zakelijk">💼 Zakelijk gebruik</option>
              <option value="online">💻 Online shopping</option>
              <option value="noodgeval">🆘 Noodgevallen/reserve</option>
            </select>
          </div>
        </div>

        {/* 2. REWARDS & VOORDELEN */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Rewards & voordelen</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Rewards programma</label>
            <select value={rewards} onChange={(e) => setRewards(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="cashback">💵 Cashback (geld terug)</option>
              <option value="miles">✈️ Vliegtuig miles</option>
              <option value="punten">⭐ Spaarpunten</option>
              <option value="korting">🎫 Kortingen bij partners</option>
              <option value="geen">❌ Geen rewards (goedkoper)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Max. jaarlijkse kosten (€)</label>
            <input type="number" min="0" max="250" step="25" value={annualFee} onChange={(e) => setAnnualFee(parseInt(e.target.value))} placeholder="0" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
            <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>{annualFee === 0 ? 'Alleen gratis kaarten' : `Tot €${annualFee}/jaar`}</div>
          </div>
        </div>

        {/* 3. PERSOONLIJKE INFO */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Persoonlijke informatie</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bruto jaarinkomen (€)</label>
            <input type="number" min="15000" max="100000" step="5000" value={income} onChange={(e) => setIncome(parseInt(e.target.value))} placeholder="30000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>
        </div>

        {/* 4. EXTRA OPTIES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Extra opties</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[{value: travelInsurance, setter: setTravelInsurance, label: '✈️ Reisverzekering', desc: 'Gratis verzekering bij reizen'}, {value: purchaseProtection, setter: setPurchaseProtection, label: '🛡️ Aankoopbescherming', desc: 'Bescherming tegen schade/diefstal'}, {value: contactless, setter: setContactless, label: '📶 Contactloos betalen', desc: 'NFC/tap-to-pay functie'}, {value: secondCard, setter: setSecondCard, label: '👥 Tweede kaart', desc: 'Extra kaart voor partner/kind'}].map((item, i) => (
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
          {searching ? 'Zoeken...' : 'Zoek beste creditcard →'}
        </button>
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste creditcards voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
