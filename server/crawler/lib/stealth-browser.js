// Stealth Browser - Playwright + Stealth Plugin
// 100% UNDETECTABLE - bypasses Cloudflare, DataDome, PerimeterX
// Residential proxies + fingerprint masking + human behavior

const { chromium } = require('playwright-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')

// Add stealth plugin
chromium.use(StealthPlugin())

// 30+ Real User Agents (Desktop + Mobile)
const USER_AGENTS = [
  // Chrome Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  
  // Chrome Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  
  // Firefox Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
  
  // Firefox Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0',
  
  // Safari Mac
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  
  // Edge Windows
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  
  // Mobile Chrome Android
  'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
  
  // Mobile Safari iPhone
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  
  // Mobile Chrome iOS
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1',
  
  // Tablet iPad
  'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  
  // Linux Chrome
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0'
]

class StealthBrowser {
  constructor(proxyConfig = {}) {
    this.browser = null
    this.context = null
    this.page = null
    this.proxyConfig = proxyConfig
    this.requestCount = 0
    this.proxyRotationInterval = 5 // Rotate proxy every 5 requests
  }

  /**
   * Launch browser with stealth mode + residential proxy
   */
  async launch() {
    const randomUA = this.getRandomUserAgent()
    
    // Proxy configuration (residential)
    const proxyServer = this.getProxyServer()
    
    // Launch args - disable automation detection
    const launchOptions = {
      headless: false,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-gpu',
        '--window-size=1920,1080'
      ]
    }

    // Add proxy if configured
    if (proxyServer) {
      // IPRoyal requires credentials in URL (Playwright limitation)
      if (this.proxyConfig.provider === 'iproyal') {
        launchOptions.proxy = {
          server: proxyServer
        }
      } else {
        // BrightData/SmartProxy use separate auth fields
        launchOptions.proxy = {
          server: proxyServer,
          username: this.proxyConfig.username,
          password: this.proxyConfig.password
        }
      }
    }

    this.browser = await chromium.launch(launchOptions)
    
    // Create context with realistic settings
    this.context = await this.browser.newContext({
      userAgent: randomUA,
      viewport: { width: 1920, height: 1080 },
      locale: 'nl-NL',
      timezoneId: 'Europe/Amsterdam',
      permissions: ['geolocation'],
      geolocation: { latitude: 52.3676, longitude: 4.9041 }, // Amsterdam
      colorScheme: 'light',
      deviceScaleFactor: 1,
      hasTouch: false,
      isMobile: randomUA.includes('Mobile'),
      javaScriptEnabled: true
    })

