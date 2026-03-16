# 🎯 RENDER ENV - FINALNA KONFIGURACJA

**Data:** 2026-03-15  
**Decyzje:** Średnia 4.0, 30 recenzji, BEZ wieku domeny

---

## ✅ **FINALNE PARAMETRY KWANT:**

### **Anti-Scam Filtering:**
```
PRICING_SCAM_MIN_RATING = 4.0
  ↳ Minimum 4.0★ (średnia)
  ↳ Odrzuca sklepy <4.0

PRICING_SCAM_MIN_REVIEWS = 30
  ↳ Minimum 30 recenzji
  ↳ Wystarczy do odfiltrowania scam ✅

PRICING_SCAM_MIN_PRICE_RATIO = 0.35
  ↳ Cena ≥35% średniej rynkowej
  ↳ Odrzuca €15.95 dla Nintendo €350
```

### **Pricing V2 Engine:**
```
PRICING_V2_MIN_RATING = 4.0
  ↳ Spójne ze średnią 4.0

PRICING_V2_MIN_REVIEWS = 30
  ↳ Spójne z SCAM_MIN_REVIEWS
  ↳ WIĘCEJ ofert z rynku ✅

PRICING_V2_MAX_RATING = 4.8
  ↳ Pozwala na bardzo dobre sklepy 4.5-4.8

PRICING_V2_MAX_RATING_DEVIATION = 1.5
  ↳ Maksymalne odchylenie od średniej
```

### **Niche Shops:**
```
PRICING_NICHE_EXCEPTION_ENABLED = true
  ↳ Pozwala małym sklepom z wysoką oceną

PRICING_NICHE_MIN_RATING = 4.0
  ↳ Spójne ze średnią 4.0

PRICING_NICHE_MIN_REVIEWS = 10
  ↳ Mniej recenzji OK jeśli rating wysoki
```

---

## 🔧 **CO MUSISZ ZROBIĆ NA RENDER:**

### **ZMIEŃ (1 zmienna):**

**PRICING_V2_MIN_REVIEWS**
```
BYŁO: 50
ZMIEŃ NA: 30
```

### **DODAJ (5 nowych zmiennych):**

**1. PRICING_V2_MAX_RATING**
```
KEY: PRICING_V2_MAX_RATING
VALUE: 4.8
```

**2. PRICING_NICHE_EXCEPTION_ENABLED**
```
KEY: PRICING_NICHE_EXCEPTION_ENABLED
VALUE: true
```

**3. PRICING_NICHE_MIN_RATING**
```
KEY: PRICING_NICHE_MIN_RATING
VALUE: 4.0
```

**4. PRICING_NICHE_MIN_REVIEWS**
```
KEY: PRICING_NICHE_MIN_REVIEWS
VALUE: 10
```

**5. PRICING_SCAM_MIN_PRICE_RATIO**
```
KEY: PRICING_SCAM_MIN_PRICE_RATIO
VALUE: 0.35
```

---

## ✅ **SPRAWDŹ (powinny już być OK):**

- ✅ PRICING_SCAM_MIN_RATING = 4.0
- ✅ PRICING_SCAM_MIN_REVIEWS = 30
- ✅ PRICING_V2_MIN_RATING = 4.0 (zmień z 3.5 jeśli trzeba)
- ✅ PRICING_V2_MAX_RATING_DEVIATION = 1.5
- ✅ GOOGLE_SHOPPING_API_KEY = [TWÓJ_KLUCZ]
- ✅ USE_MOCK_FALLBACK = false
- ✅ MARKET_DISK_CACHE_ENABLED = 1
- ✅ MARKET_LOG_SILENT = 1

---

## 🚀 **KROKI:**

1. **Render Dashboard** → Settings → Environment Variables
2. **Zmień:** PRICING_V2_MIN_REVIEWS (50 → 30)
3. **Dodaj:** 5 nowych zmiennych (powyżej)
4. **Save**
5. **Manual Deploy** → **Clear build cache & deploy**
6. **Poczekaj ~2-3 minuty**

---

## 📊 **EFEKT:**

**PRZED (restrykcyjne):**
- MIN_REVIEWS: 50
- MIN_RATING: 3.5/3.8
- MAX_RATING: 4.2
- Wynik: MAŁO ofert z rynku

**PO (optymalne):**
- MIN_REVIEWS: **30** ✅
- MIN_RATING: **4.0** ✅
- MAX_RATING: **4.8** ✅
- Wynik: **WIĘCEJ ofert z rynku** ✅

**30 recenzji + 4.0★ = wystarczy do odfiltrowania scam** ✅

---

## ✅ **GOTOWE DO WDROŻENIA!**

Zaktualizuj ENV i zrób redeploy. Potem test #3 z prawdziwymi produktami. 🚀
