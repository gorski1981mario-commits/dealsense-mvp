// Secure Client-Side Storage for PWA
// Encrypted localStorage with Web Crypto API (2025 Best Practices)

class SecureStorage {
  private static instance: SecureStorage
  private encryptionKey: CryptoKey | null = null

  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage()
    }
    return SecureStorage.instance
  }

  /**
   * Initialize encryption key (call once on app start)
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return

    try {
      // Generate or retrieve encryption key
      const storedKey = localStorage.getItem('_ek')
      
      if (storedKey) {
        // Import existing key
        const keyData = this.base64ToArrayBuffer(storedKey)
        this.encryptionKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        )
      } else {
        // Generate new key
        this.encryptionKey = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        )
        
        // Store key (in production: use more secure method like IndexedDB)
        const exportedKey = await crypto.subtle.exportKey('raw', this.encryptionKey)
        localStorage.setItem('_ek', this.arrayBufferToBase64(exportedKey))
      }
    } catch (error) {
      console.error('SecureStorage initialization failed:', error)
    }
  }

  /**
   * Set encrypted item
   */
  async setItem(key: string, value: any, expirationMinutes?: number): Promise<void> {
    if (!this.encryptionKey) {
      await this.initialize()
    }

    try {
      const data = {
        value,
        timestamp: Date.now(),
        expires: expirationMinutes ? Date.now() + (expirationMinutes * 60 * 1000) : null
      }

      const encrypted = await this.encrypt(JSON.stringify(data))
      localStorage.setItem(`_s_${key}`, encrypted)
    } catch (error) {
      console.error('SecureStorage setItem failed:', error)
    }
  }

  /**
   * Get decrypted item
   */
  async getItem(key: string): Promise<any> {
    if (!this.encryptionKey) {
      await this.initialize()
    }

    try {
      const encrypted = localStorage.getItem(`_s_${key}`)
      if (!encrypted) return null

      const decrypted = await this.decrypt(encrypted)
      const data = JSON.parse(decrypted)

      // Check expiration
      if (data.expires && Date.now() > data.expires) {
        this.removeItem(key)
        return null
      }

      return data.value
    } catch (error) {
      console.error('SecureStorage getItem failed:', error)
      return null
    }
  }

  /**
   * Remove item
   */
  removeItem(key: string): void {
    localStorage.removeItem(`_s_${key}`)
  }

  /**
   * Clear all secure items
   */
  clear(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('_s_')) {
        localStorage.removeItem(key)
      }
    })
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) throw new Error('Encryption key not initialized')

    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)

    // Generate random IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Encrypt
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      dataBuffer
    )

    // Combine IV + encrypted data
    const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encryptedBuffer), iv.length)

    return this.arrayBufferToBase64(combined.buffer)
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) throw new Error('Encryption key not initialized')

    const combined = this.base64ToArrayBuffer(encryptedData)
    
    // Extract IV and encrypted data
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)

    // Decrypt
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      data
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}

export const secureStorage = SecureStorage.getInstance()

/**
 * Helper functions for common use cases
 */
export const SecureStorageHelpers = {
  // Store user session (30 min expiration)
  async setSession(sessionData: any): Promise<void> {
    await secureStorage.setItem('session', sessionData, 30)
  },

  async getSession(): Promise<any> {
    return await secureStorage.getItem('session')
  },

  // Store device ID (no expiration)
  async setDeviceId(deviceId: string): Promise<void> {
    await secureStorage.setItem('device_id', deviceId)
  },

  async getDeviceId(): Promise<string | null> {
    return await secureStorage.getItem('device_id')
  },

  // Store scan history (7 days expiration)
  async setScanHistory(history: any[]): Promise<void> {
    await secureStorage.setItem('scan_history', history, 7 * 24 * 60)
  },

  async getScanHistory(): Promise<any[]> {
    return (await secureStorage.getItem('scan_history')) || []
  },

  // Clear all on logout
  logout(): void {
    secureStorage.clear()
  }
}

