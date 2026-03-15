'use client'

import { useState } from 'react'
import AgentEchoLogo from '../AgentEchoLogo'

export default function LoanConfigurator() {
  const [config, setConfig] = useState({
    amount: 10000,
    duration: 60,
    purpose: 'Vrij',
    income: 40000,
    bkr: false
  })
  const [searching, setSearching] = useState(false)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '24px' }}>💳 Lening Configurator</h2>
      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Bedrag: €{config.amount.toLocaleString()}</label>
          <input type="range" min="1000" max="50000" step="500" value={config.amount} onChange={(e) => setConfig({ ...config, amount: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Looptijd: {config.duration} maanden</label>
          <input type="range" min="12" max="120" value={config.duration} onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Doel</label>
          <select value={config.purpose} onChange={(e) => setConfig({ ...config, purpose: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px' }}>
            <option value="Verbouwing">Verbouwing</option>
            <option value="Auto">Auto</option>
            <option value="Studie">Studie</option>
            <option value="Vrij">Vrij te besteden</option>
          </select>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Jaarinkomen: €{config.income.toLocaleString()}</label>
          <input type="range" min="20000" max="100000" step="5000" value={config.income} onChange={(e) => setConfig({ ...config, income: parseInt(e.target.value) })} style={{ width: '100%' }} />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={config.bkr} onChange={(e) => setConfig({ ...config, bkr: e.target.checked })} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>BKR registratie</span>
          </label>
        </div>
        <button onClick={() => setSearching(true)} disabled={searching} style={{ width: '100%', padding: '16px', background: searching ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 600, cursor: searching ? 'not-allowed' : 'pointer' }}>
          {searching ? 'Zoeken...' : 'Zoek beste lening'}
        </button>
      </div>
      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste leningen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
