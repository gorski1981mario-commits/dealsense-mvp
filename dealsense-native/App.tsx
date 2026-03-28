import { StatusBar } from 'expo-status-bar'
import { useState, useEffect } from 'react'
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native'
import ScannerScreen from './src/screens/ScannerScreen'
import ResultsScreen from './src/screens/ResultsScreen'
import UpgradeScreen from './src/screens/UpgradeScreen'
import PaywallScreen from './src/screens/PaywallScreen'
import EchoScreen from './src/screens/EchoScreen'
import GhostModeScreen from './src/screens/GhostModeScreen'
import { storage } from './src/lib/storage'
import { payment } from './src/lib/payment'
import { ghostMode } from './src/lib/ghost-mode'
import type { GhostModeItem } from './src/lib/ghost-mode'
import { COLORS } from './src/lib/constants'
import type { ScanResult, UserProfile } from './src/types'

type AppState = 'loading' | 'scanner' | 'results' | 'upgrade' | 'paywall' | 'echo' | 'ghostmode'

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [ghostModeItems, setGhostModeItems] = useState<GhostModeItem[]>([])

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

  const handleCloseEcho = () => {
    setAppState('scanner')
  }

  const handleActivateGhostMode = async () => {
    if (!scanResult || !userProfile) return

    try {
      const targetPrice = scanResult.offers[0]?.price || scanResult.basePrice * 0.9
      
      await ghostMode.activate(
        scanResult.ean,
        scanResult.productName,
        scanResult.basePrice,
        targetPrice
      )

      Alert.alert(
        '👻 Ghost Mode Geactiveerd!',
        `We monitoren ${scanResult.productName} voor 24 uur. Je krijgt een notificatie als we een betere prijs vinden!`,
        [{ text: 'OK', onPress: () => setAppState('scanner') }]
      )
    } catch (error) {
      Alert.alert('Fout', 'Ghost Mode kon niet worden geactiveerd. Probeer opnieuw.')
    }
  }

  const handleOpenGhostMode = async () => {
    const items = await ghostMode.getActive()
    setGhostModeItems(items)
    setAppState('ghostmode')
  }ghostmode' && userProfile) {
    return (
      <View style={styles.container}>
        <GhostModeScreen
          items={ghostModeItems}
          onClose={handleCloseGhostMode}
          onActivate={handleActivateGhostMode}
        />
        <StatusBar style="dark" />
      </View>
    )
  }

  if (appState === '

  const handleCloseGhostMode = () => {
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

  if (appState === 'echo' && userProfile) {
    return (
      <View style={styles.container}>
        <EchoScreen packageType={userProfile.packageType} onClose={handleCloseEcho} />
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
          onActivateGhostMode={handleActivateGhostMode}
        />
        <StatusBar style="dark" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ScannerScreen
        onScanComplete={handleScanComplete}
        onOpenEcho={handleOpenEcho}
        packageType={userProfile?.packageType}
      />
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
