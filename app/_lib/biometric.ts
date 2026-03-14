// Biometric Authentication using Web Authentication API (WebAuthn)
// For PLUS, PRO, FINANCE packages only

export interface BiometricCredential {
  id: string
  publicKey: string
  counter: number
  createdAt: number
}

export class BiometricAuth {
  private static STORAGE_KEY = 'dealsense_biometric_credentials'

  /**
   * Check if biometric authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') return false
    
    // Check if WebAuthn is supported
    if (!window.PublicKeyCredential) return false
    
    // Check if platform authenticator is available (Face ID, Touch ID, Windows Hello)
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
      return available
    } catch {
      return false
    }
  }

  /**
   * Register biometric credential for user
   */
  static async register(userId: string): Promise<boolean> {
    try {
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'DealSense',
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: 'DealSense User'
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false
        },
        timeout: 60000,
        attestation: 'none'
      }

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential

      if (!credential) return false

      // Store credential info
      const credentialData: BiometricCredential = {
        id: credential.id,
        publicKey: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
        counter: 0,
        createdAt: Date.now()
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentialData))
      return true
    } catch (error) {
      console.error('Biometric registration failed:', error)
      return false
    }
  }

  /**
   * Authenticate using biometric
   */
  static async authenticate(): Promise<boolean> {
    try {
      const storedCredential = localStorage.getItem(this.STORAGE_KEY)
      if (!storedCredential) return false

      const credential: BiometricCredential = JSON.parse(storedCredential)
      const challenge = new Uint8Array(32)
      crypto.getRandomValues(challenge)

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: [{
          id: Uint8Array.from(atob(credential.publicKey), c => c.charCodeAt(0)),
          type: 'public-key',
          transports: ['internal']
        }],
        timeout: 60000,
        userVerification: 'required'
      }

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential

      return !!assertion
    } catch (error) {
      console.error('Biometric authentication failed:', error)
      return false
    }
  }

  /**
   * Check if user has registered biometric
   */
  static hasRegistered(): boolean {
    return !!localStorage.getItem(this.STORAGE_KEY)
  }

  /**
   * Remove biometric credential
   */
  static remove(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}
