# Crawler Integration Guide - DealSense

## 🎯 JAK CRAWLER DZIAŁA Z APLIKACJĄ

### **ARCHITEKTURA:**

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                    │
│              dealsense-100 (Vercel)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP Request
                     ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND API (Node.js)                      │
│         server/api/* (Vercel Functions)                 │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ Internal API Call
                     ▼
┌─────────────────────────────────────────────────────────┐
│            CRAWLER SERVICE (Node.js)                    │
│         server/crawler/* (Separate server)              │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  Queue   │  │  Cache   │  │ Workers  │            │
│  │  (Bull)  │  │ (Redis)  │  │(Parsers) │            │
│  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────┘
                     │
                     │ HTTP Requests (with proxies)
                     ▼
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL WEBSITES                          │
│   Bol.com, Coolblue, Gaslicht, etc. (400+ domains)    │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 **DEPLOYMENT OPTIONS:**

### **OPCJA 1: Separate Server (RECOMMENDED)**

**Frontend:** Vercel (Next.js)  
**Backend API:** Vercel Functions  
**Crawler:** Hetzner VPS / AWS EC2

**Dlaczego separate:**
- ✅ Crawler działa 24/7 (background jobs)
- ✅ Nie blokuje głównej aplikacji
- ✅ Łatwe skalowanie (dodaj więcej workers)
- ✅ Tańsze (VPS €50/mies vs Vercel compute)

**Komunikacja:**
```
Frontend → Vercel API → Crawler API (HTTP)
```

---

### **OPCJA 2: Monolith (Prostsze, ale droższe)**

**Wszystko:** AWS ECS / Hetzner

**Dlaczego NIE:**
- ❌ Droższe (€200+ vs €50 dla crawler only)
- ❌ Trudniejsze skalowanie
- ❌ Crawler może spowolnić główną aplikację

---

## 🔌 **INTEGRACJA KROK PO KROKU:**

### **KROK 1: Deploy Crawler Service**

**Na Hetzner VPS (€50/mies):**

```bash
# SSH do serwera
ssh root@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install Redis
apt-get install -y redis-server
systemctl start redis
systemctl enable redis

# Clone crawler
cd /opt
git clone https://github.com/your-repo/dealsense-crawler.git
cd dealsense-crawler/server/crawler

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit with your credentials

# Start crawler
npm start

# Setup PM2 (process manager)
npm install -g pm2
pm2 start index.js --name dealsense-crawler
pm2 startup
pm2 save
```

**Crawler będzie dostępny na:**
`http://your-server-ip:3001`

---

### **KROK 2: Dodaj API Endpoint w Backend**

**Stwórz:** `server/api/crawler.js`

```javascript
// server/api/crawler.js
const axios = require('axios')

const CRAWLER_URL = process.env.CRAWLER_URL || 'http://localhost:3001'
const CRAWLER_TOKEN = process.env.CRAWLER_TOKEN || 'your_secret_token'

/**
 * Enqueue crawl job
 */
