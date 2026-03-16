'use client'

import { useState } from 'react'
import AgentEchoLogo from '../AgentEchoLogo'

interface LeasingConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function LeasingConfigurator({ packageType = 'finance', userId }: LeasingConfiguratorProps = {}) {
  const [vehicleType, setVehicleType] = useState('auto')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [amount, setAmount] = useState(30000)
  const [duration, setDuration] = useState(48)
  const [kilometers, setKilometers] = useState(20000)
  const [leasingType, setLeasingType] = useState('operational')
  const [maintenance, setMaintenance] = useState(true)
  const [insurance, setInsurance] = useState(true)
  const [tires, setTires] = useState(true)
  const [fuelCard, setFuelCard] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div style={{ padding: '20px' }}>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>🚗 Leasing Configurator</h2>

      <form onSubmit={handleSubmit}>
        
        {/* 1. VOERTUIG */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Voertuig</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Type</label>
            <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="auto">🚗 Auto</option>
              <option value="elektrisch">⚡ Elektrische auto</option>
              <option value="hybride">🔋 Hybride auto</option>
              <option value="bestelauto">🚐 Bestelauto</option>
              <option value="motor">🏍️ Motor</option>
              <option value="fiets">🚴 (Elektrische) fiets</option>
            </select>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Merk (optioneel)</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Bijv. Volkswagen, Tesla, BMW..." style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Model (optioneel)</label>
            <input type="text" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Bijv. Golf, Model 3, X5..." style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>
        </div>

        {/* 2. FINANCIEEL */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Financieel</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Cataloguswaarde (€)</label>
            <input type="number" min="10000" max="100000" step="1000" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} placeholder="30000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Looptijd (maanden)</label>
            <input type="number" min="12" max="60" step="12" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} placeholder="48" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Kilometers per jaar</label>
            <input type="number" min="10000" max="50000" step="5000" value={kilometers} onChange={(e) => setKilometers(parseInt(e.target.value))} placeholder="20000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>
        </div>

        {/* 3. TYPE LEASING */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Type leasing</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[{value: 'operational', label: '💼 Operational Lease', desc: 'All-in, incl. onderhoud'}, {value: 'financial', label: '📊 Financial Lease', desc: 'Voertuig wordt eigendom'}].map(t => (
              <div key={t.value} onClick={() => setLeasingType(t.value)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: leasingType === t.value ? '#E6F4EE' : 'white', borderColor: leasingType === t.value ? '#1E7F5C' : '#E5E7EB' }}>
                <input type="radio" name="leasingType" value={t.value} checked={leasingType === t.value} onChange={() => setLeasingType(t.value)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{t.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. EXTRA SERVICES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Extra services</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[{value: maintenance, setter: setMaintenance, label: '🔧 Onderhoud & reparaties'}, {value: insurance, setter: setInsurance, label: '🛡️ Verzekering (WA, Casco)'}, {value: tires, setter: setTires, label: '🛞 Banden (zomer & winter)'}, {value: fuelCard, setter: setFuelCard, label: '⛽ Tankpas'}].map((item, i) => (
              <div key={i} onClick={() => item.setter(!item.value)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: item.value ? '#E6F4EE' : 'white', borderColor: item.value ? '#1E7F5C' : '#E5E7EB' }}>
                <input type="checkbox" checked={item.value} onChange={() => item.setter(!item.value)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <label style={{ margin: 0, fontSize: '13px', fontWeight: 500, cursor: 'pointer', flex: 1 }}>{item.label}</label>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={searching} style={{ width: '100%', padding: '14px', background: searching ? '#9ca3af' : 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer', boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)' }}>
          {searching ? 'Zoeken...' : 'Zoek beste leasing →'}
        </button>
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste leasing aanbiedingen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
