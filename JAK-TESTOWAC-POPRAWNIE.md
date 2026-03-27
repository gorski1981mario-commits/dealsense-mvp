# 📱 JAK TESTOWAĆ - POPRAWNA INSTRUKCJA

**Dla:** Mario  
**Data:** 27 marca 2026  
**Status:** SCANNER DZIAŁA TYLKO NA BARCODE/QR (automatyczne wypełnianie)

---

## ⚠️ WAŻNE - JAK DZIAŁA SCANNER:

### **NIE MOŻESZ WPISYWAĆ RĘCZNIE!**

Scanner działa **TYLKO** przez:
1. **Skanowanie barcode** (kod kreskowy na produkcie)
2. **Skanowanie QR code**

**Wszystko wypełnia się AUTOMATYCZNIE:**
- ✅ EAN (z barcode)
- ✅ Nazwa produktu (z API)
- ✅ Cena (z API)
- ✅ Kategoria (z API)
- ✅ Sklep (z API)

**NIE MA ręcznego wpisywania!**

---

## 📱 JAK TESTOWAĆ NA DILSONS.NL:

### **KROK 1: Otwórz aplikację**
```
https://dilsons.nl
```

### **KROK 2: Kliknij "Scan Barcode/QR"**
- Aplikacja otworzy kamerę
- Zezwól na dostęp do kamery

### **KROK 3: Zeskanuj barcode produktu**
- Skieruj kamerę na kod kreskowy
- Scanner automatycznie odczyta EAN
- Aplikacja pobierze dane z API

### **KROK 4: Sprawdź wyniki**
- Nazwa produktu (automatycznie)
- Cena bazowa (automatycznie)
- 3-5 ofert (Trust >= 50)
- Smart Bundles (jeśli dostępne)

---

## 🧪 PRODUKTY DO TESTU (MUSISZ MIEĆ FIZYCZNIE):

### **OPCJA A: Produkty w domu**
Zeskanuj cokolwiek co ma barcode:
- Telefon (pudełko z iPhone, Samsung)
- Książka (Harry Potter, bestseller)
- Zabawka (LEGO pudełko)
- AGD (pudełko od miksera, ekspresu)
- Kosmetyki (Estee Lauder, L'Oreal)

### **OPCJA B: Produkty w sklepie**
Idź do MediaMarkt/Coolblue/Bol.com:
- Zeskanuj iPhone 15 Pro
- Zeskanuj LEGO Technic
- Zeskanuj Nike Air Max
- Zeskanuj Dyson odkurzacz

---

## 📊 CO SPRAWDZIĆ W WYNIKACH:

### ✅ MUSI BYĆ:
1. **Automatyczne wypełnienie** (nazwa, cena, kategoria)
2. **3-5 ofert** (Trust >= 50)
3. **Oszczędności wyraźne** (€X besparing)
4. **Tylko NL/BE sklepy**
5. **Smart Bundles** (jeśli elektronika)

### ❌ NIE MOŻE BYĆ:
1. **Etsy, OnBuy, Cdiscount**
2. **Używane/refurbished**
3. **Sklepy .fr, .de, .pl**
4. **Podejrzane sklepy** (Trust < 50)

---

## 🔧 JEŚLI NIE MASZ PRODUKTÓW DO SKANOWANIA:

### **OPCJA 1: Użyj Google Images**
1. Wyszukaj w Google: "iPhone 15 Pro barcode"
2. Znajdź zdjęcie kodu kreskowego
3. Wyświetl na komputerze
4. Zeskanuj telefonem z dilsons.nl

### **OPCJA 2: Wygeneruj testowy barcode**
1. Otwórz: https://barcode.tec-it.com/en
2. Wpisz EAN: `8719273228098` (iPhone 15 Pro)
3. Wygeneruj barcode
4. Zeskanuj z ekranu

### **OPCJA 3: Idź do sklepu**
1. MediaMarkt, Coolblue, Bol.com
2. Zeskanuj produkty na półce
3. Sprawdź wyniki w aplikacji

---

## 🎯 PRZYKŁADOWE EAN DO TESTÓW:

Jeśli generujesz barcode online:

```
iPhone 15 Pro: 8719273228098
LEGO Technic Porsche: 5702016617221
Nike Air Max 90: 195866137578
Harry Potter Box: 9781408856772
Dyson V15 Detect: 5025155049068
```

---

## 📋 FLOW TESTOWANIA:

```
1. Otwórz dilsons.nl na telefonie
   ↓
2. Kliknij "Scan Barcode/QR"
   ↓
3. Zezwól na kamerę
   ↓
4. Zeskanuj barcode produktu
   (fizyczny lub z ekranu)
   ↓
5. Scanner automatycznie:
   - Odczyta EAN
   - Pobierze nazwę produktu
   - Pobierze cenę
   - Pobierze kategorię
   - Znajdzie oferty
   ↓
6. Sprawdź wyniki:
   - 3-5 ofert (Trust >= 50)
   - Oszczędności
   - Smart Bundles
   - Tylko NL/BE sklepy
```

---

## ⚠️ DLACZEGO NIE MA RĘCZNEGO WPISYWANIA:

**SECURITY + UX:**
1. **Device-bound token** (linia 130 Scanner.tsx)
   - Token = `${userId}-${timestamp}`
   - Nie można manipulować
   
2. **Automatyczne wypełnianie** (linia 134-143)
   - EAN → API → Wszystkie dane
   - User nie musi nic wpisywać
   
3. **FREE package tracking** (linia 169)
   - 3 scany limit
   - Paywall po 3 skanach

---

## 🚀 CO MUSISZ ZROBIĆ:

### **NAJPROSTSZE:**
1. Znajdź produkt z barcode (telefon, książka, LEGO)
2. Otwórz dilsons.nl
3. Kliknij "Scan Barcode/QR"
4. Zeskanuj barcode
5. Sprawdź wyniki

### **JEŚLI NIE MASZ PRODUKTÓW:**
1. Wygeneruj barcode online (barcode.tec-it.com)
2. Użyj EAN: `8719273228098` (iPhone 15 Pro)
3. Wyświetl na komputerze
4. Zeskanuj telefonem

---

## 📞 CO TESTUJEMY:

1. ✅ **Scanner działa** (odczytuje barcode)
2. ✅ **API działa** (pobiera dane produktu)
3. ✅ **Trust Filter** (tylko >= 50)
4. ✅ **Etsy/OnBuy banned**
5. ✅ **Smart Bundles** (dla elektroniki)
6. ✅ **Oszczędności** (wyraźnie widoczne)

---

**GOTOWE!** Znajdź produkt z barcode i testuj! 🚀

**KLUCZOWE:** Scanner = TYLKO barcode/QR, wszystko automatyczne!
