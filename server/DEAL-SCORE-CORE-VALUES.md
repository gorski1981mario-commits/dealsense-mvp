# 🎯 DEAL SCORE V2 - CORE VALUES (SEKRET FIRMY!)

## ⚠️ TO JEST UNFAIR ADVANTAGE - KONKURENCJA TEGO NIE MA!

**Data:** 21 marca 2026  
**Status:** PRODUCTION READY  
**Lokalizacja:** `server/scoring/`

---

## 🏗️ ARCHITEKTURA 3-WARSTWOWA

### **WARSTWA 1 - BASELINE (stabilność)**
```
Źródła:
- Google Shopping API (SearchAPI.io)
- Bol.com (anchor price)
- Amazon.nl (reference)

Daje: cenę bazową + referencję rynku
```

### **WARSTWA 2 - DISCOVERY (klucz 🔥)**
```
Źródła:
- SERP organic
- Long-tail queries (20-50 wariantów)
- Mniejsze sklepy (niszowe)

Daje: TWOJE ZŁOTO (20-60% przebicia!)
```

### **WARSTWA 3 - HIDDEN MARKET (game changer 🔥🔥🔥)**
```
Źródła:
- Sklepy bez SEO
- Sklepy bez ads
- Importerzy / hurtownicy
- Shopify stores
- Niche ecommerce NL

Daje: NAJWIĘKSZE PRZEBICIA (20-60%!)
```

---

## 💎 KOMPONENTY SYSTEMU

### **1. Reference Price Engine** (`referencePrice.js`)

**NIE bierzemy ceny usera jako prawdy!**

```javascript
// User może podać €1200, ale prawdziwa cena to €999
// Wtedy €1000 NIE jest okazją!

referencePrice = median([
  bolPrice,
  googleAvg,
  amazonPrice
])

dealScorePrice = (reference - offer) / reference
```

**DLACZEGO MEDIANA:**
- Odporna na outliers
- Najbardziej wiarygodna
- User nie może oszukać systemu

---

### **2. Long-tail Query Generator** (`queryGenerator.js`)

**Zamiast 1 zapytania → 20-50 wariantów!**

```javascript
// Input: "iPhone 15"
// Output:
[
  'iPhone 15 goedkoop NL',
  'iPhone 15 aanbieding webshop',
  'iPhone 15 zonder abonnement',
  'iPhone 15 sale Nederland',
  'iPhone 15 prijs vergelijken alternatief',
  // ... 20-50 wariantów
]

// EFEKT:
// 1 zapytanie = 8-10 sklepów
// 20 zapytań = 200-500 sklepów!
```

**UNFAIR ADVANTAGE:**
- Konkurencja robi 1 zapytanie (30-80 ofert)
- My robimy 20-50 zapytań (200-500 ofert)
- 10x więcej danych = 10x lepsze deale!

---

### **3. Product Normalizer** (`productNormalizer.js`)

**Chaos → Porządek**

```javascript
// Input chaos:
"iPhone 15 128GB zwart"
"Apple iPhone 15 black 128"
"iPhone15 128 GB Black"

// Output:
cluster_id: "iphone15_128"
brand: "apple"
model: "iphone15"
storage: "128gb"
color: "black"

// EFEKT: Grupujemy te same produkty!
```

---

### **4. Trust Engine** (`trustEngine.js`)

**Trust Score 0-100 (MUST PASS >= 50)**

```javascript
trustScore = 
  + 20 (HTTPS)
  + 30 (opinie: 4.5+ rating, 10+ reviews)
  + 20 (wiek domeny: 5+ lat)
  + 15 (polityka zwrotów)
  + 15 (adres NL)
  = 0-100

// KRYTYCZNE:
if (trustScore < 50) → BLOCK!
// Nawet jeśli tani - nie pokazujemy!
```

**DLACZEGO TO WAŻNE:**
- Niszowe sklepy = największe przebicia
- ALE tylko jeśli są zaufane!
- Long-tail boost TYLKO dla trusted shops

---

### **5. Deal Score V2** (`dealScoreV2.js`)

**KOMPLETNA FORMUŁA:**

