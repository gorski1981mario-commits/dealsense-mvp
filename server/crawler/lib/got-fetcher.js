// Got Fetcher - Fast HTTP client with proxy support
// Works with IPRoyal Residential proxy (Playwright doesn't)
// Use for simple HTML pages, fallback to Playwright for JS-heavy sites

const got = require('got');
const cheerio = require('cheerio');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
];

class GotFetcher {
  constructor(proxyConfig = {}) {
    this.proxyConfig = proxyConfig;
    this.requestCount = 0;
  }

  /**
   * Check if URL exists (HEAD request) - szybkie sprawdzenie bez pobierania HTML
   */
  async checkUrl(url) {
    try {
      const response = await got.head(url, {
        ...this.getGotOptions(),
        timeout: { request: 5000 }, // 5s timeout
        retry: { limit: 0 }
      });
      
      return { ok: response.statusCode >= 200 && response.statusCode < 400 };
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  /**
   * Fetch URL with got + proxy
   */
  async fetch(url, options = {}) {
    const randomUA = this.getRandomUserAgent();
    
    const gotOptions = {
      headers: {
        'User-Agent': randomUA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'nl-NL,nl;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: {
        request: 30000
      },
      retry: {
        limit: 2,
        methods: ['GET']
      },
      followRedirect: true,
      maxRedirects: 5
    };

    // Add proxy if configured
    if (this.proxyConfig.enabled) {
      const proxyUrl = this.getProxyUrl();
      if (proxyUrl) {
        gotOptions.proxy = proxyUrl;
      }
    }

    try {
      const response = await got(url, gotOptions);
      this.requestCount++;
      return response.body;
      
    } catch (error) {
      // Check if it's a Cloudflare/JS challenge
      if (error.response && error.response.body) {
        const body = error.response.body;
        if (body.includes('cf-browser-verification') || 
            body.includes('Checking your browser') ||
            body.includes('__cf_chl_jschl_tk__')) {
          throw new Error('NEEDS_PLAYWRIGHT'); // Signal to use Playwright instead
        }
      }
      
      throw error;
    }
  }

  /**
   * Get proxy URL with credentials
   */
  getProxyUrl() {
    if (!this.proxyConfig.enabled) return null;

    const { provider, username, password } = this.proxyConfig;

    // IPRoyal residential proxies
    if (provider === 'iproyal') {
      return `http://${username}:${password}@geo.iproyal.com:12321`;
    }

    // BrightData residential proxies
    if (provider === 'brightdata') {
      return `http://${username}:${password}@brd.superproxy.io:22225`;
    }

    // SmartProxy residential proxies
    if (provider === 'smartproxy') {
      return `http://${username}:${password}@gate.smartproxy.com:7000`;
    }

    return null;
  }

  /**
   * Get random user agent
   */
  getRandomUserAgent() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  /**
   * Check if page needs JavaScript rendering
   */
  needsJavaScript(html) {
    const $ = cheerio.load(html);
    
    // Check for common JS framework indicators
    const hasReact = html.includes('react') || html.includes('__NEXT_DATA__');
    const hasVue = html.includes('vue') || html.includes('v-app');
    const hasAngular = html.includes('ng-app') || html.includes('angular');
    const hasSPA = $('div[id="app"]').length > 0 || $('div[id="root"]').length > 0;
    
    // Check if content is minimal (likely needs JS)
    const textContent = $('body').text().trim();
    const hasMinimalContent = textContent.length < 500;
    
    return hasReact || hasVue || hasAngular || hasSPA || hasMinimalContent;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      provider: this.proxyConfig.provider,
      enabled: this.proxyConfig.enabled
    };
  }
}

module.exports = GotFetcher;
