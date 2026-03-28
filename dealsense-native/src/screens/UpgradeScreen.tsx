import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { COLORS, PACKAGES } from '../lib/constants'

interface UpgradeScreenProps {
  currentPackage: 'free' | 'plus'
  onUpgrade: () => void
  onClose: () => void
}

export default function UpgradeScreen({ currentPackage, onUpgrade, onClose }: UpgradeScreenProps) {
  const plusPackage = PACKAGES.plus

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade naar PLUS</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.heroSection}>
          <Text style={styles.heroEmoji}>🚀</Text>
          <Text style={styles.heroTitle}>Ontgrendel alle functies</Text>
          <Text style={styles.heroSubtitle}>
            Krijg toegang tot onbeperkte scans en exclusieve deals
          </Text>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceAmount}>€{plusPackage.price.toFixed(2)}</Text>
          <Text style={styles.priceLabel}>per maand</Text>
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsBadgeText}>
              Bespaar gemiddeld €50-200/maand
            </Text>
          </View>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Wat krijg je?</Text>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Onbeperkte scans</Text>
              <Text style={styles.featureDescription}>
                Scan zoveel producten als je wilt
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Directe winkel links</Text>
              <Text style={styles.featureDescription}>
                Zie winkelnamen en krijg directe links naar deals
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Ghost Mode (24u)</Text>
              <Text style={styles.featureDescription}>
                Automatische prijsmonitoring als we nu niks vinden
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Lagere commissie</Text>
              <Text style={styles.featureDescription}>
                9% i.p.v. 10% - meer besparing voor jou
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>✓</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Scan geschiedenis</Text>
              <Text style={styles.featureDescription}>
                Bekijk al je vorige scans en besparingen
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.guaranteeSection}>
          <Text style={styles.guaranteeTitle}>💯 Geld-terug garantie</Text>
          <Text style={styles.guaranteeText}>
            Niet tevreden? Krijg je geld terug binnen 30 dagen. Geen vragen gesteld.
          </Text>
        </View>

        <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
          <Text style={styles.upgradeButtonText}>
            Start voor €{plusPackage.price.toFixed(2)}/maand
          </Text>
        </TouchableOpacity>

        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            Door te upgraden ga je akkoord met onze voorwaarden.{'\n'}
            Je kunt op elk moment opzeggen.
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    top: 60,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  heroEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  priceCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    padding: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  priceLabel: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 16,
  },
  savingsBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  savingsBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  featureIcon: {
    fontSize: 24,
    color: COLORS.primary,
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  guaranteeSection: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  guaranteeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  guaranteeText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  upgradeButton: {
    marginHorizontal: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  termsSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  termsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  spacer: {
    height: 40,
  },
})