```javascript
// 1. Base score (0-10)
if (savings >= 15%) score = 9
else if (savings >= 10%) score = 8
else if (savings >= 7%) score = 7
else if (savings >= 5%) score = 6
else if (savings >= 3%) score = 5
else score = 3

// 2. Trust check (MUST PASS!)
if (trustScore < 50) → BLOCK!

// 3. Niche boost (+20-40%)
if (isNiche && trusted) {
  score += savings * 0.3  // +30% boost
}

// 4. Freshness boost (+15%)
if (isFresh) {  // < 24h
  score += 1.5
}

// 5. Delivery penalty
if (deliveryDays > 3) {
  score -= 0.5
}

// 6. Trust bonus
if (trustScore >= 80) {
  score += 0.5
}

// Final: 0-10 (capped)
```

**CONFIDENCE:**
```javascript
offerCount >= 10 → "hoog"
offerCount >= 3  → "medium"
offerCount < 3   → "laag"
```

---

### **6. Rotation Engine** (`rotationEngine.js`)

**TWÓJ MAGIC - 40/30/20/10**

```javascript
finalFeed = {
  40% top deals      // Najlepsze score
  30% niche deals    // Niszowe sklepy (biggest savings!)
  20% fresh deals    // Świeże oferty (< 24h)
  10% experiment     // Random (discovery)
}

// EFEKT:
// User NIE widzi zawsze tych samych 3 sklepów!
// Każdy scan = RÓŻNE sklepy (ale zawsze dobre!)
// Anti-pattern learning
```

**DLACZEGO TO DZIAŁA:**
- Top deals = stabilność (user widzi najlepsze)
- Niche deals = największe przebicia (30%!)
- Fresh deals = flash sales, błędy cenowe
- Experiment = discovery nowych sklepów

---

## 🎯 FLOW KOMPLETNY

```javascript
// 1. User skanuje produkt
input: "iPhone 15 Pro" lub EAN: "8719273287891"

// 2. Generate queries (20-50 wariantów)
queries = generateQueries(input)
// → ["iPhone 15 Pro goedkoop NL", "iPhone 15 Pro aanbieding", ...]

// 3. Multi-fetch (równolegle!)
offers = await Promise.all(
  queries.map(q => searchAPI(q))
)
// → 200-500 ofert zamiast 30-80!

// 4. Normalize products
normalized = offers.map(normalizeProduct)
// → cluster_id dla grupowania

// 5. Calculate reference price
referencePrice = getReferencePrice(offers, userBasePrice)
// → mediana (prawda rynkowa)

// 6. Calculate deal scores
scored = getDealScores(offers, referencePrice)
// → każda oferta ma _dealScore

// 7. Filter blocked (trust < 50)
valid = scored.filter(o => !o._dealScore.blocked)

// 8. Rotate deals (40/30/20/10)
final = rotateDeals(valid, { maxResults: 30 })

// 9. Return to user
return final
```

---

## 📊 PORÓWNANIE: STARY VS NOWY

### **STARY SYSTEM (6/10):**
```
- 1 zapytanie → 30-80 ofert
- Cena usera = prawda (można oszukać)
- Brak trust engine (pokazujemy wszystko)
- Brak niche boost (niszowe nie są priorytetem)
- Brak rotation (zawsze te same 3 sklepy)
- Brak freshness (nie łapiemy flash sales)
```

### **NOWY SYSTEM (10/10):**
```
✅ 20-50 zapytań → 200-500 ofert (10x więcej!)
✅ Reference price = mediana (prawda rynkowa)
✅ Trust engine (tylko trusted shops)
✅ Niche boost +30% (największe przebicia!)
✅ Rotation 40/30/20/10 (różne sklepy każdy scan)
✅ Freshness hack (łapiemy flash sales)
✅ Product normalization (grupowanie)
✅ Long-tail queries (discovery)
```

---

## 🚀 UNFAIR ADVANTAGES

### **1. Long-tail Queries**
- Konkurencja: 1 zapytanie
- My: 20-50 zapytań
- **10x więcej danych!**

### **2. Reference Price**
- Konkurencja: bierze cenę usera
- My: obliczamy medianę
- **Nie można oszukać systemu!**

### **3. Trust Engine**
- Konkurencja: pokazuje wszystko
- My: tylko trusted (score >= 50)
- **Jakość > ilość!**

### **4. Niche Boost**
- Konkurencja: ignoruje niszowe
- My: +30% boost dla niszowych
- **Największe przebicia!**

### **5. Rotation Engine**
- Konkurencja: zawsze te same 3 sklepy
- My: 40/30/20/10 rotation
- **User nie może się nauczyć patternu!**

