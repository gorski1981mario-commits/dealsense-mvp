# 📱 PUBLIKACJA DEALSENSE W GOOGLE PLAY (PWA)

**Data:** 27 marca 2026  
**Cel:** Opublikować DealSense jako aplikacja Android w Google Play Store

---

## 🎯 CO TO DAJE:

### **PRZED (bez Google Play):**
- ❌ DealSense nie pojawia się w "Udostępnij"
- ❌ User musi ręcznie kopiować/wklejać URL
- ❌ Brak automatycznego flow

### **PO (z Google Play):**
- ✅ DealSense pojawia się w "Udostępnij"
- ✅ MediaMarkt → Udostępnij → DealSense → Automatycznie!
- ✅ 2 kroki zamiast 5
- ✅ Profesjonalny wygląd
- ✅ Łatwiejsza instalacja (Google Play)

---

## 📋 WYMAGANIA:

### **1. Google Play Console Account**
- Koszt: **$25** (jednorazowo, na zawsze)
- Link: https://play.google.com/console
- Czas weryfikacji: 1-2 dni

### **2. Trusted Web Activity (TWA)**
- Technologia: Opakowuje PWA w natywną aplikację Android
- Narzędzie: **Bubblewrap CLI** (Google)
- Czas: 30-60 min setup

### **3. Signing Key**
- Keystore file (.jks)
- Potrzebny do podpisania aplikacji
- Wygenerowany przez Android Studio lub keytool

### **4. Ikony i Assets**
- Icon 512x512 (już masz: `/public/icon-512.png`)
- Screenshots (540x720 minimum)
- Feature graphic (1024x500)

---

## 🚀 PROCES PUBLIKACJI (KROK PO KROKU):

### **KROK 1: Zainstaluj Bubblewrap CLI**

```bash
npm install -g @bubblewrap/cli
```

### **KROK 2: Inicjalizuj projekt TWA**

```bash
cd "c:\DEALSENSE AI"
bubblewrap init --manifest https://dilsons.nl/manifest.json
```

**Odpowiedz na pytania:**
- App name: `DealSense`
- Package name: `nl.dilsons.dealsense`
- Host: `dilsons.nl`
- Start URL: `/`
- Icon URL: `https://dilsons.nl/icon-512.png`
- Theme color: `#15803d`
- Background color: `#ffffff`

### **KROK 3: Wygeneruj Digital Asset Links**

Bubblewrap automatycznie wygeneruje plik `assetlinks.json`.

**Skopiuj go do:**
```
c:\DEALSENSE AI\public\.well-known\assetlinks.json
```

**Musi być dostępny pod:**
```
https://dilsons.nl/.well-known/assetlinks.json
```

### **KROK 4: Zbuduj aplikację**

```bash
bubblewrap build
```

**To wygeneruje:**
- `app-release-signed.apk` (do testowania)
- `app-release-bundle.aab` (do Google Play)

### **KROK 5: Przetestuj lokalnie**

```bash
# Zainstaluj na telefonie przez USB
adb install app-release-signed.apk

# LUB użyj Android Studio
```

### **KROK 6: Przygotuj assets dla Google Play**

**Potrzebne pliki:**

1. **Screenshots (minimum 2):**
   - Rozmiar: 540x720 do 1080x1920
   - Format: PNG lub JPG
   - Pokaż: Scanner, Wyniki, Smart Bundles

2. **Feature Graphic:**
   - Rozmiar: 1024x500
   - Format: PNG lub JPG
   - Zawiera: Logo DealSense + slogan

3. **App Icon:**
   - Już masz: `icon-512.png`

### **KROK 7: Utwórz aplikację w Google Play Console**

1. Zaloguj się: https://play.google.com/console
2. **"Create app"**
3. Wypełnij:
   - App name: `DealSense`
   - Default language: `Dutch (Netherlands)`
   - App or game: `App`
   - Free or paid: `Free`
   - Declarations: Zaakceptuj

### **KROK 8: Wypełnij Store Listing**

