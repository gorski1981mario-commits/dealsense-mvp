import { useState } from 'react'

export interface VacationOffer {
  agency: string
  agencyDisplay: string
  price: number
  pricePerPerson: number
  flight: number
  hotel: number
  url: string
  destination: string
  stars: string
  board: string
  directFlight: boolean
  reviewScore: number
  savings: number
  savingsPercent: number
  isEstimated: boolean
  source: string
}

export interface VacationSearchParams {
  destination: string
  departureAirport: string
  departureDate: string
  duration: number
  adults: number
  children?: number
  stars?: string
  board?: string
  packageType: 'free' | 'plus' | 'pro' | 'finance'
  userId?: string
}

export interface VacationSearchResult {
  success: boolean
  offers: VacationOffer[]
  allOffers?: VacationOffer[]
  basePrice?: number
  referencePrice?: number
  maxSavings?: number
  savingsPercent?: number
  cached: boolean
  timestamp: number
  config?: VacationSearchParams
  error?: string
  message?: string
}

export function useVacationSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<VacationSearchResult | null>(null)

  const search = async (params: VacationSearchParams): Promise<VacationSearchResult | null> => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/vacation/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Search failed')
      }

      const data: VacationSearchResult = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'No results found')
      }
      
      setResults(data)
      return data

    } catch (err: any) {
      console.error('[Vacation Search Error]', err)
      setError(err.message || 'Failed to search vacations')
      return null
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResults(null)
    setError(null)
    setLoading(false)
  }

  return {
    search,
    reset,
    loading,
    error,
    results
  }
}
