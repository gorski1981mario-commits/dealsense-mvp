// DirectLease.nl Parser - Car leasing
// Finance category - Leasing

const cheerio = require('cheerio')

module.exports = {
  name: 'directlease.nl',
  category: 'finance',
  subcategory: 'leasing',

  parse(html, jobData) {
    const $ = cheerio.load(html)
    const { carModel, duration } = jobData.metadata || {}

    return this.parseLeaseOffers($, carModel, duration)
  },

  parseLeaseOffers($, carModel, duration) {
    const offers = []

    $('.lease-offer, .auto-item, .car-lease-item').each((i, el) => {
      const car = $(el).find('.car-name, .model').text().trim()
      const monthlyPrice = $(el).find('.monthly-price, .maandbedrag').text().trim()
      const downPayment = $(el).find('.down-payment, .aanbetaling').text().trim()
      const mileage = $(el).find('.mileage, .km-stand').text().trim()
      const duration = $(el).find('.duration, .looptijd').text().trim()
      const fuelType = $(el).find('.fuel-type, .brandstof').text().trim()

      if (car && monthlyPrice) {
        offers.push({
          car,
          monthlyPrice: this.parsePrice(monthlyPrice),
          downPayment: this.parsePrice(downPayment) || 0,
          mileage: this.parseMileage(mileage),
          duration: this.parseDuration(duration) || 60,
          fuelType: fuelType || 'Benzine',
          totalCost: this.calculateTotalCost(
            this.parsePrice(monthlyPrice),
            this.parseDuration(duration) || 60,
            this.parsePrice(downPayment) || 0
          ),
          url: $(el).find('a').attr('href')
        })
      }
    })

    // Sort by monthly price
    offers.sort((a, b) => a.monthlyPrice - b.monthlyPrice)

    return {
      category: 'finance',
      subcategory: 'leasing',
      source: 'directlease.nl',
      carModel,
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

  parseMileage(mileageStr) {
    if (!mileageStr) return 0
    
    const match = mileageStr.match(/(\d+\.?\d*)\s*(km|kilometer)/i)
    if (!match) return 0

    return parseFloat(match[1].replace('.', ''))
  },

  parseDuration(durationStr) {
    if (!durationStr) return 0
    
    const match = durationStr.match(/(\d+)\s*(maand|month)/i)
    return match ? parseInt(match[1]) : 0
  },

  calculateTotalCost(monthlyPrice, months, downPayment) {
    return (monthlyPrice * months) + downPayment
  }
}
