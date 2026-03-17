// Human Behavior Simulator - Advanced Anti-Bot Protection
// Makes crawler 100% undetectable by mimicking real human browsing patterns

const crypto = require('crypto')

class HumanBehavior {
  constructor() {
    // Session fingerprint - unique per crawler instance
    this.sessionId = crypto.randomBytes(16).toString('hex')
    this.sessionStart = Date.now()
    this.requestCount = 0
    this.lastRequestTime = 0
    
    // Behavioral patterns
    this.typingSpeed = this.randomBetween(40, 80) // chars per minute
    this.readingSpeed = this.randomBetween(200, 300) // words per minute
    this.mouseMovementStyle = this.randomChoice(['smooth', 'jerky', 'precise'])
  }

  /**
   * Generate human-like delay before request
   * Simulates: thinking time, reading, scrolling, mouse movement
   */
  async beforeRequest(url, context = {}) {
    const delays = []
    
    // 1. Simulate page reading time (if coming from another page)
    if (this.lastRequestTime > 0) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime
      
      // If too fast, add reading delay
      if (timeSinceLastRequest < 2000) {
        const readingDelay = this.randomBetween(1500, 4000)
        delays.push({ type: 'reading', duration: readingDelay })
      }
    }
    
    // 2. Simulate mouse movement to link (100-500ms)
    const mouseDelay = this.randomBetween(100, 500)
    delays.push({ type: 'mouse_movement', duration: mouseDelay })
    
    // 3. Random "thinking" pause (humans don't click instantly)
    if (Math.random() > 0.7) {
      const thinkingDelay = this.randomBetween(300, 1200)
      delays.push({ type: 'thinking', duration: thinkingDelay })
    }
    
    // 4. Simulate scroll behavior (sometimes people scroll before clicking)
    if (Math.random() > 0.6) {
      const scrollDelay = this.randomBetween(200, 800)
      delays.push({ type: 'scrolling', duration: scrollDelay })
    }
    
    // Execute all delays
    const totalDelay = delays.reduce((sum, d) => sum + d.duration, 0)
    await this.sleep(totalDelay)
    
    this.lastRequestTime = Date.now()
    this.requestCount++
    
