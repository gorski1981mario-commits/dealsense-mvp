# 🎯 UI FLOW IMPLEMENTATION PLAN

**Data:** 2026-03-25  
**Status:** Awaiting approval

---

## 📋 **LOGICZNA STRUKTURA UI (1→10)**

### **FREE Page:**
```
1. Header & Status
   - Logo: D.nl
   - Badge: FREE
   - Scans: 0/3 gebruikt
   - Badges: ✓ 1000+ winkels, ✓ Veilig, ✓ 3 gratis scans

2. Product Scanner
   - URL/Name input (editable)
   - "Scan Product" button (auto-enabled gdy wypełnione)
   - OF divider
   - "Scan Barcode/QR" button
   
3. Auto-fill Preview (gdy Scanner wypełni dane)
   - ✓ Product: iPhone 15 Pro 128GB
   - ✓ Prijs: €999
   - ✓ Shop: bol.com
   - ✓ Categorie: electronics

4. Results Section (po kliknięciu "Vind goedkoper" w Scanner)
   - Oferty (jeśli znaleźliśmy)
   - LUB Ghost Mode button (jeśli nie znaleźliśmy) - tylko PLUS/PRO/FINANCE

5. Scan History

6. FAQ

7. Footer
```

---

### **PLUS Page:**
```
1. Header & Status
   - Badge: PLUS
   - Biometric setup prompt (jeśli nie zarejestrowane)

2. Product Scanner (identyczny jak FREE)

3. Auto-fill Preview

4. Results Section
   - Oferty
   - LUB Ghost Mode (24h)

5. Payment Button (€19.99/maand)

6. Scan History

7. FAQ

8. Footer
```

---

### **PRO Page:**
```
1. Header & Status
   - Badge: PRO
   - Biometric setup prompt

2. Product Scanner (identyczny)

3. Auto-fill Preview

4. Results Section
   - Oferty
   - LUB Ghost Mode (48h)

5. Payment Button (€29.99/maand)

6. Diensten Configurators (PRO exclusive)
   - Vakanties
   - Verzekeringen
   - Energie
   - Telecom

7. Scan History

8. FAQ

9. Footer
```

---

### **FINANCE Page:**
```
1. Header & Status
   - Badge: FINANCE
   - Biometric setup prompt

2. Product Scanner (identyczny)

3. Auto-fill Preview

4. Results Section
   - Oferty
   - LUB Ghost Mode (7 dagen)

5. Payment Button (€49.99/maand)

6. Diensten Configurators (wszystkie 4 z PRO)
   - Vakanties
   - Verzekeringen
   - Energie
   - Telecom

7. Finansiële Configurators (FINANCE exclusive)
   - Mortgage
   - Loan
   - Credit Card
   - Leasing

8. Scan History

9. FAQ

10. Footer
```

---

## 🔧 **ZMIANY DO WDROŻENIA:**

### **1. FREE Page (app/page.tsx):**
```typescript
// USUNĄĆ:
- ❌ Stary form z polami (Categorie, Product URL, Prijs - readonly)
- ❌ Ghost Mode checkbox w formularzu

// ZOSTAWIĆ:
- ✅ Scanner component (już dodany)
- ✅ Scan History
- ✅ FAQ
- ✅ Footer

// DODAĆ:
- ✅ Auto-fill Preview component (nowy)
- ✅ Results Section (nowy)
```

### **2. PLUS Page (app/plus/page.tsx):**
```typescript
// USUNĄĆ:
- ❌ ScanForm component (stary form)
- ❌ GhostMode component (u góry)

// DODAĆ:
- ✅ Scanner component
- ✅ Auto-fill Preview
- ✅ Results Section (z Ghost Mode gdy brak ofert)
```

### **3. PRO Page (app/pro/page.tsx):**
```typescript
// USUNĄĆ:
- ❌ ScanForm component
- ❌ GhostMode component (u góry)

// DODAĆ:
- ✅ Scanner component
- ✅ Auto-fill Preview
- ✅ Results Section (z Ghost Mode gdy brak ofert)

// ZOSTAWIĆ:
- ✅ Diensten Configurators (4 karty)
```

### **4. FINANCE Page (app/finance/page.tsx):**
```typescript
// USUNĄĆ:
- ❌ ScanForm component
- ❌ GhostMode component (u góry)

// DODAĆ:
- ✅ Scanner component
- ✅ Auto-fill Preview
- ✅ Results Section (z Ghost Mode gdy brak ofert)

// ZOSTAWIĆ:
- ✅ Diensten Configurators (4 karty)
- ✅ Finansiële Configurators (4 karty)
```

---

## 📦 **NOWE KOMPONENTY DO STWORZENIA:**

### **1. AutoFillPreview.tsx**
```typescript
// Pokazuje wypełnione dane po skanowaniu
interface AutoFillPreviewProps {
  productName: string
  price: number
  shop: string
  category: string
}

// Wyświetla:
// ✓ Product: iPhone 15 Pro 128GB
// ✓ Prijs: €999
// ✓ Shop: bol.com
// ✓ Categorie: electronics
```

### **2. ResultsSection.tsx**
```typescript
// Pokazuje oferty lub Ghost Mode
interface ResultsSectionProps {
  offers: Offer[]
  packageType: 'free' | 'plus' | 'pro' | 'finance'
  productName: string
  basePrice: number
  ean: string
}

// Jeśli offers.length > 0:
//   - Pokazuje oferty (🥇🥈💎)
// Jeśli offers.length === 0 && packageType !== 'free':
//   - Pokazuje Ghost Mode button
```

---

## ✅ **KORZYŚCI:**

1. **Brak duplikacji** - URL input tylko raz (w Scanner)
2. **Logiczny flow** - 1→2→3→4→5 (nie 1→3→5→2)
3. **Spójność** - identyczny flow na wszystkich 4 stronach
4. **Czytelność** - user wie co się dzieje krok po kroku
5. **Funkcje na końcu** - PRO/FINANCE configurators po głównym flow

---

## 🤔 **PYTANIE:**

**Czy zatwierdzasz ten plan?**

Jeśli TAK, zacznę implementację:
1. Stworzę AutoFillPreview.tsx
2. Stworzę ResultsSection.tsx
3. Zaktualizuję FREE page
4. Zaktualizuję PLUS page
5. Zaktualizuję PRO page
6. Zaktualizuję FINANCE page
7. Zakomituję i wypuszczę na Vercel

**Czekam na Twoją zgodę!** 🎯
