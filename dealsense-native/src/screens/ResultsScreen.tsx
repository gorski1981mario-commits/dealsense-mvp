import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native'
import { COLORS } from '../lib/constants'
import type { ScanResult } from '../types'

interface ResultsScreenProps {
  result: ScanResult
  packageType: 'free' | 'plus'
  onNewScan: () => void
  onUpgrade?: () => void
  onActivateGhostMode?: () => void
}
, onActivateGhostMode
export default function ResultsScreen({ result, packageType, onNewScan, onUpgrade }: ResultsScreenProps) {
  const handleOpenShop = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err))
  }

  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`
  }

  const bestOffer = result.offers[0]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.productName}>{result.productName}</Text>
        <Text style={styles.ean}>EAN: {result.ean}</Text>
      </View>

      {result.savings > 0 && (
        <View style={styles.savingsCard}>
          <Text style={styles.savingsLabel}>💰 Besparing</Text>
          <Text style={styles.savingsAmount}>{formatPrice(result.savings)}</Text>
          <Text style={styles.savingsPercent}>
            {((result.savings / result.basePrice) * 100).toFixed(0)}% goedkoper
          </Text>
        </View>
      )}

      <View style={styles.offersSection}>
        <Text style={styles.sectionTitle}>
          {result.offers.length} {result.offers.length === 1 ? 'aanbieding' : 'aanbiedingen'} gevonden
        </Text>

        {result.offers.map((offer, index) => (
          <View key={index} style={styles.offerCard}>
            <View style={styles.offerHeader}>
              {index === 0 && (
                <View style={styles.bestBadge}>
                  <Text style={styles.bestBadgeText}>🥇 Beste deal</Text>
                </View>
              )}
            </View>

            <View style={styles.offerContent}>
              <View style={styles.offerInfo}>
                <Text style={styles.offerPrice}>{formatPrice(offer.price)}</Text>
                {offer.shipping && offer.shipping > 0 && (
                  <Text style={styles.shippingText}>
                    + {formatPrice(offer.shipping)} verzending
                  </Text>
                )}
                {packageType === 'plus' && (
                  <Text style={styles.shopName}>{offer.shop}</Text>
                )}
              </View>

              {packageType === 'plus' ? (
                <TouchableOpacity
                  style={styles.shopButton}
                  onPress={() => handleOpenShop(offer.url)}
                >
                  <Text style={styles.shopButtonText}>Naar winkel →</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.lockedBadge}>
                  <Text style={styles.lockedText}>🔒 PLUS</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {packageType === 'free' && (
        <View style={styles.upgradeCard}>
          <Text style={styles.upgradeTitle}>🚀 Upgrade naar PLUS</Text>
          <Text style={styles.upgradeText}>
            Zie winkelnamen en krijg directe links naar de beste deals
          </Text>
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <Text style={styles.upgradeButtonText}>Upgrade voor €19,99/mnd</Text>
          </TouchableOpacity>
        </View>
      )}

      {packageType === 'plus' && result.savings < 10 && onActivateGhostMode && (
        <View style={styles.ghostModeCard}>
          <Text style={styles.ghostModeTitle}>👻 Ghost Mode</Text>
          <Text style={styles.ghostModeText}>
            Niet tevreden met deze prijs? Activeer Ghost Mode en we monitoren
            automatisch de prijs voor 24 uur. Je krijgt een notificatie als we een
            betere deal vinden!
          </Text>
          <TouchableOpacity style={styles.ghostModeButton} onPress={onActivateGhostMode}>
            <Text style={styles.ghostModeButtonText}>Activeer Ghost Mode (24u)</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.newScanButton} onPress={onNewScan}>
        <Text style={styles.newScanButtonText}>📱 Nieuwe scan</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  ean: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  savingsCard: {
    margin: 20,
    padding: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
  },
  savingsLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  savingsPercent: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  offersSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  offerHeader: {
    marginBottom: 12,
  },
  bestBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bestBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  offerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offerInfo: {
    flex: 1,
  },
  offerPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  shippingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  lockedBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  lockedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  upgradeCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  upgradeText: {
    fontSize: 14,
    color: '#92400e',
    marginBottom: 16,
    lineHeight: 20,
  },
  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  ghostModeCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
  },
  ghostModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  ghostModeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  ghostModeButton: {
    backgroundColor: COLORS.text,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  ghostModeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  newScanButton: {
    margin: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  newScanButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  spacer: {
    height: 40,
  },
})
