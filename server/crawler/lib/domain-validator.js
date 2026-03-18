// Domain Validator - Filter out young/untrusted domains
// Ensures we only show offers from established, trusted shops

const axios = require('axios')

class DomainValidator {
  constructor(config = {}) {
    this.minDomainAge = config.minDomainAge || 365 // 1 year in days
    this.cache = new Map()
    this.cacheTTL = 7 * 24 * 60 * 60 * 1000 // 7 days
  }

  /**
   * Check if domain is old enough (trusted)
   * Filters out new domains that might be scams
   */
  async isValidDomain(domain) {
    // Check cache first
    const cached = this.cache.get(domain)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.valid
    }

    // Whitelist: Known trusted domains (skip age check)
    const trustedDomains = [
      'bol.com',
      'coolblue.nl',
      'mediamarkt.nl',
      'amazon.nl',
      'wehkamp.nl',
      'alternate.nl',
      'azerty.nl',
      'belsimpel.nl',
      'gaslicht.com',
      'independer.nl',
      'booking.com',
      'hypotheker.nl',
      'geldshop.nl',
      'directlease.nl'
    ]

    if (trustedDomains.some(trusted => domain.includes(trusted))) {
      this.cacheResult(domain, true)
      return true
    }

    // Check domain age via WHOIS API
    try {
      const age = await this.getDomainAge(domain)
      const valid = age >= this.minDomainAge

      this.cacheResult(domain, valid)

      if (!valid) {
        console.log(`⚠️  Domain ${domain} too young (${age} days) - filtered out`)
      }

      return valid

    } catch (error) {
      console.error(`Failed to check domain age for ${domain}:`, error.message)
      // On error, allow domain (don't block legitimate shops due to API issues)
      return true
    }
  }

  /**
   * Get domain age in days
   * Uses WHOIS API to check domain registration date
   */
  async getDomainAge(domain) {
    // IMPORTANT: In production, use WHOIS API service
    // Options: whoisxmlapi.com, whois.domaintools.com
    
    /* PRODUCTION CODE:
    const response = await axios.get(`https://www.whoisxmlapi.com/whoisserver/WhoisService`, {
      params: {
        apiKey: process.env.WHOIS_API_KEY,
        domainName: domain,
        outputFormat: 'JSON'
      }
    })

    const createdDate = new Date(response.data.WhoisRecord.createdDate)
    const ageInDays = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))
    
    return ageInDays
    */

    // MOCK: For testing, return random age
    // In production, replace with real WHOIS API call
    const mockAge = Math.floor(Math.random() * 3000) // 0-3000 days
    return mockAge
  }

  /**
   * Cache domain validation result
   */
  cacheResult(domain, valid) {
    this.cache.set(domain, {
      valid,
      timestamp: Date.now()
    })
  }

  /**
   * Get validation stats
   */
  getStats() {
    return {
      cachedDomains: this.cache.size,
      minDomainAge: this.minDomainAge
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }
}

module.exports = { DomainValidator }
