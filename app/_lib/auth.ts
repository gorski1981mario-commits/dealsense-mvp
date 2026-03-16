// Modern Authentication System - 2026 Standard
// Email/Password + Magic Link + OAuth + Biometric (optional)

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  packageType: 'free' | 'plus' | 'pro' | 'finance'
  biometricEnabled: boolean
  backupCodes?: string[]
  createdAt: number
  lastLogin: number
}

export interface AuthSession {
  userId: string
  token: string
  expiresAt: number
}

export class AuthService {
  private static SESSION_KEY = 'dealsense_session'
  private static USER_KEY = 'dealsense_user'

  /**
   * Sign up with email/password
   */
  static async signUp(email: string, password: string, name?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Call backend API /api/auth/signup
      // For now, store locally
      const userId = 'user_' + Date.now()
      const user: User = {
        id: userId,
        email,
        name,
        packageType: 'free',
        biometricEnabled: false,
        createdAt: Date.now(),
        lastLogin: Date.now()
      }

      localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      
      // Create session
      const session: AuthSession = {
        userId,
        token: this.generateToken(),
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
      }
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Registratie mislukt' }
    }
  }

  /**
   * Sign in with email/password
   */
  static async signIn(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Call backend API /api/auth/signin
      // For now, check localStorage
      const userStr = localStorage.getItem(this.USER_KEY)
      if (!userStr) {
        return { success: false, error: 'Account niet gevonden' }
      }

      const user: User = JSON.parse(userStr)
      if (user.email !== email) {
        return { success: false, error: 'Onjuist email of wachtwoord' }
      }

      // Update last login
      user.lastLogin = Date.now()
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))

      // Create session
      const session: AuthSession = {
        userId: user.id,
        token: this.generateToken(),
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
      }
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Inloggen mislukt' }
    }
  }

  /**
   * Send magic link to email
   */
  static async sendMagicLink(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Call backend API /api/auth/magic-link
      console.log('Magic link sent to:', email)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Kon geen magic link versturen' }
    }
  }

  /**
   * Sign in with OAuth (Google, GitHub, Apple)
   */
  static async signInWithOAuth(provider: 'google' | 'github' | 'apple'): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Implement OAuth flow
      console.log('OAuth sign in with:', provider)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'OAuth inloggen mislukt' }
    }
  }

  /**
   * Sign out
   */
  static signOut(): void {
    localStorage.removeItem(this.SESSION_KEY)
    // Keep user data for faster re-login
  }

  /**
   * Get current user
   */
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY)
    if (!userStr) return null
    return JSON.parse(userStr)
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const sessionStr = localStorage.getItem(this.SESSION_KEY)
    if (!sessionStr) return false

    const session: AuthSession = JSON.parse(sessionStr)
    return session.expiresAt > Date.now()
  }

  /**
   * Generate backup codes for biometric recovery
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = []
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      codes.push(code)
    }
    return codes
  }

  /**
   * Enable biometric authentication
   */
  static async enableBiometric(): Promise<{ success: boolean; backupCodes?: string[]; error?: string }> {
    try {
      const user = this.getCurrentUser()
      if (!user) return { success: false, error: 'Niet ingelogd' }

      // Generate backup codes
      const backupCodes = this.generateBackupCodes()
      
      // Update user
      user.biometricEnabled = true
      user.backupCodes = backupCodes
      localStorage.setItem(this.USER_KEY, JSON.stringify(user))

      return { success: true, backupCodes }
    } catch (error) {
      return { success: false, error: 'Kon biometrie niet activeren' }
    }
  }

  /**
   * Disable biometric authentication
   */
  static disableBiometric(): void {
    const user = this.getCurrentUser()
    if (!user) return

    user.biometricEnabled = false
    user.backupCodes = undefined
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(code: string): boolean {
    const user = this.getCurrentUser()
    if (!user || !user.backupCodes) return false

    const index = user.backupCodes.indexOf(code.toUpperCase())
    if (index === -1) return false

    // Remove used code
    user.backupCodes.splice(index, 1)
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))

    return true
  }

  /**
   * Send password reset email
   */
  static async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Call backend API /api/auth/reset-password
      console.log('Password reset sent to:', email)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Kon geen reset email versturen' }
    }
  }

  /**
   * Update user package
   */
  static updatePackage(packageType: 'free' | 'plus' | 'pro' | 'finance'): void {
    const user = this.getCurrentUser()
    if (!user) return

    user.packageType = packageType
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  // Helper: Generate random token
  private static generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
}
