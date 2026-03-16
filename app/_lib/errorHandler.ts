// Global Error Handler for API calls and async operations

export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
}

export interface SuccessResponse<T = any> {
  success: true
  data?: T
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

export class ErrorHandler {
  /**
   * Handle API errors with user-friendly messages
   */
  static handleApiError(error: any): ErrorResponse {
    // Network errors
    if (error.message === 'Failed to fetch' || !navigator.onLine) {
      return {
        success: false,
        error: 'Geen internetverbinding. Controleer je netwerk en probeer opnieuw.',
        code: 'NETWORK_ERROR'
      }
    }

    // Timeout errors
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return {
        success: false,
        error: 'Verzoek duurde te lang. Probeer het opnieuw.',
        code: 'TIMEOUT_ERROR'
      }
    }

    // HTTP errors
    if (error.status) {
      switch (error.status) {
        case 400:
          return {
            success: false,
            error: 'Ongeldige aanvraag. Controleer je invoer.',
            code: 'BAD_REQUEST'
          }
        case 401:
          return {
            success: false,
            error: 'Niet geautoriseerd. Log opnieuw in.',
            code: 'UNAUTHORIZED'
          }
        case 403:
          return {
            success: false,
            error: 'Toegang geweigerd. Je hebt geen toestemming.',
            code: 'FORBIDDEN'
          }
        case 404:
          return {
            success: false,
            error: 'Niet gevonden. De gevraagde bron bestaat niet.',
            code: 'NOT_FOUND'
          }
        case 429:
          return {
            success: false,
            error: 'Te veel verzoeken. Wacht even en probeer opnieuw.',
            code: 'RATE_LIMIT'
          }
        case 500:
          return {
            success: false,
            error: 'Serverfout. Probeer het later opnieuw.',
            code: 'SERVER_ERROR'
          }
        case 503:
          return {
            success: false,
            error: 'Service tijdelijk niet beschikbaar. Probeer het later opnieuw.',
            code: 'SERVICE_UNAVAILABLE'
          }
        default:
          return {
            success: false,
            error: `Er is een fout opgetreden (${error.status}). Probeer het opnieuw.`,
            code: 'HTTP_ERROR',
            details: { status: error.status }
          }
      }
    }

    // Generic errors
    return {
      success: false,
      error: error.message || 'Er is een onbekende fout opgetreden. Probeer het opnieuw.',
      code: 'UNKNOWN_ERROR',
      details: error
    }
  }

  /**
   * Wrap async function with error handling
   */
  static async withErrorHandling<T>(
    fn: () => Promise<T>,
    fallbackError = 'Er is een fout opgetreden'
  ): Promise<ApiResponse<T>> {
    try {
      const data = await fn()
      return { success: true, data }
    } catch (error) {
      const errorResponse = this.handleApiError(error)
      return {
        ...errorResponse,
        error: errorResponse.error || fallbackError
      }
    }
  }

  /**
   * Log error to console (in development) or error tracking service (in production)
   */
  static logError(error: any, context?: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Error${context ? ` - ${context}` : ''}]:`, error)
    } else {
      // TODO: Send to Sentry or other error tracking service
      // Sentry.captureException(error, { tags: { context } })
    }
  }

  /**
   * Show toast notification for error
   */
  static showErrorToast(error: string): void {
    // TODO: Integrate with toast notification system
    console.error('Toast:', error)
  }

  /**
   * Retry failed operation with exponential backoff
   */
  static async retry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000
  ): Promise<T> {
    let lastError: any

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        this.logError(error, `Retry ${i + 1}/${maxRetries}`)
        
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)))
        }
      }
    }

    throw lastError
  }
}

/**
 * Fetch wrapper with error handling and timeout
 */
export async function fetchWithErrorHandling<T = any>(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30000
): Promise<ApiResponse<T>> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      throw { status: response.status, message: response.statusText }
    }

    const data = await response.json()
    return { success: true, data }
  } catch (error) {
    clearTimeout(timeout)
    return ErrorHandler.handleApiError(error)
  }
}
