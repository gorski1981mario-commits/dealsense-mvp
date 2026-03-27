'use client'

import { useState } from 'react'
import { CheckCircle, AlertCircle, XCircle, Edit2, Check, X, Loader2 } from 'lucide-react'

interface OCRField {
  key: string
  label: string
  value: any
  confidence: number
  status: 'ok' | 'warning' | 'error'
  editable: boolean
}

interface OCRReviewScreenProps {
  documentType: string
  fields: Record<string, any>
  rawText: string
  confidence: number
  onConfirm: (correctedFields: Record<string, any>) => void
  onCancel: () => void
}

export default function OCRReviewScreen({
  documentType,
  fields,
  rawText,
  confidence,
  onConfirm,
  onCancel
}: OCRReviewScreenProps) {
  const [reviewFields, setReviewFields] = useState<OCRField[]>(
    generateReviewFields(fields, confidence)
  )
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const handleEdit = (field: OCRField) => {
    setEditingField(field.key)
    setEditValue(String(field.value || ''))
  }

  const handleSaveEdit = (fieldKey: string) => {
    setReviewFields(prev => prev.map(f => {
      if (f.key === fieldKey) {
        return {
          ...f,
          value: editValue,
          status: 'ok' as const,
          confidence: 100
        }
      }
      return f
    }))
    setEditingField(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handleConfirm = async () => {
    setSaving(true)

    // Convert reviewFields back to object
    const correctedFields: Record<string, any> = {}
    reviewFields.forEach(f => {
      correctedFields[f.key] = f.value
    })

    // Save corrections to feedback loop
    await saveFeedback(documentType, fields, correctedFields)

    setSaving(false)
    onConfirm(correctedFields)
  }

  const allFieldsOk = reviewFields.every(f => f.status === 'ok')
  const hasWarnings = reviewFields.some(f => f.status === 'warning')
  const hasErrors = reviewFields.some(f => f.status === 'error')

  return (
    <div style={{
      padding: '24px',
      background: 'white',
      borderRadius: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
          Controleer de gegevens
        </h3>
        <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
          AI heeft je document gescand. Controleer of alles klopt.
        </p>
      </div>

      {/* Overall Status */}
      <div style={{
        padding: '12px 16px',
        background: allFieldsOk ? '#E6F4EE' : hasErrors ? '#fee' : '#fff7ed',
        border: `2px solid ${allFieldsOk ? '#15803d' : hasErrors ? '#fcc' : '#fed7aa'}`,
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {allFieldsOk ? (
          <CheckCircle size={20} style={{ color: '#15803d' }} />
        ) : hasErrors ? (
          <XCircle size={20} style={{ color: '#c00' }} />
        ) : (
          <AlertCircle size={20} style={{ color: '#f59e0b' }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>
            {allFieldsOk ? '✓ Alles ziet er goed uit!' : hasErrors ? 'Controleer de rode velden' : 'Controleer de gele velden'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {confidence}% zekerheid • {reviewFields.length} velden
          </div>
        </div>
      </div>

      {/* Fields Table */}
      <div style={{ marginBottom: '24px' }}>
        {reviewFields.map((field) => {
          const isEditing = editingField === field.key
          const statusColor = field.status === 'ok' ? '#15803d' : field.status === 'warning' ? '#f59e0b' : '#c00'
          const statusBg = field.status === 'ok' ? '#E6F4EE' : field.status === 'warning' ? '#fff7ed' : '#fee'

          return (
            <div
              key={field.key}
              style={{
                padding: '16px',
                background: statusBg,
                border: `2px solid ${statusColor}`,
                borderRadius: '8px',
                marginBottom: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                {/* Status Icon */}
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {field.status === 'ok' ? (
                    <CheckCircle size={20} style={{ color: statusColor }} />
                  ) : field.status === 'warning' ? (
                    <AlertCircle size={20} style={{ color: statusColor }} />
                  ) : (
                    <XCircle size={20} style={{ color: statusColor }} />
                  )}
                </div>

                {/* Field Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                    {field.label}
                  </div>

                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          border: '2px solid #15803d',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: 600
                        }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveEdit(field.key)}
                        style={{
                          padding: '8px',
                          background: '#15803d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        style={{
                          padding: '8px',
                          background: '#666',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: 600 }}>
                        {formatFieldValue(field.key, field.value)}
                      </div>
                      {field.editable && (
                        <button
                          onClick={() => handleEdit(field)}
                          style={{
                            padding: '6px 12px',
                            background: 'white',
                            border: `1px solid ${statusColor}`,
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: statusColor,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit2 size={12} />
                          Popraw
                        </button>
                      )}
                    </div>
                  )}

                  {/* Confidence */}
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                    {field.confidence}% zekerheid
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={handleConfirm}
          disabled={saving}
          style={{
            flex: 1,
            padding: '16px',
            background: allFieldsOk ? '#15803d' : '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: saving ? 0.6 : 1
          }}
        >
          {saving ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Opslaan...
            </>
          ) : (
            <>
              <CheckCircle size={16} />
              {allFieldsOk ? 'Bevestigen & Zoeken' : 'Opslaan & Doorgaan'}
            </>
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={saving}
          style={{
            padding: '16px 24px',
            background: 'transparent',
            color: '#666',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.6 : 1
          }}
        >
          Annuleren
        </button>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

/**
 * Generate review fields with confidence-based status
 */
function generateReviewFields(fields: Record<string, any>, overallConfidence: number): OCRField[] {
  const reviewFields: OCRField[] = []

  // Field labels mapping
  const labels: Record<string, string> = {
    provider: 'Leverancier',
    contractNumber: 'Contractnummer',
    policyNumber: 'Polisnummer',
    monthlyPrice: 'Maandprijs',
    monthlyPremium: 'Maandpremie',
    monthlyPayment: 'Maandbetaling',
    monthlyUsage: 'Maandverbruik',
    dataGB: 'Data',
    minutes: 'Belminuten',
    endDate: 'Einddatum',
    insuranceType: 'Type verzekering',
    loanAmount: 'Leningbedrag',
    interestRate: 'Rentepercentage',
    termMonths: 'Looptijd',
    cancellationPenalty: 'Opzegkosten',
    noticePeriod: 'Opzegtermijn'
  }

  // Critical fields (high confidence required)
  const criticalFields = ['monthlyPrice', 'monthlyPremium', 'monthlyPayment', 'loanAmount']

  Object.entries(fields).forEach(([key, value]) => {
    // Skip internal fields
    if (key.includes('Warning') || key.includes('penalty') && key !== 'cancellationPenalty') {
      return
    }

    // Calculate field confidence
    let fieldConfidence = overallConfidence

    // Lower confidence for numbers (harder to OCR)
    if (typeof value === 'number') {
      fieldConfidence = Math.max(50, overallConfidence - 15)
    }

    // Lower confidence for dates (complex format)
    if (key.includes('Date') || key.includes('date')) {
      fieldConfidence = Math.max(55, overallConfidence - 10)
    }

    // Determine status based on REALISTIC Tesseract confidence
    // Tesseract max ~85%, not 99%!
    let status: 'ok' | 'warning' | 'error' = 'ok'
    
    // 🔴 RED (error): < 55% - definitely wrong
    if (fieldConfidence < 55) {
      status = 'error'
    }
    // 🟡 YELLOW (warning): 55-70% - probably needs check
    else if (fieldConfidence < 70) {
      status = 'warning'
    }
    // 🟢 GREEN (ok): 70%+ - likely correct
    else {
      status = 'ok'
    }

    // Critical fields (prices, amounts) need higher threshold
    if (criticalFields.includes(key)) {
      if (fieldConfidence < 65) {
        status = 'error'
      } else if (fieldConfidence < 75) {
        status = 'warning'
      }
    }

    reviewFields.push({
      key,
      label: labels[key] || key,
      value,
      confidence: fieldConfidence,
      status,
      editable: true
    })
  })

  return reviewFields
}

/**
 * Format field value for display
 */
function formatFieldValue(key: string, value: any): string {
  if (value === null || value === undefined) return '-'

  // Price fields
  if (key.toLowerCase().includes('price') || 
      key.toLowerCase().includes('premium') || 
      key.toLowerCase().includes('payment') ||
      key.toLowerCase().includes('amount') ||
      key.toLowerCase().includes('penalty')) {
    return `€${parseFloat(value).toFixed(2)}`
  }

  // Percentage fields
  if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('interest')) {
    return `${parseFloat(value).toFixed(2)}%`
  }

  // GB/Data fields
  if (key.toLowerCase().includes('gb') || key.toLowerCase().includes('data')) {
    return `${value} GB`
  }

  // kWh fields
  if (key.toLowerCase().includes('usage') || key.toLowerCase().includes('kwh')) {
    return `${value} kWh`
  }

  // Minutes fields
  if (key.toLowerCase().includes('minutes') || key.toLowerCase().includes('min')) {
    return `${value} min`
  }

  // Months fields
  if (key.toLowerCase().includes('term') || key.toLowerCase().includes('months')) {
    return `${value} maanden`
  }

  return String(value)
}

/**
 * Save user corrections to feedback loop
 */
async function saveFeedback(
  documentType: string,
  originalFields: Record<string, any>,
  correctedFields: Record<string, any>
): Promise<void> {
  try {
    // Find differences
    const corrections: Record<string, { original: any; corrected: any }> = {}
    
    Object.keys(correctedFields).forEach(key => {
      if (originalFields[key] !== correctedFields[key]) {
        corrections[key] = {
          original: originalFields[key],
          corrected: correctedFields[key]
        }
      }
    })

    // Only save if there are corrections
    if (Object.keys(corrections).length === 0) {
      return
    }

    // Send to feedback API
    await fetch('/api/ocr/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        documentType,
        corrections,
        timestamp: Date.now()
      })
    })

    console.log('✓ Feedback saved:', corrections)
  } catch (error) {
    console.error('Failed to save feedback:', error)
  }
}

