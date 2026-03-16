'use client'

import { useState } from 'react'

interface TelecomConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

interface TelecomConfig {
  type: string
  data: number
  speed: number
  contract: string
  lines: number
}

export default function TelecomConfigurator({ packageType = 'pro', userId }: TelecomConfiguratorProps = {}) {
  const [config, setConfig] = useState<TelecomConfig>({
    type: 'Bundel',
    data: 10,
    speed: 200,
    contract: '1 jaar',
    lines: 1
  })
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    setSearching(true)
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        📱 Telecom Configurator
      </h2>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Type</label>
          <select value={config.type} onChange={(e) => setConfig({ ...config, type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
            <option value="Mobiel">Mobiel</option>
            <option value="Internet">Internet</option>
            <option value="TV">TV</option>
            <option value="Bundel">Bundel (Alles-in-1)</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Data: {config.data === 999 ? 'Unlimited' : `${config.data} GB`}</label>
          <input type="range" min="1" max="999" value={config.data} onChange={(e) => setConfig({ ...config, data: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Snelheid: {config.speed} Mb/s</label>
          <input type="range" min="50" max="1000" step="50" value={config.speed} onChange={(e) => setConfig({ ...config, speed: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Contract</label>
          <select value={config.contract} onChange={(e) => setConfig({ ...config, contract: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
            <option value="1 jaar">1 jaar</option>
            <option value="2 jaar">2 jaar</option>
            <option value="Sim-only">Sim-only</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Aantal lijnen: {config.lines}</label>
          <input type="range" min="1" max="5" value={config.lines} onChange={(e) => setConfig({ ...config, lines: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>

        <button onClick={handleSearch} disabled={searching} style={{ width: '100%', padding: '16px', background: searching ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer' }}>
          {searching ? 'Zoeken...' : 'Zoek beste telecom pakket'}
        </button>
      </div>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste telecom pakketten voor je...</p>
        </div>
      )}

      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
