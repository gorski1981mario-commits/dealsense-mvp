// Playwright Fallback - For sites that block axios
// Uses stealth plugin to bypass Cloudflare

const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

class PlaywrightFallback {
  constructor() {
    this.browser = null
  }

  async initialize() {
    if (this.browser) return

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    })

    console.log('✓ Playwright browser initialized')
  }

  async fetch(url, options = {}) {
    if (!this.browser) {
      await this.initialize()
    }

    const page = await this.browser.newPage()

    try {
      // Set user agent
      const userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      await page.setUserAgent(userAgent)

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 })

      // Navigate with timeout
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: options.timeout || 30000
      })

      // Wait for content (if selector provided)
      if (options.waitForSelector) {
        await page.waitForSelector(options.waitForSelector, {
          timeout: 10000
        }).catch(() => {
          console.warn(`Selector ${options.waitForSelector} not found, continuing anyway`)
        })
      }

      // Get HTML
      const html = await page.content()

      await page.close()

      return html

    } catch (error) {
      await page.close()
      throw error
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      console.log('✓ Playwright browser closed')
    }
  }
}

// Singleton instance
let instance = null

module.exports = {
  getPlaywright: () => {
    if (!instance) {
      instance = new PlaywrightFallback()
    }
    return instance
  }
}
