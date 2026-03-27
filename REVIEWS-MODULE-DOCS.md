# 🤖 AI REVIEWS MODULE - DOKUMENTACJA

## 📋 OVERVIEW

Modularny system analizy opinii produktów - **klocek LEGO** dodany do DealSense.

**Funkcjonalność:**
- Scraping recenzji z 6 źródeł
- Analiza AI (GPT-4/Claude) - bezlitosny analityk
- Cache Redis (90 dni TTL)
- Target: **6s response time**
- Focus: **Elektronika**

---

## 🏗️ ARCHITEKTURA (MODULAR)

```
server/reviews/
├── index.js              # Main module (getReviewsAnalysis)
├── scrapers/
│   ├── index.js          # Parallel scraping orchestrator
│   ├── bol.js            # Bol.com scraper
│   ├── coolblue.js       # Coolblue scraper
│   ├── mediamarkt.js     # MediaMarkt scraper
│   ├── tweakers.js       # Tweakers.net scraper
│   ├── reddit.js         # Reddit scraper
│   └── trustpilot.js     # Trustpilot scraper
├── ai-analyzer.js        # GPT-4/Claude analysis
├── cache.js              # Redis cache (90 days)
├── product-info.js       # SearchAPI integration
└── README.md

app/api/reviews/[ean]/
└── route.ts              # API endpoint

app/components/
└── ReviewsAnalysis.tsx   # Frontend component
```

---

## 🚀 USAGE

### Backend (Node.js)

```javascript
const { getReviewsAnalysis } = require('./server/reviews');

const result = await getReviewsAnalysis('8806094934850', {
  forceRefresh: false,  // Skip cache
  timeout: 6000         // 6s max
});

console.log(result);
// {
//   ean: '8806094934850',
//   productName: 'Samsung Galaxy S24',
//   totalReviews: 150,
//   sources: { bol: 45, coolblue: 38, tweakers: 25, ... },
//   analysis: {
//     positive_percent: 75,
//     negative_percent: 15,
//     neutral_percent: 10,
//     top_pros: [...],
//     top_cons: [...],
//     critical_issues: [...],
//     verdict: { color: 'green', text: '...', score: 7.5 }
//   },
//   cached: false,
//   responseTime: 4523
// }
```

### Frontend (React/Next.js)

```tsx
import ReviewsAnalysis from '@/app/components/ReviewsAnalysis'

<ReviewsAnalysis 
  ean="8806094934850"
  productName="Samsung Galaxy S24"
/>
```

### API Endpoint

```bash
# Get reviews analysis
GET /api/reviews/8806094934850

# Force refresh (skip cache)
GET /api/reviews/8806094934850?force=true
```

---

## 🔧 CONFIGURATION

### Environment Variables

```bash
# AI Provider (openai or anthropic)
AI_PROVIDER=openai

# OpenAI API Key (GPT-4)
OPENAI_API_KEY=sk-...

# Anthropic API Key (Claude 3.5)
ANTHROPIC_API_KEY=sk-ant-...

# Redis Cache (optional - falls back to memory)
REDIS_URL=redis://...
UPSTASH_REDIS_URL=redis://...

# SearchAPI (already configured)
GOOGLE_SHOPPING_API_KEY=...
```

---

## 📊 DATA SOURCES

| Source | Type | Reviews/Product | Verified | Notes |
|--------|------|----------------|----------|-------|
| **Bol.com** | Shop | 50-200 | ✅ Yes | Verified purchases only |
| **Coolblue** | Shop | 30-150 | ✅ Yes | High quality reviews |
| **MediaMarkt** | Shop | 20-100 | ❌ No | Mixed quality |
| **Tweakers.net** | Tech | 10-50 | ✅ Yes | Expert reviews, pros/cons |
| **Reddit** | Community | 5-30 | ❌ No | Real user experiences |
| **Trustpilot** | Reviews | 10-50 | ⚠️ Mixed | Shop reviews |

**Total:** 125-580 reviews per product (last 90 days)

---

## 🤖 AI ANALYSIS

### Prompt (Bezlitosny Analityk)

```
Jesteś bezlitosnym analitykiem produktów. 
Przeanalizuj recenzje i wyodrębnij TYLKO FAKTY.

ZASADY:
1. Bez marketingowego bełkotu
2. Bez ogólników typu "produkt jest dobry"
3. Konkretne problemy i zalety
4. Liczby i procenty
5. Najczęstsze skargi i pochwały
```

### Output Format

```json
{
  "positive_percent": 75,
  "negative_percent": 15,
  "neutral_percent": 10,
  "total_reviews": 150,
  "top_pros": [
    "Długi czas pracy baterii (45x)",
    "Dobra jakość zdjęć (38x)",
    "Szybkie ładowanie (32x)"
  ],
  "top_cons": [
    "Przegrzewanie podczas ładowania (23x)",
    "Słaba jakość dźwięku (18x)",
    "Drogi w naprawie (12x)"
  ],
  "critical_issues": [
    "Bateria traci pojemność po 6 miesiącach (15 przypadków)",
    "Ekran pęka przy upadku z 50cm (8 przypadków)"
  ],
  "verdict": {
    "color": "green",
    "text": "Dobry wybór, ale uważaj na przegrzewanie",
    "score": 7.5
  }
}
```

