/**
 * URL PARSER - Automatyczne wypełnianie z URL-a produktu
 * 
 * Wspierane sklepy:
 * - bol.com
 * - Amazon.nl
 * - Coolblue.nl
 * - MediaMarkt.nl
 * - Wehkamp.nl
 * 
 * Wyciąga:
 * - Nazwa produktu
 * - Cena (jeśli dostępna w URL)
 * - EAN (jeśli dostępny w URL)
 */

export interface ParsedProductUrl {
  productName: string
  price?: number
  ean?: string
  shop: string
  originalUrl: string
  isValid: boolean
}

/**
 * Parse product URL and extract product info
 */
export function parseProductUrl(url: string): ParsedProductUrl | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  const urlLower = url.toLowerCase().trim()

  // bol.com
  if (urlLower.includes('bol.com')) {
    return parseBolComUrl(url)
  }

  // Amazon.nl
  if (urlLower.includes('amazon.nl')) {
    return parseAmazonUrl(url)
  }

  // Coolblue.nl
  if (urlLower.includes('coolblue.nl')) {
    return parseCoolblueUrl(url)
  }

  // MediaMarkt.nl
  if (urlLower.includes('mediamarkt.nl')) {
    return parseMediaMarktUrl(url)
  }

  // Wehkamp.nl
  if (urlLower.includes('wehkamp.nl')) {
    return parseWehkampUrl(url)
  }

  // Nie rozpoznany sklep - próbuj wyciągnąć nazwę z URL
  return parseGenericUrl(url)
}

/**
 * Parse bol.com URL
 * Example: https://www.bol.com/nl/nl/p/apple-iphone-15-pro-128gb-zwart/9300000153849217/
 */
function parseBolComUrl(url: string): ParsedProductUrl {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(p => p)

    // Znajdź nazwę produktu (przed ID produktu)
    let productName = ''
    let ean = ''

    // Format: /nl/nl/p/product-name/product-id/
    const pIndex = pathParts.indexOf('p')
    if (pIndex >= 0 && pathParts[pIndex + 1]) {
      productName = pathParts[pIndex + 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    // Szukaj EAN w URL (jeśli jest)
    const eanMatch = url.match(/\/(\d{13,14})\/?/)
    if (eanMatch) {
      ean = eanMatch[1]
    }

    return {
      productName: productName || 'Product van bol.com',
      ean,
      shop: 'bol.com',
      originalUrl: url,
      isValid: !!productName
    }
  } catch (e) {
    return {
      productName: 'Product van bol.com',
      shop: 'bol.com',
      originalUrl: url,
      isValid: false
    }
  }
}

/**
 * Parse Amazon.nl URL
 * Example: https://www.amazon.nl/Apple-iPhone-15-Pro-128GB/dp/B0CHX3TW6P/
 */
function parseAmazonUrl(url: string): ParsedProductUrl {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(p => p)

    // Znajdź nazwę produktu (przed /dp/)
    let productName = ''
    const dpIndex = pathParts.indexOf('dp')
    if (dpIndex > 0) {
      productName = pathParts[dpIndex - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    return {
      productName: productName || 'Product van Amazon',
      shop: 'Amazon.nl',
      originalUrl: url,
      isValid: !!productName
    }
  } catch (e) {
    return {
      productName: 'Product van Amazon',
      shop: 'Amazon.nl',
      originalUrl: url,
      isValid: false
    }
  }
}

/**
 * Parse Coolblue.nl URL
 * Example: https://www.coolblue.nl/product/123456/apple-iphone-15-pro-128gb-zwart
 */
function parseCoolblueUrl(url: string): ParsedProductUrl {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(p => p)

    // Format: /product/id/product-name
    let productName = ''
    const productIndex = pathParts.indexOf('product')
    if (productIndex >= 0 && pathParts[productIndex + 2]) {
      productName = pathParts[productIndex + 2]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    return {
      productName: productName || 'Product van Coolblue',
      shop: 'Coolblue.nl',
      originalUrl: url,
      isValid: !!productName
    }
  } catch (e) {
    return {
      productName: 'Product van Coolblue',
      shop: 'Coolblue.nl',
      originalUrl: url,
      isValid: false
    }
  }
}

/**
 * Parse MediaMarkt.nl URL
 */
function parseMediaMarktUrl(url: string): ParsedProductUrl {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(p => p)

    // Ostatnia część URL to zazwyczaj nazwa produktu
    let productName = ''
    if (pathParts.length > 0) {
      productName = pathParts[pathParts.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    return {
      productName: productName || 'Product van MediaMarkt',
      shop: 'MediaMarkt.nl',
      originalUrl: url,
      isValid: !!productName
    }
  } catch (e) {
    return {
      productName: 'Product van MediaMarkt',
      shop: 'MediaMarkt.nl',
      originalUrl: url,
      isValid: false
    }
  }
}

/**
 * Parse Wehkamp.nl URL
 */
function parseWehkampUrl(url: string): ParsedProductUrl {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(p => p)

    // Ostatnia część URL
    let productName = ''
    if (pathParts.length > 0) {
      productName = pathParts[pathParts.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    return {
      productName: productName || 'Product van Wehkamp',
      shop: 'Wehkamp.nl',
      originalUrl: url,
      isValid: !!productName
    }
  } catch (e) {
    return {
      productName: 'Product van Wehkamp',
      shop: 'Wehkamp.nl',
      originalUrl: url,
      isValid: false
    }
  }
}

/**
 * Parse generic URL (nierozpoznany sklep)
 */
function parseGenericUrl(url: string): ParsedProductUrl {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(p => p)

    // Ostatnia część URL
    let productName = ''
    if (pathParts.length > 0) {
      productName = pathParts[pathParts.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }

    return {
      productName: productName || 'Product',
      shop: urlObj.hostname,
      originalUrl: url,
      isValid: !!productName
    }
  } catch (e) {
    return {
      productName: 'Product',
      shop: 'Unknown',
      originalUrl: url,
      isValid: false
    }
  }
}

/**
 * Check if string is a valid URL
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str)
    return true
  } catch {
    return false
  }
}
