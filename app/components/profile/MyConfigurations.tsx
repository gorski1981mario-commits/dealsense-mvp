'use client'

import { useState, useEffect } from 'react'
import { Download, ExternalLink, FileText, Calendar, CreditCard } from 'lucide-react'
import { generateConfigurationPDF } from '../ConfigurationPDFGenerator'

interface Configuration {
  id: string
  configId: string // INS-2026-XXXXX
  sector: 'insurance' | 'energy' | 'telecom' | 'vacation' | 'leasing' | 'creditcard' | 'loan' | 'mortgage' | 'subscriptions'
  status: 'opgeslagen' | 'betaald' | 'voltooid'
  timestamp: string
  transactionId?: string
  paymentAmount?: number
  userProfile: {
    firstName: string
    lastName: string
    email: string
    phone: string
    postcode: string
    houseNumber: string
    street: string
    city: string
  }
  parameters: any
  results?: {
    name: string
    price: string
    url: string
  }[]
}

interface MyConfigurationsProps {
  userId: string
  packageType: 'free' | 'plus' | 'pro' | 'finance' | 'zakelijk'
}

export default function MyConfigurations({ userId, packageType }: MyConfigurationsProps) {
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSector, setSelectedSector] = useState<string>('all')

  // Check access based on package type
  const hasAccess = packageType !== 'free'

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false)
      return
    }

    // Load configurations from API/localStorage
    loadConfigurations()
  }, [userId, hasAccess])

  const loadConfigurations = async () => {
    try {
      // Load from localStorage (later: replace with API call)
      const storedConfigs = localStorage.getItem('userConfigurations')
      const configs: Configuration[] = storedConfigs ? JSON.parse(storedConfigs) : []
      
      // Sort by timestamp (newest first)
      configs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setConfigurations(configs)
    } catch (error) {
      console.error('Error loading configurations:', error)
      setConfigurations([])
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = (config: Configuration) => {
    generateConfigurationPDF({
      configId: config.configId,
      userId,
      sector: config.sector,
      userProfile: config.userProfile,
      parameters: config.parameters,
      timestamp: config.timestamp
    })
  }

  const handleSendToProvider = (config: Configuration) => {
    if (!config.results || config.results.length === 0) return
    
    // Open provider URL
    window.open(config.results[0].url, '_blank')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'opgeslagen': return '#F59E0B'
      case 'betaald': return '#15803d'
      case 'voltooid': return '#6B7280'
      default: return '#6B7280'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'opgeslagen': return '💾 Opgeslagen'
      case 'betaald': return '✅ Betaald'
      case 'voltooid': return '🎉 Voltooid'
      default: return status
    }
  }

  const getSectorIcon = (sector: string) => {
    switch (sector) {
      case 'insurance': return '🛡️'
      case 'energy': return '⚡'
      case 'telecom': return '📱'
      case 'vacation': return '✈️'
      case 'leasing': return '🚗'
      case 'creditcard': return '💳'
      case 'loan': return '💰'
      case 'mortgage': return '🏠'
      case 'subscriptions': return '📺'
      default: return '📄'
    }
  }

  if (!hasAccess) {
    return (
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '40px', 
        textAlign: 'center',
        border: '2px solid #E5E7EB'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
          Upgrade naar PLUS of hoger
        </h2>
        <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '24px' }}>
          Toegang tot "Mijn Configuraties" is beschikbaar vanaf het PLUS pakket
        </p>
        <button style={{
          padding: '12px 24px',
          background: 'linear-gradient(135deg, #15803d 0%, #15803d 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer'
        }}>
          Upgrade nu →
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: '#6B7280' }}>Configuraties laden...</p>
      </div>
    )
  }

  const filteredConfigs = selectedSector === 'all' 
    ? configurations 
    : configurations.filter(c => c.sector === selectedSector)

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
          📋 Mijn Configuraties
        </h2>
        <p style={{ color: '#6B7280', fontSize: '14px' }}>
          Bekijk en beheer al je opgeslagen configuraties
        </p>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {['all', 'insurance', 'energy', 'telecom', 'vacation'].map(sector => (
          <button
            key={sector}
            onClick={() => setSelectedSector(sector)}
            style={{
              padding: '8px 16px',
              background: selectedSector === sector ? '#E6F4EE' : 'white',
              border: `2px solid ${selectedSector === sector ? '#15803d' : '#E5E7EB'}`,
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: selectedSector === sector ? '#15803d' : '#6B7280',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {sector === 'all' ? '📁 Alle' : `${getSectorIcon(sector)} ${sector.charAt(0).toUpperCase() + sector.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Configurations List */}
      {filteredConfigs.length === 0 ? (
        <div style={{ 
          background: '#F9FAFB', 
          borderRadius: '12px', 
          padding: '40px', 
          textAlign: 'center',
          border: '2px dashed #E5E7EB'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p style={{ color: '#6B7280', fontSize: '14px' }}>
            Geen configuraties gevonden
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredConfigs.map(config => (
            <div 
              key={config.id}
              style={{
                background: 'white',
                border: '2px solid #E5E7EB',
                borderRadius: '12px',
                padding: '20px',
                transition: 'all 0.2s'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '20px' }}>{getSectorIcon(config.sector)}</span>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                      {config.sector.charAt(0).toUpperCase() + config.sector.slice(1)} Configuratie
                    </h3>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {new Date(config.timestamp).toLocaleString('nl-NL')}
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  background: getStatusColor(config.status) + '20',
                  color: getStatusColor(config.status),
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {getStatusLabel(config.status)}
                </div>
              </div>

              {/* Details */}
              <div style={{ 
                background: '#F9FAFB', 
                borderRadius: '8px', 
                padding: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#6B7280' }}>Configuration ID:</span>
                    <div style={{ fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>{config.configId}</div>
                  </div>
                  {config.transactionId && (
                    <div>
                      <span style={{ color: '#6B7280' }}>Transaction ID:</span>
                      <div style={{ fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>{config.transactionId}</div>
                    </div>
                  )}
                  {config.paymentAmount && (
                    <div>
                      <span style={{ color: '#6B7280' }}>Betaald bedrag:</span>
                      <div style={{ fontWeight: 600, color: '#15803d' }}>€{config.paymentAmount.toFixed(2)}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleDownloadPDF(config)}
                  style={{
                    flex: 1,
                    minWidth: '150px',
                    padding: '10px 16px',
                    background: '#15803d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={16} />
                  Download PDF
                </button>
                
                {config.status === 'betaald' && config.results && (
                  <button
                    onClick={() => handleSendToProvider(config)}
                    style={{
                      flex: 1,
                      minWidth: '150px',
                      padding: '10px 16px',
                      background: 'white',
                      color: '#15803d',
                      border: '2px solid #15803d',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <ExternalLink size={16} />
                    Ga naar aanbieder
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}




