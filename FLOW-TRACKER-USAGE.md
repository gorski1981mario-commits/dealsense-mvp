# 🔄 UNIVERSAL FLOW TRACKER - INSTRUKCJA UŻYCIA

**Plik:** `app/_lib/flow-tracker.ts`  
**Status:** ✅ GOTOWY (kod stworzony, integracja na jutro)

---

## 🎯 **CO TO JEST:**

Universal Flow Tracker to system, który:
1. **Trackuje wszystkie akcje** użytkownika (view → action → purchase)
2. **Blokuje puste przejrzenia** (user tylko patrzy, nie kupuje)
3. **Działa dla WSZYSTKICH flow** (scanner, konfiguratory, pakiety, etc.)
4. **Wymusza konwersję** (user musi kupować aby kontynuować)

---

## 📊 **LIMITY ANTI-ABUSE:**

```typescript
FREE: 3 views bez zakupu (paywall)
PLUS: 10 views bez zakupu
PRO: 20 views bez zakupu
FINANCE: 30 views bez zakupu
ZAKELIJK: 50 views bez zakupu
```

**Po przekroczeniu limitu:** BLOKADA + komunikat "Kup coś aby kontynuować"

---

## 💡 **JAK UŻYWAĆ - PRZYKŁADY:**

### **1. SCANNER FLOW (Produkty)**

**Plik do edycji:** `app/components/Scanner.tsx`

```typescript
import { flowTracker } from '../_lib/flow-tracker'
import { getDeviceId } from '../_lib/utils'

// Po zeskanowaniu QR i otrzymaniu ofert (VIEW)
const handleScanSuccess = async (offers: any[]) => {
  const userId = getDeviceId()
  const flowId = `scan_${Date.now()}`
  
  // Track VIEW
  await flowTracker.trackView(userId, 'scan', flowId, {
    ean: scannedEan,
    offersCount: offers.length
  })
  
  // Sprawdź czy może kontynuować
  const userPackage = localStorage.getItem(`package_${userId}`) || 'free'
  const { allowed, reason, viewsLeft } = await flowTracker.canContinue(
    userId,
    'scan',
    userPackage as PackageType
  )
  
  if (!allowed) {
    // BLOKADA
    showToast(`❌ ${reason}`)
    setShowUpgradePrompt(true)
    return
  }
  
  // Ostrzeżenie gdy zbliża się limit
  const warning = flowTracker.getWarningMessage(viewsLeft!, userPackage as PackageType)
  if (warning) {
    showToast(warning)
  }
  
  // Pokaż oferty
  setOffers(offers)
}

// Po kliknięciu w ofertę (ACTION)
const handleOfferClick = async (offer: any) => {
  const userId = getDeviceId()
  const flowId = `scan_${Date.now()}`
  
  // Track ACTION
  await flowTracker.trackAction(userId, 'scan', flowId, {
    offerId: offer.id,
    store: offer.store,
    price: offer.price
  })
  
  // Redirect do sklepu
  window.open(offer.url, '_blank')
}

// Po zakupie (PURCHASE) - webhook od sklepu lub manual confirmation
const handlePurchaseConfirmation = async (orderId: string, amount: number) => {
  const userId = getDeviceId()
  const flowId = `scan_${Date.now()}`
  
  // Track PURCHASE
  await flowTracker.trackPurchase(userId, 'scan', flowId, {
    orderId,
    amount,
    commission: amount * 0.09 // 9% komisja
  })
  
  // Reset licznika - user może znowu skanować
  showToast('✅ Zakup potwierdzony! Licznik zresetowany.')
}
```

---

### **2. CONFIGURATOR FLOW (Energia, Telecom, etc.)**

**Plik do edycji:** `app/components/configurators/EnergyConfigurator.tsx`

