/**
 * IDENTIFIER EXTRACTION - UNIWERSALNY
 * Działa na EAN, URL, nazwę produktu, usługę, miejsce
 */

const { detectCategory } = require('./categories')

/**
 * Extract identifier from input
 * @param {string} input - EAN, URL, product name, service name, etc.
 * @param {string} categoryHint - Optional category hint
 * @returns {object} - { type, value, category }
 */
function extractIdentifier(input, categoryHint = null) {
  // 1. Check if EAN (13 digits)
  if (/^\d{13}$/.test(input)) {
    return {
      type: 'ean',
      value: input,
      category: categoryHint || detectCategory(input, categoryHint)
    }
  }
  
  // 2. Check if URL
  if (input.startsWith('http://') || input.startsWith('https://')) {
    const ean = extractEANFromURL(input)
    if (ean) {
      return {
        type: 'url',
        value: ean,
        category: categoryHint || detectCategory(input, categoryHint)
      }
    }
    
    // Extract product/service name from URL
    const name = extractNameFromURL(input)
    return {
      type: 'url',
      value: name || input,
      category: categoryHint || detectCategory(name || input, categoryHint)
    }
  }
  
  // 3. Plain text (product name, service name, place name)
  return {
    type: 'name',
    value: input.trim(),
    category: categoryHint || detectCategory(input, categoryHint)
  }
}

/**
 * Extract EAN from URL
 */
function extractEANFromURL(url) {
  const match = url.match(/\b(\d{13})\b/)
  return match ? match[1] : null
}

/**
 * Extract product/service name from URL
 */
function extractNameFromURL(url) {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Remove common patterns
    let name = pathname
      .replace(/^\//, '')
      .replace(/\.html?$/, '')
      .replace(/\/p\//, '')
      .replace(/\/product\//, '')
      .replace(/\/nl\//, '')
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .trim()
    
    // Take first part (usually product name)
    const parts = name.split('/')
    return parts[0] || null
  } catch (err) {
    return null
  }
}

/**
 * Normalize identifier for cache key
 */
function normalizeIdentifier(value, category) {
  return `${category}:${value.toLowerCase().replace(/\s+/g, '-')}`
}

module.exports = {
  extractIdentifier,
  extractEANFromURL,
  extractNameFromURL,
  normalizeIdentifier
}
