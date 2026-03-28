import { StatusBar } from 'expo-status-bar'
import { useState, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import ScannerScreen from './src/screens/ScannerScreen'
import ResultsScreen from './src/screens/ResultsScreen'
import UpgradeScreen from './src/screens/UpgradeScreen'
import PaywallScreen from './src/screens/PaywallScreen'
import { storage } from './src/lib/storage'
import { payment } from './src/lib/payment'
import { COLORS } from './src/lib/constants'
import type { ScanResult, UserProfile } from './src/types'

type AppState = 'loading' | 'scanner' | 'results' | 'upgrade' | 'paywall'

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

  const handleNewScan = async () => {
    // Check scan limit for FREE users
    if (userProfile?.packageType === 'free') {
      const profile = await storage.getUserProfile()
      if (profile && profile.scansRemaining <= 0) {
        setAppState('paywall')
        return
      }
    }

    setScanResult(null)
    setAppState('scanner')
  }

  const handleUpgradeClick = () => {
    setAppState('upgrade')
  }

  const handleUpgradeConfirm = async () => {
    if (!userProfile) return

    Alert.alert(
      'Bevestig upgrade',
      'Upgrade naar PLUS voor €19,99/maand?',
      [
        {
          text: 'Annuleren',
          style: 'cancel',
        },
        {
          text: 'Bevestigen',
          onPress: async () => {
            const success = await payment.processUpgrade(userProfile.userId)
            
            if (success) {
              // Refresh profile
              const updatedProfile = await storage.getUserProfile()
              setUserProfile(updatedProfile)
              
              Alert.alert(
                '🎉 Welkom bij PLUS!',
                'Je hebt nu toegang tot alle functies',
                [
                  {
                    text: 'Start scannen',
                    onPress: () => setAppState('scanner'),
                  },
                ]
              )
            } else {
              Alert.alert(
                'Fout',
                'Er is iets misgegaan. Probeer opnieuw.',
                [{ text: 'OK' }]
              )
            }
          },
        },
      ]
    )
  }

  const handleCloseUpgrade = () => {
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

  if (appState === 'upgrade' && userProfile) {
    return (
      <View style={styles.container}>
        <UpgradeScreen
          currentPackage={userProfile.packageType}
          onUpgrade={handleUpgradeConfirm}
          onClose={handleCloseUpgrade}
        />
        <StatusBar style="dark" />
      </View>
    )
  }

  if (appState === 'paywall' && userProfile) {
    return (
      <View style={styles.container}>
        <PaywallScreen
          scansRemaining={userProfile.scansRemaining}
          onUpgrade={handleUpgradeClick}
        />
        <StatusBar style="dark" />
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
          onUpgrade={handleUpgradeClick}
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
