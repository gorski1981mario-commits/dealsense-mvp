# Anti-Block Strategy - Optymalna Ścieżka Unikania Blokad

## 🎯 TWOJE RADY - ANALIZA:

### ✅ **CO JEST ŚWIETNE:**
1. **Python + requests + fake user agent** - Prosty start ✅
2. **Darmowe proxy** - Tańsze na start ✅
3. **Playwright stealth** - Fallback dla trudnych sites ✅
4. **ScrapingBee** - Last resort (€150/mies) ✅
5. **Szablon parsera** - Copy-paste friendly ✅
6. **Delays 5-10s** - KLUCZOWE! ✅
7. **Error logging** - Monitoring layout changes ✅
8. **Cron job** - Co 30 min ✅

### ⚠️ **CO MOŻNA POPRAWIĆ:**
- Node.js lepsze dla DealSense (już używasz)
- Residential proxies > darmowe (ale droższe)
- Rate limiting > delays (bardziej precyzyjne)

---

## 🚀 **OPTYMALNA ŚCIEŻKA - 3 POZIOMY:**

### **POZIOM 1: PROSTY START (90% sklepów)**
```
axios + cheerio
+ fake user agent
+ darmowe proxy (optional)
+ delays 5-10s
+ retry 3x
```

**Koszty:** €0-50/mies  
**Success rate:** 85-90%  
**Dla:** Bol, Coolblue, MediaMarkt, IKEA, Decathlon

---

### **POZIOM 2: TRUDNE SKLEPY (8% sklepów)**
```
Playwright + stealth plugin
+ residential proxy
+ delays 5-10s
+ retry 3x
```

**Koszty:** €100-300/mies  
**Success rate:** 95%+  
**Dla:** Amazon, Independer, niektóre banki

---

### **POZIOM 3: BARDZO TRUDNE (2% sklepów)**
```
ScrapingBee API
+ €150/mies (100k requests)
```

**Success rate:** 99%+  
**Dla:** Sites z Cloudflare Enterprise, Akamai Bot Manager

---

## 💡 **MOJA REKOMENDACJA - HYBRID APPROACH:**

### **Strategia Fallback:**

```javascript
async function crawl(url) {
  // Try 1: Prosty axios (90% success)
  try {
    return await crawlWithAxios(url)
  } catch (error) {
    console.log('Axios failed, trying Playwright...')
  }

  // Try 2: Playwright stealth (95% success)
  try {
    return await crawlWithPlaywright(url)
  } catch (error) {
    console.log('Playwright failed, trying ScrapingBee...')
  }

  // Try 3: ScrapingBee (99% success)
  try {
    return await crawlWithScrapingBee(url)
  } catch (error) {
    console.error('All methods failed!')
    throw error
  }
}
```

**Koszty:**
- 90% requestów: €0 (axios)
- 8% requestów: €100/mies (playwright + proxy)
- 2% requestów: €30/mies (ScrapingBee)
- **TOTAL: €130/mies** (vs €300 residential proxies dla wszystkich)

---

## 🛡️ **ANTI-BLOCK TECHNIQUES:**

### **1. DELAYS (KLUCZOWE!):**

```javascript
// ❌ ZŁE - instant ban
for (const url of urls) {
  await fetch(url)
}

// ✅ DOBRE - human-like
for (const url of urls) {
  await fetch(url)
  await sleep(randomBetween(5000, 10000)) // 5-10s
}

// ✅ NAJLEPSZE - per-domain rate limiting
const rateLimiter = new RateLimiter({
  'bol.com': 30, // 30 req/min = 2s between requests
  'amazon.nl': 15, // 15 req/min = 4s between requests
  default: 20 // 20 req/min = 3s between requests
})

await rateLimiter.wait('bol.com')
await fetch(url)
```

**Dlaczego to działa:**
- Człowiek nie klika 100x/minutę
- Sklepy trackują request frequency
- Random delays (5-10s) wyglądają naturalnie

---

### **2. FAKE USER AGENT (MUST-HAVE):**

```javascript
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
]

const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)]

await fetch(url, {
  headers: { 'User-Agent': randomUA }
})
```

---

### **3. DARMOWE PROXY (START):**

