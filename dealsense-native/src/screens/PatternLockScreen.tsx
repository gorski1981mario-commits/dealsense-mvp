import React, { useState, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'
import { COLORS } from '../lib/constants'

const { width } = Dimensions.get('window')
const GRID_SIZE = 3
const DOT_SIZE = 15
const DOT_SPACING = 25

interface PatternLockScreenProps {
  onUnlockSuccess: () => void
  onCancel: () => void
}

export default function PatternLockScreen({ onUnlockSuccess, onCancel }: PatternLockScreenProps) {
  const [pattern, setPattern] = useState<number[]>([])
  const [isVerifying, setIsVerifying] = useState(false)

  const dots = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i)

  const handleDotPress = (index: number) => {
    if (pattern.includes(index)) return

    const newPattern = [...pattern, index]
    setPattern(newPattern)

    if (newPattern.length >= 4) {
      verifyPattern(newPattern)
    }
  }

  const verifyPattern = async (currentPattern: number[]) => {
    setIsVerifying(true)
    
    try {
      // Check if biometry is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()

      if (!hasHardware || !isEnrolled) {
        // Fallback to pattern verification
        // For MVP, accept any pattern of 4+ dots
        setTimeout(() => {
          if (currentPattern.length >= 4) {
            onUnlockSuccess()
          } else {
            Alert.alert('Patroon ongeldig', 'Patroon moet minimaal 4 punten hebben')
            setPattern([])
          }
          setIsVerifying(false)
        }, 500)
        return
      }

      // Try biometric authentication
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Bevestig om DealSense te ontgrendelen',
        fallbackLabel: 'Gebruik patron',
        cancelLabel: 'Annuleren',
      })

      if (result.success) {
        onUnlockSuccess()
      } else {
        Alert.alert('Authenticatie mislukt', 'Probeer opnieuw')
        setPattern([])
      }
    } catch (error) {
      console.error('Authentication error:', error)
      // Fallback to pattern verification
      setTimeout(() => {
        if (currentPattern.length >= 4) {
          onUnlockSuccess()
        } else {
          Alert.alert('Patroon ongeldig', 'Patroon moet minimaal 4 punten hebben')
          setPattern([])
        }
        setIsVerifying(false)
      }, 500)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleReset = () => {
    setPattern([])
  }

  const isDotSelected = (index: number) => pattern.includes(index)
  const isDotConnected = (index: number) => {
    if (pattern.length === 0) return false
    return pattern.includes(index)
  }

  const getDotStyle = (index: number) => {
    if (isDotSelected(index)) {
      return {
        backgroundColor: COLORS.primary,
        transform: [{ scale: 1.2 }],
      }
    }
    return {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🔐 Patron Ontgrendelen</Text>
        <Text style={styles.subtitle}>
          Verbind {pattern.length >= 4 ? `${pattern.length}+` : '4+'} punten om te ontgrendelen
        </Text>

        <View style={styles.grid}>
          {dots.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                getDotStyle(index),
              ]}
              onPress={() => handleDotPress(index)}
              disabled={isVerifying}
              activeOpacity={0.7}
            />
          ))}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={handleReset}
            disabled={pattern.length === 0}
          >
            <Text style={styles.secondaryButtonText}>Opnieuw</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onCancel}
          >
            <Text style={styles.cancelButtonText}>Annuleren</Text>
          </TouchableOpacity>
        </View>

        {isVerifying && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Verifiëren...</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#1a1a1a',
    padding: 30,
    borderRadius: 20,
    width: width * 0.85,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 30,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    margin: DOT_SPACING / 2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
})
