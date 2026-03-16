'use client'

import { useState } from 'react'
import AgentEchoLogo from '../AgentEchoLogo'

interface EnergyConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function EnergyConfigurator({ packageType = 'pro', userId }: EnergyConfiguratorProps = {}) {
  const [energyType, setEnergyType] = useState('stroom-gas')
  const [electricityUsage, setElectricityUsage] = useState(3000)
  const [gasUsage, setGasUsage] = useState(1500)
  const [contractType, setContractType] = useState('vast-1')
  const [postcode, setPostcode] = useState('')
  const [houseNumber, setHouseNumber] = useState('')
  const [greenEnergy, setGreenEnergy] = useState(false)
  const [solarPanels, setSolarPanels] = useState(false)
  const [smartMeter, setSmartMeter] = useState(true)
  const [searching, setSearching] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div style={{ padding: '20px' }}>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>⚡ Energie Configurator</h2>

      <form onSubmit={handleSubmit}>
        
        {/* 1. TYPE ENERGIE */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Type energie</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Wat wil je vergelijken?</label>
            <select value={energyType} onChange={(e) => setEnergyType(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="stroom-gas">⚡🔥 Stroom + Gas</option>
              <option value="stroom">⚡ Alleen stroom</option>
              <option value="gas">🔥 Alleen gas</option>
            </select>
          </div>
        </div>

        {/* 2. VERBRUIK */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Jaarverbruik</div>
          
          {(energyType === 'stroom' || energyType === 'stroom-gas') && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Stroomverbruik (kWh/jaar)</label>
              <input type="number" min="500" max="15000" step="100" value={electricityUsage} onChange={(e) => setElectricityUsage(parseInt(e.target.value))} placeholder="3000" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Gemiddeld huishouden: 2500-3500 kWh</div>
            </div>
          )}

          {(energyType === 'gas' || energyType === 'stroom-gas') && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gasverbruik (m³/jaar)</label>
              <input type="number" min="200" max="5000" step="100" value={gasUsage} onChange={(e) => setGasUsage(parseInt(e.target.value))} placeholder="1500" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Gemiddeld huishouden: 1200-1800 m³</div>
            </div>
          )}
        </div>

        {/* 3. CONTRACT */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Contract type</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              {value: 'vast-1', label: '🔒 Vast 1 jaar', desc: 'Vaste prijs voor 1 jaar'},
              {value: 'vast-3', label: '🔐 Vast 3 jaar', desc: 'Vaste prijs voor 3 jaar'},
              {value: 'vast-5', label: '🔏 Vast 5 jaar', desc: 'Vaste prijs voor 5 jaar'},
              {value: 'variabel', label: '📊 Variabel', desc: 'Prijs volgt de markt'}
            ].map(c => (
              <div key={c.value} onClick={() => setContractType(c.value)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', border: '2px solid #E5E7EB', borderRadius: '8px', cursor: 'pointer', background: contractType === c.value ? '#E6F4EE' : 'white', borderColor: contractType === c.value ? '#1E7F5C' : '#E5E7EB' }}>
                <input type="radio" name="contractType" value={c.value} checked={contractType === c.value} onChange={() => setContractType(c.value)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>{c.label}</div>
                  <div style={{ fontSize: '11px', color: '#6B7280' }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. ADRES */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Adresgegevens</div>
          
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postcode</label>
            <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="1234 AB" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Huisnummer</label>
            <input type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} placeholder="123" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
          </div>
        </div>

        {/* 5. EXTRA OPTIES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>5. Extra voorkeuren</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {value: greenEnergy, setter: setGreenEnergy, label: '🌱 Groene energie', desc: 'Alleen duurzame energie'},
              {value: solarPanels, setter: setSolarPanels, label: '☀️ Zonnepanelen', desc: 'Ik heb zonnepanelen (salderen)'},
              {value: smartMeter, setter: setSmartMeter, label: '📊 Slimme meter', desc: 'Ik heb een slimme meter'}
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
          {searching ? 'Zoeken...' : 'Zoek beste energieleverancier →'}
        </button>
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste energieleveranciers voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
