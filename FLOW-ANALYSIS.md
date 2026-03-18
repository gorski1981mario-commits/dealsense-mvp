# 🔄 ANALIZA WSZYSTKICH FLOW W APLIKACJI

**Cel:** Zidentyfikować wszystkie flow (finansowe, logiczne, transakcje) i stworzyć uniwersalny system tracking + blokady pustych przejrzeń

---

## 📊 **ZIDENTYFIKOWANE FLOW:**

### **1. SCANNER FLOW (Główny - Produkty)**
**Plik:** `app/page.tsx`, `app/components/Scanner.tsx`

**Flow:**
```
User → Scan QR → View Offers → [DECISION]
  ├─ Click Offer → Redirect to Store → [PURCHASE?]
  └─ Close → No Action (PUSTE PRZEJRZENIE)
```

**Problem:** User może skanować 3x, zobaczyć oferty, ale nic nie kupić
**Tracking:** Obecnie: scans count (3 max)
**Brakuje:** Purchase tracking, conversion rate

---

### **2. CONFIGURATOR FLOW (9 Konfiguratorów)**
**Pliki:** `app/components/configurators/*.tsx`

**Flow:**
```
User → Fill Form → View Results → [DECISION]
  ├─ Lock Config → Download PDF → Send to Provider → [PURCHASE?]
  └─ Close → No Action (PUSTE PRZEJRZENIE)
```

**Problem:** User może wypełnić 100x formularzy, ale nic nie kupić
**Tracking:** Obecnie: config save count
**Brakuje:** Purchase confirmation, provider response tracking

**Konfiguratory:**
1. Insurance (ubezpieczenia)
2. Energy (energia)
3. Telecom (telekom)
4. Vacation (wakacje)
5. Leasing (leasing)
6. Mortgage (hipoteka)
7. Loan (pożyczka)
8. CreditCard (karta kredytowa)
9. Subscriptions (subskrypcje)

---

### **3. PACKAGE PURCHASE FLOW (Abonament)**
**Pliki:** `app/packages/page.tsx`, `app/checkout/[packageType]/page.tsx`

**Flow:**
```
User → View Packages → Select Package → Biometric Auth → Stripe Payment → [PURCHASE]
```

**Problem:** User może klikać "Kies dit pakket" 100x, ale nie dokończyć płatności
**Tracking:** Obecnie: package selection
**Brakuje:** Checkout abandonment rate, payment success rate

---

### **4. REFERRAL FLOW (Polecenia)**
**Pliki:** `app/api/referral/*.ts`, `app/components/ReferralShare.tsx`

**Flow:**
```
User → Generate Code → Share → Friend Clicks → [CONVERSION?]
  ├─ Friend Buys → Owner Gets -2%
  └─ Friend Ignores → No Conversion (PUSTE PRZEJRZENIE)
```

**Problem:** User może generować 100x kodów, ale nikt nie kupi
**Tracking:** Obecnie: code generation
**Brakuje:** Click tracking, conversion tracking

---

### **5. ECHO PROMPTS FLOW (AI Prompts)**
**Pliki:** `app/checkout/echo-prompts/page.tsx`

**Flow:**
```
User → View Prompts Package → Buy 10k Prompts → [PURCHASE]
```

**Problem:** User może klikać "Koop nu" 100x, ale nie dokończyć płatności
**Tracking:** Obecnie: brak
**Brakuje:** Purchase tracking

---

### **6. BILLS OPTIMIZER FLOW (Optymalizacja Rachunków)**
**Pliki:** `app/components/BillsOptimizer.tsx`

**Flow:**
```
User → Input Bills → View Savings → [DECISION]
  ├─ Confirm → Pay Commission → [PURCHASE]
  └─ Close → No Action (PUSTE PRZEJRZENIE)
```

**Problem:** User może sprawdzać 100x oszczędności, ale nic nie kupić
**Tracking:** Obecnie: brak
**Brakuje:** Confirmation tracking, commission payment tracking

