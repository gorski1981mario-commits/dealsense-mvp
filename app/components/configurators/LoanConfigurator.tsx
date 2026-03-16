'use client'

import { useState } from 'react'
import AgentEchoLogo from '../AgentEchoLogo'

interface LoanConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function LoanConfigurator({ packageType = 'finance', userId }: LoanConfiguratorProps = {}) {
  const [amount, setAmount] = useState(10000)
  const [duration, setDuration] = useState(60)
  const [purpose, setPurpose] = useState('vrij')
  const [income, setIncome] = useState(40000)
  const [employmentType, setEmploymentType] = useState('vast')
  const [bkr, setBkr] = useState(false)
  const [coApplicant, setCoApplicant] = useState(false)
  const [homeOwner, setHomeOwner] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>� Lening Configurator</h2>

      <form onSubmit={handleSubmit}>
        
        {/* 1. LENING DETAILS */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Lening details</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bedrag (€)</label>
            <input type="number" min="1000" max="75000" step="500" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} placeholder="10000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Looptijd (maanden)</label>
            <input type="number" min="12" max="120" step="12" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} placeholder="60" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Doel van de lening</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="verbouwing">🏗️ Verbouwing/renovatie</option>
              <option value="auto">🚗 Auto aankoop</option>
              <option value="studie">🎓 Studie/opleiding</option>
              <option value="schuld">💳 Schulden samenvoegen</option>
              <option value="bruiloft">💍 Bruiloft</option>
              <option value="vakantie">✈️ Vakantie</option>
              <option value="vrij">🎯 Vrij te besteden</option>
            </select>
          </div>
        </div>

        {/* 2. PERSOONLIJKE SITUATIE */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Persoonlijke situatie</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bruto jaarinkomen (€)</label>
            <input type="number" min="15000" max="150000" step="5000" value={income} onChange={(e) => setIncome(parseInt(e.target.value))} placeholder="40000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Type dienstverband</label>
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="vast">💼 Vast contract</option>
              <option value="tijdelijk">📄 Tijdelijk contract</option>
              <option value="zzp">👨‍💻 ZZP/Zelfstandige</option>
              <option value="pensioen">👴 Pensioen/AOW</option>
              <option value="uitkering">💵 Uitkering</option>
            </select>
          </div>
        </div>

        {/* 3. EXTRA INFORMATIE */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Extra informatie</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[{value: bkr, setter: setBkr, label: '⚠️ BKR registratie', desc: 'Ik heb een BKR-registratie'}, {value: coApplicant, setter: setCoApplicant, label: '👥 Mede-aanvrager', desc: 'Ik vraag samen met partner aan'}, {value: homeOwner, setter: setHomeOwner, label: '🏠 Eigen woning', desc: 'Ik ben eigenaar van een woning'}].map((item, i) => (
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
          {searching ? 'Zoeken...' : 'Zoek beste lening →'}
        </button>
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste leningen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
