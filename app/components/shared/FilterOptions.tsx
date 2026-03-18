'use client'

import { useState } from 'react'

export type FilterType = 'cheapest' | 'balanced' | 'quality'

interface FilterOptionsProps {
  selectedFilter: FilterType | ''
  onFilterChange: (filter: FilterType) => void
  disabled?: boolean
}

export default function FilterOptions({ selectedFilter, onFilterChange, disabled = false }: FilterOptionsProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ 
        fontSize: '15px', 
        fontWeight: 600, 
        color: '#111827', 
        marginBottom: '12px' 
      }}>
        Kies zoekstrategie:
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Cheapest */}
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '12px 16px', 
          background: selectedFilter === 'cheapest' ? '#E6F4EE' : 'white',
          border: selectedFilter === 'cheapest' ? '2px solid #15803d' : '2px solid #E5E7EB',
          borderRadius: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: disabled ? 0.6 : 1
        }}>
          <input 
            type="radio" 
            name="filter" 
            value="cheapest"
            checked={selectedFilter === 'cheapest'}
            onChange={() => !disabled && onFilterChange('cheapest')}
            disabled={disabled}
            style={{ width: '18px', height: '18px', cursor: disabled ? 'not-allowed' : 'pointer' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
              🏷️ Goedkoopste
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Laagste prijs (kwaliteit minder belangrijk)
            </div>
          </div>
        </label>
        
        {/* Balanced */}
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '12px 16px', 
          background: selectedFilter === 'balanced' ? '#E6F4EE' : 'white',
          border: selectedFilter === 'balanced' ? '2px solid #15803d' : '2px solid #E5E7EB',
          borderRadius: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: disabled ? 0.6 : 1
        }}>
          <input 
            type="radio" 
            name="filter" 
            value="balanced"
            checked={selectedFilter === 'balanced'}
            onChange={() => !disabled && onFilterChange('balanced')}
            disabled={disabled}
            style={{ width: '18px', height: '18px', cursor: disabled ? 'not-allowed' : 'pointer' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <span>⚖️ Prijs + Kwaliteit</span>
              <span style={{ 
                fontSize: '11px', 
                fontWeight: 700, 
                color: '#15803d', 
                background: '#E6F4EE', 
                padding: '2px 8px', 
                borderRadius: '6px'
              }}>MEEST GEKOZEN</span>
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Balans tussen prijs en kwaliteit
            </div>
          </div>
        </label>
        
        {/* Quality */}
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '12px 16px', 
          background: selectedFilter === 'quality' ? '#E6F4EE' : 'white',
          border: selectedFilter === 'quality' ? '2px solid #15803d' : '2px solid #E5E7EB',
          borderRadius: '10px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          opacity: disabled ? 0.6 : 1
        }}>
          <input 
            type="radio" 
            name="filter" 
            value="quality"
            checked={selectedFilter === 'quality'}
            onChange={() => !disabled && onFilterChange('quality')}
            disabled={disabled}
            style={{ width: '18px', height: '18px', cursor: disabled ? 'not-allowed' : 'pointer' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
              ⭐ Beste kwaliteit
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>
              Hoogste beoordelingen (binnen redelijke prijs)
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}


