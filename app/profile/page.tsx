'use client'

import { useState } from 'react'
import { BarChart3, ClipboardList, Settings } from 'lucide-react'
import MyConfigurations from '../components/profile/MyConfigurations'
import AgentEchoLogo from '../components/AgentEchoLogo'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'configurations' | 'settings'>('configurations')
  
  // Mock user data - replace with actual auth
  const userId = 'user-123'
  const packageType: 'free' | 'plus' | 'pro' | 'finance' = 'pro'
  const userName = 'Jan de Vries'
  const userEmail = 'jan.devries@example.nl'

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #E5E7EB', padding: '20px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <AgentEchoLogo />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Profile Header */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          marginBottom: '24px',
          border: '2px solid #E5E7EB'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #15803d 0%, #15803d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 700,
              color: 'white'
            }}>
              {userName.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                {userName}
              </h1>
              <p style={{ color: '#6B7280', fontSize: '14px' }}>{userEmail}</p>
            </div>
            <div style={{
              padding: '8px 16px',
              background: '#E6F4EE',
              color: '#15803d',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600
            }}>
              {packageType.toUpperCase()} PAKKET
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '2px solid #E5E7EB',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', borderBottom: '2px solid #E5E7EB' }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                flex: 1,
                padding: '16px',
                background: activeTab === 'overview' ? '#E6F4EE' : 'white',
                border: 'none',
                borderBottom: activeTab === 'overview' ? '3px solid #15803d' : '3px solid transparent',
                fontSize: '14px',
                fontWeight: 600,
                color: activeTab === 'overview' ? '#15803d' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <BarChart3 size={18} strokeWidth={2} style={{ marginRight: '6px' }} /> Overzicht
            </button>
            <button
              onClick={() => setActiveTab('configurations')}
              style={{
                flex: 1,
                padding: '16px',
                background: activeTab === 'configurations' ? '#E6F4EE' : 'white',
                border: 'none',
                borderBottom: activeTab === 'configurations' ? '3px solid #15803d' : '3px solid transparent',
                fontSize: '14px',
                fontWeight: 600,
                color: activeTab === 'configurations' ? '#15803d' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <ClipboardList size={18} strokeWidth={2} style={{ marginRight: '6px' }} /> Mijn Configuraties
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              style={{
                flex: 1,
                padding: '16px',
                background: activeTab === 'settings' ? '#E6F4EE' : 'white',
                border: 'none',
                borderBottom: activeTab === 'settings' ? '3px solid #15803d' : '3px solid transparent',
                fontSize: '14px',
                fontWeight: 600,
                color: activeTab === 'settings' ? '#15803d' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Settings size={18} strokeWidth={2} style={{ marginRight: '6px' }} /> Instellingen
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          border: '2px solid #E5E7EB'
        }}>
          {activeTab === 'overview' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                Dashboard Overzicht
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Totaal configuraties</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                    {JSON.parse(localStorage.getItem('userConfigurations') || '[]').length}
                  </div>
                </div>
                <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Betaald</div>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: '#15803d' }}>
                    {JSON.parse(localStorage.getItem('userConfigurations') || '[]').filter((c: any) => c.status === 'betaald').length}
                  </div>
                </div>
                <div style={{ background: '#F9FAFB', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Pakket</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
                    {packageType.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'configurations' && (
            <MyConfigurations userId={userId} packageType={packageType} />
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                Account Instellingen
              </h2>
              <p style={{ color: '#6B7280', fontSize: '14px' }}>
                Instellingen pagina - coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


