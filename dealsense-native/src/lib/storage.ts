// AsyncStorage wrapper for DealSense

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { UserProfile, ScanRecord } from '../types'

const KEYS = {
  USER_PROFILE: 'dealsense_user_profile',
  DEVICE_ID: 'dealsense_device_id',
  SCAN_HISTORY: 'dealsense_scan_history',
}

export const storage = {
  // Device ID
  async getDeviceId(): Promise<string> {
    let id = await AsyncStorage.getItem(KEYS.DEVICE_ID)
    if (!id) {
      id = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await AsyncStorage.setItem(KEYS.DEVICE_ID, id)
    }
    return id
  },

  // User Profile
  async getUserProfile(): Promise<UserProfile | null> {
    const data = await AsyncStorage.getItem(KEYS.USER_PROFILE)
    return data ? JSON.parse(data) : null
  },

  async setUserProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile))
  },

  async createDefaultProfile(): Promise<UserProfile> {
    const deviceId = await this.getDeviceId()
    const profile: UserProfile = {
      userId: deviceId,
      deviceId,
      packageType: 'free',
      scansUsed: 0,
      scansRemaining: 3,
      createdAt: Date.now(),
    }
    await this.setUserProfile(profile)
    return profile
  },

  // Scan History
  async getScanHistory(): Promise<ScanRecord[]> {
    const data = await AsyncStorage.getItem(KEYS.SCAN_HISTORY)
    return data ? JSON.parse(data) : []
  },

  async addScanRecord(record: ScanRecord): Promise<void> {
    const history = await this.getScanHistory()
    history.unshift(record)
    // Keep only last 50 scans
    if (history.length > 50) {
      history.splice(50)
    }
    await AsyncStorage.setItem(KEYS.SCAN_HISTORY, JSON.stringify(history))
  },

  // Clear all data
  async clearAll(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER_PROFILE)
    await AsyncStorage.removeItem(KEYS.SCAN_HISTORY)
  },
}
