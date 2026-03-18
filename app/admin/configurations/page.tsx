'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Calendar, User, Package } from 'lucide-react'
import { generateConfigurationPDF } from '../../components/ConfigurationPDFGenerator'

interface Configuration {
  id: string
  config_id: string
  user_id: string
  sector: string
  parameters: Record<string, any>
  timestamp: string
  locked: boolean
  created_at: string
}

export default function AdminConfigurationsPage() {
  const [configurations, setConfigurations] = useState<Configuration[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSector, setFilterSector] = useState('all')

  useEffect(() => {
    fetchAllConfigurations()
  }, [])

  const fetchAllConfigurations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/configurations/get?userId=all')
      const result = await response.json()
      
      if (result.success) {
        setConfigurations(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching configurations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = (config: Configuration) => {
    generateConfigurationPDF({
      configId: config.config_id,
      userId: config.user_id,
      sector: config.sector,
      parameters: config.parameters,
      timestamp: config.timestamp
    })
  }

  const filteredConfigurations = configurations.filter(config => {
    const matchesSearch = 
      config.config_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSector = filterSector === 'all' || config.sector === filterSector

    return matchesSearch && matchesSector
  })

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
            Admin Panel - Configuraties
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Beheer en bekijk alle opgeslagen configuraties
          </p>
        </div>

        {/* Filters */}
        <div style={{ 
          background: 'white', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '20px',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '16px' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#6B7280" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                placeholder="Zoek op Config ID of User ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 10px 10px 40px',
                  border: '2px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Sector filter */}
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              style={{
                padding: '10px 14px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                background: 'white'
              }}
            >
              <option value="all">Alle sectoren</option>
              <option value="energy">Energie</option>
              <option value="insurance">Verzekering</option>
              <option value="telecom">Telecom</option>
              <option value="mortgage">Hypotheek</option>
              <option value="loan">Lening</option>
              <option value="leasing">Leasing</option>
              <option value="creditcard">Creditcard</option>
              <option value="vacation">Vakantie</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Totaal configuraties</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#10b981' }}>{configurations.length}</div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Vandaag</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>
              {configurations.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length}
            </div>
          </div>
          <div style={{ background: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px' }}>Unieke gebruikers</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#111827' }}>
              {new Set(configurations.map(c => c.user_id)).size}
            </div>
          </div>
        </div>

        {/* Configurations list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            Laden...
          </div>
        ) : filteredConfigurations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
            Geen configuraties gevonden
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredConfigurations.map((config) => (
              <div
                key={config.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #E5E7EB'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
                      {config.config_id}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#6B7280' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <User size={14} />
                        {config.user_id}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={14} />
                        {config.sector}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {new Date(config.created_at).toLocaleString('nl-NL')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownloadPDF(config)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 16px',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Download size={16} />
                    Download PDF
                  </button>
                </div>

                {/* Parameters preview */}
                <div style={{ 
                  background: '#F7F9F8', 
                  borderRadius: '8px', 
                  padding: '12px',
                  fontSize: '13px',
                  color: '#6B7280'
                }}>
                  <strong>Parameters:</strong> {Object.keys(config.parameters).length} items
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