```typescript
import { flowTracker } from '../../_lib/flow-tracker'
import { getDeviceId } from '../../_lib/utils'

// Po wyświetleniu wyników (VIEW)
const handleViewResults = async () => {
  const userId = getDeviceId()
  const flowId = `config_energy_${Date.now()}`
  
  // Track VIEW
  await flowTracker.trackView(userId, 'configurator_energy', flowId, {
    energyType,
    electricityUsage,
    gasUsage
  })
  
  // Sprawdź czy może kontynuować
  const userPackage = localStorage.getItem(`package_${userId}`) || 'free'
  const { allowed, reason, viewsLeft } = await flowTracker.canContinue(
    userId,
    'configurator_energy',
    userPackage as PackageType
  )
  
  if (!allowed) {
    // BLOKADA
    alert(`❌ ${reason}`)
    router.push('/packages')
    return
  }
  
  // Ostrzeżenie
  const warning = flowTracker.getWarningMessage(viewsLeft!, userPackage as PackageType)
  if (warning) {
    alert(warning)
  }
  
  // Pokaż wyniki
  setView('results')
}

// Po wysłaniu do dostawcy (ACTION)
const handleSendToProvider = async (providerId: string) => {
  const userId = getDeviceId()
  const flowId = `config_energy_${Date.now()}`
  
  // Track ACTION
  await flowTracker.trackAction(userId, 'configurator_energy', flowId, {
    providerId,
    configId
  })
  
  alert('✅ Konfiguracja wysłana do dostawcy!')
}

// Po potwierdzeniu zakupu (PURCHASE) - webhook od dostawcy
const handlePurchaseConfirmation = async (contractId: string, amount: number) => {
  const userId = getDeviceId()
  const flowId = `config_energy_${Date.now()}`
  
  // Track PURCHASE
  await flowTracker.trackPurchase(userId, 'configurator_energy', flowId, {
    contractId,
    amount,
    commission: amount * 0.09
  })
  
  alert('✅ Kontrakt potwierdzony! Licznik zresetowany.')
}
```

---

### **3. PACKAGE PURCHASE FLOW (Abonament)**

**Plik do edycji:** `app/packages/page.tsx`

```typescript
import { flowTracker } from '../_lib/flow-tracker'

// Po kliknięciu "Kies dit pakket" (VIEW)
const handleSelectPackage = async (packageType: string) => {
  const userId = getDeviceId()
  const flowId = `package_${packageType}_${Date.now()}`
  
  // Track VIEW
  await flowTracker.trackView(userId, 'package_purchase', flowId, {
    packageType,
    price: PRICING[packageType]
  })
  
  // Redirect do checkout
  router.push(`/checkout/${packageType}`)
}

// Po rozpoczęciu płatności (ACTION)
const handleStartPayment = async (packageType: string) => {
  const userId = getDeviceId()
  const flowId = `package_${packageType}_${Date.now()}`
  
  // Track ACTION
  await flowTracker.trackAction(userId, 'package_purchase', flowId, {
    packageType,
    paymentMethod: 'stripe'
  })
}

// Po udanej płatności (PURCHASE)
const handlePaymentSuccess = async (packageType: string, amount: number) => {
  const userId = getDeviceId()
  const flowId = `package_${packageType}_${Date.now()}`
  
  // Track PURCHASE
  await flowTracker.trackPurchase(userId, 'package_purchase', flowId, {
    packageType,
    amount,
    subscriptionId: 'sub_xxx'
  })
  
  // Aktywuj pakiet
  localStorage.setItem(`package_${userId}`, packageType)
}
```

---

### **4. BILLS OPTIMIZER FLOW (Rachunki)**

**Plik do edycji:** `app/components/BillsOptimizer.tsx`