```javascript
// Free proxy lists (niestabilne, ale za darmo)
const freeProxies = [
  'http://proxy1.com:8080',
  'http://proxy2.com:8080',
  // ... z free-proxy-list.net
]

// Lub używaj bez proxy na start
// Większość NL sklepów nie blokuje pojedynczych IP
```

**Kiedy potrzebujesz proxy:**
- Robisz >100 requestów/dzień do tego samego sklepu
- Sklep ma aggressive rate limiting
- Testujesz z tego samego IP co development

**Kiedy NIE potrzebujesz:**
- <50 requestów/dzień per sklep
- Masz delays 5-10s
- Sklep nie ma bot protection

---

### **4. PLAYWRIGHT STEALTH (FALLBACK):**

```javascript
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

async function crawlWithPlaywright(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu'
    ]
  })

  const page = await browser.newPage()
  
  // Set user agent
  await page.setUserAgent(randomUA)
  
  // Navigate
  await page.goto(url, { waitUntil: 'networkidle2' })
  
  // Wait for content
  await page.waitForSelector('.product-item', { timeout: 10000 })
  
  // Extract HTML
  const html = await page.content()
  
  await browser.close()
  
  return html
}
```

**Koszty:**
- Server RAM: +2GB (€10-20/mies extra)
- Wolniejsze: 2-5s per request (vs 500ms axios)

**Kiedy używać:**
- Axios fails z 403/Cloudflare
- Site wymaga JavaScript rendering
- Dynamic content loading

---

### **5. SCRAPINGBEE (LAST RESORT):**

```javascript
const ScrapingBee = require('scrapingbee')
const client = new ScrapingBee({ apiKey: process.env.SCRAPINGBEE_KEY })

async function crawlWithScrapingBee(url) {
  const response = await client.get({
    url: url,
    params: {
      render_js: 'true',
      premium_proxy: 'true',
      country_code: 'nl'
    }
  })
  
  return response.data
}
```

**Koszty:**
- €49/mies: 100k requests
- €99/mies: 250k requests
- €149/mies: 500k requests

**Kiedy używać:**
- Playwright fails
- Cloudflare Enterprise
- Akamai Bot Manager
- Bardzo ważny sklep (np. Amazon)

---

## 📊 **ERROR LOGGING & MONITORING:**

### **Problem: Sklep zmienia layout → crawler padnie**

**Rozwiązanie:**

```javascript
// 1. Loguj każdy failed parse
function parseProduct($, url) {
  try {
    const title = $('.product-title').text().trim()
    const price = $('.price').text().trim()
    
    if (!title || !price) {
      // Log missing data
      logger.error('Parse failed - missing data', {
        url,
        hasTitle: !!title,
        hasPrice: !!price,
        html: $.html().substring(0, 500) // First 500 chars
      })
      
      // Send alert
      sendSlackAlert(`⚠️ Parser failed for ${url}`)
      
      return null
    }
    
    return { title, price }
    
  } catch (error) {
    logger.error('Parse exception', { url, error: error.message })
    return null
  }
}

// 2. Monitor success rate
const stats = {
  'bol.com': { success: 95, failed: 5 },
  'coolblue.nl': { success: 98, failed: 2 }
}

// Alert if success rate drops below 90%
if (stats['bol.com'].success < 90) {
  sendSlackAlert('🚨 Bol.com parser success rate dropped to 85%!')
}

// 3. Daily health check
cron.schedule('0 9 * * *', async () => {
  // Test each parser with known product
  const testUrls = {
    'bol.com': 'https://bol.com/product/123',
    'coolblue.nl': 'https://coolblue.nl/product/456'
  }
  
  for (const [domain, url] of Object.entries(testUrls)) {
    const result = await crawl(url)
    if (!result || !result.offers.length) {
      sendSlackAlert(`❌ ${domain} parser broken!`)
    }
  }
})
```

---

## 🔄 **CRON JOB - CO 30 MIN:**

```javascript
// Option 1: Vercel Cron (serverless)
// vercel.json
{
  "crons": [{
    "path": "/api/cron/crawler",
    "schedule": "*/30 * * * *"
  }]
}

// Option 2: PM2 (VPS)
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'crawler',
    script: './crawler/index.js',
    cron_restart: '*/30 * * * *'
  }]
}

// Option 3: GitHub Actions (free!)
// .github/workflows/crawler.yml
name: Crawler
on:
  schedule:
    - cron: '*/30 * * * *'
jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: node crawler/index.js
```

