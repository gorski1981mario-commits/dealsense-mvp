import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { COLORS } from '../lib/constants'

interface PaywallScreenProps {
  scansRemaining: number
  onUpgrade: () => void
}

export default function PaywallScreen({ scansRemaining, onUpgrade }: PaywallScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🔒</Text>
        <Text style={styles.title}>Scan limiet bereikt</Text>
        <Text style={styles.message}>
          Je hebt je {3} gratis scans gebruikt.{'\n'}
          Upgrade naar PLUS voor onbeperkte scans!
        </Text>

        <View style={styles.benefitsBox}>
          <Text style={styles.benefitsTitle}>Met PLUS krijg je:</Text>
          <Text style={styles.benefit}>✓ Onbeperkte scans</Text>
          <Text style={styles.benefit}>✓ Directe winkel links</Text>
          <Text style={styles.benefit}>✓ Ghost Mode (24u monitoring)</Text>
          <Text style={styles.benefit}>✓ Lagere commissie (9%)</Text>
        </View>

        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <Text style={styles.upgradeButtonText}>Upgrade naar PLUS - €19,99/mnd</Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Of wacht tot morgen voor 3 nieuwe gratis scans
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  benefitsBox: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  benefit: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  upgradeButton: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  hint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
})
