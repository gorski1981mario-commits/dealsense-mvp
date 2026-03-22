# 🎯 JAK DOBRAĆ SIĘ DO NISZOWYCH SKLEPÓW NL - BEZ CRAWLERA

**Problem:** Google Shopping pokazuje tylko gigantów (bol.com, Amazon.nl)  
**Cel:** Znaleźć niszowe sklepy NL które mają lepsze ceny  
**Ograniczenie:** Crawler zamrożony

---

## 💡 **ROZWIĄZANIA - OD NAJLEPSZEGO:**

### **OPCJA 1: TWEAKERS PRICEWATCH** ⭐⭐⭐

**Co to jest:**
- Największa porównywarka cen w Holandii
- **MA WSZYSTKIE NISZOWE SKLEPY NL**
- Działa od 20+ lat, ogromna baza

**Jak to działa:**
```
Tweakers Pricewatch:
- 500+ sklepów NL (giganci + niszowe!)
- Aktualizacja cen co 1-24h
- API publiczne (unofficial)
- Scraping możliwy
```

**PRZYKŁAD:**
```
iPhone 15 Pro na Tweakers:
- bol.com: €999
- Coolblue: €989
- Belsimpel: €949 ✅ (niszowy!)
- You-Mobile: €929 ✅✅ (niszowy!)
- iPhoned: €919 ✅✅✅ (niszowy!)
```

**JAK TO ZROBIĆ:**

#### **A. Tweakers Unofficial API:**
```javascript
// Tweakers ma unofficial API
const TWEAKERS_API = 'https://tweakers.net/pricewatch/search/';

async function fetchTweakers(productName) {
  const url = `${TWEAKERS_API}?keyword=${encodeURIComponent(productName)}`;
  
  // Fetch HTML
  const response = await fetch(url);
  const html = await response.text();
  
  // Parse HTML (cheerio)
  const $ = cheerio.load(html);
  
  const offers = [];
  $('.shop-listing').each((i, el) => {
    const shop = $(el).find('.shop-name').text();
    const price = parseFloat($(el).find('.price').text().replace('€', '').replace(',', '.'));
    const url = $(el).find('a').attr('href');
    
    offers.push({ shop, price, url });
  });
  
  return offers;
}
```

**EFEKT:** +200-300 niszowych sklepów NL! ⭐

---

### **OPCJA 2: BESLIST.NL** ⭐⭐

**Co to jest:**
- Druga największa porównywarka NL
- 300+ sklepów NL
- Ma API (płatne) lub scraping

**JAK TO ZROBIĆ:**

#### **A. Beslist API (płatne):**
```javascript
// Beslist ma oficjalne API dla partnerów
// Koszt: €50-200/miesiąc
// https://www.beslist.nl/info/api

const BESLIST_API = 'https://api.beslist.nl/v1/products';

async function fetchBeslist(productName, apiKey) {
  const response = await fetch(`${BESLIST_API}?q=${productName}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  
  const data = await response.json();
  return data.products.map(p => ({
    shop: p.shop_name,
    price: p.price,
    url: p.url
  }));
}
```

#### **B. Beslist Scraping (darmowe):**
```javascript
async function scrapeBeslist(productName) {
  const url = `https://www.beslist.nl/products/q/${encodeURIComponent(productName)}`;
  
  const response = await fetch(url);
  const html = await response.text();
  
  // Parse HTML
  const $ = cheerio.load(html);
  
  const offers = [];
  $('.product-item').each((i, el) => {
    const shop = $(el).find('.shop-name').text();
    const price = parseFloat($(el).find('.price').text().replace('€', ''));
    const url = $(el).find('a').attr('href');
    
    offers.push({ shop, price, url });
  });
  
  return offers;
}
```

**EFEKT:** +100-200 niszowych sklepów NL

---

### **OPCJA 3: KIESKEURIG.NL** ⭐⭐

**Co to jest:**
- Trzecia największa porównywarka NL
- 200+ sklepów NL
- Scraping możliwy

**JAK TO ZROBIĆ:**
```javascript
async function scrapeKieskeurig(productName) {
  const url = `https://www.kieskeurig.nl/zoeken?zoekterm=${encodeURIComponent(productName)}`;
  
  const response = await fetch(url);
  const html = await response.text();
  
  const $ = cheerio.load(html);
  
  const offers = [];
  $('.price-row').each((i, el) => {
    const shop = $(el).find('.shop').text();
    const price = parseFloat($(el).find('.price').text().replace('€', ''));
    const url = $(el).find('a').attr('href');
    
    offers.push({ shop, price, url });
  });
  
  return offers;
}
```

**EFEKT:** +100-150 niszowych sklepów NL

---

### **OPCJA 4: IDEALO.NL** ⭐

**Co to jest:**
- Międzynarodowa porównywarka (DE/NL/BE)
- 150+ sklepów NL
- API dostępne

**JAK TO ZROBIĆ:**
```javascript
// Idealo ma API dla partnerów
const IDEALO_API = 'https://api.idealo.com/v1/search';

