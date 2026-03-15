# 🚀 KWANT Backend - Render Deployment

## Deployment Instructions

### 1. **Create New Web Service on Render**
- Go to: https://dashboard.render.com
- Click: **New** → **Web Service**
- Connect GitHub repo: `gorski1981mario-commits/dealsense-mvp`
- Branch: `main`
- Root Directory: `server`

### 2. **Configuration**

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
node server-simple.js
```

**Environment Variables:**
```
PORT=10000
USE_MOCK_FALLBACK=true
NODE_ENV=production
```

### 3. **Optional Environment Variables**

For production with real APIs:
```
GOOGLE_SHOPPING_API_KEY=your_searchapi_key
SERPAPI_API_KEY=your_serpapi_key
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### 4. **Health Check**

After deployment, verify:
```bash
curl https://your-app.onrender.com/health
curl https://your-app.onrender.com/api/status
```

### 5. **Endpoints**

- `GET /health` - Health check
- `GET /api/status` - API status
- `POST /api/scan` - Scan product (URL/price)
- `POST /api/scan-qr` - Scan QR code
- `POST /api/top3` - Get TOP 3 offers (KWANT engine)
- `POST /api/market` - Get market offers

### 6. **Connect to Next.js Frontend**

Update Next.js API routes to point to Render backend:

```typescript
// app/api/scan/route.ts
const BACKEND_URL = process.env.BACKEND_URL || 'https://your-app.onrender.com';

export async function POST(request: Request) {
  const body = await request.json();
  
  const response = await fetch(`${BACKEND_URL}/api/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  return Response.json(await response.json());
}
```

### 7. **Environment Variables for Next.js (Vercel)**

Add to Vercel:
```
BACKEND_URL=https://your-app.onrender.com
```

---

## 🎯 KWANT Engine Features

✅ **TOP 3 Offers** - Główny silnik KWANT  
✅ **Market API** - SearchAPI + SerpAPI integration  
✅ **Scoring System** - Anti-scam + deal scoring  
✅ **Rate Limiting** - 1M users ready  
✅ **Caching** - Memory + disk cache  
✅ **3 AI Agents** - Core worker + Lite worker + Self-healing  
✅ **96 Tests** - Benchmarks + diagnostics  

---

## 📊 Current Status

**Backend:** `server-simple.js` (uproszczona wersja)  
**Full Backend:** `server.js` (wymaga dodatkowych modułów)  
**KWANT Engine:** mvp-latest (2026-03-03) - OPTYMALNY ✅  

---

## 🔧 Troubleshooting

**Problem:** Module not found errors  
**Solution:** Używaj `server-simple.js` zamiast `server.js`

**Problem:** Rate limit exceeded  
**Solution:** Zwiększ limity w `engine/rateLimit.js`

**Problem:** No offers returned  
**Solution:** Ustaw `USE_MOCK_FALLBACK=false` i dodaj API keys
