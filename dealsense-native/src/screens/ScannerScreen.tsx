import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import * as ImageManipulator from 'expo-image-manipulator'
import { COLORS } from '../lib/constants'
import { storage } from '../lib/storage'
import { api } from '../lib/api'
import type { ScanResult } from '../types'

interface ScannerScreenProps {
  onScanComplete: (result: ScanResult) => void
  onOpenEcho?: () => void
  onOpenPatternLock?: () => void
  packageType?: 'free' | 'plus'
}

export default function ScannerScreen({ onScanComplete, onOpenEcho, onOpenPatternLock, packageType }: ScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [lastScanTime, setLastScanTime] = useState(0)
  const [lastAlertTime, setLastAlertTime] = useState(0)
  const [scanStatus, setScanStatus] = useState<string>('')
  const scanAttempts = useRef(0)
  const lastScanData = useRef<string>('')

  if (!permission || permission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Camera laden...</Text>
      </View>
    )
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionBox}>
          <Text style={styles.title}>📱 Camera Toegang</Text>
          <Text style={styles.message}>
            DealSense heeft camera toegang nodig om barcodes te scannen
          </Text>
          <TouchableOpacity style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Geef Toegang</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const extractEANFromURL = (url: string): string | null => {
    // Extract EAN from MediaMarkt and other Dutch shop URLs
    // MediaMarkt format: https://www.mediamarkt.nl/nl/product/_samsung-55-oled-8806094968804.html
    // Bol.com format: https://www.bol.com/nl/nl/p/product-name/9200000123456789/
    // Coolblue format: https://www.coolblue.nl/product/123456/product-name
    
    // Try to find 13-digit EAN first (most common)
    const ean13Match = url.match(/(\d{13})/)
    if (ean13Match) {
      return ean13Match[1]
    }
    
    // Try to find 8-digit EAN (less common)
    const ean8Match = url.match(/(\d{8})/)
    if (ean8Match) {
      return ean8Match[1]
    }
    
    return null
  }

  const extractEANFromText = (text: string): string | null => {
    // OCR fallback - extract 13-digit or 8-digit number from any text
    // This is used when barcode scanner fails
    console.log('🔍 OCR fallback - searching for EAN in text:', text)
    
    // Remove all non-digits
    const digitsOnly = text.replace(/\D/g, '')
    
    // Look for 13-digit sequences
    const ean13Matches = digitsOnly.match(/(\d{13})/g)
    if (ean13Matches && ean13Matches.length > 0) {
      console.log('✅ Found EAN13:', ean13Matches[0])
      return ean13Matches[0]
    }
    
    // Look for 8-digit sequences
    const ean8Matches = digitsOnly.match(/(\d{8})/g)
    if (ean8Matches && ean8Matches.length > 0) {
      console.log('✅ Found EAN8:', ean8Matches[0])
      return ean8Matches[0]
    }
    
    console.log('❌ No EAN found in text')
    return null
  }

  const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || scanning) return

    // Debounce - prevent multiple scans within 300ms (not 3 seconds!)
    const now = Date.now()
    if (now - lastScanTime < 300) {
      return
    }
    
    // Prevent duplicate scans of same data
    if (data === lastScanData.current && now - lastScanTime < 3000) {
      return
    }
    
    setLastScanTime(now)
    lastScanData.current = data

    // Prevent alert spam - only show alert once every 3 seconds
    const canShowAlert = now - lastAlertTime >= 3000
    
    console.log('📸 Scan detected:', { type, data: data.substring(0, 50) })

    let eanToSearch: string | null = null

    // Smart detection: QR code with URL or direct barcode
    if (data.includes('http://') || data.includes('https://') || data.includes('www.')) {
      // QR code with URL - extract EAN from URL
      setScanStatus('QR code gedetecteerd...')
      eanToSearch = extractEANFromURL(data)
      
      if (!eanToSearch) {
        // OCR fallback - try to extract EAN from the data itself
        setScanStatus('EAN niet in URL - probeer OCR...')
        eanToSearch = extractEANFromText(data)
        
        if (!eanToSearch) {
          if (canShowAlert) {
            Alert.alert('Geen EAN gevonden', 'Scan de barcode (streepjes) onder het product')
            setLastAlertTime(now)
          }
          setScanStatus('')
          return
        }
        
        console.log('✅ OCR fallback successful - EAN gevonden:', eanToSearch)
      }
      
      console.log('📱 QR code gescand - EAN geëxtraheerd:', eanToSearch)
      setScanStatus('EAN gevonden: ' + eanToSearch)
    } else {
      // Direct barcode scan
      const cleanData = data.trim()
      
      // Validate barcode - must be numeric (EAN format)
      if (!/^\d+$/.test(cleanData)) {
        if (canShowAlert) {
          Alert.alert('Ongeldige barcode', 'Barcode moet alleen cijfers bevatten')
          setLastAlertTime(now)
        }
        return
      }

      // Validate barcode length - EAN8 (8 digits) or EAN13 (13 digits)
      if (cleanData.length !== 8 && cleanData.length !== 13) {
        if (canShowAlert) {
          Alert.alert('Ongeldige barcode', `Barcode moet 8 of 13 cijfers hebben (gevonden: ${cleanData.length})`)
          setLastAlertTime(now)
        }
        return
      }
      
      eanToSearch = cleanData
      console.log('📱 Barcode gescand:', eanToSearch)
      setScanStatus('Barcode gescand: ' + eanToSearch)
    }

    setScanned(true)
    setScanning(true)
    setScanStatus('Zoeken naar aanbiedingen...')

    try {
      const deviceId = await storage.getDeviceId()
      const result = await api.searchByEAN(eanToSearch, deviceId)

      if (result) {
        // Update scan count
        const profile = await storage.getUserProfile()
        if (profile) {
          profile.scansUsed += 1
          if (profile.packageType === 'free') {
            profile.scansRemaining = Math.max(0, 3 - profile.scansUsed)
          }
          await storage.setUserProfile(profile)

          // Save scan record
          await storage.addScanRecord({
            id: `scan_${Date.now()}`,
            userId: profile.userId,
            ean: data,
            productName: result.productName,
            savings: result.savings,
            timestamp: Date.now(),
          })

          onScanComplete(result)
        } else {
          setScanStatus('Profiel niet gevonden')
          Alert.alert('Fout', 'Kon profiel niet laden')
        }
      } else {
        setScanStatus('Geen resultaat gevonden')
        Alert.alert('Geen resultaat', 'Geen aanbiedingen gevonden voor dit product')
      }
    } catch (error) {
      console.error('❌ Scan error:', error)
      Alert.alert(
        'Fout',
        'Er is iets misgegaan. Probeer opnieuw.',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false)
              setScanning(false)
              setScanStatus('')
            },
          },
        ]
      )
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        active={!scanned}
        mute={false}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        enableTorch={false}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <Text style={styles.title}>Scan Barcode</Text>
            <Text style={styles.subtitle}>
              {scanStatus || 'Richt de camera op de barcode'}
            </Text>
            {scanning && (
              <ActivityIndicator size="large" color="#fff" style={{ marginTop: 10 }} />
            )}
          </View>

          {packageType === 'plus' && onOpenEcho && (
            <TouchableOpacity style={styles.echoButton} onPress={onOpenEcho}>
              <Text style={styles.echoButtonText}>💬 Echo Agent</Text>
            </TouchableOpacity>
          )}

          {packageType === 'plus' && onOpenPatternLock && (
            <TouchableOpacity style={styles.patternLockButton} onPress={onOpenPatternLock}>
              <Text style={styles.patternLockButtonText}>🔐 Pattern Lock</Text>
            </TouchableOpacity>
          )}

          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.hint}>
              Houd de camera stil en zorg voor goede verlichting
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  topOverlay: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 280,
    borderWidth: 3,
    borderColor: COLORS.primary,
    borderRadius: 20,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  scanningIndicator: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 320,
  },
  scanningText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  echoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  echoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  patternLockButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  patternLockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginVertical: 20,
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  loadingText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
})