    return {
      delays,
      totalDelay,
      sessionDuration: Date.now() - this.sessionStart
    }
  }

  /**
   * Generate realistic browser headers
   * Rotates between different browser profiles
   */
  generateHeaders(url) {
    const profiles = this.getBrowserProfiles()
    const profile = this.randomChoice(profiles)
    
    // Base headers
    const headers = {
      'User-Agent': profile.userAgent,
      'Accept': profile.accept,
      'Accept-Language': this.getAcceptLanguage(),
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': Math.random() > 0.5 ? '1' : undefined, // Some users have DNT
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': this.getSecFetchSite(url),
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    }
    
    // Add referer (simulate coming from Google/previous page)
    if (this.requestCount > 0 && Math.random() > 0.3) {
      headers['Referer'] = this.generateReferer(url)
    }
    
    // Add viewport size (from browser)
    if (Math.random() > 0.5) {
      headers['Viewport-Width'] = this.randomChoice(['1920', '1366', '1440', '2560'])
    }
    
    // Remove undefined values
    Object.keys(headers).forEach(key => {
      if (headers[key] === undefined) delete headers[key]
    })
    
    return headers
  }

  /**
   * Browser profiles - real browser fingerprints
   */
  getBrowserProfiles() {
    return [
      // Chrome on Windows
      {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        platform: 'Win32'
      },
      // Chrome on Mac
      {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        platform: 'MacIntel'
      },
      // Firefox on Windows
      {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        platform: 'Win32'
      },
      // Safari on Mac
      {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        platform: 'MacIntel'
      },
      // Edge on Windows
      {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        platform: 'Win32'
      }
    ]
  }

  /**
   * Generate Accept-Language header
   * Prioritize Dutch but include English (realistic for NL users)
   */
  getAcceptLanguage() {
    const patterns = [
      'nl-NL,nl;q=0.9,en;q=0.8',
      'nl,en-US;q=0.9,en;q=0.8',
      'nl-NL,nl;q=0.9,en-US;q=0.8,en;q=0.7',
      'nl;q=0.9,en;q=0.8,de;q=0.7'
    ]
    return this.randomChoice(patterns)
  }

  /**
   * Generate realistic referer
   */
  generateReferer(currentUrl) {
    const domain = new URL(currentUrl).hostname
    
    // 60% chance: Google search
    if (Math.random() > 0.4) {
      const searchTerms = [
        'beste prijs',
        'goedkoopste',
        'aanbieding',
        'vergelijk prijzen',
        'online kopen'
      ]
      const term = this.randomChoice(searchTerms)
      return `https://www.google.nl/search?q=${encodeURIComponent(term + ' ' + domain)}`
    }
    
    // 30% chance: Direct navigation (no referer)
    if (Math.random() > 0.7) {
      return undefined
    }
    
    // 10% chance: Social media
    const social = ['facebook.com', 'twitter.com', 'linkedin.com']
    return `https://www.${this.randomChoice(social)}/`
  }

  /**
   * Determine Sec-Fetch-Site based on navigation pattern
   */
  getSecFetchSite(url) {
    if (this.requestCount === 0) {
      return 'none' // First request (direct navigation)
    }
    
    // Simulate cross-site navigation sometimes
    if (Math.random() > 0.8) {
      return 'cross-site'
    }
    
    return 'same-origin'
  }

  /**
   * Generate realistic cookie behavior
   */
  generateCookies(domain) {
    const cookies = []
    
    // Session cookie
    cookies.push({
      name: '_session',
      value: crypto.randomBytes(16).toString('hex'),
      domain,
      path: '/',
      httpOnly: true
    })
    
    // Analytics cookies (Google Analytics simulation)
    if (Math.random() > 0.3) {
      cookies.push({
        name: '_ga',
        value: `GA1.2.${Math.floor(Math.random() * 1000000000)}.${Math.floor(Date.now() / 1000)}`,
        domain,
        path: '/'
      })
    }
    
    // Consent cookie (GDPR)
    if (Math.random() > 0.5) {
      cookies.push({
        name: 'cookie_consent',
        value: 'accepted',
        domain,
        path: '/'
      })
    }
    
    return cookies
  }

  /**
   * Simulate random browsing patterns
   * Returns array of actions to take (scroll, wait, click, etc.)
   */
  generateBrowsingPattern(pageType = 'product') {
    const actions = []
    
    // Initial page load wait
    actions.push({
      type: 'wait',
      duration: this.randomBetween(500, 1500),
      reason: 'page_load'
    })
    
    // Scroll down (humans always scroll)
    const scrolls = this.randomBetween(1, 4)
    for (let i = 0; i < scrolls; i++) {
      actions.push({
        type: 'scroll',
        distance: this.randomBetween(200, 800),
        duration: this.randomBetween(300, 1000)
      })
      
      // Pause after scroll (reading)
      actions.push({
        type: 'wait',
        duration: this.randomBetween(800, 2500),
        reason: 'reading'
      })
    }
    
    // Mouse movements (simulate hovering over elements)
    if (Math.random() > 0.5) {
      actions.push({
        type: 'mouse_move',
        movements: this.randomBetween(3, 8),
        duration: this.randomBetween(100, 400)
      })
    }
    
    // Sometimes scroll back up
    if (Math.random() > 0.7) {
      actions.push({
        type: 'scroll',
        distance: -this.randomBetween(200, 500),
        duration: this.randomBetween(300, 800)
      })
    }
    
    return actions
  }

  /**
   * Add random jitter to timing
   * Prevents detection of too-regular patterns
   */
  addJitter(baseDelay, jitterPercent = 0.3) {
    const jitter = baseDelay * jitterPercent
    return baseDelay + this.randomBetween(-jitter, jitter)
  }

  /**
   * Simulate typing behavior (for search forms)
   */
  async simulateTyping(text) {
    const delays = []
    
    for (let i = 0; i < text.length; i++) {
      // Variable typing speed (humans don't type at constant speed)
      const charDelay = this.randomBetween(50, 150)
      
      // Occasional longer pauses (thinking about next word)
      if (text[i] === ' ' && Math.random() > 0.7) {
        delays.push(this.randomBetween(200, 500))
      } else {
        delays.push(charDelay)
      }
    }
    
    const totalDelay = delays.reduce((a, b) => a + b, 0)
    await this.sleep(totalDelay)
    
    return totalDelay
  }

  /**
   * Random number between min and max
   */
  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  /**
   * Random choice from array
   */
  randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  /**
   * Sleep for specified duration
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Get session statistics
   */
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.sessionStart,
      requestCount: this.requestCount,
      avgRequestInterval: this.requestCount > 1 ? 
        (Date.now() - this.sessionStart) / this.requestCount : 0
    }
  }
}

module.exports = HumanBehavior