---

### **7. GOLD INVESTMENT FLOW (Złoto)**
**Pliki:** `app/gold/page.tsx`

**Flow:**
```
User → Input Amount → View Gold Price → [DECISION]
  ├─ Buy → Redirect to Provider → [PURCHASE?]
  └─ Close → No Action (PUSTE PRZEJRZENIE)
```

**Problem:** User może sprawdzać 100x ceny, ale nic nie kupić
**Tracking:** Obecnie: brak
**Brakuje:** Purchase tracking

---

## ⚠️ **GŁÓWNY PROBLEM - PUSTE PRZEJRZENIA:**

### **Scenariusz:**
```
User ma PLUS/PRO/FINANCE (€19.99-39.99/mnd)
↓
Skanuje 100x produktów → Widzi oszczędności → NIE KUPUJE
Wypełnia 50x konfiguratorów → Widzi oferty → NIE KUPUJE
Sprawdza 30x rachunki → Widzi savings → NIE KUPUJE
↓
REZULTAT: User płaci abonament, ale nie generuje komisji
↓
PROBLEM: Abonament się nie opłaca (user "wyczaska" system)
```

---

## 🎯 **ROZWIĄZANIE - UNIWERSALNY SYSTEM FLOW TRACKING:**

### **Koncepcja:**
```typescript
interface FlowTracking {
  userId: string
  flowType: 'scan' | 'configurator' | 'package' | 'referral' | 'bills' | 'gold'
  flowId: string
  
  // Tracking stages
  stages: {
    view: { timestamp: string, data: any }      // User zobaczył
    action: { timestamp: string, data: any }    // User kliknął/wypełnił
    purchase: { timestamp: string, data: any }  // User kupił
  }
  
  // Conversion metrics
  conversionRate: number  // % users who purchase after view
  abandonmentRate: number // % users who abandon after action
  
  // Limits (anti-abuse)
  viewsWithoutPurchase: number  // Ile razy user tylko patrzył
  maxViewsWithoutPurchase: number  // Limit (np. 10)
}
```

### **Logika Blokady:**
```typescript
// Przykład dla Scanner Flow
if (userPackage === 'plus' || userPackage === 'pro' || userPackage === 'finance') {
  const viewsWithoutPurchase = await getViewsWithoutPurchase(userId, 'scan')
  
  if (viewsWithoutPurchase >= 10) {
    // BLOKADA
    return {
      blocked: true,
      message: "Je hebt 10 scans uitgevoerd zonder aankoop. Koop iets om door te gaan.",
      nextPurchaseRequired: true
    }
  }
}
```

---

## 📋 **IMPLEMENTACJA - PLAN:**

### **1. Stworzyć Universal Flow Tracker**
**Plik:** `app/_lib/flow-tracker.ts`

```typescript
export class FlowTracker {
  // Track view (user zobaczył)
  async trackView(userId: string, flowType: string, data: any)
  
  // Track action (user kliknął/wypełnił)
  async trackAction(userId: string, flowType: string, data: any)
  
  // Track purchase (user kupił)
  async trackPurchase(userId: string, flowType: string, data: any)
  
  // Check if user can continue (anti-abuse)
  async canContinue(userId: string, flowType: string): Promise<boolean>
  
  // Get conversion metrics
  async getConversionRate(userId: string, flowType: string): Promise<number>
}
```

### **2. Dodać do Wszystkich Flow**
- Scanner → `trackView()` po scan, `trackPurchase()` po click offer
- Configurators → `trackView()` po results, `trackPurchase()` po send to provider
- Packages → `trackView()` po select, `trackPurchase()` po payment success
- Referrals → `trackView()` po generate, `trackPurchase()` po friend buys
- Bills → `trackView()` po results, `trackPurchase()` po confirm
- Gold → `trackView()` po price, `trackPurchase()` po buy

