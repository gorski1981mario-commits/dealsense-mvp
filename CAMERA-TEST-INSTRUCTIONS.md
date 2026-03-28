# 📸 CAMERA TEST - INSTRUKCJE LOKALNE

## 🎯 CEL
Przetestować kamerę od A do Z - wszystkie aspekty (permissions, stream, scanning).

## 📋 TESTY DO WYKONANIA

### Test 1: Browser Support ✅
- Automatyczny check przy załadowaniu
- Sprawdza: getUserMedia, Canvas API, jsQR library
- **EXPECTED:** Wszystkie ✅ zielone

### Test 2: Camera Permission 🔐
1. Kliknij "Request Camera Permission"
2. Przeglądarka pokaże prompt
3. Kliknij "Allow" / "Toestaan"
- **EXPECTED:** "✅ Permission granted"

### Test 3: Camera Stream 🎥
1. Kliknij "Start Camera"
2. Kamera powinna się włączyć
3. Zobaczysz live video feed
4. Zielona ramka ze skanującą linią
- **EXPECTED:** "✅ Camera active" + live video

### Test 4: Barcode Scanning 📱
1. Przygotuj barcode/QR code (może być z ekranu innego urządzenia)
2. Pokaż kod do kamery
3. System automatycznie wykryje
- **EXPECTED:** "✅ Barcode detected!" + wyświetlony kod

### Test 5: Console Log 📝
- Wszystkie eventy są logowane w czasie rzeczywistym
- Sprawdź czy nie ma błędów (❌)
- **EXPECTED:** Tylko ✅ i ℹ️ (bez ❌)

## 🚀 JAK URUCHOMIĆ

### Opcja 1: Bezpośrednio w przeglądarce
```
Otwórz plik: c:\DEALSENSE AI\camera-test-local.html
```

### Opcja 2: Lokalny serwer (HTTPS - lepsze dla mobile)
```bash
# W folderze projektu
npx http-server -p 8080 -c-1
```
Potem otwórz: http://localhost:8080/camera-test-local.html

### Opcja 3: Test na telefonie (HTTPS wymagane!)
```bash
# Użyj ngrok lub podobnego
npx localtunnel --port 8080
```

## ✅ CHECKLIST

- [ ] Test 1: Browser Support - PASS
- [ ] Test 2: Permission - GRANTED
- [ ] Test 3: Camera Stream - ACTIVE
- [ ] Test 4: Barcode Scan - DETECTED
- [ ] Test 5: No Errors in Log

## 🐛 TROUBLESHOOTING

### Problem: "Permission denied"
- **Fix:** Sprawdź ustawienia przeglądarki (Settings → Privacy → Camera)
- **Fix:** Użyj HTTPS (nie HTTP) dla mobile

### Problem: "Camera failed"
- **Fix:** Zamknij inne aplikacje używające kamery (Zoom, Teams, etc.)
- **Fix:** Restart przeglądarki

### Problem: "jsQR not defined"
- **Fix:** Sprawdź połączenie internetowe (CDN)
- **Fix:** Poczekaj na załadowanie biblioteki

### Problem: Barcode nie wykrywa
- **Fix:** Lepsze oświetlenie
- **Fix:** Większy kod (zoom in)
- **Fix:** Stabilna ręka (nie trzęsie się)

## 📊 EXPECTED RESULTS

**WSZYSTKO POWINNO BYĆ ZIELONE:**
```
✅ Browser fully supported
✅ Permission granted
✅ Camera active
✅ Barcode detected!
```

**CONSOLE LOG:**
```
[10:30:15] ℹ️ Camera Test Suite initialized
[10:30:15] ℹ️ Checking browser support...
[10:30:15] ✅ Browser support: OK
[10:30:20] ℹ️ Requesting camera permission...
[10:30:22] ✅ Camera permission: GRANTED
[10:30:25] ℹ️ Starting camera stream...
[10:30:26] ✅ Camera stream: ACTIVE
[10:30:26] ℹ️ Video dimensions: 1280x720
[10:30:30] ✅ Barcode detected: 1234567890123
```

## 🎯 NEXT STEPS

Jeśli wszystkie testy PASS:
1. ✅ Kamera działa poprawnie
2. ✅ Można integrować z główną aplikacją
3. ✅ Gotowe do deployment

Jeśli jakiś test FAIL:
1. ❌ Sprawdź troubleshooting
2. ❌ Sprawdź console errors
3. ❌ Raportuj błąd z dokładnymi logami
