'use client'

import { useState } from 'react'
import AgentEchoLogo from '../AgentEchoLogo'

interface InsuranceConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

interface InsuranceConfig {
  type: string
  coverage: string
  age: number
  postcode: string
  bonusMalus: number
}

export default function InsuranceConfigurator({ packageType = 'pro', userId }: InsuranceConfiguratorProps = {}) {
  const [config, setConfig] = useState<InsuranceConfig>({
    type: 'Auto',
    coverage: 'WA',
    age: 35,
    postcode: '',
    bonusMalus: 0
  })
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    setSearching(true)
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <AgentEchoLogo />

      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        🛡️ Verzekering Configurator
      </h2>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        {/* Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
            Type verzekering
          </label>
          <select
            value={config.type}
            onChange={(e) => setConfig({ ...config, type: e.target.value })}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
          >
            <option value="Auto">Autoverzekering</option>
            <option value="Zdrowie">Zorgverzekering</option>
            <option value="Dom">Woonverzekering</option>
            <option value="Życie">Levensverzekering</option>
          </select>
        </div>

        {/* Coverage */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
            Dekking
          </label>
          <select
            value={config.coverage}
            onChange={(e) => setConfig({ ...config, coverage: e.target.value })}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
          >
            <option value="WA">WA (Wettelijke Aansprakelijkheid)</option>
            <option value="WA+Casco">WA + Beperkt Casco</option>
            <option value="Volledig">Volledig Casco</option>
          </select>
        </div>

        {/* Age */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
            Leeftijd: {config.age} jaar
          </label>
          <input
            type="range"
            min="18"
            max="80"
            value={config.age}
            onChange={(e) => setConfig({ ...config, age: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        {/* Postcode */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
            Postcode
          </label>
          <input
            type="text"
            value={config.postcode}
            onChange={(e) => setConfig({ ...config, postcode: e.target.value })}
            placeholder="1234 AB"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}
          />
        </div>

        {/* Bonus-Malus */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
            Bonus-malus: {config.bonusMalus}
          </label>
          <input
            type="range"
            min="0"
            max="10"
            value={config.bonusMalus}
            onChange={(e) => setConfig({ ...config, bonusMalus: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        <button
          onClick={handleSearch}
          disabled={searching}
          style={{
            width: '100%',
            padding: '16px',
            background: searching ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: searching ? 'not-allowed' : 'pointer'
          }}
        >
          {searching ? 'Zoeken...' : 'Zoek beste verzekering'}
        </button>
      </div>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste verzekeringen voor je...</p>
        </div>
      )}

      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
