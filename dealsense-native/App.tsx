import { StatusBar } from 'expo-status-bar'
import { useState, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator } from 'react-native'
import ScannerScreen from './src/screens/ScannerScreen'
import ResultsScreen from './src/screens/ResultsScreen'
import { storage } from './src/lib/storage'
import { COLORS } from './src/lib/constants'
import type { ScanResult, UserProfile } from './src/types'

type AppState = 'loading' | 'scanner' | 'results'

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      let profile = await storage.getUserProfile()
      
      if (!profile) {
        profile = await storage.createDefaultProfile()
      }
      
      setUserProfile(profile)
      setAppState('scanner')
    } catch (error) {
      console.error('Failed to initialize app:', error)
      setAppState('scanner')
    }
  }

  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result)
    setAppState('results')
  }

  const handleNewScan = () => {
    setScanResult(null)
    setAppState('scanner')
  }

  if (appState === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <StatusBar style="auto" />
      </View>
    )
  }

  if (appState === 'results' && scanResult && userProfile) {
    return (
      <View style={styles.container}>
        <ResultsScreen
          result={scanResult}
          packageType={userProfile.packageType}
          onNewScan={handleNewScan}
        />
        <StatusBar style="dark" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScannerScreen onScanComplete={handleScanComplete} />
      <StatusBar style="light" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
})
