import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { COLORS } from '../lib/constants'
import type { GhostModeItem } from '../lib/ghost-mode'

interface GhostModeScreenProps {
  items: GhostModeItem[]
  onClose: () => void
  onActivate: (ean: string, productName: string, currentPrice: number, targetPrice: number) => void
}

export default function GhostModeScreen({ items, onClose, onActivate }: GhostModeScreenProps) {
  const formatTimeRemaining = (expiresAt: number) => {
    const now = Date.now()
    const remaining = expiresAt - now
    const hours = Math.floor(remaining / (1000 * 60 * 60))
    return `${hours}u resterend`
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👻 Ghost Mode</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Wat is Ghost Mode?</Text>
          <Text style={styles.infoText}>
            Als we nu geen betere prijs vinden, activeer Ghost Mode. We monitoren
            automatisch de prijs voor 24 uur en sturen een notificatie als we een
            betere deal vinden!
          </Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👻</Text>
            <Text style={styles.emptyTitle}>Geen actieve monitoring</Text>
            <Text style={styles.emptyText}>
              Scan een product en activeer Ghost Mode als we geen betere prijs vinden
            </Text>
          </View>
        ) : (
          <View style={styles.itemsSection}>
            <Text style={styles.sectionTitle}>
              Actieve monitoring ({items.length})
            </Text>

            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {item.status === 'active' ? '🔍 Monitoring' : '✓ Gevonden'}
                    </Text>
                  </View>
                </View>

                <View style={styles.itemDetails}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Huidige prijs:</Text>
                    <Text style={styles.priceValue}>€{item.currentPrice.toFixed(2)}</Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Doel prijs:</Text>
                    <Text style={styles.targetPrice}>€{item.targetPrice.toFixed(2)}</Text>
                  </View>
                </View>

                <View style={styles.itemFooter}>
                  <Text style={styles.timeRemaining}>
                    ⏱️ {formatTimeRemaining(item.expiresAt)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Voordelen Ghost Mode:</Text>
          <Text style={styles.benefit}>✓ Automatische prijsmonitoring (24u)</Text>
          <Text style={styles.benefit}>✓ Notificatie bij betere deal</Text>
          <Text style={styles.benefit}>✓ Geen handmatig checken nodig</Text>
          <Text style={styles.benefit}>✓ Exclusief voor PLUS leden</Text>
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
  infoSection: {
    padding: 20,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  itemsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  itemDetails: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  targetPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  itemFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  timeRemaining: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  benefitsSection: {
    margin: 20,
    padding: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
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
  spacer: {
    height: 40,
  },
})
