# 🎯 GOOGLE SHOPPING API - ZAAWANSOWANE FILTRY

**Źródło:** SearchAPI.io - Google Shopping API  
**Odkrycie:** Możemy używać zaawansowanych filtrów w query!

---

## 📋 **DOSTĘPNE FILTRY:**

### **1. Search by PRICE:**
```
tshirt under $30
skinny fit kids jeans between $15 and $30
charizard over $300
```

### **2. Search by SIZE:**
```
mens size 8.5 nike air
```

### **3. Search by COLOR:**
```
Playstation white
```

### **4. Search nearby stores:**
```
Apparel nearby
```

### **5. Search by CONDITION:**
```
iphone used
macbook new
```

### **6. Search by BRAND:**
```
prada dress
gucci shoes
```

### **7. Search DISCOUNTED products:**
```
laptop on sale
headphones on sale
```

---

## 💡 **JAK TO WYKORZYSTAĆ DLA NISZOWYCH SKLEPÓW:**

### **PROBLEM:**
- Google Shopping pokazuje głównie gigantów (bol.com, Amazon.nl)
- Niszowe sklepy są dalej w wynikach

### **ROZWIĄZANIE:**
Użyj filtrów żeby **wymusić niszowe sklepy**!

```javascript
// STRATEGIA 1: Szukaj "on sale" (promocje)
const query1 = `${productName} on sale`;
// Efekt: Niszowe sklepy częściej mają promocje niż giganci!

// STRATEGIA 2: Szukaj w price range (tańsze)
const query2 = `${productName} under €${basePrice * 0.8}`;
// Efekt: Giganci rzadko są najtańsi, niszowe częściej!

// STRATEGIA 3: Szukaj "new" (nowe produkty)
const query3 = `${productName} new`;
// Efekt: Odrzuca używane z Marktplaats

// STRATEGIA 4: Multi-query (różne warianty)
const queries = [
  productName,                              // Standard
  `${productName} on sale`,                 // Promocje
  `${productName} under €${basePrice}`,     // Tańsze
  `${productName} new`,                     // Nowe
  `${productName} discount`,                // Zniżki
];
```

---

## 🚀 **NOWA STRATEGIA - MULTI-QUERY:**

```javascript
async function fetchGoogleShoppingMultiQuery(productName, basePrice) {
  const queries = [
    // Query 1: Standard (giganci + niszowe)
    productName,
    
    // Query 2: On sale (niszowe częściej!)
    `${productName} on sale`,
    
    // Query 3: Price range (tańsze = niszowe)
    `${productName} under €${Math.round(basePrice * 0.9)}`,
    
    // Query 4: Discount (promocje = niszowe)
    `${productName} discount`,
    
    // Query 5: New (odrzuca używane)
    `${productName} new`
  ];
  
  const allOffers = [];
  
  for (const query of queries) {
    const offers = await fetchGoogleShopping(query);
    allOffers.push(...offers);
  }
  
  // Deduplikacja (usuń duplikaty)
  const uniqueOffers = deduplicateOffers(allOffers);
  
  return uniqueOffers;
}

function deduplicateOffers(offers) {
  const seen = new Map();
  
  return offers.filter(offer => {
    const key = `${offer.seller}_${offer.price}`;
    
    if (seen.has(key)) {
      return false;
    }
    
    seen.set(key, true);
    return true;
  });
}
```

---

## 📊 **PRZYKŁAD - iPhone 15 Pro:**

### **PRZED (1 query):**
```javascript
query = "iPhone 15 Pro"
→ 40 ofert: 70% giganci, 30% niszowe
```

### **PO (5 queries):**
```javascript
query1 = "iPhone 15 Pro"              → 40 ofert (70% giganci)
query2 = "iPhone 15 Pro on sale"      → 30 ofert (50% niszowe!) ✅
query3 = "iPhone 15 Pro under €1200"  → 25 ofert (60% niszowe!) ✅
query4 = "iPhone 15 Pro discount"     → 20 ofert (55% niszowe!) ✅
query5 = "iPhone 15 Pro new"          → 35 ofert (40% niszowe)

TOTAL: ~150 ofert (deduplikacja → ~80 unique)
→ 50% niszowe! ✅✅✅
```

