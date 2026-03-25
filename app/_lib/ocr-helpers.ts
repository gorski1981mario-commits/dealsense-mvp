// OCR Helper Functions
// Utilities for OCR processing and document parsing

export interface DocumentField {
  key: string
  label: string
  value: any
  confidence: number
}

export interface ParsedDocument {
  type: 'energy' | 'telecom' | 'insurance' | 'mortgage' | 'loan' | 'unknown'
  provider?: string
  fields: DocumentField[]
  rawText: string
  confidence: number
}

/**
 * Format field value for display
 */
export function formatFieldValue(key: string, value: any): string {
  if (value === null || value === undefined) return '-'

  // Price fields
  if (key.toLowerCase().includes('price') || 
      key.toLowerCase().includes('premium') || 
      key.toLowerCase().includes('payment') ||
      key.toLowerCase().includes('amount')) {
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
 * Get human-readable field label
 */
export function getFieldLabel(key: string): string {
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
    termMonths: 'Looptijd'
  }

  return labels[key] || key.replace(/([A-Z])/g, ' $1').trim()
}

/**
 * Validate OCR confidence
 */
export function validateConfidence(confidence: number): {
  isValid: boolean
  level: 'high' | 'medium' | 'low'
  message: string
} {
  if (confidence >= 90) {
    return {
      isValid: true,
      level: 'high',
      message: 'Zeer betrouwbaar'
    }
  }

  if (confidence >= 75) {
    return {
      isValid: true,
      level: 'medium',
      message: 'Betrouwbaar - controleer de gegevens'
    }
  }

  return {
    isValid: false,
    level: 'low',
    message: 'Lage betrouwbaarheid - handmatig invoeren aanbevolen'
  }
}

/**
 * Clean OCR text (remove noise)
 */
export function cleanOCRText(text: string): string {
  return text
    .replace(/[^\w\s€.,:\-/()]/g, '') // Remove special chars except common ones
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
}

/**
 * Extract date from text (DD-MM-YYYY or DD/MM/YYYY)
 */
export function extractDate(text: string): string | null {
  const datePattern = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/g
  const matches = text.match(datePattern)
  
  if (!matches || matches.length === 0) return null
  
  // Return the last date found (usually contract end date)
  return matches[matches.length - 1]
}

/**
 * Extract price from text (€XX.XX)
 */
export function extractPrice(text: string): number | null {
  const pricePattern = /€\s*(\d{1,4}[.,]\d{2})/g
  const matches = text.match(pricePattern)
  
  if (!matches || matches.length === 0) return null
  
  // Convert all prices and return the largest one
  const prices = matches.map(p => 
    parseFloat(p.replace('€', '').replace(',', '.'))
  )
  
  return Math.max(...prices)
}

/**
 * Extract number from text
 */
export function extractNumber(text: string, pattern: RegExp): number | null {
  const match = text.match(pattern)
  if (!match) return null
  
  const numStr = match[1].replace(/[.,]/g, '')
  return parseInt(numStr)
}

/**
 * Detect provider from text
 */
export function detectProvider(text: string, type: ParsedDocument['type']): string | null {
  const providers: Record<string, string[]> = {
    energy: ['Essent', 'Eneco', 'Vattenfall', 'Greenchoice', 'Energiedirect', 'Budget Energie'],
    telecom: ['KPN', 'Vodafone', 'T-Mobile', 'Ziggo', 'Tele2', 'Simyo', 'Ben'],
    insurance: ['Aegon', 'Nationale Nederlanden', 'Achmea', 'ASR', 'Allianz', 'Centraal Beheer']
  }

  const typeProviders = providers[type] || []
  
  for (const provider of typeProviders) {
    if (text.includes(provider)) {
      return provider
    }
  }
  
  return null
}

/**
 * Calculate savings potential based on OCR data
 */
export function calculateSavingsPotential(
  documentType: ParsedDocument['type'],
  currentPrice: number
): {
  estimatedSavings: number
  percentage: number
  message: string
} {
  // Average savings by document type (based on market data)
  const avgSavings: Record<string, number> = {
    energy: 0.25, // 25% avg savings
    telecom: 0.20, // 20% avg savings
    insurance: 0.15, // 15% avg savings
    mortgage: 0.10, // 10% avg savings
    loan: 0.12 // 12% avg savings
  }

  const savingsRate = avgSavings[documentType] || 0.15
  const estimatedSavings = currentPrice * savingsRate
  const percentage = savingsRate * 100

  return {
    estimatedSavings,
    percentage,
    message: `Gemiddeld besparen klanten ${percentage}% op ${documentType}`
  }
}

/**
 * Generate configurator URL with OCR data
 */
export function generateConfiguratorURL(
  documentType: ParsedDocument['type'],
  fields: Record<string, any>
): string {
  const baseURLs: Record<string, string> = {
    energy: '/configurators/energy',
    telecom: '/configurators/telecom',
    insurance: '/configurators/insurance',
    mortgage: '/configurators/mortgage',
    loan: '/configurators/loan'
  }

  const baseURL = baseURLs[documentType]
  if (!baseURL) return '/'

  const params = new URLSearchParams({
    ocr: 'true',
    ...fields
  })

  return `${baseURL}?${params.toString()}`
}
