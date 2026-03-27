# 📱 PUBLIKACJA DEALSENSE W GOOGLE PLAY - UPROSZCZONA INSTRUKCJA

**Data:** 27 marca 2026  
**Status:** Pliki przygotowane - gotowe do publikacji

---

## ✅ CO JUŻ JEST GOTOWE:

### **1. PWA Manifest** ✅
- Lokalizacja: `public/manifest.json`
- Share Target skonfigurowany
- Ikony 192x192 i 512x512

### **2. Digital Asset Links** ✅
- Lokalizacja: `public/.well-known/assetlinks.json`
- Package: `nl.dilsons.dealsense`
- ⚠️ SHA256 fingerprint będzie dodany po wygenerowaniu keystore

### **3. Privacy Policy** ✅
- Lokalizacja: `app/privacy/page.tsx`
- URL: `https://dilsons.nl/privacy`
- Zgodna z GDPR i Google Play wymaganiami

---

## 🚀 OPCJE PUBLIKACJI:

### **OPCJA A: PWA Builder (NAJPROSTSZE - REKOMENDOWANE)**

**PWA Builder** to narzędzie Microsoft które automatycznie tworzy Android package z PWA.

#### **Kroki:**

1. **Otwórz:** https://www.pwabuilder.com/

2. **Wpisz URL:** `https://dilsons.nl`

3. **Kliknij "Start"** - PWA Builder przeskanuje manifest

4. **Wybierz "Android"** → **"Generate Package"**

5. **Wypełnij:**
   - Package ID: `nl.dilsons.dealsense`
   - App name: `DealSense`
   - Version: `1.0.0`
   - Version code: `1`

6. **Download** - otrzymasz gotowy `.aab` plik

7. **Upload do Google Play Console**

**CZAS:** 15-30 minut  
**KOSZT:** $0 (tylko Google Play Console $25)

---

### **OPCJA B: Bubblewrap (ZAAWANSOWANE)**

Wymaga JDK i Android SDK - bardziej skomplikowane.

**Pomiń jeśli używasz PWA Builder!**

---

## 📋 GOOGLE PLAY CONSOLE SETUP:

### **KROK 1: Załóż konto**
- URL: https://play.google.com/console
- Koszt: **$25** (jednorazowo)
- Czas weryfikacji: 1-2 dni

### **KROK 2: Utwórz aplikację**
1. **"Create app"**
2. App name: `DealSense`
3. Language: `Dutch (Netherlands)`
4. Type: `App`
5. Free/Paid: `Free`

### **KROK 3: Store Listing**

**App details:**
```
Name: DealSense
Short description: Vind direct de beste prijs voor elk product

Full description:
DealSense helpt je om altijd de beste prijs te vinden voor producten die je wilt kopen.

✅ Scan barcode of deel product URL
✅ Vergelijk prijzen van 100+ Nederlandse webshops
✅ Bespaar gemiddeld 25-30% op je aankopen
✅ Alleen betrouwbare winkels (Trust Score 50+)
✅ Smart Bundles - vind ook de beste accessoires

Hoe werkt het?
1. Scan een product in de winkel of deel een product URL
2. DealSense zoekt automatisch de beste prijzen
3. Bekijk de top 3-5 aanbiedingen
4. Koop direct bij de goedkoopste winkel

Ondersteunde categorieën:
• Elektronica (iPhone, Samsung, laptops)
• Speelgoed (LEGO, Playmobil)
• Sport (Nike, Adidas)
• Huis & Tuin (Dyson, Karcher)
• Boeken, Fietsen, Baby, Keuken en meer!

Bespaar tijd en geld met DealSense!
```

**Contact:**
- Email: support@dilsons.nl
- Website: https://dilsons.nl
- Privacy policy: https://dilsons.nl/privacy ✅

**Category:**
- App: `Shopping`
- Tags: `price comparison`, `shopping`, `deals`

**Graphics:**
- App icon: `public/icon-512.png` ✅
- Feature graphic: 1024x500 (musisz stworzyć)
- Screenshots: 2-8 (musisz stworzyć)

### **KROK 4: Content Rating**
1. **App content → Content rating**
2. Category: `Utility`
3. Violence: No
4. Sexual content: No
5. Language: No
6. Substances: No
7. Gambling: No
8. User interaction: Yes (sharing)

