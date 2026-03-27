# 🔒 BACKUP PRO/FINANCE FEATURES

**Status:** ODPIĘTE - Na półce do przyszłego użycia

## Co jest tutaj:

### 1. OCR Scanner (Document Upload)
- Upload PDF/Foto dokumentów
- AI OCR extraction (Tesseract.js)
- Automatic field detection
- Review & validation system
- **Pakiet:** FINANCE
- **Lokalizacja oryginalna:** `/app/ocr-demo`, `/app/api/ocr`, `/app/components/OCRScanner.tsx`

### 2. Bills Optimizer
- Upload rachunków (energie, telefoon, internet, verzekering)
- AI analysis i optimization
- Savings calculation
- **Pakiet:** FINANCE
- **Lokalizacja oryginalna:** `/app/components/BillsOptimizer.tsx`

### 3. Configurators (PRO/FINANCE)
- Vakanties, Verzekeringen, Energie, Telecom (PRO)
- Hypotheek, Leasing, Lening, Creditcard (FINANCE)
- **Lokalizacja oryginalna:** `/app/vacations`, `/app/insurance`, etc.

## Dlaczego odpięte:

- Brak API integrations (Travelpayouts, Independer, etc.)
- Tylko SearchAPI.io dostępne
- Estimated prices nie są wystarczające dla produkcji
- Przywrócimy gdy dostaniemy więcej API

## Jak przywrócić:

1. Przenieś pliki z powrotem do `/app`
2. Odkomentuj w UI (BottomNav, HamburgerMenu, etc.)
3. Dodaj z powrotem do PricingAccordion
4. Włącz w feature flags

## Aktywne pakiety:

- ✅ FREE: Scanner produktów (3 scany)
- ✅ PLUS: Scanner produktów (unlimited), Echo AI, Ghost Mode 24h

**Data odpięcia:** 27 marca 2026
**Powód:** Fazowana implementacja - START z FREE/PLUS, potem PRO/FINANCE gdy API będą gotowe
