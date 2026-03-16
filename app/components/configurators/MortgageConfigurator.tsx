'use client'

import { useState } from 'react'

interface MortgageConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

interface MortgageConfig {
  inkomen: number
  postcode: string
  bedrag: number
  looptijd: number
  type: string
}

export default function MortgageConfigurator({ packageType = 'finance', userId }: MortgageConfiguratorProps = {}) {
  const [config, setConfig] = useState<MortgageConfig>({
    inkomen: 50000,
    postcode: '',
    bedrag: 300000,
    looptijd: 30,
    type: 'Annuïteit'
  })
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    setSearching(true)
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>
        🏠 Hypotheek Configurator
      </h2>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Bruto inkomen per jaar: €{config.inkomen.toLocaleString()}</label>
          <input type="range" min="20000" max="150000" step="5000" value={config.inkomen} onChange={(e) => setConfig({ ...config, inkomen: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Postcode</label>
          <input type="text" placeholder="1234 AB" value={config.postcode} onChange={(e) => setConfig({ ...config, postcode: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Gewenst bedrag: €{config.bedrag.toLocaleString()}</label>
          <input type="range" min="100000" max="1000000" step="10000" value={config.bedrag} onChange={(e) => setConfig({ ...config, bedrag: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Looptijd: {config.looptijd} jaar</label>
          <input type="range" min="10" max="30" value={config.looptijd} onChange={(e) => setConfig({ ...config, looptijd: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Type hypotheek</label>
          <select value={config.type} onChange={(e) => setConfig({ ...config, type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
            <option value="Annuïteit">Annuïteitenhypotheek</option>
            <option value="Lineair">Lineaire hypotheek</option>
            <option value="Aflossingsvrij">Aflossingsvrije hypotheek</option>
          </select>
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