---

## 📝 **SZABLON PARSERA (COPY-PASTE FRIENDLY):**

```javascript
// Template: parsers/domains/TEMPLATE.js
const cheerio = require('cheerio')

module.exports = {
  name: 'DOMAIN.nl', // CHANGE THIS
  category: 'products', // CHANGE THIS
  
  parse(html, jobData) {
    const $ = cheerio.load(html)
    const products = []
    
    // CHANGE SELECTORS BELOW
    $('.product-item').each((i, el) => {
      const title = $(el).find('.title').text().trim()
      const price = $(el).find('.price').text().trim()
      const url = $(el).find('a').attr('href')
      
      if (title && price) {
        products.push({
          title,
          price: this.parsePrice(price),
          url: url?.startsWith('http') ? url : `https://DOMAIN.nl${url}`,
          seller: 'DOMAIN'
        })
      }
    })
    
    return {
      source: 'DOMAIN.nl',
      products: products.slice(0, 20),
      scrapedAt: Date.now()
    }
  },
  
  parsePrice(priceStr) {
    if (!priceStr) return 0
    const cleaned = priceStr.replace(/[€$£]/g, '').replace(',', '.').trim()
    return parseFloat(cleaned) || 0
  }
}
```

**Jak używać:**
1. Skopiuj template
2. Zmień `DOMAIN.nl` na nazwę sklepu
3. Otwórz sklep w przeglądarce
4. Inspect element → znajdź selektory
5. Zamień `.product-item`, `.title`, `.price`
6. Test na 5 produktach
7. Deploy

**Czas:** 10-15 minut per sklep

---

## ✅ **FINALNA REKOMENDACJA:**

### **Faza 1: START (Teraz)**
```
✅ axios + cheerio (już masz)
✅ Fake user agent rotation (już masz)
✅ Rate limiting 5-10s delays (DODAJ!)
✅ Error logging (DODAJ!)
✅ Darmowe proxy (OPTIONAL - tylko jeśli potrzeba)
```

**Koszty:** €50/mies (server only)  
**Success rate:** 85-90%

---

### **Faza 2: SCALE (Po 1-2 miesiącach)**
```
✅ Playwright stealth (dla trudnych sites)
✅ Residential proxies (BrightData €100/mies)
✅ Monitoring dashboard
✅ Slack alerts
```

**Koszty:** €150-200/mies  
**Success rate:** 95%+

---

### **Faza 3: ENTERPRISE (Po 6 miesiącach)**
```
✅ ScrapingBee (dla 2% trudnych)
✅ Multiple servers (geo-distributed)
✅ Advanced monitoring
```

**Koszty:** €300-400/mies  
**Success rate:** 99%+

---

## 🎯 **ODPOWIEDŹ NA TWOJE RADY:**

| Rada | Moja Ocena | Implementacja |
|------|-----------|---------------|
| **Python + requests** | ⚠️ Node.js lepsze (już używasz) | Zostań przy Node.js |
| **Fake user agent** | ✅ MUST-HAVE | Już masz, rotuj 5 UA |
| **Darmowe proxy** | ✅ OK na start | Optional, tylko jeśli ban |
| **Playwright stealth** | ✅ ŚWIETNY fallback | Dodaj dla 10% sites |
| **ScrapingBee €150** | ✅ Last resort | Dodaj dla 2% sites |
| **Szablon parsera** | ✅ GENIALNY pomysł | Template gotowy! |
| **Delays 5-10s** | ✅ KLUCZOWE! | DODAJ NATYCHMIAST |
| **Error logging** | ✅ MUST-HAVE | DODAJ monitoring |
| **Cron co 30min** | ✅ Dobry start | Vercel Cron / PM2 |

---

## 💰 **KOSZTY - PORÓWNANIE:**

| Approach | Miesiąc 1 | Miesiąc 6 | Miesiąc 12 |
|----------|-----------|-----------|------------|
| **Twoje rady** | €50 | €150 | €150 |
| **Moja (hybrid)** | €50 | €200 | €300 |
| **All residential** | €300 | €300 | €300 |

**Twoje rady = OPTYMALNE dla start!** 🎯

**Moja sugestia:** Start z Twoimi radami, dodaj residential + playwright tylko gdy potrzeba.

---

**Chcesz żebym zaimplementował delays + error logging + szablon parsera?**
