// Storage utility for DealSense MVP
// Uses localStorage for now, can be migrated to Upstash/PostgreSQL later

export interface UserProfile {
  userId: string
  deviceId: string
  packageType: 'free' | 'plus' | 'pro' | 'finance'
  createdAt: number
  lastActive: number
  biometricRegistered: boolean
}

export interface ScanRecord {
  id: string
  userId: string
  timestamp: number
  productUrl: string
  basePrice: number
  category: string
  bestOffer?: {
    price: number
    seller: string
    url: string
  }
  savings?: number
  offersCount: number
}

export interface SavingsData {
  userId: string
  week: number
  month: number
  total: number
  lastUpdated: number
  scans: ScanRecord[]
}

export class Storage {
  // User Profile
  static getUserProfile(userId: string): UserProfile | null {
    const data = localStorage.getItem(`profile_${userId}`)
    return data ? JSON.parse(data) : null
  }

  static saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(`profile_${profile.userId}`, JSON.stringify(profile))
  }

  static createUserProfile(userId: string, deviceId: string): UserProfile {
    const profile: UserProfile = {
      userId,
      deviceId,
      packageType: 'free',
      createdAt: Date.now(),
      lastActive: Date.now(),
      biometricRegistered: false
    }
    this.saveUserProfile(profile)
    return profile
  }

  static updatePackageType(userId: string, packageType: UserProfile['packageType']): void {
    const profile = this.getUserProfile(userId)
    if (profile) {
      profile.packageType = packageType
      profile.lastActive = Date.now()
      this.saveUserProfile(profile)
    }
  }

  // Scan History
  static getScanHistory(userId: string): ScanRecord[] {
    const data = localStorage.getItem(`scans_${userId}`)
    return data ? JSON.parse(data) : []
  }

  static addScan(userId: string, scan: Omit<ScanRecord, 'id' | 'userId' | 'timestamp'>): ScanRecord {
    const scans = this.getScanHistory(userId)
    const newScan: ScanRecord = {
      ...scan,
      id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      timestamp: Date.now()
    }
    scans.unshift(newScan) // Add to beginning
    
    // Keep only last 100 scans
    const trimmedScans = scans.slice(0, 100)
    localStorage.setItem(`scans_${userId}`, JSON.stringify(trimmedScans))
    
    // Update savings
    this.updateSavings(userId)
    
    return newScan
  }

  static clearScanHistory(userId: string): void {
    localStorage.removeItem(`scans_${userId}`)
  }

  // Savings
  static getSavings(userId: string): SavingsData {
    const scans = this.getScanHistory(userId)
    const now = Date.now()
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000)
    const monthAgo = now - (30 * 24 * 60 * 60 * 1000)

    const weekScans = scans.filter(s => s.timestamp >= weekAgo)
    const monthScans = scans.filter(s => s.timestamp >= monthAgo)

    const weekSavings = weekScans.reduce((sum, s) => sum + (s.savings || 0), 0)
    const monthSavings = monthScans.reduce((sum, s) => sum + (s.savings || 0), 0)
    const totalSavings = scans.reduce((sum, s) => sum + (s.savings || 0), 0)

    return {
      userId,
      week: weekSavings,
      month: monthSavings,
      total: totalSavings,
      lastUpdated: now,
      scans
    }
  }

  static updateSavings(userId: string): void {
    const savings = this.getSavings(userId)
    localStorage.setItem(`savings_${userId}`, JSON.stringify(savings))
  }

  // Usage Count (for FREE package)
  static getUsageCount(userId: string): number {
    const scans = this.getScanHistory(userId)
    return scans.length
  }

  static getRemainingScans(userId: string, packageType: UserProfile['packageType']): number {
    if (packageType !== 'free') return Infinity
    const count = this.getUsageCount(userId)
    return Math.max(0, 3 - count)
  }

  // Ghost Mode
  static getGhostMode(userId: string): any {
    const data = localStorage.getItem(`ghost_mode_${userId}`)
    return data ? JSON.parse(data) : null
  }

  static setGhostMode(userId: string, ghostData: any): void {
    localStorage.setItem(`ghost_mode_${userId}`, JSON.stringify(ghostData))
  }

  static clearGhostMode(userId: string): void {
    localStorage.removeItem(`ghost_mode_${userId}`)
  }

  // Biometric
  static setBiometricRegistered(userId: string, registered: boolean): void {
    const profile = this.getUserProfile(userId)
    if (profile) {
      profile.biometricRegistered = registered
      this.saveUserProfile(profile)
    }
  }

  // Clear all data (for testing)
  static clearAllData(userId: string): void {
    localStorage.removeItem(`profile_${userId}`)
    localStorage.removeItem(`scans_${userId}`)
    localStorage.removeItem(`savings_${userId}`)
    localStorage.removeItem(`ghost_mode_${userId}`)
  }

  // Export data (for user download)
  static exportData(userId: string): string {
    const profile = this.getUserProfile(userId)
    const scans = this.getScanHistory(userId)
    const savings = this.getSavings(userId)
    const ghostMode = this.getGhostMode(userId)

    return JSON.stringify({
      profile,
      scans,
      savings,
      ghostMode,
      exportedAt: new Date().toISOString()
    }, null, 2)
  }

  // Import data (for user upload)
  static importData(userId: string, jsonData: string): void {
    try {
      const data = JSON.parse(jsonData)
      if (data.profile) this.saveUserProfile(data.profile)
      if (data.scans) localStorage.setItem(`scans_${userId}`, JSON.stringify(data.scans))
      if (data.savings) localStorage.setItem(`savings_${userId}`, JSON.stringify(data.savings))
      if (data.ghostMode) this.setGhostMode(userId, data.ghostMode)
    } catch (error) {
      console.error('Failed to import data:', error)
      throw new Error('Invalid data format')
    }
  }
}