async function enqueueCrawl(url, options = {}) {
  try {
    const response = await axios.post(`${CRAWLER_URL}/api/enqueue`, {
      url,
      ...options
    }, {
      headers: {
        'Authorization': `Bearer ${CRAWLER_TOKEN}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    })

    return response.data
  } catch (error) {
    console.error('Crawler enqueue failed:', error.message)
    throw error
  }
}

/**
 * Get crawl result (from cache)
 */
async function getCrawlResult(cacheKey) {
  try {
    const response = await axios.get(`${CRAWLER_URL}/api/result/${cacheKey}`, {
      headers: {
        'Authorization': `Bearer ${CRAWLER_TOKEN}`
      },
      timeout: 5000
    })

    return response.data
  } catch (error) {
    console.error('Crawler get result failed:', error.message)
    return null
  }
}

/**
 * Get crawler stats
 */
async function getCrawlerStats() {
  try {
    const response = await axios.get(`${CRAWLER_URL}/api/stats`, {
      headers: {
        'Authorization': `Bearer ${CRAWLER_TOKEN}`
      },
      timeout: 5000
    })

    return response.data
  } catch (error) {
    console.error('Crawler stats failed:', error.message)
    return null
  }
}

module.exports = {
  enqueueCrawl,
  getCrawlResult,
  getCrawlerStats
}
```

---

### **KROK 3: Użyj w Głównym API**

**Przykład:** `server/api/scan.js`

```javascript
// server/api/scan.js
const { enqueueCrawl, getCrawlResult } = require('./crawler')

/**
 * Scan product by EAN
 */
async function scanProduct(req, res) {
  const { ean } = req.body

  if (!ean) {
    return res.status(400).json({ error: 'EAN required' })
  }

  try {
    // Step 1: Check if we have cached result
    const cacheKey = `ean:${ean}`
    let result = await getCrawlResult(cacheKey)

    if (result && result.cached) {
      // Return cached data immediately
      return res.json({
        success: true,
        cached: true,
        data: result.data
      })
    }

    // Step 2: Enqueue crawl job (non-blocking)
    const crawlUrls = [
      `https://www.bol.com/nl/s/?searchtext=${ean}`,
      `https://www.coolblue.nl/zoeken?query=${ean}`,
      `https://www.mediamarkt.nl/nl/search.html?query=${ean}`
    ]

    const jobs = await Promise.all(
      crawlUrls.map(url => 
        enqueueCrawl(url, {
          category: 'products',
          ean,
          priority: 1
        })
      )
    )

    // Step 3: Return job IDs (frontend can poll for results)
    return res.json({
      success: true,
      cached: false,
      message: 'Crawl jobs enqueued',
      jobs: jobs.map(j => j.jobId),
      estimatedTime: '2-5 seconds'
    })

  } catch (error) {
    console.error('Scan error:', error)
    return res.status(500).json({
      error: 'Scan failed',
      message: error.message
    })
  }
}

module.exports = { scanProduct }
```

---

### **KROK 4: Frontend Integration**

**W Next.js app:**

```typescript
// app/scan/page.tsx
'use client'

import { useState } from 'react'

export default function ScanPage() {
  const [ean, setEan] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleScan = async () => {
    setLoading(true)

    try {
      // Call backend API
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ean })
      })

      const data = await response.json()

      if (data.cached) {
        // Got cached result immediately
        setResult(data.data)
        setLoading(false)
      } else {
        // Jobs enqueued, poll for results
        pollForResults(data.jobs)
      }

    } catch (error) {
      console.error('Scan failed:', error)
      setLoading(false)
    }
  }

  const pollForResults = async (jobIds) => {
    // Poll every 2 seconds for max 30 seconds
    let attempts = 0
    const maxAttempts = 15

    const interval = setInterval(async () => {
      attempts++

      try {
        const response = await fetch(`/api/scan/result?ean=${ean}`)
        const data = await response.json()

        if (data.ready) {
          setResult(data.data)
          setLoading(false)
          clearInterval(interval)
        }

        if (attempts >= maxAttempts) {
          setLoading(false)
          clearInterval(interval)
          alert('Scan timeout - probeer opnieuw')
        }

      } catch (error) {
        console.error('Poll error:', error)
      }

    }, 2000)
  }

  return (
    <div>
      <input 
        value={ean}
        onChange={(e) => setEan(e.target.value)}
        placeholder="Scan EAN..."
      />
      <button onClick={handleScan} disabled={loading}>
        {loading ? 'Scanning...' : 'Scan'}
      </button>

      {result && (
        <div>
          <h3>Results:</h3>
          {result.offers.map(offer => (
            <div key={offer.seller}>
              {offer.seller}: €{offer.price}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 🔐 **SECURITY - CRAWLER TOKEN:**

**NIE MA API KEYS jak Google!**

Zamiast tego używasz **własnego tokena** do zabezpieczenia komunikacji między Twoim backend a crawler service.

**Setup:**

```bash
# .env (Backend API)
CRAWLER_URL=http://your-crawler-server:3001
CRAWLER_TOKEN=your_super_secret_token_here_min_32_chars

# .env (Crawler Service)
API_TOKEN=your_super_secret_token_here_min_32_chars
```

**W crawler service dodaj middleware:**

```javascript
// server/crawler/middleware/auth.js
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1]
  
  if (!token || token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  next()
}

module.exports = { authenticateToken }
```

---

## 📊 **MONITORING:**

**Dashboard endpoint:**

```javascript
// server/crawler/api/stats.js
app.get('/api/stats', authenticateToken, async (req, res) => {
  const stats = await crawler.getStats()
  res.json(stats)
})
```

**Response:**
```json
{
  "requests": {
    "total": 1523,
    "success": 1445,
    "failed": 78,
    "cached": 342
  },
  "successRate": "94.88%",
  "avgDuration": "1234ms",
  "topDomains": [
    { "domain": "bol.com", "total": 523, "successRate": "96.2%" },
    { "domain": "coolblue.nl", "total": 412, "successRate": "95.1%" }
  ]
}
```

---

## 🚀 **DEPLOYMENT CHECKLIST:**

### **1. Crawler Service:**
- [ ] Deploy na Hetzner VPS / AWS EC2
- [ ] Install Redis
- [ ] Setup BrightData proxies
- [ ] Configure .env (proxies, Redis, Sentry)
- [ ] Start with PM2
- [ ] Setup firewall (tylko port 3001 dla Twojego backend)

### **2. Backend API:**
- [ ] Dodaj CRAWLER_URL do .env
- [ ] Dodaj CRAWLER_TOKEN do .env
- [ ] Stwórz `/api/crawler.js` helper
- [ ] Update `/api/scan.js` żeby używał crawlera
- [ ] Deploy na Vercel

### **3. Frontend:**
- [ ] Update scan flow (polling)
- [ ] Dodaj loading states
- [ ] Deploy na Vercel

### **4. Testing:**
- [ ] Test crawler locally
- [ ] Test integration locally
- [ ] Test on staging
- [ ] Test on production

---

## 💡 **KLUCZOWE RÓŻNICE:**

| Aspekt | API (Google) | Crawler (Własny) |
|--------|--------------|------------------|
| **Setup** | Klucz API | Własny serwer |
| **Credentials** | API KEY | Internal TOKEN |
| **Hosting** | Nie trzeba | Trzeba (VPS/AWS) |
| **Cost** | Per request | Flat (server) |
| **Control** | Zero | Pełna |
| **Maintenance** | Zero | Średnia |

---

## ✅ **FINALNA ODPOWIEDŹ:**

**Crawler NIE używa kluczy API!**

To **Twój własny serwis** który:
1. Hostujesz na własnym serwerze (Hetzner/AWS)
2. Zabezpieczasz własnym tokenem (internal auth)
3. Komunikuje się z Twoim backend przez HTTP
4. Działa 24/7 w tle

**Vs API:**
- API = płacisz za klucz, zero hostingu
- Crawler = hostujesz sam, zero opłat per request

**Dla DealSense: Crawler jest lepszy bo masz kontrolę i 10x taniej przy skali!**
