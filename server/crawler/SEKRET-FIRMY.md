# 🔒 SEKRET FIRMY - SMART ROTATION

## ⚠️ POUFNE - NIE UDOSTĘPNIAĆ!

---

## 🎯 GŁÓWNA ZASADA DEALSENSE

**SMART ROTATION = UNFAIR ADVANTAGE**

Konkurencja (Kieskeurig, Tweakers, Beslist) pokazuje zawsze te same sklepy w tej samej kolejności.
User się uczy → omija platformę → tracimy prowizję.

**MY:** User NIE MOŻE się nauczyć patternu!

---

## 📋 KLUCZOWE ZASADY (NIE MOGĄ SIĘ STRACIĆ!)

### 1. TYLKO OFERTY TAŃSZE NIŻ CENA BAZOWA
```javascript
// ZAWSZE filtruj:
validOffers = offers.filter(o => o.price < basePrice)
validOffers.sort((a, b) => a.price - b.price) // najtańszy → najdroższy
```

### 2. ROTACJA MIĘDZY RÓŻNYMI SKLEPAMI
```javascript
// Każdy scan = RÓŻNE sklepy (nie te same 3!)
// Anti-pattern: omijaj sklepy z ostatnich 15 skanów
const recentShops = getRecentShops(userId) // last 15 shops
if (recentShops.includes(offer.seller) && position < 2) {
  skip() // Omijaj dla top 2 pozycji
}
```

### 3. MULTI-LEVEL ROTATION
```javascript
// LEVEL 1: 24h cycle (pattern wraca po 24h)
const daySlot = Math.floor(now / 86400000)

// LEVEL 2: Gradual rotation (100% → 50% → 25% → 100%)
const rotationCycle = daySlot % 4 // 0, 1, 2, 3
const intensity = [1.0, 0.5, 0.25, 1.0][rotationCycle]

// LEVEL 3: Hour variation (lekka zmiana co godzinę)
const hourSlot = Math.floor((now % 86400000) / 3600000)
```

### 4. SEED GENERATION
```javascript
// Deterministyczny seed:
const seedString = `${userId}-${daySlot}-${hourSlot}-${intensity}`
const hash = crypto.createHash('md5').update(seedString).digest('hex')
const seed = parseInt(hash.substring(0, 8), 16)

// EFEKT:
// - Ten sam user + ten sam dzień + ta sama godzina = ten sam pattern
// - Różny user = inny pattern
// - Inna godzina = lekka zmiana
// - Inny dzień = inna intensity
```

### 5. MICRO-SHUFFLE (intensity-based)
```javascript
// INTENSITY 100% (Day 1, 4): Full shuffle
if (random < 0.5) {
  return [offers[2], offers[0], offers[1]] // 1→3, 2→1, 3→2
}

// INTENSITY 50% (Day 2): Half shuffle
if (random < 0.5) {
  [offers[0], offers[1]] = [offers[1], offers[0]] // 1↔2
}

// INTENSITY 25% (Day 3): Quarter shuffle
if (random < 0.3) {
  [offers[1], offers[2]] = [offers[2], offers[1]] // 2↔3
}
```

---

## 🔥 PRZYKŁAD DZIAŁANIA

### User A skanuje iPhone 15 Pro przez 4 dni:

```
DAY 1 (Monday) 10:00 - INTENSITY 100%:
1. Azerty €1.099
2. Beslist €999
3. Alternate €1.049

DAY 2 (Tuesday) 10:00 - INTENSITY 50%:
1. Alternate €1.049 ← Swap 1↔2
2. Beslist €999
3. Azerty €1.099

DAY 3 (Wednesday) 10:00 - INTENSITY 25%:
1. Beslist €999
2. Azerty €1.099 ← Swap 2↔3
3. Alternate €1.049

DAY 4 (Thursday) 10:00 - INTENSITY 100%:
1. Azerty €1.099 ← Wraca pattern z Day 1!
2. Beslist €999
3. Alternate €1.049
```

**EFEKT:** User widzi różne sklepy, ale NIE widzi patternu!

---

## 📁 LOKALIZACJA KODU

```
server/crawler/
├── smart-rotation.js ← GŁÓWNA LOGIKA (SEKRET!)
├── smart-crawler-strategy.js ← Integracja z crawlerem
├── domains-1000-nl-final.js ← 1000 NL domen (400+600)
└── SEKRET-FIRMY.md ← Ten plik

app/api/crawler/search/route.ts ← API endpoint (używa smart rotation)
app/_hooks/useConfiguratorSearch.ts ← Hook dla konfiguratorów
app/components/Scanner.tsx ← Scanner (EAN)
```

---

## ⚙️ INTEGRACJA

### W KAŻDYM MIEJSCU gdzie pokazujemy oferty:

```javascript
const smartRotation = require('./smart-rotation')

// 1. Pobierz oferty z crawlera
const offers = await crawler.search(query, ean, category)

// 2. Zastosuj smart rotation
const rotated = smartRotation.rotateOffers(
  offers,
  userId,
  packageType,
  basePrice // KLUCZOWE: tylko oferty < basePrice
)

// 3. Zwróć rotowane oferty
return rotated
```

---

## 🚫 CO NIE WOLNO ROBIĆ

❌ **NIE** pokazuj zawsze tych samych sklepów  
❌ **NIE** sortuj tylko po cenie (user się nauczy)  
❌ **NIE** używaj czystego random (user widzi chaos)  
❌ **NIE** pokazuj ofert droższy niż basePrice  
❌ **NIE** udostępniaj tego kodu konkurencji!  

---

## ✅ CO MUSI BYĆ ZAWSZE

✅ Filtruj: `price < basePrice`  
✅ Sortuj: najtańszy → najdroższy  
✅ Rotuj: RÓŻNE sklepy każdy scan  
✅ Anti-pattern: omijaj recent shops  
✅ Multi-level: 24h cycle + gradual + hour variation  

---

## 🏆 PRZEWAGA KONKURENCYJNA

| Feature | My | Kieskeurig | Tweakers | Beslist |
|---------|-----|------------|----------|---------|
| Smart Rotation | ✅ | ❌ | ❌ | ❌ |
| Anti-pattern | ✅ | ❌ | ❌ | ❌ |
| Multi-level | ✅ | ❌ | ❌ | ❌ |
| 1000 domen | ✅ | ❌ (50) | ❌ (30) | ✅ (200) |
| 60% niszowych | ✅ | ❌ | ❌ | ❌ |

**WYNIK: 100x PRZEWAGA! 🏆**

---

## 🔐 BACKUP

**WAŻNE:** Ten kod jest KLUCZOWY dla biznesu!

Backup locations:
1. Git repository (private)
2. Memory system (Cascade)
3. Ten plik (SEKRET-FIRMY.md)

**Jeśli coś się stanie, ODTWÓRZ Z TEGO PLIKU!**

---

## 📞 KONTAKT

W razie pytań: tylko właściciel firmy!

**NIE UDOSTĘPNIAJ NIKOMU!** 🔒