---

## 💰 **KOSZT:**

### **SearchAPI.io pricing:**
```
1 query = 1 credit
5 queries = 5 credits

Plan:
- Free: 100 credits/month (20 searches)
- Starter: $49/month = 5000 credits (1000 searches)
- Pro: $99/month = 15000 credits (3000 searches)
```

### **Kalkulacja:**
```
1 user search = 5 queries = 5 credits

1000 user searches/month:
- Potrzeba: 5000 credits
- Koszt: $49/month (Starter plan)

3000 user searches/month:
- Potrzeba: 15000 credits
- Koszt: $99/month (Pro plan)
```

**vs Tweakers scraping:** €0/month (darmowe)

---

## 🎯 **PORÓWNANIE:**

| Opcja | Koszt | Trudność | Czas | Niszowe sklepy | Ryzyko |
|-------|-------|----------|------|----------------|--------|
| **Google Multi-Query** | $49-99/m | Łatwa | 1 dzień | 50% | Niskie |
| **Tweakers scraping** | €0 | Średnia | 3-5 dni | 60% | Średnie |
| **Beslist API** | €50-200/m | Łatwa | 1-2 dni | 40% | Niskie |

---

## 💡 **REKOMENDACJA:**

### **OPCJA A: Google Multi-Query (SZYBKIE)** ⭐⭐⭐
**Zalety:**
- ✅ Łatwe (1 dzień implementacji)
- ✅ Oficjalne API (nie zablokują)
- ✅ 50% niszowych sklepów
- ✅ Już mamy SearchAPI.io

**Wady:**
- ⚠️ Koszt: $49-99/month
- ⚠️ 5x więcej zapytań (5 credits zamiast 1)

**Kiedy:**
- Jeśli mamy budżet $49-99/m
- Jeśli chcemy szybko (1 dzień)
- Jeśli chcemy oficjalne API

---

### **OPCJA B: Tweakers scraping (DARMOWE)** ⭐⭐
**Zalety:**
- ✅ Darmowe (€0/month)
- ✅ 60% niszowych sklepów (więcej niż Google!)
- ✅ 500+ sklepów NL

**Wady:**
- ⚠️ Trudniejsze (3-5 dni)
- ⚠️ Mogą zablokować (rate limiting)
- ⚠️ HTML może się zmienić

**Kiedy:**
- Jeśli nie mamy budżetu
- Jeśli chcemy więcej niszowych (60% vs 50%)
- Jeśli mamy czas (3-5 dni)

---

### **OPCJA C: HYBRID (NAJLEPSZE!)** ⭐⭐⭐⭐
```javascript
async function fetchWithHybrid(productName, basePrice) {
  // 1. Google Multi-Query (szybkie, oficjalne)
  let offers = await fetchGoogleShoppingMultiQuery(productName, basePrice);
  
  // 2. Jeśli nadal mało niszowych → dodaj Tweakers
  const niszowe = countNiszowe(offers);
  
  if (niszowe < 10) {
    const tweakersOffers = await fetchTweakers(productName);
    offers = mergeOffers(offers, tweakersOffers);
  }
  
  return offers;
}
```

**Efekt:**
- Google Multi-Query: 50% niszowych (szybkie)
- Tweakers backup: +10-20% niszowych (jeśli trzeba)
- **TOTAL: 60-70% niszowych!** 🚀

**Koszt:**
- Google: $49-99/m
- Tweakers: €0 (backup, rzadko używany)

---

## 🚀 **PLAN IMPLEMENTACJI:**

### **TYDZIEŃ 1: Google Multi-Query**
- Dzień 1: Implementacja multi-query
- Dzień 2: Deduplikacja + testy
- Dzień 3: Optymalizacja (cache, rate limiting)
- Dzień 4-5: Production deployment

**Efekt:** 50% niszowych sklepów

---

### **TYDZIEŃ 2: Tweakers backup (opcjonalnie)**
- Dzień 1-2: Tweakers scraper
- Dzień 3: Integracja jako backup
- Dzień 4-5: Testy

**Efekt:** 60-70% niszowych sklepów

---

**Koniec dokumentu**