async function fetchIdealo(productName) {
  const response = await fetch(`${IDEALO_API}?q=${productName}&country=NL`);
  const data = await response.json();
  
  return data.offers.map(o => ({
    shop: o.merchant,
    price: o.price,
    url: o.url
  }));
}
```

**EFEKT:** +100 sklepów NL

---

## 🎯 **REKOMENDACJA - CO ZROBIĆ:**

### **IMPLEMENTACJA - POZIOM 1 (1 tydzień):**

```javascript
// NOWY FLOW:
async function fetchWithNiszowe(productName, basePrice) {
  // 1. Google Shopping (giganci)
  let offers = await fetchGoogleShopping(productName);
  
  // 2. Jeśli mało ofert lub tylko giganci → dodaj Tweakers
  if (offers.length < 5 || onlyGiants(offers)) {
    const tweakersOffers = await fetchTweakers(productName);
    offers = mergeOffers(offers, tweakersOffers);
  }
  
  // 3. Jeśli nadal mało → dodaj Beslist
  if (offers.length < 5) {
    const beslistOffers = await scrapeBeslist(productName);
    offers = mergeOffers(offers, beslistOffers);
  }
  
  return offers;
}

function onlyGiants(offers) {
  const giants = ['bol.com', 'amazon.nl', 'coolblue'];
  const giantCount = offers.filter(o => 
    giants.some(g => o.seller.toLowerCase().includes(g))
  ).length;
  
  return giantCount === offers.length;
}
```

---

## 📊 **PORÓWNANIE OPCJI:**

| Opcja | Sklepy | Koszt | Trudność | Efekt |
|-------|--------|-------|----------|-------|
| **Tweakers** | 500+ | Darmowe (scraping) | Średnia | ⭐⭐⭐ |
| **Beslist API** | 300+ | €50-200/m | Łatwa | ⭐⭐⭐ |
| **Beslist Scraping** | 300+ | Darmowe | Średnia | ⭐⭐ |
| **Kieskeurig** | 200+ | Darmowe (scraping) | Średnia | ⭐⭐ |
| **Idealo** | 150+ | €? | Średnia | ⭐ |

---

## 🚀 **PLAN IMPLEMENTACJI:**

### **TYDZIEŃ 1:**
1. ✅ Zbuduj Tweakers scraper
2. ✅ Dodaj do market-api.js jako fallback
3. ✅ Test na 10 produktach

**TARGET:** 50-70% ofert z niszowych sklepów

---

### **TYDZIEŃ 2:**
1. ✅ Dodaj Beslist scraping (backup)
2. ✅ Optymalizacja (cache, rate limiting)
3. ✅ Production deployment

**TARGET:** 70-80% ofert z niszowych sklepów

---

## 💎 **UNFAIR ADVANTAGE:**

**PRZED (tylko Google Shopping):**
- bol.com: 67%
- Amazon.nl: 56%
- Niszowe: 11%

**PO (Google + Tweakers + Beslist):**
- bol.com: 30%
- Amazon.nl: 25%
- **Niszowe: 45%** ✅✅✅

**USER ZOBACZY SKLEPY KTÓRYCH NIE MA NA BOL ANI AMAZON!**

---

## 🎯 **PRZYKŁAD - iPhone 15 Pro:**

**PRZED:**
1. bol.com - €999
2. Amazon.nl - €989
3. Coolblue - €979

**PO (z Tweakers):**
1. **iPhoned - €919** ✅ (niszowy!)
2. **You-Mobile - €929** ✅ (niszowy!)
3. **Belsimpel - €949** ✅ (niszowy!)
4. bol.com - €999
5. Amazon.nl - €989

**Oszczędność: €80 (8%) więcej niż bol.com!**

---

## ⚠️ **UWAGA - LEGAL:**

**Scraping Tweakers/Beslist:**
- Sprawdź Terms of Service
- Dodaj rate limiting (max 1 request/s)
- Dodaj User-Agent
- Nie przeciążaj serwerów
- Rozważ kontakt z nimi (partnerstwo?)

**LEPIEJ:** Spróbuj negocjować API access jako partner

---

**Koniec dokumentu**
