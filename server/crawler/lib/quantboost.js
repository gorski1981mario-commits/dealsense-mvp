// QuantBoost (Kwant) - Enrichment & Warm-up Layer
// Crawls 25-50 domains per EAN in background

const axios = require('axios')

class QuantBoost {
  constructor(crawler) {
    this.crawler = crawler
    this.enabled = process.env.QUANTBOOST_ENABLED === 'true'
    this.domains = this.loadDomains()
  }

  loadDomains() {
    // TOP 50 domains for warm-up
    return [
      'bol.com',
      'coolblue.nl',
      'mediamarkt.nl',
      'amazon.nl',
      'wehkamp.nl',
      'alternate.nl',
      'azerty.nl',
      'paradigit.nl',
      'megekko.nl',
      'informatique.nl',
      'centralpoint.nl',
      'mycom.nl',
      'afuture.nl',
      'amac.nl',
      'expert.nl',
      'bcc.nl',
      'gamma.nl',
      'praxis.nl',
      'karwei.nl',
      'hornbach.nl',
      'ikea.nl',
      'leen-bakker.nl',
      'kwantum.nl',
      'decathlon.nl',
      'intersport.nl',
      'bever.nl',
      'h-m.nl',
      'zara.com',
      'c-a.nl',
      'we-fashion.nl',
      'nike.com',
      'adidas.nl',
      'puma.nl',
      'blokker.nl',
      'hema.nl',
      'xenos.nl',
      'action.com',
      'kruidvat.nl',
      'etos.nl',
      'prenatal.nl',
      'babypark.nl',
      'intertoys.nl',
      'bart-smit.nl',
      'toys-xl.nl',
      'fietsenwinkel.nl',
      'mantel.com',
      'bike-totaal.nl',
      'gazelle.nl',
      'batavus.nl',
      'sparta.nl'
    ]
  }

  /**
   * Enqueue warm-up jobs for EAN
   * Crawls 25-50 domains in background
   */
  async warmUp(ean, options = {}) {
    if (!this.enabled) {
      console.log('QuantBoost disabled')
      return
    }

    const {
      maxDomains = 50,
      priority = 5 // Low priority (background)
    } = options

    console.log(`🔥 QuantBoost warming up EAN: ${ean}`)

    // Select domains to crawl
    const selectedDomains = this.selectDomains(ean, maxDomains)

    // Enqueue crawl jobs (non-blocking)
    const jobs = []
    for (const domain of selectedDomains) {
      const url = this.buildSearchUrl(domain, ean)
      
      const job = this.crawler.enqueue(url, {
        category: 'products',
        ean,
        priority,
        metadata: {
          source: 'quantboost',
          domain
        }
      }).catch(error => {
        console.error(`QuantBoost failed for ${domain}:`, error.message)
      })

      jobs.push(job)
    }

    // Wait for all jobs to be enqueued (not completed)
    await Promise.all(jobs)

    console.log(`✓ QuantBoost enqueued ${jobs.length} jobs for ${ean}`)
  }

  /**
   * Select which domains to crawl for this EAN
   * Uses ranking/rotation to prioritize best domains
   */
  selectDomains(ean, maxDomains) {
    // For now, use top N domains
    // TODO: Add domain ranking based on historical success rate
    return this.domains.slice(0, maxDomains)
  }

  /**
   * Build search URL for domain + EAN
   */
  buildSearchUrl(domain, ean) {
    const searchPatterns = {
      'bol.com': `https://www.bol.com/nl/s/?searchtext=${ean}`,
      'coolblue.nl': `https://www.coolblue.nl/zoeken?query=${ean}`,
      'mediamarkt.nl': `https://www.mediamarkt.nl/nl/search.html?query=${ean}`,
      'amazon.nl': `https://www.amazon.nl/s?k=${ean}`,
      'wehkamp.nl': `https://www.wehkamp.nl/search/${ean}/`,
      // Add more patterns as needed
      'default': `https://www.${domain}/search?q=${ean}`
    }

    return searchPatterns[domain] || searchPatterns['default']
  }

  /**
   * Get enrichment stats
   */
  getStats() {
    return {
      enabled: this.enabled,
      domains: this.domains.length,
      maxDomainsPerEAN: 50
    }
  }
}

module.exports = { QuantBoost }