**App details:**
- **App name:** DealSense
- **Short description:** Vind direct de beste prijs voor elk product
- **Full description:**
```
DealSense helpt je om altijd de beste prijs te vinden voor producten die je wilt kopen.

✅ Scan barcode of plak product URL
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

- **App icon:** Upload `icon-512.png`
- **Feature graphic:** Upload feature graphic
- **Screenshots:** Upload 2-8 screenshots

**Contact details:**
- Email: support@dilsons.nl (lub twój email)
- Website: https://dilsons.nl
- Privacy policy: https://dilsons.nl/privacy (musisz stworzyć!)

**Category:**
- App category: `Shopping`
- Tags: `price comparison`, `shopping`, `deals`

### **KROK 9: Upload AAB**

1. **Production → Create new release**
2. Upload `app-release-bundle.aab`
3. Release name: `1.0.0`
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

### **KROK 10: Content Rating**

1. **Policy → App content → Content rating**
2. Wypełnij kwestionariusz:
   - App category: `Utility, Productivity, Communication, or Other`
   - Violence: No
   - Sexual content: No
   - Language: No
   - Controlled substances: No
   - Gambling: No
   - User interaction: Yes (users can share)

### **KROK 11: Target Audience**

1. **Policy → App content → Target audience**
2. Age groups: `18+` (shopping app)

### **KROK 12: Privacy Policy**

**Musisz stworzyć:** `https://dilsons.nl/privacy`

**Minimalna privacy policy:**
```
Privacy Policy voor DealSense

Laatste update: [DATA]

DealSense verzamelt minimale gegevens:
- Device ID (voor scan tracking)
- Scan geschiedenis (lokaal opgeslagen)
- Geen persoonlijke gegevens

We delen geen data met derden.
Contact: support@dilsons.nl
```

### **KROK 13: Submit for Review**

1. Sprawdź wszystkie sekcje (muszą być ✅)
2. **"Send for review"**
3. Czas weryfikacji: **1-7 dni**

---

## 📁 PLIKI DO PRZYGOTOWANIA:

### **1. assetlinks.json**
```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "nl.dilsons.dealsense",
    "sha256_cert_fingerprints": ["TWÓJ_SHA256_FINGERPRINT"]
  }
}]
```

**Umieść w:**
```
public/.well-known/assetlinks.json
```

### **2. Privacy Policy**

Stwórz: `app/privacy/page.tsx`

### **3. Screenshots**

Zrób 2-4 screenshoty:
- Scanner view
- Results view
- Smart Bundles
- Savings summary

---

## 💰 KOSZTY:

- **Google Play Console:** $25 (jednorazowo)
- **Development:** $0 (Bubblewrap jest darmowy)
- **Maintenance:** $0

**TOTAL:** $25

---

## ⏱️ TIMELINE:

- **Setup (Bubblewrap):** 1-2 godziny
- **Assets (screenshots, graphics):** 2-3 godziny
- **Google Play Console setup:** 1-2 godziny
- **Review:** 1-7 dni (Google)

**TOTAL:** 1-2 dni pracy + 1-7 dni review

---

## 🔧 KOMENDY (QUICK REFERENCE):

```bash
# 1. Instaluj Bubblewrap
npm install -g @bubblewrap/cli

# 2. Inicjalizuj projekt
cd "c:\DEALSENSE AI"
bubblewrap init --manifest https://dilsons.nl/manifest.json

# 3. Zbuduj APK/AAB
bubblewrap build

# 4. Przetestuj
adb install app-release-signed.apk

# 5. Upload do Google Play
# (ręcznie przez console)
```

---

## ✅ CHECKLIST:

- [ ] Google Play Console account ($25)
- [ ] Bubblewrap CLI zainstalowany
- [ ] TWA projekt zainicjalizowany
- [ ] assetlinks.json wygenerowany i wdrożony
- [ ] Privacy policy stworzona
- [ ] Screenshots przygotowane (2-8)
- [ ] Feature graphic przygotowany (1024x500)
- [ ] AAB zbudowany
- [ ] Store listing wypełniony
- [ ] Content rating wypełniony
- [ ] Target audience wypełniony
- [ ] Submitted for review

---

## 🎯 PO PUBLIKACJI:

### **User flow będzie:**
```
1. MediaMarkt → Produkt
2. Udostępnij → DealSense
3. Automatycznie się otwiera
4. Wyniki się pokazują!
```

**TYLKO 3 KROKI!** 🚀

---

## 📞 WSPARCIE:

- **Bubblewrap docs:** https://github.com/GoogleChromeLabs/bubblewrap
- **Google Play docs:** https://support.google.com/googleplay/android-developer
- **TWA guide:** https://developer.chrome.com/docs/android/trusted-web-activity/

---

**GOTOWE DO PUBLIKACJI!** 

Zacznij od: `npm install -g @bubblewrap/cli`