```typescript
import { flowTracker } from '../_lib/flow-tracker'

// Po wyświetleniu oszczędności (VIEW)
const handleViewSavings = async (savings: number) => {
  const userId = getDeviceId()
  const flowId = `bills_${Date.now()}`
  
  // Track VIEW
  await flowTracker.trackView(userId, 'bills_optimizer', flowId, {
    totalSavings: savings,
    billsCount: bills.length
  })
  
  // Sprawdź czy może kontynuować
  const userPackage = localStorage.getItem(`package_${userId}`) || 'free'
  const { allowed, reason } = await flowTracker.canContinue(
    userId,
    'bills_optimizer',
    userPackage as PackageType
  )
  
  if (!allowed) {
    alert(`❌ ${reason}`)
    return
  }
}

// Po potwierdzeniu optymalizacji (ACTION)
const handleConfirmOptimization = async () => {
  const userId = getDeviceId()
  const flowId = `bills_${Date.now()}`
  
  // Track ACTION
  await flowTracker.trackAction(userId, 'bills_optimizer', flowId, {
    confirmed: true
  })
}

// Po zapłaceniu komisji (PURCHASE)
const handlePayCommission = async (amount: number) => {
  const userId = getDeviceId()
  const flowId = `bills_${Date.now()}`
  
  // Track PURCHASE
  await flowTracker.trackPurchase(userId, 'bills_optimizer', flowId, {
    commission: amount
  })
}
```

---

## 📊 **METRYKI KONWERSJI:**

```typescript
// Pobierz metryki dla użytkownika
const metrics = await flowTracker.getConversionMetrics(userId, 'scan')

console.log(`
  Views: ${metrics.views}
  Actions: ${metrics.actions}
  Purchases: ${metrics.purchases}
  View → Action: ${metrics.viewToActionRate}%
  Action → Purchase: ${metrics.actionToPurchaseRate}%
  Overall Conversion: ${metrics.overallConversionRate}%
`)
```

---

## 🎯 **FLOW TYPES (Wszystkie):**

```typescript
'scan'                          // Scanner (produkty)
'configurator_insurance'        // Ubezpieczenia
'configurator_energy'           // Energia
'configurator_telecom'          // Telekom
'configurator_vacation'         // Wakacje
'configurator_leasing'          // Leasing
'configurator_mortgage'         // Hipoteka
'configurator_loan'             // Pożyczka
'configurator_creditcard'       // Karta kredytowa
'configurator_subscriptions'    // Subskrypcje
'package_purchase'              // Zakup pakietu
'referral'                      // Polecenia
'bills_optimizer'               // Optymalizacja rachunków
'gold_investment'               // Inwestycja w złoto
```

---

## ⚠️ **WAŻNE - INTEGRACJA NA JUTRO:**

**Dzisiaj:** Kod stworzony, gotowy do użycia  
**Jutro:** Integracja z wszystkimi flow (scanner, konfiguratory, etc.)

**Plan integracji:**
1. Scanner → dodać `trackView()`, `trackAction()`, `canContinue()`
2. Wszystkie 9 konfiguratorów → dodać tracking
3. Package purchase → dodać tracking
4. Bills Optimizer → dodać tracking
5. Testy end-to-end

---

## 🔧 **TESTING:**

```typescript
// Clear data dla testów
flowTracker.clearAllData(userId)

// Symuluj flow
await flowTracker.trackView(userId, 'scan', 'test_1', {})
await flowTracker.trackView(userId, 'scan', 'test_2', {})
await flowTracker.trackView(userId, 'scan', 'test_3', {})

// Sprawdź limit
const { allowed } = await flowTracker.canContinue(userId, 'scan', 'free')
console.log(allowed) // false (FREE ma limit 3)

// Symuluj zakup
await flowTracker.trackPurchase(userId, 'scan', 'test_4', { amount: 100 })

// Sprawdź ponownie
const { allowed: allowed2 } = await flowTracker.canContinue(userId, 'scan', 'free')
console.log(allowed2) // true (licznik zresetowany po zakupie)
```

---

**Status:** ✅ **GOTOWY DO INTEGRACJI JUTRO**  
**Oszczędność:** ~800 linii kodu + eliminacja pustych przejrzeń  
**Korzyść:** Wymuszenie konwersji, abonament się opłaca
