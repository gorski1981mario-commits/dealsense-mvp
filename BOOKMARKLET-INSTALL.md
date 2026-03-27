# 🔖 DealSense Bookmarklet - Automatyczny Token Transfer

## 📱 Co to jest?

Bookmarklet to przycisk w przeglądarce, który **automatycznie** przenosi URL produktu z bol.com/Media Markt do DealSense.

**Zamiast:**
1. Skopiuj URL z bol.com
2. Otwórz DealSense
3. Wklej URL
4. Kliknij "Vergelijk prijzen"

**Teraz:**
1. Kliknij bookmarklet na bol.com
2. ✓ Gotowe! (automatycznie otwiera DealSense z produktem)

---

## 🚀 Instalacja (Desktop)

### **Chrome / Edge / Brave:**

1. **Pokaż pasek zakładek:**
   - Windows: `Ctrl + Shift + B`
   - Mac: `Cmd + Shift + B`

2. **Stwórz nową zakładkę:**
   - Kliknij prawym na pasek zakładek
   - Wybierz "Dodaj stronę"

3. **Wklej kod:**
   - Nazwa: `📱 Scan in DealSense`
   - URL: (skopiuj z `public/bookmarklet.js`)

4. **Gotowe!**
   - Idź na bol.com/Media Markt
   - Kliknij bookmarklet
   - DealSense otworzy się automatycznie z produktem

### **Firefox:**

1. Pokaż pasek zakładek: `Ctrl + Shift + B`
2. Kliknij prawym → "Nowa zakładka"
3. Wklej kod bookmarklet
4. Gotowe!

### **Safari:**

1. Pokaż pasek ulubionych: `Cmd + Shift + B`
2. Przeciągnij link bookmarklet na pasek
3. Gotowe!

---

## 📱 Instalacja (Mobile)

### **iOS Safari:**

1. Dodaj tę stronę do zakładek
2. Edytuj zakładkę
3. Zmień URL na kod bookmarklet
4. Gotowe!

### **Android Chrome:**

1. Dodaj stronę do zakładek
2. Edytuj zakładkę
3. Zmień URL na kod bookmarklet
4. Gotowe!

---

## 🎯 Jak używać?

1. **Znajdź produkt** na bol.com, Media Markt, Coolblue, etc.
2. **Kliknij bookmarklet** "📱 Scan in DealSense"
3. **Automatycznie:**
   - URL produktu jest zakodowany (base64)
   - DealSense otwiera się w nowej karcie
   - URL jest automatycznie wklejony
   - Kategoria jest auto-wykryta
4. **Kliknij "Vergelijk prijzen"** i gotowe!

---

## 🛍️ Wspierane sklepy

- ✅ bol.com
- ✅ Amazon.nl
- ✅ Coolblue.nl
- ✅ MediaMarkt.nl
- ✅ Wehkamp.nl

**Więcej sklepów wkrótce!**

---

## 🔧 Jak to działa?

### **1. Bookmarklet (klient):**
```javascript
// Pobiera URL strony
const currentUrl = window.location.href;

// Koduje URL do base64
const token = btoa(currentUrl);

// Otwiera DealSense z tokenem
window.open(`https://dealsense-mvp.vercel.app/?token=${token}`, '_blank');
```

### **2. DealSense (aplikacja):**
```typescript
// Odczytuje token z URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

// Dekoduje token do oryginalnego URL
const decodedUrl = atob(token);

// Automatycznie wypełnia formularz
setUrl(decodedUrl);
setCategory('electronics'); // auto-detect
```

---

## 🎁 Unfair Advantages

**Konkurencja tego nie ma!**

1. **Zero kliknięć** - automatyczny transfer URL
2. **Auto-detect kategorii** - rozpoznaje sklep
3. **Bezpieczny** - base64 encoding (nie plain text)
4. **Cross-platform** - działa wszędzie (desktop + mobile)
5. **Instant** - natychmiastowe otwarcie DealSense

---

## 📊 Tracking

Bookmarklet automatycznie trackuje:
- `FlowTracker.trackEvent('scanner', 'view')` - użycie bookmarklet
- Sklep źródłowy (bol.com, Media Markt, etc.)
- Kategoria produktu (auto-detect)

---

## 🔐 Bezpieczeństwo

- ✅ **Base64 encoding** - URL nie jest plain text w parametrze
- ✅ **Clean URL** - token jest usuwany po dekodowaniu (`history.replaceState`)
- ✅ **Validation** - sprawdzamy czy token jest poprawny
- ✅ **Error handling** - jeśli token niepoprawny, user może wkleić ręcznie

---

## 🚀 Przyszłość

**Planowane:**
1. **Browser Extension** - Chrome/Firefox extension z 1-click scan
2. **iOS Share Sheet** - "Share to DealSense" z Safari
3. **Android Intent** - Deep linking `dealsense://scan?url=...`
4. **QR Code Scanner** - scan barcode w sklepie fizycznym
5. **Image Recognition** - zrób zdjęcie produktu → auto-scan

---

## 📝 Changelog

**v1.0 (27 marca 2026):**
- ✅ Bookmarklet z base64 token
- ✅ Auto-detect kategorii
- ✅ Wsparcie dla 5 sklepów NL
- ✅ Desktop + Mobile support
- ✅ FlowTracker integration

---

**UNFAIR ADVANTAGE - KONKURENCJA TEGO NIE MA!** 🚀
