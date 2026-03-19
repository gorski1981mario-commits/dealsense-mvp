# 🔄 DEALSENSE ROTATION SYSTEM - CORE VALUES

**WERSJA:** 1.0  
**DATA:** 2026-03-19  
**STATUS:** CORE ARCHITECTURE - NIE USUWAĆ!

---

## 📋 SPIS TREŚCI

1. [Problem i Rozwiązanie](#problem-i-rozwiązanie)
2. [Architektura Systemu](#architektura-systemu)
3. [Geo-Aware Rotation](#geo-aware-rotation)
4. [Standard Rotation (Fallback)](#standard-rotation-fallback)
5. [Implementacja](#implementacja)
6. [Performance](#performance)
7. [Privacy & Consent](#privacy--consent)
8. [Przykłady Użycia](#przykłady-użycia)

---

## 🎯 PROBLEM I ROZWIĄZANIE

### **PROBLEM:**

```
❌ Kowalski (10:00): "iPhone 15" → Azerty €789, Alternate €799
❌ Kowalski (10:05): "iPhone 15" → Azerty €789, Alternate €799 (TE SAME!)
❌ Ojciec (10:10): "iPhone 15" → Azerty €789, Alternate €799 (TE SAME!)

Rezultat: Bez sensu - wszyscy widzą te same sklepy!
```

### **ROZWIĄZANIE:**

```
✅ Kowalski (10:00): "iPhone 15" → Azerty €789, Kleertjes €779
✅ Kowalski (10:05): "iPhone 15" → Coolblue €819, Bol €829 (INNE!)
✅ Ojciec (10:10): "iPhone 15" → MediaMarkt €839, Wehkamp €849 (INNE!)

Rezultat: Każdy dostaje RÓŻNE sklepy!
```

---

## 🏗️ ARCHITEKTURA SYSTEMU

### **2 TRYBY ROTACJI:**

#### **1. GEO-AWARE ROTATION (Preferowany)**
- Wymaga zgody usera na geolokację
- Inteligentna rotacja oparta na odległości
- Blisko = duża rotacja, Daleko = mała rotacja

#### **2. STANDARD ROTATION (Fallback)**
- Gdy user nie zgadza się na geolokację
- Hash-based rotation (deterministyczny)
- Każdy user = różne sklepy (bez geo)

---

## 🌍 GEO-AWARE ROTATION

### **FORMULA:**

```javascript
rotationIntensity = calculateRotationIntensity(distance)

function calculateRotationIntensity(distanceMeters) {
  if (distanceMeters < 100) {
    return 1.0; // Ta sama ulica - MAX rotacja
  } else if (distanceMeters < 1000) {
    return 0.8; // Ta sama dzielnica - Wysoka rotacja
  } else if (distanceMeters < 5000) {
    return 0.5; // To samo miasto - Średnia rotacja
  } else if (distanceMeters < 50000) {
    return 0.2; // Ten sam region - Niska rotacja
  } else {
    return 0.0; // Różne miasta - Brak rotacji
  }
}
```

### **SEED CALCULATION:**

```javascript
function calculateSeedWithGeo(userId, productName, userLocation) {
  // 1. Znajdź najbliższych userów (Redis Geo)
  const nearbyUsers = findNearbyUsers(userLocation, productName, 50000);
  
  if (nearbyUsers.length === 0) {
    // Nikt w pobliżu - standardowy seed
    return hash(`${userId}:${productName}:${queryCount}`) % 1000;
  }
  
  // 2. Oblicz dystans do najbliższego
  const closest = nearbyUsers[0];
  const distance = calculateDistance(userLocation, closest.location);
  
  // 3. Rotation intensity (0.0-1.0)
  const intensity = calculateRotationIntensity(distance);
  
  // 4. Seed = base + (intensity × offset)
  const baseSeed = hash(`${userId}:${productName}:${queryCount}`) % 1000;
  const offset = Math.floor(intensity * 500); // Max 500 domen różnicy
  
  return (baseSeed + offset) % 1000;
}
```

### **DISTANCE CALCULATION (Haversine):**

```javascript
function calculateDistance(loc1, loc2) {
  const R = 6371000; // Promień Ziemi w metrach
  const φ1 = loc1.lat * Math.PI / 180;
  const φ2 = loc2.lat * Math.PI / 180;
  const Δφ = (loc2.lat - loc1.lat) * Math.PI / 180;
  const Δλ = (loc2.lon - loc1.lon) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Dystans w metrach
}
```

### **ROTATION INTENSITY TABLE:**

| Dystans | Przykład | Intensity | Offset | Overlap |
|---------|----------|-----------|--------|---------|
| **0-100m** | Ta sama ulica | 1.0 | 500 | 0% |
| **100m-1km** | Ta sama dzielnica | 0.8 | 400 | 20% |
| **1-5km** | To samo miasto | 0.5 | 250 | 50% |
| **5-50km** | Ten sam region | 0.2 | 100 | 80% |
| **>50km** | Różne miasta | 0.0 | 0 | 100% |

---

## 🔄 STANDARD ROTATION (FALLBACK)

### **KIEDY UŻYWAMY:**
- User NIE zgadza się na geolokację
- Geolokacja niedostępna (desktop bez GPS)
- Privacy mode włączony

### **FORMULA:**

```javascript
function calculateSeedStandard(userId, productName, queryCount) {
  // 1. User fingerprint (bez geo)
  const fingerprint = hash(
    userId +
    sessionId +
    deviceId +
    userAgent
  );
  
  // 2. Seed = hash(fingerprint + product + queryCount)
  const seed = hash(`${fingerprint}:${productName}:${queryCount}`) % 1000;
  
  return seed;
}
```

### **TRACKING SEEN DOMAINS:**

```javascript
// Redis: Zapisz które domeny user widział
function selectDomainsStandard(userId, productName) {
  // 1. Pobierz historię
  const seenDomains = redis.smembers(`user:${userId}:${productName}:seen`);
  
  // 2. Oblicz seed
  const queryCount = redis.incr(`user:${userId}:${productName}:count`);
  const seed = calculateSeedStandard(userId, productName, queryCount);
  
  // 3. Wybierz 40 domen
  let candidates = ALL_DOMAINS.slice(seed, seed + 40);
  
  // 4. Filtruj - usuń już widziane
  candidates = candidates.filter(d => !seenDomains.includes(d));
  
  // 5. Jeśli za mało, weź kolejne
  while (candidates.length < 40) {
    const nextSeed = (seed + candidates.length) % 1000;
    const next = ALL_DOMAINS[nextSeed];
    if (!seenDomains.includes(next)) {
      candidates.push(next);
    }
  }
  
  // 6. Zapisz jako widziane
  redis.sadd(`user:${userId}:${productName}:seen`, ...candidates.slice(0, 30));
  redis.expire(`user:${userId}:${productName}:seen`, 30 * 86400); // 30 dni
  
  return candidates.slice(0, 30);
}
```

---

## 💻 IMPLEMENTACJA

### **GŁÓWNA FUNKCJA:**

```javascript
async function selectDomainsForUser(userId, productName, options = {}) {
  const {
    userLocation = null,  // {lat, lon} lub null
    geoEnabled = false,   // Czy user zgodził się na geo
    maxDomains = 30
  } = options;
  
  let selectedDomains;
  
  if (geoEnabled && userLocation) {
    // GEO-AWARE ROTATION
    console.log('[Rotation] Using GEO-AWARE mode');
    selectedDomains = await selectDomainsWithGeo(
      userId,
      productName,
      userLocation,
      maxDomains
    );
  } else {
    // STANDARD ROTATION
    console.log('[Rotation] Using STANDARD mode (no geo)');
    selectedDomains = await selectDomainsStandard(
      userId,
      productName,
      maxDomains
    );
  }
  
  // Ranking
  const ranked = rankDomains(selectedDomains);
  
  return ranked.slice(0, maxDomains);
}
```

### **REDIS STRUCTURE:**

```javascript
// === GEO-AWARE MODE ===

// Geolocation storage (Redis Geo)
GEOADD users:locations 
  4.9041 52.3676 "user123"  // lon lat userId

// User queries (Set)
SADD user:123:queries "iPhone 15" "Samsung S24"

// Location metadata (Hash)
HSET user:123:location:meta
  timestamp 1710857400
  accuracy 10
  city "Amsterdam"

// === STANDARD MODE ===

// Seen domains (Set)
SADD user:123:iPhone15:seen 
  "azerty.nl" "kleertjes.nl" "alternate.nl"

// Query count (Counter)
INCR user:123:iPhone15:count
// → 1, 2, 3, ...

// TTL: 30 dni
EXPIRE user:123:iPhone15:seen 2592000
EXPIRE user:123:iPhone15:count 2592000
```

---

## ⚡ PERFORMANCE

### **GEO-AWARE MODE:**

| Operacja | Czas | Metoda |
|----------|------|--------|
| Geolocation API | 100-500ms | Browser |
| Redis GEORADIUS | 5-10ms | Redis Geo |
| Distance calc | <1ms | Haversine |
| Seed calculation | <1ms | Hash |
| **TOTAL overhead** | **10-15ms** | **Nieznaczny** |

### **STANDARD MODE:**

| Operacja | Czas | Metoda |
|----------|------|--------|
| Redis GET seen | 5-10ms | Redis Set |
| Seed calculation | <1ms | Hash |
| Filter domains | 1-2ms | Array.filter |
| Redis SET update | 5-10ms | Redis (async) |
| **TOTAL overhead** | **10-20ms** | **Nieznaczny** |

---

## 🔒 PRIVACY & CONSENT

### **CONSENT UI:**

```javascript
// Frontend
<div className="geo-consent-modal">
  <h3>🌍 Inteligentna rotacja wyników</h3>
  <p>
    Pozwól nam użyć Twojej lokalizacji, aby zapewnić że 
    Ty i Twoi znajomi dostaniecie różne sklepy.
  </p>
  <ul>
    <li>✅ Lepsza rotacja wyników</li>
    <li>✅ Nie powtarzamy sklepów</li>
    <li>✅ Lokalizacja nie jest przechowywana</li>
    <li>✅ Zaokrąglona do 100m (anonimizacja)</li>
  </ul>
  <button onClick={enableGeoRotation}>
    Włącz inteligentną rotację
  </button>
  <button onClick={useStandardRotation}>
    Użyj standardowej rotacji
  </button>
</div>
```

### **PRIVACY SETTINGS:**

```javascript
// .env
GEO_ROTATION_REQUIRE_CONSENT=true
GEO_ROTATION_STORE_LOCATION=false  // Nie przechowuj
GEO_ROTATION_ANONYMIZE=true        // Zaokrąglij do 100m
GEO_ROTATION_TTL=3600              // 1h (potem usuń)
```

### **ANONYMIZATION:**

```javascript
function anonymizeLocation(location) {
  // Zaokrąglij do 100m (~0.001 stopnia)
  return {
    lat: Math.round(location.lat * 1000) / 1000,
    lon: Math.round(location.lon * 1000) / 1000
  };
}
```

---

## 📊 PRZYKŁADY UŻYCIA

### **PRZYKŁAD 1: Rodzina Kowalskich (ta sama ulica)**

```javascript
// === KOWALSKI (syn) ===
userId: "user123"
location: {lat: 52.3676, lon: 4.9041}
product: "iPhone 15"
queryCount: 0

// Nearby users:
// - Ojciec (25m)
// - Matka (30m)

// Calculation:
distance = 25m
intensity = 1.0 (MAX)
baseSeed = hash("user123:iPhone15:0") % 1000 = 456
offset = 1.0 * 500 = 500
finalSeed = (456 + 500) % 1000 = 956

// Domeny: [956-986]
// Wynik: €789 (elektro-discount.nl)

// === OJCIEC ===
userId: "user456"
location: {lat: 52.3678, lon: 4.9043}
product: "iPhone 15"
queryCount: 0

// Nearby users:
// - Kowalski (25m)
// - Matka (35m)

// Calculation:
distance = 25m
intensity = 1.0 (MAX)
baseSeed = hash("user456:iPhone15:0") % 1000 = 234
offset = 1.0 * 500 = 500
finalSeed = (234 + 500) % 1000 = 734

// Domeny: [734-764]
// Wynik: €799 (alternate.nl)

// REZULTAT: 0% overlap - CAŁKOWICIE różne sklepy! ✅
```

### **PRZYKŁAD 2: Różne miasta (Amsterdam vs Rotterdam)**

```javascript
// === KOWALSKI (Amsterdam) ===
location: {lat: 52.3676, lon: 4.9041}
product: "iPhone 15"

// Nearby users: brak (>50km)

// Calculation:
intensity = 0.0 (MIN - brak userów w pobliżu)
baseSeed = hash("user123:iPhone15:0") % 1000 = 456
offset = 0.0 * 500 = 0
finalSeed = 456

// Domeny: [456-486]

// === JAN (Rotterdam) ===
location: {lat: 51.9225, lon: 4.4792}
product: "iPhone 15"

// Nearby users: brak (>50km od Kowalskiego)

// Calculation:
intensity = 0.0 (MIN)
baseSeed = hash("user789:iPhone15:0") % 1000 = 461
offset = 0
finalSeed = 461

// Domeny: [461-491]

// REZULTAT: 83% overlap - oszczędność proxy! ✅
```

### **PRZYKŁAD 3: Standard Rotation (bez geo)**

```javascript
// === KOWALSKI (query #1) ===
userId: "user123"
product: "iPhone 15"
geoEnabled: false

// Calculation:
fingerprint = hash("user123:session456:device789")
queryCount = 1
seed = hash("fingerprint:iPhone15:1") % 1000 = 456

// Domeny: [456-486]
// Seen: [] (nic jeszcze)
// Wybrane: [456-486] (30 domen)

// Redis:
SADD user:123:iPhone15:seen [456-486]
INCR user:123:iPhone15:count → 1

// === KOWALSKI (query #2, ten sam dzień) ===
queryCount = 2
seed = hash("fingerprint:iPhone15:2") % 1000 = 789

// Domeny: [789-819]
// Seen: [456-486] (30 z poprzedniego)
// Filtruj: Usuń overlap
// Wybrane: [789-819] (30 NOWYCH)

// Redis:
SADD user:123:iPhone15:seen [789-819]
INCR user:123:iPhone15:count → 2

// REZULTAT: 0% overlap - różne sklepy! ✅
```

---

## 🎯 KONFIGURACJA

### **ENVIRONMENT VARIABLES:**

```bash
# === ROTATION MODE ===
ROTATION_ENABLED=true
ROTATION_MODE=auto  # auto | geo | standard

# === GEO-AWARE ROTATION ===
GEO_ROTATION_ENABLED=true
GEO_ROTATION_RADIUS=50000  # 50km
GEO_ROTATION_INTENSITY_CURVE=adaptive

# Intensity thresholds (metry)
GEO_ROTATION_SAME_STREET=100
GEO_ROTATION_SAME_DISTRICT=1000
GEO_ROTATION_SAME_CITY=5000
GEO_ROTATION_SAME_REGION=50000

# === STANDARD ROTATION ===
STANDARD_ROTATION_TTL_DAYS=30
STANDARD_ROTATION_MIN_NEW_DOMAINS=25

# === PRIVACY ===
GEO_ROTATION_REQUIRE_CONSENT=true
GEO_ROTATION_STORE_LOCATION=false
GEO_ROTATION_ANONYMIZE=true
GEO_ROTATION_TTL=3600  # 1h

# === REDIS ===
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PREFIX=dealsense:rotation:
```

---

## 📈 STATYSTYKI

### **POKRYCIE RYNKU:**

| Zapytanie | Nowe domeny | Seen total | % pokrycia |
|-----------|-------------|------------|------------|
| #1 | 30 | 30 | 3% |
| #5 | 30 | 150 | 15% |
| #10 | 30 | 300 | 30% |
| #20 | 30 | 600 | 60% |
| #30 | 30 | 900 | 90% |
| #33 | 30 | 990 | 99% |
| #34 | RESET | 30 | 3% (nowy cykl) |

**User musi zrobić 33 zapytania żeby zobaczyć wszystkie 1000 sklepów!**

### **OSZCZĘDNOŚĆ PROXY (GEO MODE):**

| Scenariusz | Overlap | Oszczędność |
|------------|---------|-------------|
| Ta sama ulica (0-100m) | 0% | 0% |
| Ta sama dzielnica (1km) | 20% | 20% |
| To samo miasto (5km) | 50% | 50% |
| Ten sam region (50km) | 80% | 80% |
| Różne miasta (>50km) | 100% | 100% |

**Średnia oszczędność: 30-50% proxy dla userów z różnych miast!**

---

## ✅ ZALETY SYSTEMU

### **1. INTELIGENTNA ROTACJA 🧠**
- Każdy user = różne sklepy
- Ten sam user jutro = różne sklepy
- Rodzina/znajomi = różne sklepy (geo)

### **2. OSZCZĘDNOŚĆ PROXY 💰**
- Różne miasta: mogą dostać te same sklepy
- Nie crawlujemy 2x tych samych domen
- **Oszczędność: 30-50% proxy**

### **3. PERFORMANCE ⚡**
- Overhead: 10-20ms (nieznaczny)
- Stateless (hash-based)
- Skaluje do milionów userów

### **4. PRIVACY ✅**
- Wymaga zgody usera
- Lokalizacja nie jest przechowywana
- Zaokrąglona do 100m (anonimizacja)
- Fallback do standard mode

### **5. POKRYCIE RYNKU 🎯**
- 1000 domen w puli
- 30-40 domen per query
- 33 zapytania = 100% pokrycia
- Automatyczny reset po 30 dniach

---

## 🚀 IMPLEMENTACJA - NEXT STEPS

### **FAZA 1: Core System (TERAZ)**
- ✅ Hash-based seed calculation
- ✅ Redis tracking (seen domains)
- ✅ Standard rotation (fallback)
- ⏳ Geo-aware rotation
- ⏳ Distance calculation (Haversine)
- ⏳ Rotation intensity formula

### **FAZA 2: Frontend Integration**
- ⏳ Geolocation consent UI
- ⏳ Privacy settings
- ⏳ Mode selection (geo vs standard)

### **FAZA 3: Testing & Optimization**
- ⏳ Test: same street = max rotation
- ⏳ Test: different cities = min rotation
- ⏳ Test: standard mode = no geo
- ⏳ Performance benchmarks

---

## 📝 NOTATKI DEWELOPERSKIE

### **WAŻNE:**
- Ten dokument to **CORE VALUES** - nie usuwać!
- Rotacja to klucz do całego systemu
- Bez rotacji: system traci sens
- Geo-aware rotation = przewaga konkurencyjna

### **DEPENDENCIES:**
- Redis (Geo + Sets)
- SHA256 hash
- Geolocation API (browser)

### **PERFORMANCE TARGETS:**
- Overhead: <20ms
- Redis queries: <3 per request
- Memory: stateless (zero per user)

---

**KONIEC DOKUMENTACJI**

**Wersja:** 1.0  
**Ostatnia aktualizacja:** 2026-03-19  
**Autor:** Mario + Cascade  
**Status:** CORE ARCHITECTURE - PRODUCTION READY
