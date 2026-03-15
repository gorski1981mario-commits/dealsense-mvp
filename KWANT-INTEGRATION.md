# 🔗 KWANT Backend Integration - Next.js ↔ Render

**Data integracji:** 2026-03-15  
**Frontend:** Next.js 16 (Vercel) - https://dealsense-mvp.vercel.app  
**Backend:** KWANT Engine (Render) - https://dealsense-aplikacja.onrender.com

---

## ✅ **CO ZOSTAŁO ZROBIONE:**

### **1. API Routes (Next.js → KWANT)**

Stworzone 3 nowe API routes w Next.js które przekierowują requesty do KWANT backend:

**`/api/kwant/scan`** → `BACKEND/api/scan`
- Główny endpoint dla skanowania produktów
- Parametry: `url`, `product_name`, `packageType`, `maxOffers`
- Timeout: 30s
- Używany przez: `Scanner.tsx`

**`/api/kwant/top3`** → `BACKEND/api/top3`
- KWANT TOP 3 engine
- Parametry: `product_name`, `base_price`, `ean`
- Zwraca: TOP 3 najlepsze oferty

**`/api/kwant/market`** → `BACKEND/api/market`
- Market API (SearchAPI + SerpAPI)
- Parametry: `product_name`, `ean`
- Zwraca: Wszystkie oferty z rynku

### **2. Environment Variables**

**`.env.example`** (template):
```
NEXT_PUBLIC_BACKEND_URL=https://dealsense-aplikacja.onrender.com
```

**Vercel ENV** (do dodania):
```
NEXT_PUBLIC_BACKEND_URL = https://dealsense-aplikacja.onrender.com
```

### **3. Component Updates**

**`Scanner.tsx`:**
- Zmieniony endpoint z `/api/scan-qr` na `/api/kwant/scan`
- Dodane parametry: `url`, `product_name`, `packageType`, `maxOffers`

---

## 🔧 **DEPLOYMENT STEPS:**

### **1. Commit i Push:**
```bash
cd c:\dealsense-100
git add .
git commit -m "🔗 KWANT Integration: Connect Next.js frontend with KWANT backend on Render"
git push origin main
```

### **2. Dodaj ENV w Vercel:**
1. Idź do: https://vercel.com/gorski1981mario-commits/dealsense-mvp/settings/environment-variables
2. Dodaj:
   - Key: `NEXT_PUBLIC_BACKEND_URL`
   - Value: `https://dealsense-aplikacja.onrender.com`
   - Environments: Production, Preview, Development
3. Kliknij "Save"

### **3. Redeploy Vercel:**
- Vercel auto-deploy po push do GitHub
- Lub manual: Deployments → Redeploy

### **4. Test End-to-End:**
```bash
# Frontend
https://dealsense-mvp.vercel.app

# Backend
https://dealsense-aplikacja.onrender.com/health
```

---

## 📡 **API FLOW:**

```
User (Browser)
    ↓
Next.js Frontend (Vercel)
    ↓ /api/kwant/scan
Next.js API Route
    ↓ fetch()
KWANT Backend (Render)
    ↓ /api/scan
KWANT Engine
    ↓
SearchAPI / SerpAPI
    ↓
TOP 3 Offers
    ↓
User (Browser)
```

---

## 🧪 **TESTING:**

### **Local:**
```bash
# 1. Create .env.local
echo "NEXT_PUBLIC_BACKEND_URL=https://dealsense-aplikacja.onrender.com" > .env.local

# 2. Run dev server
npm run dev

# 3. Test scanner
# Open http://localhost:3000
# Scan QR code
```

### **Production:**
```bash
# Test frontend
curl https://dealsense-mvp.vercel.app

# Test backend connection
curl https://dealsense-mvp.vercel.app/api/kwant/top3 \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"product_name":"iPhone 15 Pro","base_price":1199}'
```

---

## ⚠️ **IMPORTANT NOTES:**

1. **NEXT_PUBLIC_** prefix jest WYMAGANY dla client-side access
2. Backend URL jest hardcoded jako fallback w każdym route
3. Timeout 30s dla wszystkich KWANT requestów
4. Error handling dla timeout + connection failures
5. Scanner używa nowego `/api/kwant/scan` endpoint

---

## 🎯 **NEXT STEPS:**

1. ✅ Commit changes
2. ✅ Push to GitHub
3. ✅ Add ENV to Vercel
4. ✅ Test production deployment
5. ⏳ Monitor errors in Vercel logs
6. ⏳ Fine-tune KWANT pricing engine (jeśli potrzebne)

---

**Status:** READY FOR DEPLOYMENT 🚀
