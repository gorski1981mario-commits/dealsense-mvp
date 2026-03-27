# 🔧 CRAWLER FIXES 2026 - SKLEPY HOLENDERSKIE

## 📊 PROBLEM: 12% Success Rate

Sklepy NL w 2026 (Bol, Coolblue, BCC) to **dynamiczne bestie**:
- Ceny ładują się po JS
- Po banerze cookie
- Po scroll (lazy loading)
- AJAX requests
- Anti-bot (Cloudflare)

---

## ❌ 5 GŁÓWNYCH WIN CRAWLERA

### **1. NIE CZEKA NA JS RENDER**

**Problem:**
```javascript
await page.goto(url, { waitUntil: 'domcontentloaded' });
// Ceny w AJAX lub po scrollu → 0 cen
```

**Fix:**
```javascript
// Scroll to trigger lazy loading
await page.evaluate(() => window.scrollTo(0, 500));

// Wait for prices to appear
await page.waitForFunction(() => {
  const text = document.body.innerText;
  return text.includes('€');
}, { timeout: 5000 });

// Lub konkretny selektor
await page.waitForSelector('.price', { timeout: 5000 });
```

---

### **2. BANER NIE ZNIKA**

**Problem:**
```javascript
// Handler kliknie, ale overlay blokuje DOM
await page.click('.cookie-accept');
// Overlay nadal tam jest!
```

**Fix:**
```javascript
// Po kliknięciu - USUŃ overlay z DOM
await page.evaluate(() => {
  const overlays = document.querySelectorAll(
    '[class*="cookie"], [class*="overlay"], [class*="modal"]'
  );
  overlays.forEach(el => el.remove());
});
```

---

### **3. SELEKTORY KRUCHE**

**Problem:**
```javascript
// Bol zmienia .product-price na .current-price co miesiąc
const price = await page.$('.product-price'); // null!
```

**Fix:**
```javascript
// Nie używaj class - używaj innerText.match
const prices = await page.evaluate(() => {
  const text = document.body.innerText;
  const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g);
  return matches;
});

// Dla każdego sklepu - 2-3 fallbacki
const selectors = [
  '.price',           // Fallback 1
  '.current-price',   // Fallback 2
  '[data-price]',     // Fallback 3
  '[itemprop="price"]' // Fallback 4
];

for (const selector of selectors) {
  const el = await page.$(selector);
  if (el) {
    const price = await el.innerText();
    if (price.includes('€')) return price;
  }
}
```

---

### **4. FINGERPRINT SŁABY**

**Problem:**
```javascript
// IPRoyal daje IP, ale nie zmienia canvas/WebGL/UA
// Cloudflare widzi bot po 5 requestach
```

**Fix:**
```javascript
// Playwright-extra + Stealth Plugin
const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')();

chromium.use(StealthPlugin);

// Random User Agent (Chrome 126+ NL)
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/126.0.0.0',
  // ... więcej
];

const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];

const context = await browser.newContext({
  userAgent: randomUA,
  locale: 'nl-NL',
  timezoneId: 'Europe/Amsterdam'
});
```

---

### **5. ZA DUŻO REQUESTÓW**

**Problem:**
```javascript
// 100 sklepów × 5 produktów = 500 requestów
// Cloudflare: BAN po 50 requestach
```

**Fix:**
```javascript
// Rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Max 15-20 concurrent
for (let i = 0; i < shops.length; i += 15) {
  const batch = shops.slice(i, i + 15);
  await Promise.allSettled(batch.map(shop => crawl(shop)));
  
  // Delay between batches
  await delay(5000); // 5s delay
}

// Random delays per request
await delay(Math.random() * 2000 + 1000); // 1-3s
```

---

## ✅ KOMPLETNY FIX - PRZYKŁAD

```javascript
async function crawlShop(url) {
  const page = await context.newPage();
  
  try {
    // 1. Navigate
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // 2. Scroll to trigger lazy loading
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);
    
    // 3. Wait for JS render (prices)
    await page.waitForFunction(() => {
      return document.body.innerText.includes('€');
    }, { timeout: 5000 });
    
    // 4. Remove cookie overlays
    await page.evaluate(() => {
      const overlays = document.querySelectorAll('[class*="cookie"], [class*="overlay"]');
      overlays.forEach(el => el.remove());
    });
    
    // 5. Extract prices (innerText.match + fallbacki)
    const prices = await page.evaluate(() => {
      const text = document.body.innerText;
      const matches = text.match(/€\s*(\d{1,4})[.,](\d{2})/g) || [];
      
      return matches.map(m => {
        const match = m.match(/€\s*(\d{1,4})[.,](\d{2})/);
        return parseFloat(`${match[1]}.${match[2]}`);
      }).filter(p => p > 10 && p < 10000);
    });
    
    return prices;
    
  } finally {
    await page.close();
  }
}
```

---

## 📊 EXPECTED RESULTS

**Przed fixami:**
- Success rate: 12%
- Avg load time: 3.79s
- Prices found: 3/25

**Po fixach:**
- Success rate: **60-80%** (expected)
- Avg load time: 4-6s (czekanie na JS)
- Prices found: **15-20/25**

---

## 🚀 INSTALACJA

```bash
# Playwright-extra + Stealth
npm install playwright-extra puppeteer-extra-plugin-stealth
```

---

## ✅ CHECKLIST

- [x] Wait for JS render (waitForFunction)
- [x] Scroll to trigger lazy loading
- [x] Remove cookie overlays (evaluate + remove)
- [x] innerText.match zamiast selektorów
- [x] 2-3 fallbacki per sklep
- [x] Playwright-extra + Stealth Plugin
- [x] Random User Agent (Chrome 126+ NL)
- [x] Rate limiting (max 15-20 concurrent)
- [x] Delays between batches (5s)
- [x] Random delays per request (1-3s)

**STATUS: READY TO TEST** 🎯
