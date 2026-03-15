# 🔧 RENDER ENV VARIABLES - UPDATE INSTRUKCJE

**Data:** 2026-03-15  
**Cel:** Średnia 4.0 dla wszystkich parametrów KWANT

---

## ✅ **KROK 1: ZMIEŃ ISTNIEJĄCE**

### **1. PRICING_V2_MIN_RATING**
```
BYŁO: 3.5
ZMIEŃ NA: 4.0
```
**Jak:** Kliknij na zmienną → Edit → zmień value na `4.0` → Save

---

## ✅ **KROK 2: DODAJ NOWE (5 zmiennych)**

Kliknij **"Add Environment Variable"** dla każdej:

### **1. PRICING_V2_MAX_RATING**
**KEY:**
```
PRICING_V2_MAX_RATING
```
**VALUE:**
```
4.8
```

### **2. PRICING_NICHE_EXCEPTION_ENABLED**
**KEY:**
```
PRICING_NICHE_EXCEPTION_ENABLED
```
**VALUE:**
```
true
```

### **3. PRICING_NICHE_MIN_RATING**
**KEY:**
```
PRICING_NICHE_MIN_RATING
```
**VALUE:**
```
4.0
```

### **4. PRICING_NICHE_MIN_REVIEWS**
**KEY:**
```
PRICING_NICHE_MIN_REVIEWS
```
**VALUE:**
```
10
```

### **5. PRICING_SCAM_MIN_PRICE_RATIO**
**KEY:**
```
PRICING_SCAM_MIN_PRICE_RATIO
```
**VALUE:**
```
0.35
```

---

## ✅ **KROK 3: SPRAWDŹ TE (powinny już być OK)**

- ✅ `PRICING_SCAM_MIN_RATING = 4.0` (już OK)
- ✅ `PRICING_V2_MIN_REVIEWS = 30` (już OK)
- ✅ `PRICING_V2_MAX_RATING_DEVIATION = 1.5` (już OK)
- ✅ `GOOGLE_SHOPPING_API_KEY = [TWÓJ_KLUCZ]` (już OK)
- ✅ `USE_MOCK_FALLBACK = false` (już OK)
- ✅ `MARKET_DISK_CACHE_ENABLED = 1` (już OK)
- ✅ `MARKET_LOG_SILENT = 1` (już OK)
- ✅ `NODE_ENV = production` (już OK)
- ✅ `PORT = 10000` (już OK)

---

## ✅ **KROK 4: SAVE I REDEPLOY**

1. **Kliknij "Save"** (po dodaniu wszystkich zmiennych)
2. **Idź do głównej strony serwisu**
3. **Kliknij "Manual Deploy"** → **"Clear build cache & deploy"**
4. **Poczekaj ~2-3 minuty** na rebuild

---

## 📊 **PODSUMOWANIE ZMIAN:**

**ZMIENIONE:** 1 zmienna
- PRICING_V2_MIN_RATING: 3.5 → 4.0

**DODANE:** 5 nowych zmiennych
- PRICING_V2_MAX_RATING = 4.8
- PRICING_NICHE_EXCEPTION_ENABLED = true
- PRICING_NICHE_MIN_RATING = 4.0
- PRICING_NICHE_MIN_REVIEWS = 10
- PRICING_SCAM_MIN_PRICE_RATIO = 0.35

**RAZEM:** 6 zmian

---

## ✅ **PO DEPLOYMENT:**

Backend będzie używał:
- ✅ Średnia 4.0 dla wszystkich ratingów
- ✅ Anti-scam filtering w `/api/market`
- ✅ Niche shops support (małe sklepy z dobrą opinią)
- ✅ Price ratio validation (odrzuca €15.95 dla Nintendo)

**Status:** GOTOWE DO WDROŻENIA 🚀
