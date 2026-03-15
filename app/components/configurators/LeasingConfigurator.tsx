'use client'

import { useState } from 'react'
import AgentEchoLogo from '../AgentEchoLogo'

interface LeasingConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

interface LeasingConfig {
  type: string
  amount: number
  duration: number
  kilometers: number
  leasingType: string
}

export default function LeasingConfigurator({ packageType = 'finance', userId }: LeasingConfiguratorProps = {}) {
  const [config, setConfig] = useState<LeasingConfig>({
    type: 'Auto',
    amount: 30000,
    duration: 48,
    kilometers: 20000,
    leasingType: 'Operational'
  })
  const [searching, setSearching] = useState(false)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>🚗 Leasing Configurator</h2>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Type</label>
          <select value={config.type} onChange={(e) => setConfig({ ...config, type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
            <option value="Auto">Auto</option>
            <option value="Fiets">Fiets</option>
            <option value="Equipment">Equipment</option>
          </select>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Bedrag: €{config.amount.toLocaleString()}</label>
          <input type="range" min="10000" max="100000" step="1000" value={config.amount} onChange={(e) => setConfig({ ...config, amount: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Looptijd: {config.duration} maanden</label>
          <input type="range" min="12" max="60" value={config.duration} onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Kilometers: {config.kilometers}/jaar</label>
          <input type="range" min="10000" max="50000" step="5000" value={config.kilometers} onChange={(e) => setConfig({ ...config, kilometers: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Leasing type</label>
          <select value={config.leasingType} onChange={(e) => setConfig({ ...config, leasingType: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
            <option value="Operational">Operational Lease</option>
            <option value="Financial">Financial Lease</option>
          </select>
        </div>
        <button onClick={() => setSearching(true)} disabled={searching} style={{ width: '100%', padding: '16px', background: searching ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer' }}>
          {searching ? 'Zoeken...' : 'Zoek beste leasing'}
        </button>
      </div>
      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste leasing aanbiedingen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
