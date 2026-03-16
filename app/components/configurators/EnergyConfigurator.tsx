'use client'

import { useState } from 'react'

interface EnergyConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

interface EnergyConfig {
  type: string
  consumption: number
  contract: string
  postcode: string
  greenEnergy: boolean
}

export default function EnergyConfigurator({ packageType = 'pro', userId }: EnergyConfiguratorProps = {}) {
  const [config, setConfig] = useState<EnergyConfig>({
    type: 'Stroom+Gas',
    consumption: 3000,
    contract: 'Vast 1 jaar',
    postcode: '',
    greenEnergy: false
  })
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    setSearching(true)
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        ⚡ Energie Configurator
      </h2>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Type</label>
          <select value={config.type} onChange={(e) => setConfig({ ...config, type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
            <option value="Stroom">Alleen stroom</option>
            <option value="Gas">Alleen gas</option>
            <option value="Stroom+Gas">Stroom + Gas</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Verbruik: {config.consumption} kWh/jaar</label>
          <input type="range" min="1000" max="10000" step="100" value={config.consumption} onChange={(e) => setConfig({ ...config, consumption: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Contract</label>
          <select value={config.contract} onChange={(e) => setConfig({ ...config, contract: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
            <option value="Vast 1 jaar">Vast 1 jaar</option>
            <option value="Vast 3 jaar">Vast 3 jaar</option>
            <option value="Variabel">Variabel</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Postcode</label>
          <input type="text" value={config.postcode} onChange={(e) => setConfig({ ...config, postcode: e.target.value })} placeholder="1234 AB" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.greenEnergy} onChange={(e) => setConfig({ ...config, greenEnergy: e.target.checked })} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Groene energie</span>
          </label>
        </div>

        <button onClick={handleSearch} disabled={searching} style={{ width: '100%', padding: '16px', background: searching ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer' }}>
          {searching ? 'Zoeken...' : 'Zoek beste energieleverancier'}
        </button>
      </div>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste energieleveranciers voor je...</p>
        </div>
      )}

      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
