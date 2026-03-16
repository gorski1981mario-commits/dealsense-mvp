'use client'

import { useState } from 'react'
import AgentEchoLogo from '../AgentEchoLogo'

interface TelecomConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function TelecomConfigurator({ packageType = 'pro', userId }: TelecomConfiguratorProps = {}) {
  const [serviceType, setServiceType] = useState('mobiel-internet')
  const [mobileData, setMobileData] = useState(10)
  const [mobileMinutes, setMobileMinutes] = useState('onbeperkt')
  const [internetSpeed, setInternetSpeed] = useState(100)
  const [tvChannels, setTvChannels] = useState(false)
  const [postcode, setPostcode] = useState('')
  const [numberOfSims, setNumberOfSims] = useState(1)
  const [fiveG, setFiveG] = useState(false)
  const [roaming, setRoaming] = useState(false)
  const [fixedPhone, setFixedPhone] = useState(false)
  const [searching, setSearching] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSearching(true)
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <AgentEchoLogo />
      <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '24px', marginTop: '20px' }}>📱 Telecom Configurator</h2>

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        
        {/* 1. TYPE DIENST */}
        <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>1. Type dienst</div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Wat wil je vergelijken?</label>
            <select value={serviceType} onChange={(e) => setServiceType(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
              <option value="mobiel-internet">📱📡 Mobiel + Internet</option>
              <option value="mobiel">📱 Alleen mobiel</option>
              <option value="internet">📡 Alleen internet</option>
              <option value="alles">📱📡📺 Alles (mobiel + internet + TV)</option>
            </select>
          </div>
        </div>

        {/* 2. MOBIEL */}
        {(serviceType === 'mobiel' || serviceType === 'mobiel-internet' || serviceType === 'alles') && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>2. Mobiel abonnement</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Data per maand (GB)</label>
              <input type="number" min="1" max="100" value={mobileData} onChange={(e) => setMobileData(parseInt(e.target.value))} placeholder="10" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Of kies onbeperkt hieronder</div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Bel & SMS</label>
              <select value={mobileMinutes} onChange={(e) => setMobileMinutes(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
                <option value="100">100 minuten</option>
                <option value="300">300 minuten</option>
                <option value="onbeperkt">♾️ Onbeperkt bellen & SMS</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Aantal SIM-kaarten</label>
              <input type="number" min="1" max="5" value={numberOfSims} onChange={(e) => setNumberOfSims(parseInt(e.target.value))} placeholder="1" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
            </div>
          </div>
        )}

        {/* 3. INTERNET */}
        {(serviceType === 'internet' || serviceType === 'mobiel-internet' || serviceType === 'alles') && (
          <div style={{ marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>3. Internet thuis</div>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Gewenste snelheid (Mbps)</label>
              <select value={internetSpeed} onChange={(e) => setInternetSpeed(parseInt(e.target.value))} style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }}>
                <option value="50">50 Mbps - Basis</option>
                <option value="100">100 Mbps - Standaard</option>
                <option value="200">200 Mbps - Snel</option>
                <option value="500">500 Mbps - Zeer snel</option>
                <option value="1000">1000 Mbps (1 Gbps) - Ultra snel</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Postcode</label>
              <input type="text" value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="1234 AB" style={{ width: '100%', padding: '10px 14px', border: '2px solid #E5E7EB', borderRadius: '10px', fontSize: '14px', fontWeight: 500, color: '#111827', background: 'white' }} />
              <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>Voor beschikbaarheid glasvezel/kabel</div>
            </div>
          </div>
        )}

        {/* 4. EXTRA OPTIES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>4. Extra opties</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              {value: fiveG, setter: setFiveG, label: '📡 5G netwerk', desc: 'Toegang tot 5G (sneller mobiel)'},
              {value: roaming, setter: setRoaming, label: '🌍 EU roaming', desc: 'Bellen/internetten in EU'},
              {value: tvChannels, setter: setTvChannels, label: '📺 TV pakket', desc: 'Digitale TV zenders'},
              {value: fixedPhone, setter: setFixedPhone, label: '☎️ Vaste telefonie', desc: 'Vaste lijn voor thuis'}
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
          {searching ? 'Zoeken...' : 'Zoek beste telecom aanbieding →'}
        </button>
      </form>

      {searching && (
        <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '12px', padding: '24px', textAlign: 'center', marginTop: '20px' }}>
          <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #15803d', borderRadius: '50%', width: '50px', height: '50px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>Echo zoekt de beste telecom aanbiedingen voor je...</p>
        </div>
      )}
      <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
