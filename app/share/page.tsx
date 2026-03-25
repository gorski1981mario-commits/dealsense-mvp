'use client'

// PWA Share Target Handler
// Handles shared URLs from browser/apps (e.g., bol.com product page)

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { parseProductUrl } from '../_lib/urlParser'

export default function SharePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    const handleShare = async () => {
      // Get shared data from URL params
      const title = searchParams.get('title')
      const text = searchParams.get('text')
      const url = searchParams.get('url')

      console.log('[PWA Share Target]', { title, text, url })

      // Parse the shared URL
      if (url) {
        const parsed = parseProductUrl(url)
        
        if (parsed && parsed.isValid) {
          // Valid product URL - redirect to scanner with auto-fill
          const params = new URLSearchParams({
            url: url,
            productName: parsed.productName || '',
            price: parsed.price?.toString() || '',
            ean: parsed.ean || '',
            shop: parsed.shop || '',
            autoFill: 'true'
          })
          
          router.push(`/?${params.toString()}`)
        } else {
          // Invalid URL - redirect to scanner with URL in input
          router.push(`/?url=${encodeURIComponent(url)}`)
        }
      } else {
        // No URL - just redirect to scanner
        router.push('/')
      }
    }

    handleShare()
  }, [searchParams, router])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '16px'
        }}>
          🔄
        </div>
        <div style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#15803d',
          marginBottom: '8px'
        }}>
          Product URL verwerken...
        </div>
        <div style={{
          fontSize: '14px',
          color: '#666'
        }}>
          Je wordt doorgestuurd naar de scanner
        </div>
      </div>
    </div>
  )
}
