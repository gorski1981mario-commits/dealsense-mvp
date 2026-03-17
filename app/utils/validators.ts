// Common validators for configurator fields

export const validators = {
  postcode: (value: string): boolean => {
    // Dutch postcode: 4 digits + space + 2 uppercase letters
    const regex = /^\d{4}\s?[A-Z]{2}$/
    return regex.test(value)
  },
  
  age: (value: number | string, min: number = 18, max: number = 99): boolean => {
    const num = typeof value === 'string' ? parseInt(value) : value
    return !isNaN(num) && num >= min && num <= max
  },
  
  bonusMalus: (value: number | string): boolean => {
    const num = typeof value === 'string' ? parseInt(value) : value
    return !isNaN(num) && num >= 0 && num <= 15
  },
  
  required: (value: any): boolean => {
    if (typeof value === 'string') return value.trim() !== ''
    if (typeof value === 'number') return !isNaN(value)
    if (typeof value === 'boolean') return true
    return value != null && value !== ''
  },
  
  email: (value: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(value)
  },
  
  phone: (value: string): boolean => {
    // Dutch phone: 10 digits, optionally with +31 or 0031
    const cleaned = value.replace(/[\s\-\(\)]/g, '')
    const regex = /^(\+31|0031|0)[1-9]\d{8}$/
    return regex.test(cleaned)
  },
  
  amount: (value: number | string, min: number = 0, max: number = Infinity): boolean => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return !isNaN(num) && num >= min && num <= max
  }
}

// Auto-format functions
export const formatters = {
  postcode: (value: string): string => {
    // Remove all spaces and convert to uppercase
    let cleaned = value.replace(/\s/g, '').toUpperCase()
    
    // Extract digits and letters
    const digits = cleaned.match(/\d+/)?.[0] || ''
    const letters = cleaned.match(/[A-Z]+/)?.[0] || ''
    
    // Format as "1234 AB"
    if (digits.length >= 4 && letters.length >= 2) {
      return digits.slice(0, 4) + ' ' + letters.slice(0, 2)
    } else if (digits.length > 0) {
      return digits.slice(0, 4) + (letters.length > 0 ? ' ' + letters.slice(0, 2) : '')
    }
    
    return cleaned
  },
  
  phone: (value: string): string => {
    // Format as 06-12345678
    const cleaned = value.replace(/\D/g, '')
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return cleaned.slice(0, 2) + '-' + cleaned.slice(2)
    }
    return value
  },
  
  amount: (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return ''
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }
}

// Error messages
export const errorMessages = {
  postcode: '❌ Ongeldige postcode. Gebruik format: 1234 AB',
  age: '❌ Leeftijd moet tussen 18 en 99 jaar zijn',
  bonusMalus: '❌ Moet tussen 0 en 15 jaar zijn',
  required: '❌ Dit veld is verplicht',
  email: '❌ Ongeldig e-mailadres',
  phone: '❌ Ongeldig telefoonnummer',
  amount: '❌ Ongeldig bedrag'
}

// Success messages
export const successMessages = {
  postcode: '✅ Geldige Nederlandse postcode',
  age: '✅ Geldige leeftijd',
  bonusMalus: '✅ Geldig aantal jaren',
  required: '✅ Ingevuld',
  email: '✅ Geldig e-mailadres',
  phone: '✅ Geldig telefoonnummer',
  amount: '✅ Geldig bedrag'
}
