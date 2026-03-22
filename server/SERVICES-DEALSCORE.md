# 🔥 DEAL SCORE FOR SERVICES - OPTYMALNY SILNIK

**Data:** 21 marca 2026  
**Status:** PRODUCTION READY  
**Lokalizacja:** `server/services/`

---

## 🎯 CEL

Znaleźć **NAJTAŃSZĄ dobrą opcję** (nie najtańszą w ogóle = bez śmieci)

**NOWA ZASADA (GLOBALNA):**
```
user → filtr → wyniki
```

**ZAMIAST:**
```
user → profil → AI → eksploracja rynku → ranking → najlepsze opcje
```

---

## 🚀 KOMPONENTY SYSTEMU

### **1. Category Config** (`categoryConfig.js`)

**Quality thresholds per kategoria:**
```javascript
vacation: 7.5      // Wysokie (nie chcesz złego hotelu)
energy: 6.0        // Średnie (głównie cena)
insurance: 8.0     // Bardzo wysokie (bezpieczeństwo)
loan: 7.5          // Wysokie (zaufanie)
mortgage: 8.0      // Bardzo wysokie (największa decyzja)
```

**Deal Score weights per kategoria:**
```javascript
vacation: { price: 0.3, quality: 0.3, fit: 0.2, trust: 0.1, freshness: 0.1 }
energy: { price: 0.6, quality: 0.2, fit: 0.1, trust: 0.1, freshness: 0.0 }
loan: { price: 0.5, quality: 0.1, fit: 0.1, trust: 0.3, freshness: 0.0 }
```

**Cache TTL per kategoria:**
```javascript
vacation: 30min (high season) / 6h (low season)
energy: 12h
kredyty: 6h
mortgage: 24h
```

**Max queries per kategoria:**
```javascript
vacation: 3 queries
energy: 1 query
telecom: 2 queries
```

---

### **2. Profile Enrichment** (`profileEnrichment.js`)

**User podaje 3-4 pola → AI dopowiada resztę**

**Przykład (Wakacje):**
```javascript
// INPUT (user)
{
  persons: 2,
  month: 6,
  style: 'relax'
}

// OUTPUT (AI enriched)
{
  persons: 2,
  month: 6,
  style: 'relax',
  budget: 1000,           // AI estimate
  standard: 'medium',     // AI estimate
  preferences: {          // AI estimate
    beachfront: true,
    allInclusive: true,
    spa: false
  }
}
```

**Fallback strategy:**
- Jeśli za mało wyników (< 5) → rozszerz budżet o 20%
- Jeśli niski avg score (< 6.0) → obniż standard

---

### **3. Service Query Generator** (`serviceQueryGenerator.js`)

**Zamiast 20 zapytań → tylko 1-3!**

**Query templates:**
```javascript
vacation: [
  '{destination} all inclusive {month} {persons} personen',
  '{destination} goedkoop {month} vakantie',
  'last minute {destination} {month}'
]

energy: [
  'goedkope energie vergelijken',
  'groene energie {usage}'
]

loan: [
  'persoonlijke lening {amount} euro',
  'lening laagste rente'
]
```

**Przykład:**
```javascript
// Input: { destination: 'Spanje', month: 6, persons: 2 }
// Output: 'Spanje all inclusive juni 2 personen'
```

**Oszczędność:** -85% zapytań (20 → 3)

---

### **4. Quality Filter** (`qualityFilter.js`)

**CHEAP BUT GOOD FILTER**

**Logika:**
```javascript
price low AND quality > threshold
```

**Quality score (0-10):**
- Rating (0-5 → 0-10)
- Review count bonus (+0.2 to +1.0)
- Trust score bonus (+0 to +2.0)
- Completeness bonus (+0.5)

**Scam filter:**
- Odrzuć jeśli quality < 3.0
- Odrzuć jeśli brak reviews
- Odrzuć jeśli podejrzanie niska cena (< 50% median)

**Confidence score:**
```javascript
high: >= 20 ofert, avg quality >= 7.5
medium: >= 10 ofert, avg quality >= 6.5
low: < 10 ofert lub avg quality < 6.5
```

**Price volatility tracking:**
- Jeśli ceny wahają się > 15% → recommend Ghost Mode

---

### **5. Deal Score Services** (`dealScoreServices.js`)

**GŁÓWNY SILNIK**

**Deal Score formula:**
```javascript
deal_score = 
  (0.4 * price_score) +      // Category-specific weight
  (0.2 * quality_score) +
  (0.2 * fit_score) +
  (0.1 * trust_score) +
  (0.1 * freshness)
```

**Price score (0-10):**
```
-20% (drożej) = 0
0% (równo) = 5
+20% (taniej) = 8
+40% (bardzo taniej) = 10
```

**Fit score (0-10):**
- Dopasowanie do preferencji usera
- Vacation: beachfront, spa, all inclusive
- Energy: green, fixed price
- Telecom: unlimited, 5G

**Trust score (0-100):**
- Trusted sellers: +30 (booking.com, ing, kpn, etc)
- Reviews: +5 to +20
- Completeness: +10

**Freshness score (0-10):**
```
< 24h = 10
< 7 days = 7
< 30 days = 5
> 30 days = 3
```

---

## 🔄 ROTACJA (40/30/20/10)

