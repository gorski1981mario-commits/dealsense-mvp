// Ghost Mode - 24h price monitoring for PLUS users
// Activates when we don't find better deals NOW

import { storage } from './storage'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface GhostModeItem {
  id: string
  userId: string
  ean: string
  productName: string
  currentPrice: number
  targetPrice: number // Price user wants to beat
  activatedAt: number
  expiresAt: number // 24h for PLUS
  status: 'active' | 'expired' | 'found'
  lastChecked?: number
}

const GHOST_MODE_KEY = 'dealsense_ghost_mode'

export const ghostMode = {
  /**
   * Activate Ghost Mode for a product
   * PLUS: 24h monitoring
   */
  async activate(
    ean: string,
    productName: string,
    currentPrice: number,
    targetPrice: number
  ): Promise<GhostModeItem> {
    const deviceId = await storage.getDeviceId()
    const profile = await storage.getUserProfile()

    if (!profile || profile.packageType !== 'plus') {
      throw new Error('Ghost Mode is only available for PLUS users')
    }

    const duration = 24 * 60 * 60 * 1000 // 24h in milliseconds
    const now = Date.now()

    const item: GhostModeItem = {
      id: `ghost_${now}_${ean}`,
      userId: profile.userId,
      ean,
      productName,
      currentPrice,
      targetPrice,
      activatedAt: now,
      expiresAt: now + duration,
      status: 'active',
    }

    // Save to storage
    const items = await this.getAll()
    items.push(item)
    await AsyncStorage.setItem(GHOST_MODE_KEY, JSON.stringify(items))

    return item
  },

  /**
   * Get all Ghost Mode items for current user
   */
  async getAll(): Promise<GhostModeItem[]> {
    const data = await AsyncStorage.getItem(GHOST_MODE_KEY)
    if (!data) return []

    const items: GhostModeItem[] = JSON.parse(data)
    const profile = await storage.getUserProfile()
    
    if (!profile) return []

    // Filter by user and remove expired
    const now = Date.now()
    return items.filter(item => 
      item.userId === profile.userId && 
      item.expiresAt > now
    )
  },

  /**
   * Get active Ghost Mode items
   */
  async getActive(): Promise<GhostModeItem[]> {
    const items = await this.getAll()
    return items.filter(item => item.status === 'active')
  },

  /**
   * Check if product is already in Ghost Mode
   */
  async isActive(ean: string): Promise<boolean> {
    const items = await this.getActive()
    return items.some(item => item.ean === ean)
  },

  /**
   * Deactivate Ghost Mode for a product
   */
  async deactivate(id: string): Promise<void> {
    const items = await this.getAll()
    const updated = items.map(item => 
      item.id === id ? { ...item, status: 'expired' as const } : item
    )
    await AsyncStorage.setItem(GHOST_MODE_KEY, JSON.stringify(updated))
  },

  /**
   * Mark item as found (better price discovered)
   */
  async markAsFound(id: string): Promise<void> {
    const items = await this.getAll()
    const updated = items.map(item => 
      item.id === id ? { ...item, status: 'found' as const } : item
    )
    await AsyncStorage.setItem(GHOST_MODE_KEY, JSON.stringify(updated))
  },

  /**
   * Clean up expired items
   */
  async cleanup(): Promise<void> {
    const data = await AsyncStorage.getItem(GHOST_MODE_KEY)
    if (!data) return

    const items: GhostModeItem[] = JSON.parse(data)
    const now = Date.now()
    
    const active = items.filter(item => item.expiresAt > now)
    await AsyncStorage.setItem(GHOST_MODE_KEY, JSON.stringify(active))
  },
}
