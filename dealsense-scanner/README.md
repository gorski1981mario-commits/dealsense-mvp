# DealSense Scanner - Native Camera Module

Minimal React Native + Expo app for barcode/QR scanning.

## Architecture

```
PWA (Next.js) → Deep Link → Native Scanner → Return Code → PWA
```

## Features

- ✅ Expo Camera with barcode detection
- ✅ Support: EAN13, EAN8, UPC-A, UPC-E, QR, Code128, Code39
- ✅ Deep linking back to PWA with scanned code
- ✅ Minimal footprint (~5MB APK)
- ✅ iOS + Android support

## Development

```bash
# Install dependencies
npm install

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run in Expo Go
npx expo start
```

## Build for Production

### Android (APK)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build APK
eas build --platform android --profile preview

# Build AAB for Play Store
eas build --platform android --profile production
```

### iOS (IPA)

```bash
# Build for TestFlight
eas build --platform ios --profile preview

# Build for App Store
eas build --platform ios --profile production
```

## Deep Linking

### From PWA to Scanner

```javascript
// In PWA - open native scanner
window.location.href = 'dealsense://scan';
// or
window.open('dealsense://scan', '_blank');
```

### From Scanner to PWA

Scanner automatically returns to PWA with scanned code:
```
https://dealsense-mvp.vercel.app?scan=8712100882081
```

## Permissions

### Android
- `CAMERA` - Required for barcode scanning

### iOS
- `NSCameraUsageDescription` - "DealSense heeft camera toegang nodig om barcodes en QR codes te scannen."

## Costs

- **Expo EAS Build**: Free tier (30 builds/month) or $29/month unlimited
- **Apple Developer**: $99/year
- **Google Play**: $25 one-time
- **Total Year 1**: ~$150 + $29/month (optional)

## Timeline

- ✅ Setup: 1 day
- ✅ Camera implementation: 1 day
- 🔄 PWA integration: 1 day
- 🔄 Testing: 2-3 days
- 🔄 App Store submission: 1-2 weeks review
- 🔄 Play Store submission: 2-7 days review

**Total: 2-4 weeks**

## File Structure

```
dealsense-scanner/
├── App.js              # Main scanner component
├── app.json            # Expo config + permissions
├── package.json        # Dependencies
└── assets/             # Icons + splash screens
```

## Next Steps

1. Test on real device with Expo Go
2. Configure EAS Build
3. Submit to App Store + Play Store
4. Update PWA with deep link button
