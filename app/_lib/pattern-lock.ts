// Pattern Lock Authentication (3x3 grid)
// Alternative to biometric auth - works everywhere (localhost, production)

export interface PatternLockCredential {
  pattern: number[]
  createdAt: number
  backupCodes: string[]
}

export class PatternLock {
  private static STORAGE_KEY = 'dealsense_pattern_lock'
  private static BACKUP_CODES_KEY = 'dealsense_pattern_backup_codes'

  /**
   * Generate backup codes for pattern recovery
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 6; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  /**
   * Register pattern lock
   */
  static register(pattern: number[]): { success: boolean; backupCodes?: string[] } {
    try {
      if (!pattern || pattern.length < 4) {
        return { success: false }
      }

      const backupCodes = this.generateBackupCodes()
      
      const credential: PatternLockCredential = {
        pattern,
        createdAt: Date.now(),
        backupCodes
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credential))
      return { success: true, backupCodes }
    } catch (error) {
      console.error('Pattern lock registration failed:', error)
      return { success: false }
    }
  }

  /**
   * Verify pattern
   */
  static verify(pattern: number[]): boolean {
    try {
      const storedCredential = localStorage.getItem(this.STORAGE_KEY)
      if (!storedCredential) return false

      const credential: PatternLockCredential = JSON.parse(storedCredential)
      
      if (pattern.length !== credential.pattern.length) return false
      
      return pattern.every((point, index) => point === credential.pattern[index])
    } catch (error) {
      console.error('Pattern verification failed:', error)
      return false
    }
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(code: string): boolean {
    try {
      const storedCredential = localStorage.getItem(this.STORAGE_KEY)
      if (!storedCredential) return false

      const credential: PatternLockCredential = JSON.parse(storedCredential)
      return credential.backupCodes.includes(code.toUpperCase())
    } catch (error) {
      console.error('Backup code verification failed:', error)
      return false
    }
  }

  /**
   * Check if pattern lock is registered
   */
  static hasRegistered(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY)
  }

  /**
   * Get backup codes
   */
  static getBackupCodes(): string[] {
    try {
      const storedCredential = localStorage.getItem(this.STORAGE_KEY)
      if (!storedCredential) return []

      const credential: PatternLockCredential = JSON.parse(storedCredential)
      return credential.backupCodes
    } catch {
      return []
    }
  }

  /**
   * Remove pattern lock
   */
  static remove(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  /**
   * Reset pattern using backup code
   */
  static resetWithBackupCode(code: string, newPattern: number[]): boolean {
    try {
      if (!this.verifyBackupCode(code)) return false
      
      const result = this.register(newPattern)
      return result.success
    } catch (error) {
      console.error('Pattern reset failed:', error)
      return false
    }
  }
}

