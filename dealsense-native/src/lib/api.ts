// API client for DealSense backend

import { API_BASE_URL } from './constants'
import type { ScanResult } from '../types'

export const api = {
  async searchByEAN(ean: string, sessionId: string): Promise<ScanResult | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/crawler/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ean,
          session_id: sessionId,
          fingerprint: sessionId,
        }),
      })

      if (!response.ok) {
        console.error('API error:', response.status)
        return null
      }

      const data = await response.json()

      if (!data || !data.offers || data.offers.length === 0) {
        return null
      }

      // Transform API response to ScanResult
      return {
        ean,
        productName: data.product_name || 'Product',
        basePrice: data.base_price || 0,
        offers: data.offers.map((offer: any) => ({
          shop: offer.shop || 'Unknown',
          price: offer.price || 0,
          url: offer.url || '',
          shipping: offer.shipping,
          inStock: offer.in_stock !== false,
        })),
        savings: data.savings || 0,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('API error:', error)
      return null
    }
  },
}
