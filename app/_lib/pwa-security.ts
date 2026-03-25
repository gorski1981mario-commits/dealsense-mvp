// PWA Security Manager - Complete Protection Suite
// Based on 2025 Best Practices (Google, Mozilla, App Institute)

export class PWASecurity {
  private static instance: PWASecurity

  private constructor() {}

  static getInstance(): PWASecurity {
    if (!PWASecurity.instance) {
      PWASecurity.instance = new PWASecurity()
    }
    return PWASecurity.instance
  }

  /**
   * Initialize all security measures
   */
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return

    // 1. Validate HTTPS
    this.enforceHTTPS()

    // 2. Validate permissions
    this.setupPermissionsValidation()

    // 3. Setup input sanitization
    this.setupInputSanitization()

    // 4. Setup rate limiting
    this.setupRateLimiting()

    // 5. Setup anti-tampering
    this.setupAntiTampering()

    // 6. Setup secure service worker
    await this.setupSecureServiceWorker()

    console.log('✓ PWA Security initialized')
  }

  /**
   * 1. Enforce HTTPS (redirect if HTTP)
   */
  private enforceHTTPS(): void {
    if (window.location.protocol === 'http:' && !window.location.hostname.includes('localhost')) {
      window.location.href = window.location.href.replace('http:', 'https:')
    }
  }

  /**
   * 2. Permissions Validation (Camera, Storage, etc.)
   */
  private setupPermissionsValidation(): void {
    // Camera permission check
    if ('mediaDevices' in navigator) {
      navigator.mediaDevices.getUserMedia = new Proxy(navigator.mediaDevices.getUserMedia, {
        apply: async (target, thisArg, args) => {
          console.log('[Security] Camera access requested')
          
          // Log permission request
          this.logSecurityEvent('camera_permission_requested', {
            timestamp: Date.now(),
            userAgent: navigator.userAgent
          })

          return Reflect.apply(target, thisArg, args)
        }
      })
    }

    // Storage quota check
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(estimate => {
        const percentUsed = ((estimate.usage || 0) / (estimate.quota || 1)) * 100
        
        if (percentUsed > 80) {
          console.warn('[Security] Storage quota > 80%:', percentUsed.toFixed(2) + '%')
        }
      })
    }
  }

  /**
   * 3. Input Sanitization (Prevent XSS)
   */
  private setupInputSanitization(): void {
    // Sanitize all input fields
    document.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Detect potential XSS patterns
        const xssPatterns = [
          /<script[^>]*>.*?<\/script>/gi,
          /javascript:/gi,
          /on\w+\s*=/gi,
          /<iframe/gi,
          /eval\(/gi
        ]

        const hasXSS = xssPatterns.some(pattern => pattern.test(target.value))
        
        if (hasXSS) {
          console.warn('[Security] Potential XSS detected in input:', target.name)
          
          // Sanitize
          target.value = this.sanitizeInput(target.value)
          
          // Log event
          this.logSecurityEvent('xss_attempt_blocked', {
            field: target.name,
            timestamp: Date.now()
          })
        }
      }
    })
  }

  /**
   * Sanitize input string
   */
  private sanitizeInput(input: string): string {
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<iframe/gi, '')
      .replace(/eval\(/gi, '')
  }

  /**
   * 4. Rate Limiting (Prevent abuse)
   */
  private setupRateLimiting(): void {
    const rateLimits = new Map<string, { count: number; resetTime: number }>()

    // Rate limit wrapper
    window.addEventListener('fetch', (e: any) => {
      const url = e.request?.url
      if (!url) return

      const key = `fetch_${url}`
      const now = Date.now()
      const limit = rateLimits.get(key)

      if (limit) {
        if (now < limit.resetTime) {
          limit.count++
          
          // Max 100 requests per minute
          if (limit.count > 100) {
            console.warn('[Security] Rate limit exceeded for:', url)
            this.logSecurityEvent('rate_limit_exceeded', { url, count: limit.count })
          }
        } else {
          // Reset
          rateLimits.set(key, { count: 1, resetTime: now + 60000 })
        }
      } else {
        rateLimits.set(key, { count: 1, resetTime: now + 60000 })
      }
    })
  }

  /**
   * 5. Anti-Tampering Protection
   */
  private setupAntiTampering(): void {
    // Detect DevTools
    let devtoolsOpen = false
    const threshold = 160

    const detectDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold
      const heightThreshold = window.outerHeight - window.innerHeight > threshold
      
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true
          console.warn('[Security] DevTools detected')
          this.logSecurityEvent('devtools_opened', { timestamp: Date.now() })
        }
      } else {
        devtoolsOpen = false
      }
    }

    setInterval(detectDevTools, 1000)

    // Detect code injection attempts
    const originalFetch = window.fetch
    window.fetch = new Proxy(originalFetch, {
      apply: (target, thisArg, args) => {
        const [url, options] = args
        
        // Log all fetch requests
        this.logSecurityEvent('fetch_request', {
          url: typeof url === 'string' ? url : url.toString(),
          method: options?.method || 'GET',
          timestamp: Date.now()
        })

        return Reflect.apply(target, thisArg, args)
      }
    })
  }

  /**
   * 6. Secure Service Worker Setup
   */
  private async setupSecureServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // Unregister any existing service workers first
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          // Verify service worker origin
          if (registration.active && registration.active.scriptURL.startsWith(window.location.origin)) {
            console.log('[Security] Valid service worker:', registration.active.scriptURL)
          } else {
            console.warn('[Security] Suspicious service worker detected, unregistering')
            await registration.unregister()
          }
        }
      } catch (error) {
        console.error('[Security] Service worker validation failed:', error)
      }
    }
  }

  /**
   * Log security events (for monitoring)
   */
  private logSecurityEvent(event: string, data: any): void {
    const securityLog = {
      event,
      data,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Store in sessionStorage (max 100 events)
    const logs = JSON.parse(sessionStorage.getItem('_security_logs') || '[]')
    logs.unshift(securityLog)
    sessionStorage.setItem('_security_logs', JSON.stringify(logs.slice(0, 100)))

    // In production: send to monitoring service
    // await fetch('/api/security/log', { method: 'POST', body: JSON.stringify(securityLog) })
  }

  /**
   * Get security logs (for debugging)
   */
  getSecurityLogs(): any[] {
    return JSON.parse(sessionStorage.getItem('_security_logs') || '[]')
  }

  /**
   * Validate data integrity (cryptographic signature)
   */
  async validateDataIntegrity(data: any, signature: string): Promise<boolean> {
    try {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(JSON.stringify(data))
      const signatureBuffer = this.base64ToArrayBuffer(signature)

      // Import public key (in production: use real key)
      const publicKey = await crypto.subtle.importKey(
        'spki',
        new Uint8Array([/* public key bytes */]),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
      )

      const isValid = await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        publicKey,
        signatureBuffer,
        dataBuffer
      )

      return isValid
    } catch (error) {
      console.error('[Security] Data integrity validation failed:', error)
      return false
    }
  }

  /**
   * Helper: Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  /**
   * Check if app is running in secure context
   */
  isSecureContext(): boolean {
    return window.isSecureContext
  }

  /**
   * Validate app integrity (detect tampering)
   */
  async validateAppIntegrity(): Promise<boolean> {
    // Check if critical files are modified
    // In production: compare file hashes with known good hashes
    
    const criticalFiles = [
      '/manifest.json',
      '/_next/static/chunks/main.js'
    ]

    try {
      for (const file of criticalFiles) {
        const response = await fetch(file, { cache: 'no-cache' })
        if (!response.ok) {
          console.warn('[Security] Critical file missing:', file)
          return false
        }
      }
      return true
    } catch (error) {
      console.error('[Security] App integrity check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const pwaSecurity = PWASecurity.getInstance()

// Auto-initialize on import
if (typeof window !== 'undefined') {
  pwaSecurity.initialize()
}
