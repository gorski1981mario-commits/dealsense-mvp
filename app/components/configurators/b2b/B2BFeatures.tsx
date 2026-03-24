'use client'

/**
 * B2B FEATURES COMPONENT - Shared across all B2B Configurators
 * 
 * Features 2026:
 * - Disclaimers (estimated prices)
 * - Referentie prijs (reference price)
 * - Volume pricing table
 * - RFQ (Request for Quote) button
 * - Approval workflow display
 * - Bulk ordering interface
 */

import React from 'react'

interface VolumeTier {
  tier: string
  minQty: number
  maxQty: number | string
  discount: string
  unitPrice: string
  sampleTotal: string
}

interface ApprovalWorkflow {
  required: boolean
  level: string
  approvers: string[]
  message: string
}

interface B2BDisclaimerProps {
  category: string
}

export function B2BDisclaimer({ category }: B2BDisclaimerProps) {
  return (
    <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
      <div style={{ fontSize: '12px', color: '#92400E' }}>
        <strong>⚠️ Geschatte prijzen</strong> op basis van marktgegevens en industrie benchmarks. 
        Exacte prijzen worden bepaald door de leverancier op basis van uw specifieke vereisten.
      </div>
    </div>
  )
}

interface B2BReferencePriceProps {
  price: number
  label?: string
}

export function B2BReferencePrice({ price, label }: B2BReferencePriceProps) {
  return (
    <div style={{ background: '#FEF3C7', border: '2px solid #F59E0B', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400E' }}>
            💡 {label || 'Referentie (markt gemiddelde)'}
          </div>
          <div style={{ fontSize: '11px', color: '#78350F', marginTop: '2px' }}>
            Hoogste prijs als vergelijkingspunt
          </div>
        </div>
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#92400E' }}>
          €{price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  )
}

interface VolumePricingTableProps {
  tiers: VolumeTier[]
}

export function VolumePricingTable({ tiers }: VolumePricingTableProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
        📊 Volume Pricing (Bulk Discounts)
      </h3>
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#6B7280' }}>Quantity</th>
              <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#6B7280' }}>Discount</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#6B7280' }}>Unit Price</th>
              <th style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#6B7280' }}>Example Total</th>
            </tr>
          </thead>
          <tbody>
            {tiers.map((tier, index) => (
              <tr key={index} style={{ borderBottom: index < tiers.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <td style={{ padding: '12px', color: '#111827' }}>
                  {tier.minQty} - {tier.maxQty === '∞' ? '∞' : tier.maxQty}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '2px 8px', 
                    background: tier.discount === '0%' ? '#F3F4F6' : '#E6F4EE', 
                    color: tier.discount === '0%' ? '#6B7280' : '#166534',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {tier.discount}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#111827' }}>
                  {tier.unitPrice}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#6B7280' }}>
                  {tier.sampleTotal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '8px' }}>
        💡 Hogere volumes = grotere kortingen. Prijzen zijn exclusief BTW en verzendkosten.
      </div>
    </div>
  )
}

interface RFQButtonProps {
  onClick: () => void
  disabled?: boolean
}

export function RFQButton({ onClick, disabled }: RFQButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '14px',
        background: disabled ? '#9CA3AF' : 'linear-gradient(135deg, #1E7F5C 0%, #15803D 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 4px 12px rgba(30, 127, 92, 0.3)',
        marginBottom: '12px'
      }}
    >
      📋 Request for Quote (RFQ) →
    </button>
  )
}

interface ApprovalWorkflowDisplayProps {
  workflow: ApprovalWorkflow
  totalValue: number
}

export function ApprovalWorkflowDisplay({ workflow, totalValue }: ApprovalWorkflowDisplayProps) {
  if (!workflow.required) {
    return (
      <div style={{ background: '#E6F4EE', border: '1px solid #86EFAC', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>✅</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>Auto-Approved</div>
            <div style={{ fontSize: '11px', color: '#15803D' }}>{workflow.message}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400E', marginBottom: '4px' }}>
          ⚠️ Approval Required
        </div>
        <div style={{ fontSize: '11px', color: '#78350F' }}>{workflow.message}</div>
      </div>
      <div style={{ fontSize: '12px', color: '#92400E' }}>
        <strong>Approvers:</strong> {workflow.approvers.join(' → ')}
      </div>
      <div style={{ fontSize: '11px', color: '#78350F', marginTop: '4px' }}>
        Order value: €{totalValue.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
      </div>
    </div>
  )
}

interface BulkQuantityInputProps {
  value: number | string
  onChange: (value: number) => void
  unit: string
  minOrder?: number
  suggestions?: number[]
}

export function BulkQuantityInput({ value, onChange, unit, minOrder, suggestions }: BulkQuantityInputProps) {
  const defaultSuggestions = suggestions || [10, 50, 100, 500, 1000]
  
  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
        Quantity ({unit})
        {minOrder && <span style={{ fontSize: '11px', color: '#6B7280', fontWeight: 400 }}> - Min order: {minOrder}</span>}
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={minOrder || 1}
        style={{
          width: '100%',
          padding: '10px 14px',
          border: '2px solid #E5E7EB',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: 500,
          color: '#111827',
          marginBottom: '8px'
        }}
      />
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {defaultSuggestions.map((qty) => (
          <button
            key={qty}
            type="button"
            onClick={() => onChange(qty)}
            style={{
              padding: '4px 12px',
              background: value === qty ? '#E6F4EE' : '#F3F4F6',
              border: value === qty ? '1px solid #15803D' : '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              color: value === qty ? '#15803D' : '#6B7280',
              cursor: 'pointer'
            }}
          >
            {qty} {unit}
          </button>
        ))}
      </div>
    </div>
  )
}

interface PaymentTermsSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function PaymentTermsSelector({ value, onChange }: PaymentTermsSelectorProps) {
  const terms = [
    { id: 'prepayment', label: 'Prepayment', discount: '3% discount', color: '#E6F4EE' },
    { id: 'net30', label: 'Net 30 days', discount: 'Standard', color: '#F3F4F6' },
    { id: 'net60', label: 'Net 60 days', discount: '+2% premium', color: '#FEF3C7' },
    { id: 'net90', label: 'Net 90 days', discount: '+4% premium', color: '#FEE2E2' }
  ]

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
        Payment Terms
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {terms.map((term) => (
          <div
            key={term.id}
            onClick={() => onChange(term.id)}
            style={{
              padding: '10px',
              background: value === term.id ? term.color : 'white',
              border: `2px solid ${value === term.id ? '#15803D' : '#E5E7EB'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{term.label}</div>
            <div style={{ fontSize: '11px', color: '#6B7280' }}>{term.discount}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface UrgencySelectorProps {
  value: string
  onChange: (value: string) => void
}

export function UrgencySelector({ value, onChange }: UrgencySelectorProps) {
  const options = [
    { id: 'standard', label: 'Standard', time: '4-6 weeks', multiplier: '×1.0', color: '#F3F4F6' },
    { id: 'express', label: 'Express', time: '2-3 weeks', multiplier: '×1.15', color: '#FEF3C7' },
    { id: 'urgent', label: 'Urgent', time: '1 week', multiplier: '×1.30', color: '#FEE2E2' }
  ]

  return (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
        Delivery Urgency
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => onChange(option.id)}
            style={{
              padding: '10px',
              background: value === option.id ? option.color : 'white',
              border: `2px solid ${value === option.id ? '#15803D' : '#E5E7EB'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{option.label}</div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>{option.time}</div>
            <div style={{ fontSize: '10px', color: '#92400E', fontWeight: 600 }}>{option.multiplier}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