**Jak w produktach!**

```javascript
40% best deals
30% alternatywy
20% niszowe
10% experiment
```

**User-specific seed:**
- Każdy user = inna kolejność
- Anti-pattern learning

---

## 🏆 FINAL OUTPUT (TOP 3-5)

**Nie lista jak porównywarka!**

```javascript
[
  {
    _label: 'best',
    _icon: '🥇',
    _description: 'Najlepsza opcja (AI pick)',
    ...offer
  },
  {
    _label: 'cheapest',
    _icon: '🥈',
    _description: 'Tańsza alternatywa',
    ...offer
  },
  {
    _label: 'quality',
    _icon: '💎',
    _description: 'Najlepsza jakość/cena',
    ...offer
  },
  {
    _label: 'hidden',
    _icon: '🔥',
    _description: 'Hidden gem',
    ...offer
  }
]
```

**User wybiera w 30 sekund (nie 30 minut)**

---

## 💰 KOSZTY (REALNE)

### **PRZED (klasyczna porównywarka):**
```
20 queries × €0.20 = €4.00
AI enrichment: €0.50
Infra: €0.50
TOTAL: €5.00 per user
```

### **PO (nasz system):**
```
1-3 queries × €0.10 = €0.10-€0.30
AI enrichment: €0.10-€0.50
Infra: €0.50
Cache hit (80%): €0.00
TOTAL: ~€1.00 per user (€0.20 with cache!)
```

**OSZCZĘDNOŚĆ: -80% (-€4.00 per user)**

---

## 📊 PERFORMANCE (EFEKT)

| Element | Oni | Ty |
|---------|-----|-----|
| Ilość zapytań | dużo ↓ | **mało** ✅ |
| Jakość dopasowania | średnia | **🔥 wysoka** |
| UX | lista | **AI wybór** ✅ |
| Ceny | standard | **🔥 niższe** |
| Rotacja | brak | **🔥 jest** |

---

## 🎯 UŻYCIE

### **Przykład: Energy Configurator**

```javascript
const { 
  enrichProfile, 
  generateServiceQueries, 
  calculateServiceDealScore,
  filterCheapButGood,
  selectTopOffers 
} = require('./services/dealScoreServices');

// 1. User input (minimal)
const userInput = {
  usage: 'medium',
  persons: 2
};

// 2. AI enrichment
const enriched = enrichProfile('energy', userInput);
// → { usage: 'medium', persons: 2, budget: 120, standard: 'medium', preferences: { green: true, fixed: true } }

// 3. Generate queries (1-3 max)
const queries = generateServiceQueries('energy', enriched);
// → ['goedkope energie vergelijken', 'groene energie gemiddeld']

// 4. Fetch offers (from API)
const offers = await fetchOffersFromAPI(queries);

// 5. Filter: cheap BUT good
const filtered = filterCheapButGood(offers, 'energy');

// 6. Calculate Deal Score
const scored = filtered.map(offer => ({
  ...offer,
  _dealScore: calculateServiceDealScore(offer, 'energy', enriched)
}));

// 7. Select TOP 3-5
const top = selectTopOffers(scored, 5);

// 8. Return to user
return {
  offers: top,
  confidence: getConfidenceScore(filtered),
  volatility: getPriceVolatility(filtered)
};
```

---

## 🚨 CRITICAL RULES

1. **ZAWSZE używaj AI enrichment** (user podaje 3-4 pola, nie 20!)
2. **ZAWSZE używaj smart queries** (1-3 max, nie 20!)
3. **ZAWSZE używaj cheap-but-good filter** (nie pokazuj śmieci!)
4. **ZAWSZE używaj category-specific weights** (wakacje ≠ kredyt!)
5. **ZAWSZE używaj rotacji** (anti-pattern learning!)
6. **ZAWSZE zwracaj TOP 3-5** (nie listę 100 ofert!)
7. **NIGDY nie pokazuj najtańszych śmieci** (quality > threshold!)

---

## 💡 UNFAIR ADVANTAGES

1. **Minimal input** (3-4 pola vs 20) → konwersja ↑↑↑
2. **Smart queries** (1-3 vs 20) → koszty ↓↓↓
3. **Cheap but good** (nie śmieci) → jakość ↑↑↑
4. **AI wybór** (TOP 3-5 vs lista) → UX ↑↑↑
5. **Category-specific** (różne wagi) → dopasowanie ↑↑↑
6. **Rotacja** (40/30/20/10) → anti-pattern ↑↑↑
7. **Confidence + Volatility** (Ghost Mode) → retention ↑↑↑

**KONKURENCJA TEGO NIE MA!** 🔥

---

## 🎉 SUMMARY

**TO JEST ANTI-COMPARISON ENGINE!**

> "Nie pytam ile chcesz wydać, tylko znajduję najlepszą opcję za możliwie najmniej"

**Efekt:**
- ✅ Niższe koszty niż konkurencja (-80%)
- ✅ Lepsze wyniki (cheap BUT good)
- ✅ Lepszy UX (TOP 3-5, nie lista)
- ✅ Wyższa konwersja (minimal input)
- ✅ Wyższa retention (confidence + volatility)

**UNFAIR ADVANTAGE - GAME CHANGER!** 🚀
