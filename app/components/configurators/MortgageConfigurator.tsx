'use client'

import { useState } from 'react'
import AgentEchoLogo from '../AgentEchoLogo'

interface MortgageConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

interface MortgageConfig {
  amount: number
  duration: number
  interestType: string
  nhg: boolean
  interestOnly: number
}

export default function MortgageConfigurator({ packageType = 'finance', userId }: MortgageConfiguratorProps = {}) {
  const [config, setConfig] = useState<MortgageConfig>({
    amount: 300000,
    duration: 30,
    interestType: 'Vast',
    nhg: false,
    interestOnly: 0
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
        🏠 Hypotheek Configurator
      </h2>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Bedrag: €{config.amount.toLocaleString()}</label>
          <input type="range" min="100000" max="1000000" step="10000" value={config.amount} onChange={(e) => setConfig({ ...config, amount: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Looptijd: {config.duration} jaar</label>
          <input type="range" min="10" max="30" value={config.duration} onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Rente type</label>
          <select value={config.interestType} onChange={(e) => setConfig({ ...config, interestType: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
            <option value="Vast">Vast</option>
            <option value="Variabel">Variabel</option>
            <option value="Mix">Mix</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.nhg} onChange={(e) => setConfig({ ...config, nhg: e.target.checked })} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>NHG (Nationale Hypotheek Garantie)</span>
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Aflossingsvrij: {config.interestOnly}%</label>
          <input type="range" min="0" max="50" value={config.interestOnly} onChange={(e) => setConfig({ ...config, interestOnly: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>

        <button onClick={handleSearch} disabled={searching} style={{ width: '100%', padding: '16px', background: searching ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer' }}>
          {searching ? 'Zoeken...' : 'Zoek beste hypotheek'}
        </button>
      </div>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste hypotheken voor je...</p>
        </div>
      )}

      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
