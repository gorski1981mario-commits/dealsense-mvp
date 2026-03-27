'use client'

import { useEffect, useState } from 'react'
import { SocialProof, SocialProofData } from '../_lib/social-proof'

interface SocialProofBadgeProps {
  ean: string
}

export default function SocialProofBadge({ ean }: SocialProofBadgeProps) {
  const [proofData, setProofData] = useState<SocialProofData | null>(null)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    // Get social proof data
    const data = SocialProof.getSocialProofData(ean)
    setProofData(data)
    setMessage(SocialProof.getSocialProofMessage(data))

    // Track view
    const userId = localStorage.getItem('dealsense_device_id') || 'anonymous'
    SocialProof.trackView(ean, userId)

    // Update every 30 seconds
    const interval = setInterval(() => {
      const newData = SocialProof.getSocialProofData(ean)
      setProofData(newData)
      setMessage(SocialProof.getSocialProofMessage(newData))
    }, 30000)

    return () => clearInterval(interval)
  }, [ean])

  if (!message) return null

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
        proofData?.trending
          ? 'bg-red-50 text-red-700 border border-red-200'
          : 'bg-green-50 text-green-700 border border-green-200'
      }`}
    >
      {message}
    </div>
  )
}