### **3. Limity (Anti-Abuse)**
```typescript
const LIMITS = {
  free: {
    viewsWithoutPurchase: 3,  // FREE: 3 views max
    scansWithoutPurchase: 3
  },
  plus: {
    viewsWithoutPurchase: 10,  // PLUS: 10 views bez zakupu
    scansWithoutPurchase: Infinity
  },
  pro: {
    viewsWithoutPurchase: 20,  // PRO: 20 views bez zakupu
    scansWithoutPurchase: Infinity
  },
  finance: {
    viewsWithoutPurchase: 30,  // FINANCE: 30 views bez zakupu
    scansWithoutPurchase: Infinity
  }
}
```

---

## 💡 **PRZYKŁAD UŻYCIA:**

### **Scanner Flow:**
```typescript
// app/components/Scanner.tsx

// Po zeskanowaniu (VIEW)
await flowTracker.trackView(userId, 'scan', { ean, product })

// Sprawdź czy może kontynuować
const canContinue = await flowTracker.canContinue(userId, 'scan')
if (!canContinue) {
  showToast('❌ Limit osiągnięty. Kup coś aby kontynuować.')
  return
}

// Po kliknięciu oferty (ACTION)
await flowTracker.trackAction(userId, 'scan', { offerId, store })

// Po zakupie (PURCHASE) - webhook od sklepu
await flowTracker.trackPurchase(userId, 'scan', { orderId, amount })
```

### **Configurator Flow:**
```typescript
// app/components/configurators/EnergyConfigurator.tsx

// Po wyświetleniu wyników (VIEW)
await flowTracker.trackView(userId, 'configurator_energy', { results })

// Sprawdź czy może kontynuować
const canContinue = await flowTracker.canContinue(userId, 'configurator_energy')
if (!canContinue) {
  showToast('❌ Limit osiągnięty. Wyślij konfigurację do dostawcy aby kontynuować.')
  return
}

// Po wysłaniu do dostawcy (ACTION)
await flowTracker.trackAction(userId, 'configurator_energy', { providerId })

// Po potwierdzeniu zakupu (PURCHASE) - webhook od dostawcy
await flowTracker.trackPurchase(userId, 'configurator_energy', { contractId, amount })
```

---

## 🎯 **REZULTAT:**

### **Przed:**
```
User (PLUS) → 100 skanów → 0 zakupów → Abonament się nie opłaca
User (PRO) → 50 konfiguratorów → 0 zakupów → Abonament się nie opłaca
```

### **Po:**
```
User (PLUS) → 10 skanów → BLOKADA → "Kup coś aby kontynuować"
User (PRO) → 20 konfiguratorów → BLOKADA → "Wyślij do dostawcy aby kontynuować"
```

### **Korzyści:**
- ✅ Eliminacja "pustych przejrzeń"
- ✅ Wymuszenie konwersji
- ✅ Abonament się opłaca (user musi kupować)
- ✅ Tracking wszystkich flow
- ✅ Metryki konwersji (analytics)

---

## 📊 **METRYKI DO TRACKOWANIA:**

```typescript
interface FlowMetrics {
  // Conversion funnel
  views: number           // Ile razy user zobaczył
  actions: number         // Ile razy user kliknął/wypełnił
  purchases: number       // Ile razy user kupił
  
  // Rates
  viewToActionRate: number    // % users who act after view
  actionToPurchaseRate: number // % users who buy after action
  overallConversionRate: number // % users who buy after view
  
  // Abandonment
  abandonedViews: number      // Views bez action
  abandonedActions: number    // Actions bez purchase
  
  // Revenue
  totalRevenue: number        // Suma komisji
  avgRevenuePerUser: number   // Średnia komisja per user
}
```

---

**Status:** ANALIZA ZAKOŃCZONA  
**Następny krok:** Implementacja Universal Flow Tracker
