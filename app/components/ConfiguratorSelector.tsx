'use client'

import { useState } from 'react'
import VacationConfigurator from './configurators/VacationConfigurator'
import InsuranceConfigurator from './configurators/InsuranceConfigurator'
import EnergyConfigurator from './configurators/EnergyConfigurator'
import TelecomConfigurator from './configurators/TelecomConfigurator'
import MortgageConfigurator from './configurators/MortgageConfigurator'
import LeasingConfigurator from './configurators/LeasingConfigurator'
import LoanConfigurator from './configurators/LoanConfigurator'
import CreditCardConfigurator from './configurators/CreditCardConfigurator'

interface ConfiguratorSelectorProps {
  packageType: 'plus' | 'pro' | 'finance' | 'zakelijk'
  userId: string
}

type ConfiguratorType = 'vacation' | 'insurance' | 'energy' | 'telecom' | 'mortgage' | 'leasing' | 'loan' | 'creditcard' | null

export default function ConfiguratorSelector({ packageType, userId }: ConfiguratorSelectorProps) {
  const [selectedConfigurator, setSelectedConfigurator] = useState<ConfiguratorType>(null)

  // Base configurators (PRO)
  const baseConfigurators = [
    { id: 'vacation', name: '✈️ Vakanties', component: VacationConfigurator, category: 'Services' },
    { id: 'insurance', name: '🛡️ Verzekeringen', component: InsuranceConfigurator, category: 'Services' },
    { id: 'energy', name: '⚡ Energie', component: EnergyConfigurator, category: 'Services' },
    { id: 'telecom', name: '📱 Telecom', component: TelecomConfigurator, category: 'Services' }
  ]

  // Finance configurators (FINANCE only)
  const financeConfigurators = [
    { id: 'mortgage', name: '� Hypotheek', component: MortgageConfigurator, category: 'Finance' },
    { id: 'leasing', name: '� Leasing', component: LeasingConfigurator, category: 'Finance' },
    { id: 'loan', name: '� Lening', component: LoanConfigurator, category: 'Finance' },
    { id: 'creditcard', name: '💳 Creditcard', component: CreditCardConfigurator, category: 'Finance' }
  ]

  // Combine based on package type
  const configurators = packageType === 'finance' 
    ? [...baseConfigurators, ...financeConfigurators]
    : baseConfigurators

  const SelectedComponent = selectedConfigurator 
    ? configurators.find(c => c.id === selectedConfigurator)?.component 
    : null

  return (
    <div style={{ marginTop: '32px', marginBottom: '32px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#15803d' }}>
        🎯 Services Configurators ({packageType.toUpperCase()})
      </h3>
      <p style={{ fontSize: '14px', color: '#374151', marginBottom: '24px' }}>
        Kies een configurator om je ideale pakket te vinden.
      </p>

      {/* Configurator Selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: '#374151',
          marginBottom: '8px'
        }}>
          Selecteer configurator
        </label>
        <select
          value={selectedConfigurator || ''}
          onChange={(e) => setSelectedConfigurator(e.target.value as ConfiguratorType)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #E5E7EB',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: 500,
            color: '#111827',
            background: 'white',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <option value="">-- Kies een configurator --</option>
          {packageType === 'finance' ? (
            <>
              <optgroup label="Services (van PRO)">
                {baseConfigurators.map(config => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Finance (exclusief)">
                {financeConfigurators.map(config => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
              </optgroup>
            </>
          ) : (
            configurators.map(config => (
              <option key={config.id} value={config.id}>
                {config.name}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Selected Configurator */}
      {SelectedComponent && (
        <div style={{
          background: '#F9FAFB',
          borderRadius: '12px',
          padding: '24px',
          border: '2px solid #E5E7EB'
        }}>
          <SelectedComponent packageType={packageType} userId={userId} />
        </div>
      )}

      {!selectedConfigurator && (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#6B7280',
          fontSize: '14px',
          background: '#F9FAFB',
          borderRadius: '12px',
          border: '2px dashed #E5E7EB'
        }}>
          👆 Selecteer een configurator hierboven om te beginnen
        </div>
      )}
    </div>
  )
}


