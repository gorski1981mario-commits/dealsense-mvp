// Belsimpel.nl Parser - Mobile phones & subscriptions
// Internet/TV/Telefoon comparison

const cheerio = require('cheerio')

module.exports = {
  name: 'belsimpel.nl',
  category: 'diensten',
  subcategory: 'telecom',

  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { serviceType } = jobData.metadata || {}

    if (serviceType === 'mobile') {
      return this.parseMobileSubscriptions($, jobData)
    }

    return this.parsePhoneOffers($, jobData)
  },

  parseMobileSubscriptions($, jobData) {
    const providers = []

    $('.subscription-item, .abonnement-item, .sim-only-item').each((i, el) => {
      const provider = $(el).find('.provider-name, .aanbieder').text().trim()
      const plan = $(el).find('.plan-name, .abonnement-naam').text().trim()
      const price = $(el).find('.price, .prijs').text().trim()
      const data = $(el).find('.data-amount, .data').text().trim()
      const minutes = $(el).find('.minutes, .bellen').text().trim()
      const sms = $(el).find('.sms').text().trim()

      if (provider && price) {
        providers.push({
          provider,
          plan,
          monthlyPrice: this.parsePrice(price),
          data: this.parseData(data),
          minutes: this.parseMinutes(minutes),
          sms: this.parseSMS(sms),
          contractLength: this.parseContractLength($(el).find('.contract-length').text()),
          url: $(el).find('a').attr('href')
        })
      }
    })

    providers.sort((a, b) => a.monthlyPrice - b.monthlyPrice)

    return {
      category: 'diensten',
      subcategory: 'telecom-mobile',
      source: 'belsimpel.nl',
      providers: providers.slice(0, 10),
      scrapedAt: Date.now()
    }
  },

  parsePhoneOffers($, jobData) {
    const offers = []

    $('.phone-item, .toestel-item').each((i, el) => {
      const phone = $(el).find('.phone-name, h3').text().trim()
      const price = $(el).find('.price, .prijs').text().trim()
      const subscription = $(el).find('.subscription-price').text().trim()

      if (phone && price) {
        offers.push({
          phone,
          oneTimePrice: this.parsePrice(price),
          monthlySubscription: this.parsePrice(subscription),
          totalCost: this.parsePrice(price) + (this.parsePrice(subscription) * 24),
          url: $(el).find('a').attr('href')
        })
      }
    })

    return {
      category: 'products',
      subcategory: 'telefoons',
      source: 'belsimpel.nl',
      offers: offers.slice(0, 20),
      scrapedAt: Date.now()
    }
  },

  parsePrice(priceStr) {
    if (!priceStr) return 0
    
    const cleaned = priceStr
      .replace(/[€$£]/g, '')
      .replace(/per maand|\/maand|p\/m/gi, '')
      .replace(/\s+/g, '')
      .replace(',', '.')
      .trim()

    const price = parseFloat(cleaned)
    return isNaN(price) ? 0 : price
  },

  parseData(dataStr) {
    if (!dataStr) return 0
    if (dataStr.toLowerCase().includes('onbeperkt')) return 999999
    
    const match = dataStr.match(/(\d+)\s*(gb|mb)/i)
    if (!match) return 0

    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()

    return unit === 'gb' ? value * 1024 : value // Convert to MB
  },

  parseMinutes(minutesStr) {
    if (!minutesStr) return 0
    if (minutesStr.toLowerCase().includes('onbeperkt')) return 999999
    
    const match = minutesStr.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  },

  parseSMS(smsStr) {
    if (!smsStr) return 0
    if (smsStr.toLowerCase().includes('onbeperkt')) return 999999
    
    const match = smsStr.match(/(\d+)/)
    return match ? parseInt(match[1]) : 0
  },

  parseContractLength(lengthStr) {
    if (!lengthStr) return 0
    const match = lengthStr.match(/(\d+)\s*(jaar|maand)/i)
    if (!match) return 0

    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()

    return unit.includes('jaar') ? value * 12 : value
  }
}
