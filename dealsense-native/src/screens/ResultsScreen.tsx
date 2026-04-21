import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, Share } from 'react-native'
import { COLORS } from '../lib/constants'
import type { ScanResult } from '../types'

interface ResultsScreenProps {
  result: ScanResult
  packageType: 'free' | 'plus'
  onNewScan: () => void
  onUpgrade?: () => void
  onActivateGhostMode?: () => void
}

export default function ResultsScreen({ result, packageType, onNewScan, onUpgrade, onActivateGhostMode }: ResultsScreenProps) {
  console.log('[ResultsScreen] Result:', result)
  console.log('[ResultsScreen] PackageType:', packageType)
  console.log('[ResultsScreen] Offers count:', result.offers?.length)

  const handleOpenShop = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err))
  }

  const formatPrice = (price: number) => {
    return `€${price.toFixed(2)}`
  }

  const handleShare = async () => {
    const bestOffer = result.offers[0]
    const savingsText = result.savings > 0 
      ? `Besparing: €${result.savings.toFixed(2)} (${((result.savings / result.basePrice) * 100).toFixed(0)}%)`
      : ''

    const shareMessage = `💰 DealSense gevonden!\n\n${result.productName}\nEAN: ${result.ean}\n\nBeste deal: ${bestOffer.shop}\nPrijs: €${bestOffer.price.toFixed(2)}\n\n${savingsText}\n\nScan nu zelf en bespaar geld!`

    try {
      await Share.share({
        message: shareMessage,
        url: bestOffer.url
      })
    } catch (error) {
      console.error('Failed to share:', error)
      Alert.alert('Fout', 'Kon niet delen')
    }
  }

  const bestOffer = result.offers[0]
  // Base offer is the first one with _source='base'
  const baseOffer = result.offers.find(o => o._source === 'base') || result.offers[0] || { shop: 'Unknown', price: result.basePrice || 0 }
  const comparisonOffers = result.offers ? result.offers.filter(o => o._source !== 'base').slice(0, 3) : []

  // Sprawdź czy to są pierwsze 3 skany dla FREE
  const isFirstThreeScans = packageType === 'free' && result.savings > 0

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.productName}>{result.productName}</Text>
        <Text style={styles.ean}>EAN: {result.ean}</Text>
      </View>

      {/* Base Offer - oddzielona na górze */}
      <View style={styles.baseOfferCard}>
        <Text style={styles.baseOfferLabel}>Basisprijs</Text>
        <View style={styles.baseOfferContent}>
          <View style={styles.baseOfferInfo}>
            <Text style={styles.baseOfferPrice}>{formatPrice(result.basePrice)}</Text>
            <Text style={styles.baseOfferShop}>{baseOffer.shop}</Text>
          </View>
        </View>
      </View>

      {/* Prowizja i końcowa cena */}
      {result.savings > 0 && (
        <View style={styles.commissionCard}>
          <Text style={styles.commissionLabel}>💰 SAMENVATTING</Text>
          <View style={styles.commissionContent}>
            <Text style={styles.commissionRow}>
              Besparing: {formatPrice(result.savings)}
            </Text>
            <Text style={styles.commissionRow}>
              Commissie (10%): {formatPrice(result.commission)}
            </Text>
            <Text style={styles.commissionRow}>
              Eindprijs: {formatPrice(result.finalPrice)}
            </Text>
          </View>
        </View>
      )}

      {/* Comparison Offers - dynamicznie ile zwróci backend */}
      {comparisonOffers.length > 0 && (
        <View style={styles.offersSection}>
          <Text style={styles.sectionTitle}>
            {comparisonOffers.length} alternatiew{comparisonOffers.length === 1 ? 'e' : comparisonOffers.length > 1 ? 'e' : ''}
          </Text>

          {comparisonOffers.map((offer, index) => {
            return (
              <View key={index} style={styles.offerCard}>
                <View style={styles.offerHeader}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>{index + 1}</Text>
                  </View>
                </View>

                <View style={styles.offerContent}>
                  <View style={styles.offerInfo}>
                    <Text style={styles.offerPrice}>{formatPrice(offer.price)}</Text>
                    {isFirstThreeScans && packageType === 'free' && (
                      <Text style={styles.shopName}>{offer.shop}</Text>
                    )}
                    {!isFirstThreeScans && packageType === 'free' && (
                      <Text style={styles.shopName}>{offer.shop}</Text>
                    )}
                    {packageType === 'plus' && (
                      <Text style={styles.shopName}>Winkel verborgen</Text>
                    )}
                    <Text style={styles.savingsText}>
                      Besparing: {formatPrice(result.basePrice - offer.price)} ({((result.basePrice - offer.price) / result.basePrice * 100).toFixed(0)}%)
                    </Text>
                  </View>

                  {packageType === 'plus' ? (
                    <TouchableOpacity
                      style={styles.payCommissionButton}
                      onPress={() => {
                        Alert.alert(
                          'Betaal commissie',
                          `Commissie: ${formatPrice(result.commission)}\n\nWil je betalen en de winkelnaam zien?`,
                          [
                            { text: 'Annuleren', style: 'cancel' },
                            {
                              text: 'Betalen',
                              onPress: () => handleOpenShop(offer.url)
                            }
                          ]
                        )
                      }}
                    >
                      <Text style={styles.payCommissionButtonText}>Betaal commissie</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.shopButton}
                      onPress={() => handleOpenShop(offer.url)}
                    >
                      <Text style={styles.shopButtonText}>Naar winkel →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )
          })}
        </View>
      )}

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
          <Text style={styles.ghostModeTitle}>Ghost Mode</Text>
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

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>Deel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newScanButton} onPress={onNewScan}>
          <Text style={styles.newScanButtonText}>Nieuwe scan</Text>
        </TouchableOpacity>
      </View>

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
  baseOfferCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.text,
  },
  baseOfferLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  baseOfferContent: {
    alignItems: 'center',
  },
  baseOfferInfo: {
    alignItems: 'center',
  },
  baseOfferPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  baseOfferShop: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  commissionCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#fef9c3',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fde047',
  },
  commissionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ca8a04',
    marginBottom: 12,
  },
  commissionContent: {
    gap: 8,
  },
  commissionRow: {
    fontSize: 16,
    color: COLORS.text,
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
  rankBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  rankBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
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
  savingsText: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
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
  payCommissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  payCommissionButtonText: {
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
    flex: 1,
  },
  newScanButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  shareButton: {
    backgroundColor: COLORS.text,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  shareButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  spacer: {
    height: 40,
  },
})
