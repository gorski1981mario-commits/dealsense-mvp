'use client'

import { useState } from 'react'

interface VacationConfig {
  destination: string
  departureDate: string
  persons: number
  type: string
  duration: number
}

interface VacationConfiguratorProps {
  packageType?: 'plus' | 'pro' | 'finance'
  userId?: string
}

export default function VacationConfigurator({ packageType = 'pro', userId }: VacationConfiguratorProps = {}) {
  const [config, setConfig] = useState<VacationConfig>({
    destination: 'Europa',
    departureDate: '',
    persons: 2,
    type: 'All-inclusive',
    duration: 7
  })
  const [searching, setSearching] = useState(false)

  const handleSearch = async () => {
    setSearching(true)
    // TODO: API call to backend
    setTimeout(() => setSearching(false), 3000)
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Title */}
      <h2 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#111827',
        marginBottom: '24px'
      }}>
        🏖️ Vakantie Configurator
      </h2>

      {/* Form */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '24px'
      }}>
        {/* Destination */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>
            Bestemming
          </label>
          <select
            value={config.destination}
            onChange={(e) => setConfig({ ...config, destination: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          >
            <option value="Europa">Europa</option>
            <option value="Azja">Azië</option>
            <option value="Ameryka">Amerika</option>
            <option value="Afrika">Afrika</option>
            <option value="Oceania">Oceanië</option>
          </select>
        </div>

        {/* Departure Date */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>
            Vertrekdatum
          </label>
          <input
            type="date"
            value={config.departureDate}
            onChange={(e) => setConfig({ ...config, departureDate: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Persons */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>
            Aantal personen: {config.persons}
          </label>
          <input
            type="range"
            min="1"
            max="10"
            value={config.persons}
            onChange={(e) => setConfig({ ...config, persons: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        {/* Type */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>
            Type
          </label>
          <select
            value={config.type}
            onChange={(e) => setConfig({ ...config, type: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }}
          >
            <option value="All-inclusive">All-inclusive</option>
            <option value="Hotel">Hotel</option>
            <option value="Apartament">Appartement</option>
            <option value="Camping">Camping</option>
          </select>
        </div>

        {/* Duration */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 600,
            color: '#374151',
            marginBottom: '8px'
          }}>
            Duur: {config.duration} dagen
          </label>
          <input
            type="range"
            min="3"
            max="21"
            value={config.duration}
            onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
            style={{ width: '100%' }}
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={searching}
          style={{
            width: '100%',
            padding: '16px',
            background: searching ? '#9ca3af' : 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 600,
            cursor: searching ? 'not-allowed' : 'pointer'
          }}
        >
          {searching ? 'Zoeken...' : 'Zoek beste vakantie'}
        </button>
      </div>

      {/* Searching State */}
      {searching && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #15803d',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#166534', fontSize: '15px' }}>
            Echo zoekt de beste vakanties voor je...
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