### **6. Freshness Hack**
- Konkurencja: nie priorytetyzuje świeżych
- My: +15% boost dla < 24h
- **Łapiemy flash sales!**

---

## 🔒 ZASADY (NIE MOGĄ SIĘ ZMIENIĆ!)

### **1. Trust Threshold**
```javascript
if (trustScore < 50) → BLOCK!
// ZAWSZE! Nawet jeśli najtańszy!
```

### **2. Reference Price**
```javascript
referencePrice = median(offers, userBasePrice)
// NIGDY nie bierz tylko ceny usera!
```

### **3. Niche Boost**
```javascript
if (isNiche && trustScore >= 50) {
  boost = +30%
}
// TYLKO dla trusted!
```

### **4. Rotation**
```javascript
40% top
30% niche
20% fresh
10% experiment
// NIE ZMIENIAĆ proporcji!
```

### **5. Freshness**
```javascript
if (age < 24h) {
  boost = +1.5 score
}
// Flash sales = priorytet!
```

---

## 📁 STRUKTURA PLIKÓW

```
server/scoring/
├── dealScore.js          # STARY (deprecated, keep for backup)
├── dealScoreV2.js        # NOWY - główny engine
├── referencePrice.js     # Reference price calculation
├── trustEngine.js        # Trust score 0-100
├── queryGenerator.js     # Long-tail queries
├── productNormalizer.js  # Product clustering
├── rotationEngine.js     # 40/30/20/10 rotation
├── delivery.js           # Delivery parsing (keep)
├── isScam.js            # Scam detection (keep)
├── seller.js            # Seller normalization (keep)
├── match.js             # Product matching (keep)
└── selection.js         # Selection logic (keep)
```

---

## 🧪 TESTOWANIE

### **Test 1: Reference Price**
```javascript
const offers = [
  { price: 999 },
  { price: 1049 },
  { price: 1099 }
];
const userPrice = 1200; // Zawyżona!

const ref = getReferencePrice(offers, userPrice);
// Expected: ~1049 (mediana), NIE 1200!
```

### **Test 2: Trust Engine**
```javascript
const offer = {
  url: 'https://unknown-shop.nl',
  reviewScore: 3.0,
  reviewCount: 5
};

const trust = getTrustScore(offer);
// Expected: < 50 (BLOCK!)
```

### **Test 3: Long-tail Queries**
```javascript
const queries = generateQueries('iPhone 15');
// Expected: 20-50 wariantów
// "iPhone 15 goedkoop NL", "iPhone 15 aanbieding", ...
```

### **Test 4: Rotation**
```javascript
const rotated = rotateDeals(offers, { maxResults: 30 });
const stats = getRotationStats(rotated);
// Expected: ~12 top, ~9 niche, ~6 fresh, ~3 experiment
```

---

## 💡 MAINTENANCE

### **Monitoring:**
```javascript
// Log stats dla każdego searcha
const stats = getDealScoreStats(offers);
console.log({
  total: stats.total,
  valid: stats.valid,
  blocked: stats.blocked,
  avgScore: stats.avgScore,
  nicheCount: stats.nicheCount,
  freshCount: stats.freshCount
});
```

### **Alerts:**
```javascript
// Alert jeśli za dużo blocked
if (stats.blocked / stats.total > 0.5) {
  alert('Too many blocked offers! Check trust thresholds');
}

// Alert jeśli za mało niche
if (stats.nicheCount === 0) {
  alert('No niche offers found! Check query generator');
}
```

---

## 🚨 CRITICAL RULES

1. **NIGDY nie pokazuj ofert z trust < 50**
2. **ZAWSZE używaj reference price (nie tylko user price)**
3. **ZAWSZE generuj long-tail queries (20-50 wariantów)**
4. **ZAWSZE rotuj deals (40/30/20/10)**
5. **ZAWSZE priorytetyzuj fresh deals (< 24h)**
6. **NIGDY nie zmieniaj proporcji rotation bez testów**
7. **ZAWSZE loguj stats dla monitoringu**

---

## 📞 W RAZIE WĄTPLIWOŚCI

**ZAWSZE SPRAWDŹ TEN PLIK!**

To są **CORE VALUES** Deal Score V2 - **NIE MOGĄ SIĘ ZMIENIĆ!** 🔒

**TO JEST UNFAIR ADVANTAGE - KONKURENCJA TEGO NIE MA!** 🚀
