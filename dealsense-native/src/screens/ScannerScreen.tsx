import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { COLORS } from '../lib/constants'
import { storage } from '../lib/storage'
import { api } from '../lib/api'
import type { ScanResult } from '../types'

interface ScannerScreenProps {
  onScanComplete: (result: ScanResult) => void
}

export default function ScannerScreen({ onScanComplete }: ScannerScreenProps) {
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [scanning, setScanning] = useState(false)

  if (!permission) {
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

  const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned || scanning) return

    setScanned(true)
    setScanning(true)

    try {
      const deviceId = await storage.getDeviceId()
      const result = await api.searchByEAN(data, deviceId)

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
        }

        onScanComplete(result)
      } else {
        Alert.alert(
          'Geen resultaten',
          'Geen aanbiedingen gevonden voor deze barcode',
          [
            {
              text: 'Scan opnieuw',
              onPress: () => {
                setScanned(false)
                setScanning(false)
              },
            },
          ]
        )
      }
    } catch (error) {
      console.error('Scan error:', error)
      Alert.alert(
        'Fout',
        'Er is een fout opgetreden. Probeer opnieuw.',
        [
          {
            text: 'OK',
            onPress: () => {
              setScanned(false)
              setScanning(false)
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
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>📱 DealSense Scanner</Text>
            <Text style={styles.subtitle}>Richt op barcode of QR code</Text>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame} />
            {scanning && (
              <View style={styles.scanningIndicator}>
                <Text style={styles.scanningText}>Zoeken...</Text>
              </View>
            )}
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
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
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
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
