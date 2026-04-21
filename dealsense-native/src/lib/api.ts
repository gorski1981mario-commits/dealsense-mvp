// API client for DealSense backend

import { API_BASE_URL } from './constants'
import type { ScanResult } from '../types'

export const api = {
  async searchByEAN(ean: string, sessionId: string): Promise<ScanResult | null> {
    try {
      const requestBody = {
        ean,
        product_name: 'Product',
        base_price: 0 // Backend obliczy bazową cenę z ofert
      }

      console.log('🔍 API Request:', {
        url: `${API_BASE_URL}/api/market`,
        body: requestBody,
      })

      const response = await fetch(`${API_BASE_URL}/api/market`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('📡 API Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API error:', response.status, errorData)
        return null
      }

      const data = await response.json()

      console.log('📦 API Response data:', JSON.stringify(data, null, 2))

      // Backend returns different format - check for offers
      if (!data || !data.offers || data.offers.length === 0) {
        console.log('⚠️ No offers found in response')
        return null
      }

      const offers = data.offers || []

      console.log('[API] FULL DATA:', JSON.stringify(data, null, 2))
      console.log('[API] data.base_price:', data.base_price)
      console.log('[API] data.base_price type:', typeof data.base_price)
      console.log('[API] offers[0].price:', offers[0]?.price)

      // Oblicz oszczędność (cena bazowa - najlepsza oferta)
      const bestOffer = offers[0]
      const savings = bestOffer ? data.base_price - bestOffer.price : 0

      console.log('[API] savings:', savings)

      // Oblicz prowizję (10% dla FREE, 9% dla PLUS - ale nie mamy packageType tutaj, więc używamy 10%)
      // TODO: Pobrać packageType z profilu użytkownika
      const commissionRate = 0.10 // 10%
      const commission = savings * commissionRate

      console.log('[API] commission:', commission)

      // Oblicz końcową cenę (cena oferty + prowizja)
      const finalPrice = bestOffer ? bestOffer.price + commission : 0

      // Transform API response to ScanResult
      return {
        ean: data.ean || ean,
        productName: data.product_name || 'Product',
        basePrice: data.base_price || offers[0]?.price || 0,
        offers: offers.map((offer: any) => ({
          shop: offer.seller || offer.shop || 'Unknown',
          price: offer.price || 0,
          url: offer.url || '',
          shipping: offer.shipping || 0,
          inStock: true,
          _source: offer._source || 'api',
        })),
        savings: savings,
        commission: commission,
        finalPrice: finalPrice,
        timestamp: Date.now(),
      }
    } catch (error) {
      console.error('API error:', error)
      return null
    }
  },
}