### Verdict Colors

- **🟢 Green (7.5-10):** Polecany
- **🟡 Yellow (5-7.4):** OK, ale z zastrzeżeniami
- **🔴 Red (0-4.9):** Nie polecany

---

## ⚡ PERFORMANCE

### Target: 6s

**Breakdown:**
1. Product info (SearchAPI): **~1s**
2. Parallel scraping (6 sources): **~3s**
3. AI analysis (GPT-4/Claude): **~2s**
4. **Total: ~6s**

### Optimizations

1. **Parallel scraping** - wszystkie źródła równocześnie
2. **Timeouts** - 2s product info, 4s scraping, 3s AI
3. **Redis cache** - 90 dni TTL (instant response)
4. **Memory fallback** - jeśli Redis niedostępny
5. **Graceful degradation** - fallback analysis bez AI

---

## 🔄 CACHE STRATEGY

```javascript
// Cache key
`reviews:${ean}`

// TTL
90 days (7,776,000 seconds)

// Cache hit
- Instant response (<50ms)
- No scraping
- No AI calls
- No costs

// Cache miss
- Full scraping + AI
- ~6s response
- Cache result for 90 days
```

---

## 💰 COSTS

### Per Request (Cache Miss)

| Service | Cost | Notes |
|---------|------|-------|
| SearchAPI | €0.001 | Product info |
| Scraping | €0 | Free (own scrapers) |
| GPT-4 | €0.03 | ~1000 tokens |
| Claude 3.5 | €0.015 | ~1000 tokens |
| **Total** | **€0.031-0.046** | Per unique product |

### With Cache (90 days)

- **First request:** €0.03-0.05
- **Next 90 days:** €0 (cached)
- **Average (100 requests):** €0.0003-0.0005 per request

**OSZCZĘDNOŚĆ: 99% vs no cache**

---

## 🧪 TESTING

```bash
# Test single product
curl http://localhost:3000/api/reviews/8806094934850

# Test with force refresh
curl http://localhost:3000/api/reviews/8806094934850?force=true

# Test multiple products
node server/reviews/test.js
```

---

## 🔌 INTEGRATION

### Scanner Integration

```tsx
// app/components/Scanner.tsx
import ReviewsAnalysis from './ReviewsAnalysis'

// After showing offers:
{offers.length > 0 && (
  <ReviewsAnalysis 
    ean={scannedEAN}
    productName={productName}
  />
)}
```

### Product Page Integration

```tsx
// app/product/[ean]/page.tsx
import ReviewsAnalysis from '@/app/components/ReviewsAnalysis'

export default function ProductPage({ params }) {
  return (
    <div>
      <ProductInfo ean={params.ean} />
      <OffersTable ean={params.ean} />
      <ReviewsAnalysis ean={params.ean} />
    </div>
  )
}
```

---

## 🎯 FEATURES

### ✅ Implemented

- [x] Multi-source scraping (6 sources)
- [x] Parallel execution
- [x] AI analysis (GPT-4/Claude)
- [x] Redis cache (90 days)
- [x] Memory fallback
- [x] Graceful degradation
- [x] Frontend component
- [x] API endpoint
- [x] Timeout handling
- [x] Error handling

### 🚧 Future Enhancements

- [ ] More sources (Amazon.nl, Alternate, Expert)
- [ ] Sentiment analysis (NLP)
- [ ] Review trends over time
- [ ] Comparison with competitors
- [ ] Auto-refresh (weekly)
- [ ] Email alerts (critical issues)

---

## 🐛 TROUBLESHOOTING

### No reviews found

**Przyczyny:**
- Produkt nowy (brak recenzji)
- EAN niepoprawny
- Źródła niedostępne

**Rozwiązanie:**
- Sprawdź EAN
- Poczekaj 24h (nowy produkt)
- Sprawdź logi scraperów

### AI analysis timeout

**Przyczyny:**
- Za dużo recenzji (>500)
- AI API slow
- Network issues

**Rozwiązanie:**
- Zwiększ timeout (10s)
- Użyj fallback analysis
- Sprawdź AI API status

### Cache not working

**Przyczyny:**
- Redis niedostępny
- Invalid Redis URL
- Network issues

**Rozwiązanie:**
- Sprawdź REDIS_URL
- Użyj memory fallback (automatyczny)
- Restart Redis

---

## 📝 CHANGELOG

### v1.0.0 (2026-03-27)

- ✅ Initial release
- ✅ 6 sources scraping
- ✅ GPT-4/Claude analysis
- ✅ Redis cache
- ✅ Frontend component
- ✅ API endpoint
- ✅ 6s target achieved

---

## 🎯 SUMMARY

**AI Reviews Module** to modularny klocek LEGO dodany do DealSense:

✅ **6 źródeł** (Bol, Coolblue, MediaMarkt, Tweakers, Reddit, Trustpilot)
✅ **AI analiza** (GPT-4/Claude) - bezlitosny analityk
✅ **Cache 90 dni** (Redis + memory fallback)
✅ **6s response** (parallel + timeouts)
✅ **Modularny** (łatwo dodać nowe źródła)
✅ **Gotowy do produkcji**

**USAGE:**
```tsx
<ReviewsAnalysis ean="8806094934850" />
```

**DONE!** 🚀
