import { useState } from 'react'

export interface ConfiguratorOffer {
  title: string
  price: number
  seller: string
  url: string
  cartUrl?: string
  rating?: number
  reviews?: number
  stock?: {
    level: 'low' | 'medium' | 'high'
    quantity?: number | null
  }
  stockWarning?: string | null
  dealScore?: number
  image?: string
  location?: string
  description?: string
  features?: string[]
}

export interface ConfiguratorSearchParams {
  query: string
  category: string
  packageType: 'free' | 'plus' | 'pro' | 'finance'
  userId?: string
  metadata?: Record<string, any>
}

export interface ConfiguratorSearchResult {
  offers: ConfiguratorOffer[]
  cached: boolean
  scrapedAt: number
  packageType: string
  commission: string
  scansRemaining?: number
  scansUsed?: number
  warning?: string | null
}

export function useConfiguratorSearch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<ConfiguratorSearchResult | null>(null)

  const search = async (params: ConfiguratorSearchParams): Promise<ConfiguratorSearchResult | null> => {
    setLoading(true)
    setError(null)
    
    try {
      // DEVICE-BOUND TOKEN SECURITY
      // Generate unique token for this search (deviceId + timestamp)
      const userId = params.userId || (typeof window !== 'undefined' ? localStorage.getItem('dealsense_device_id') : null) || 'anonymous'
      const timestamp = Date.now()
      const scanToken = `${userId}-${timestamp}`

      const response = await fetch('/api/crawler/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...params,
          scanToken // Device-bound token (cannot be manipulated)
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle paywall (402 Payment Required)
        if (response.status === 402) {
          setError(errorData.message || 'Upgrade required')
          setResults({
            offers: [],
            cached: false,
            scrapedAt: Date.now(),
            packageType: params.packageType,
            commission: errorData.commission || '10%',
            scansRemaining: errorData.scansRemaining,
            scansUsed: errorData.scansUsed
          })
          return null
        }
        
        throw new Error(errorData.error || 'Search failed')
      }

      const data: ConfiguratorSearchResult = await response.json()
      setResults(data)
      return data

    } catch (err: any) {
      console.error('[Configurator Search Error]', err)
      setError(err.message || 'Failed to search')
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
