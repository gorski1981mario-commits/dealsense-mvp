// Parser Registry - Manages all domain-specific parsers

const fs = require('fs')
const path = require('path')

class ParserRegistry {
  constructor() {
    this.parsers = new Map()
    this.genericParsers = new Map()
  }

  /**
   * Load all parsers from parsers/ directory
   */
  loadAll() {
    const parsersDir = path.join(__dirname, '../parsers')
    
    // Load generic parsers
    this.loadGenericParsers(parsersDir)
    
    // Load domain-specific parsers
    this.loadDomainParsers(parsersDir)
    
    console.log(`Loaded ${this.parsers.size} domain parsers + ${this.genericParsers.size} generic parsers`)
  }

  /**
   * Load generic parsers (fallback)
   */
  loadGenericParsers(dir) {
    const genericDir = path.join(dir, 'generic')
    
    if (!fs.existsSync(genericDir)) {
      console.warn('Generic parsers directory not found')
      return
    }

    const files = fs.readdirSync(genericDir).filter(f => f.endsWith('.js'))
    
    for (const file of files) {
      const category = file.replace('.js', '')
      const parser = require(path.join(genericDir, file))
      this.genericParsers.set(category, parser)
    }
  }

  /**
   * Load domain-specific parsers
   */
  loadDomainParsers(dir) {
    const domainsDir = path.join(dir, 'domains')
    
    if (!fs.existsSync(domainsDir)) {
      console.warn('Domain parsers directory not found')
      return
    }

    const files = fs.readdirSync(domainsDir).filter(f => f.endsWith('.js'))
    
    for (const file of files) {
      const domain = file.replace('.js', '')
      const parser = require(path.join(domainsDir, file))
      this.parsers.set(domain, parser)
    }
  }

  /**
   * Get parser for domain and category
   */
  getParser(domain, category) {
    // Try domain-specific parser first
    if (this.parsers.has(domain)) {
      return this.parsers.get(domain)
    }

    // Fallback to generic parser for category
    if (this.genericParsers.has(category)) {
      return this.genericParsers.get(category)
    }

    // Ultimate fallback - generic product parser
    return this.genericParsers.get('products') || {
      parse: () => {
        throw new Error(`No parser found for ${domain} (${category})`)
      }
    }
  }

  /**
   * Register new parser dynamically
   */
  register(domain, parser) {
    this.parsers.set(domain, parser)
  }

  /**
   * Get all registered parsers
   */
  list() {
    return {
      domains: Array.from(this.parsers.keys()),
      generic: Array.from(this.genericParsers.keys())
    }
  }

  /**
   * Count total parsers
   */
  count() {
    return this.parsers.size + this.genericParsers.size
  }
}

module.exports = { ParserRegistry }