    // Mask WebGL, Canvas, Audio fingerprints
    await this.context.addInitScript(() => {
      // Override navigator properties
      Object.defineProperty(navigator, 'webdriver', { get: () => false })
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] })
      Object.defineProperty(navigator, 'languages', { get: () => ['nl-NL', 'nl', 'en'] })
      
      // Mask canvas fingerprint
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL
      HTMLCanvasElement.prototype.toDataURL = function(type) {
        if (type === 'image/png' && this.width === 16 && this.height === 16) {
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        }
        return originalToDataURL.apply(this, arguments)
      }
      
      // Mask WebGL fingerprint
      const getParameter = WebGLRenderingContext.prototype.getParameter
      WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return 'Intel Inc.'
        if (parameter === 37446) return 'Intel Iris OpenGL Engine'
        return getParameter.apply(this, arguments)
      }
    })

    this.page = await this.context.newPage()
    
    // Set extra headers
    await this.page.setExtraHTTPHeaders({
      'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Upgrade-Insecure-Requests': '1'
    })

    return this.page
  }

  /**
   * Fetch URL with human-like behavior
   */
  async fetch(url, options = {}) {
    if (!this.page) {
      await this.launch()
    }

    // Check if we need to rotate proxy
    if (this.requestCount > 0 && this.requestCount % this.proxyRotationInterval === 0) {
      console.log(' Rotating proxy...')
      await this.close()
      await this.launch()
    }

    try {
      // Random delay before navigation (3-8 seconds)
      const preDelay = Math.floor(Math.random() * 5000) + 3000
      await this.page.waitForTimeout(preDelay)

      // Navigate to page
      await this.page.goto(url, { waitUntil: 'networkidle', timeout: 70000 })

      // Wait 8 seconds after page load
      await this.page.waitForTimeout(8000)

      // Human-like behavior: random mouse movements
      const mouseMovements = Math.floor(Math.random() * 6) + 3 // 3-8 movements
      for (let i = 0; i < mouseMovements; i++) {
        const x = Math.floor(Math.random() * 1920)
        const y = Math.floor(Math.random() * 1080)
        await this.page.mouse.move(x, y)
        await this.page.waitForTimeout(Math.floor(Math.random() * 300) + 100)
      }

      // Random scrolling (simulate reading)
      const scrolls = Math.floor(Math.random() * 3) + 1 // 1-3 scrolls
      for (let i = 0; i < scrolls; i++) {
        const scrollY = Math.floor(Math.random() * 500) + 200
        await this.page.evaluate((y) => window.scrollBy(0, y), scrollY)
        await this.page.waitForTimeout(Math.floor(Math.random() * 1500) + 800)
      }

      // Wait for page to be fully loaded
      await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})

      // AUTO-CLICK COOKIE BANNERS (Dutch sites)
      await this.handleCookieBanners()

      // Get HTML content
      const html = await this.page.content()

      this.requestCount++

      return html

    } catch (error) {
      console.error('Fetch error:', error.message)
      
      // Check for Cloudflare challenge
      const content = await this.page.content().catch(() => '')
      if (content.includes('cf-browser-verification') || content.includes('Checking your browser')) {
        console.log('⚠️ Cloudflare detected - waiting for challenge...')
        await this.page.waitForTimeout(5000)
        return await this.page.content()
      }

      throw error
    }
  }

  /**
   * Get random user agent
   */
  getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  }

  /**
   * Get proxy server URL
   * Format: http://username:password@proxy-server:port
   */
  getProxyServer() {
    if (!this.proxyConfig.enabled) return null

    const { provider, username, password } = this.proxyConfig

    // BrightData residential proxies
    if (provider === 'brightdata') {
      return `http://${username}:${password}@brd.superproxy.io:22225`
    }

    // IPRoyal residential proxies
    if (provider === 'iproyal') {
      return `http://${username}:${password}@geo.iproyal.com:12321`
    }

    // SmartProxy residential proxies
    if (provider === 'smartproxy') {
      return `http://${username}:${password}@gate.smartproxy.com:7000`
    }

    return null
  }

  /**
   * AUTO-CLICK COOKIE BANNERS
   * SMART DETECTION - automatically finds cookie buttons without hardcoded selectors
   */
  async handleCookieBanners() {
    if (!this.page) return;

    try {
      // Wait longer for cookie banner to appear (some sites load it slowly)
      await this.page.waitForTimeout(3000);

      // SMART DETECTION: Find all buttons and links on page
      const cookieButton = await this.page.evaluate(() => {
        // Keywords that indicate "accept all cookies" in Dutch/English
        const acceptKeywords = [
          'alle cookies toestaan',
          'alles toestaan',
          'accepteren',
          'akkoord',
          'accept all',
          'accept cookies',
          'toestemming',
          'agree',
          'i agree'
        ];

        // Keywords that indicate "reject" or "settings" (avoid these)
        const rejectKeywords = [
          'weigeren',
          'afwijzen',
          'reject',
          'alleen noodzakelijke',
          'alleen essentiële',
          'instellingen',
          'settings',
          'aanpassen',
          'customize'
        ];

        // Find all clickable elements
        const elements = Array.from(document.querySelectorAll('button, a, [role="button"]'));

        // Score each element
        let bestMatch = null;
        let bestScore = 0;

        for (const el of elements) {
          const text = (el.textContent || '').toLowerCase().trim();
          const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
          const className = (el.className || '').toLowerCase();
          const id = (el.id || '').toLowerCase();
          
          const fullText = `${text} ${ariaLabel} ${className} ${id}`;

          // Skip if contains reject keywords
          if (rejectKeywords.some(keyword => fullText.includes(keyword))) {
            continue;
          }

          // Calculate score based on accept keywords
          let score = 0;
          for (const keyword of acceptKeywords) {
            if (fullText.includes(keyword)) {
              score += keyword.length; // Longer matches = higher score
            }
          }

          // Bonus points for being in a modal/dialog
          const isInModal = el.closest('[role="dialog"], .modal, .cookie, [class*="cookie"], [id*="cookie"]');
          if (isInModal) {
            score += 10;
          }

          // Bonus for being a button (not just a link)
          if (el.tagName === 'BUTTON') {
            score += 5;
          }

          // Check if visible
          const rect = el.getBoundingClientRect();
          const isVisible = rect.width > 0 && rect.height > 0;
          if (!isVisible) {
            score = 0; // Invisible = no score
          }

          if (score > bestScore) {
            bestScore = score;
            bestMatch = el;
          }
        }

        // Return the selector for best match
        if (bestMatch && bestScore > 5) {
          // Generate unique selector
          if (bestMatch.id) {
            return `#${bestMatch.id}`;
          }
          
          // Use text content as selector
          const text = bestMatch.textContent.trim();
          if (text) {
            return `text=${text}`;
          }
        }

        return null;
      });

      if (cookieButton) {
        console.log(`[Cookie Banner] 🎯 Smart detection found: ${cookieButton}`);
        
        try {
          // Click using the found selector
          if (cookieButton.startsWith('text=')) {
            const text = cookieButton.substring(5);
            await this.page.click(`text="${text}"`);
          } else {
            await this.page.click(cookieButton);
          }
          
          console.log('[Cookie Banner] ✅ Clicked cookie consent button (smart detection)');
          await this.page.waitForTimeout(2000);
          return;
        } catch (err) {
          console.log('[Cookie Banner] Smart click failed, trying fallback...');
        }
      }

      // Common Dutch cookie consent button selectors
      const cookieSelectors = [
        // Text-based (most reliable) - EXACT matches from screenshots
        'button:has-text("Alle cookies toestaan")',      // Paradigit.nl
        'button:has-text("Alles toestaan")',             // Cameraland.nl
        'button:has-text("Accepteren")',
        'button:has-text("Akkoord")',
        'button:has-text("Accept")',
        'button:has-text("Toestemming")',
        'button:has-text("Alle cookies accepteren")',
        'button:has-text("Toestaan")',
        'a:has-text("Alle cookies toestaan")',
        'a:has-text("Alles toestaan")',
        'a:has-text("Accepteren")',
        'a:has-text("Akkoord")',
        
        // Common class/id names
        '[id*="accept"][id*="cookie"]',
        '[id*="cookie"][id*="accept"]',
        '[class*="accept"][class*="cookie"]',
        '[class*="cookie"][class*="accept"]',
        '[data-consent="accept"]',
        '[data-cookie="accept"]',
        
        // Common frameworks
        '.cookie-consent-accept',
        '.cookie-accept',
        '#cookie-accept',
        '#accept-cookies',
        '.accept-all-cookies',
        
        // Specific Dutch sites
        '[data-testid="cookie-accept"]',
        '[aria-label*="accepteren"]',
        '[aria-label*="akkoord"]'
      ];

      // Try each selector
      for (const selector of cookieSelectors) {
        try {
          // Check if button exists AND is visible
          const button = await this.page.$(selector);
          if (button) {
            const isVisible = await button.isVisible().catch(() => false);
            if (isVisible) {
              console.log(`[Cookie Banner] Found visible button: ${selector}`);
              
              // Scroll button into view (sometimes it's off-screen)
              await button.scrollIntoViewIfNeeded().catch(() => {});
              await this.page.waitForTimeout(500);
              
              // Click the button
              await button.click();
              console.log('[Cookie Banner] ✅ Clicked cookie consent button');
              
              // Wait for banner to disappear
              await this.page.waitForTimeout(2000);
              return; // Success, stop trying
            }
          }
        } catch (err) {
          // Continue to next selector
        }
      }

      console.log('[Cookie Banner] No cookie banner found (or already accepted)');
    } catch (error) {
      console.log('[Cookie Banner] Error handling cookies:', error.message);
    }
  }

  /**
   * Take screenshot (for debugging)
   */
  async screenshot(path = 'screenshot.png') {
    if (this.page) {
      await this.page.screenshot({ path, fullPage: true })
    }
  }

  /**
   * Close browser
   */
  async close() {
    if (this.page) await this.page.close()
    if (this.context) await this.context.close()
    if (this.browser) await this.browser.close()
    
    this.page = null
    this.context = null
    this.browser = null
  }

  /**
   * Get session stats
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      proxyRotations: Math.floor(this.requestCount / this.proxyRotationInterval),
      isActive: this.browser !== null
    }
  }
}

module.exports = StealthBrowser
