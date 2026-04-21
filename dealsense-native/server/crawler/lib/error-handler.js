// Error Handler - Centralized error handling and logging

const Sentry = require('@sentry/node')

class ErrorHandler {
  static initialized = false

  static init(config) {
    if (config.monitoring.sentry.enabled && !this.initialized) {
      Sentry.init({
        dsn: config.monitoring.sentry.dsn,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: 0.1
      })
      this.initialized = true
      console.log('✓ Sentry error tracking initialized')
    }
  }

  /**
   * Handle error with context
   */
  static handle(error, context = {}) {
    // Log to console
    this.log(error, context.message || 'Error occurred')

    // Send to Sentry if enabled
    if (this.initialized) {
      Sentry.captureException(error, {
        tags: {
          category: context.category,
          domain: context.domain
        },
        extra: context
      })
    }

    // Determine if error is retryable
    return this.isRetryable(error)
  }

  /**
   * Log error to console
   */
  static log(error, message) {
    const timestamp = new Date().toISOString()
    console.error(`[${timestamp}] ${message}:`, error.message)
    
    if (process.env.NODE_ENV === 'development') {
      console.error(error.stack)
    }
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error) {
    const retryableErrors = [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ECONNREFUSED',
      'timeout',
      'network',
      '503',
      '502',
      '504'
    ]

    const errorStr = error.message?.toLowerCase() || ''
    return retryableErrors.some(err => errorStr.includes(err.toLowerCase()))
  }

  /**
   * Create error from HTTP response
   */
  static fromResponse(response) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
    error.status = response.status
    error.response = response
    return error
  }
}

module.exports = { ErrorHandler }