### **KROK 5: Target Audience**
- Age: `18+` (shopping app)

### **KROK 6: Upload AAB**
1. **Production → Create release**
2. Upload `.aab` (z PWA Builder lub Bubblewrap)
3. Version: `1.0.0`
4. Release notes:
```
Eerste release van DealSense!

✅ Product scanner (barcode + URL)
✅ Prijsvergelijking 100+ winkels
✅ Smart Bundles
✅ Trust Score filtering
✅ 13 productcategorieën

Bespaar gemiddeld 25-30% op je aankopen!
```

### **KROK 7: Submit**
1. Sprawdź wszystkie sekcje (✅)
2. **"Send for review"**
3. Czas: 1-7 dni

---

## 📸 SCREENSHOTS (DO ZROBIENIA):

Potrzebujesz **2-8 screenshots** (540x720 minimum):

### **Screenshot 1: Scanner**
- Pokaż: Scanner interface z polem URL
- Tekst: "Scan of plak product URL"

### **Screenshot 2: Results**
- Pokaż: Top 3-5 ofert z cenami
- Tekst: "Vergelijk prijzen van 100+ winkels"

### **Screenshot 3: Savings**
- Pokaż: Oszczędności (€200+)
- Tekst: "Bespaar gemiddeld 25-30%"

### **Screenshot 4: Smart Bundles**
- Pokaż: Bundle recommendations
- Tekst: "Vind ook de beste accessoires"

**Jak zrobić:**
1. Otwórz dilsons.nl na telefonie
2. Zrób screenshot (Power + Volume Down)
3. Przytnij do 540x720 lub większe
4. Upload do Google Play Console

---

## 🎨 FEATURE GRAPHIC (DO ZROBIENIA):

**Rozmiar:** 1024x500 px  
**Format:** PNG lub JPG

**Zawartość:**
- Logo DealSense (zielone)
- Slogan: "Vind de beste prijs"
- Ikony: 💰 📱 🎯

**Narzędzia:**
- Canva (darmowe)
- Figma (darmowe)
- Photoshop

---

## 💰 KOSZTY:

- **Google Play Console:** $25 (jednorazowo)
- **PWA Builder:** $0
- **Screenshots/Graphics:** $0 (zrób sam)

**TOTAL:** $25

---

## ⏱️ TIMELINE:

- **PWA Builder:** 15-30 min
- **Screenshots:** 30-60 min
- **Feature Graphic:** 30-60 min
- **Google Play setup:** 1-2 godziny
- **Review:** 1-7 dni

**TOTAL:** 3-4 godziny pracy + 1-7 dni review

---

## ✅ CHECKLIST:

### **Gotowe:**
- [x] PWA Manifest
- [x] Share Target
- [x] Digital Asset Links (assetlinks.json)
- [x] Privacy Policy
- [x] Ikony (192x192, 512x512)

### **Do zrobienia:**
- [ ] Google Play Console account ($25)
- [ ] Wygeneruj AAB (PWA Builder)
- [ ] Screenshots (2-8)
- [ ] Feature Graphic (1024x500)
- [ ] Wypełnij Store Listing
- [ ] Content Rating
- [ ] Target Audience
- [ ] Upload AAB
- [ ] Submit for review

---

## 🎯 PO PUBLIKACJI:

### **User flow:**
```
MediaMarkt → Produkt → Udostępnij → DealSense
    ↓
Automatycznie się otwiera
    ↓
Wyniki się pokazują!
```

**TYLKO 3 KROKI!** 🚀

---

## 📞 LINKI:

- **PWA Builder:** https://www.pwabuilder.com/
- **Google Play Console:** https://play.google.com/console
- **Privacy Policy:** https://dilsons.nl/privacy ✅
- **Asset Links:** https://dilsons.nl/.well-known/assetlinks.json ✅

---

## 🚀 NASTĘPNE KROKI:

1. **Załóż Google Play Console** ($25)
2. **Użyj PWA Builder** (https://www.pwabuilder.com/)
3. **Zrób screenshots** (2-8)
4. **Stwórz feature graphic** (1024x500)
5. **Upload AAB do Google Play**
6. **Submit for review**

**WSZYSTKO GOTOWE - MOŻESZ ZACZĄĆ!** 🎉
