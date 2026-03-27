'use client'

import { useState } from 'react'
import { GhostMode } from '../_lib/ghost-mode'

interface GhostModeButtonProps {
  userId: string
  ean: string
  productName: string
  basePrice: number
  packageType: 'plus' | 'pro' | 'finance'
  hasOffers: boolean // true = znaleźliśmy oferty, false = NIE znaleźliśmy
}

export default function GhostModeButton({
  userId,
  ean,
  productName,
  basePrice,
  packageType,
  hasOffers
}: GhostModeButtonProps) {
  const [activating, setActivating] = useState(false)
  const [activated, setActivated] = useState(false)

  // KLUCZOWA ZASADA: Ghost Mode aktywuje się TYLKO gdy NIE ZNALEŹLIŚMY ofert!
  if (hasOffers) {
    return null // Nie pokazuj przycisku gdy mamy oferty
  }

  const handleActivate = async () => {
    setActivating(true)

    try {
      // Aktywuj Ghost Mode
      await GhostMode.activate(
        userId,
        ean,
        productName,
        basePrice,
        packageType
      )

      // Request notification permission
      await GhostMode.requestNotificationPermission()

      setActivated(true)

      console.log('[Ghost Mode] ✅ Activated!')
    } catch (error) {
      console.error('[Ghost Mode] Failed to activate:', error)
    } finally {
      setActivating(false)
    }
  }

  // Monitoring duration
  const daysMap = { plus: '24 godziny', pro: '48 godzin', finance: '7 dni' }
  const duration = daysMap[packageType]

  if (activated) {
    return (
      <div className="mt-4 p-4 bg-purple-50 border-2 border-purple-300 rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">👻</span>
          <h3 className="font-semibold text-lg text-purple-800">
            Ghost Mode Aktywny!
          </h3>
        </div>
        <p className="text-sm text-purple-700 mb-2">
          Monitorujemy cenę przez {duration}. Dostaniesz powiadomienie gdy znajdziemy produkt taniej!
        </p>
        <div className="flex items-center gap-2 text-xs text-purple-600">
          <span>🔔</span>
          <span>Powiadomienia włączone</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">😔</span>
        <h3 className="font-semibold text-lg text-gray-800">
          Nie znaleźliśmy teraz produktu taniej
        </h3>
      </div>
      <p className="text-sm text-gray-700 mb-3">
        Ale możesz włączyć <strong>Ghost Mode</strong> - będziemy monitorować cenę przez {duration} i powiadomimy Cię gdy znajdziemy taniej!
      </p>
      <button
        onClick={handleActivate}
        disabled={activating}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="text-xl">👻</span>
        {activating ? 'Aktywuję...' : 'Włącz Ghost Mode'}
      </button>
      <p className="text-xs text-gray-500 text-center mt-2">
        To jest kompensacja dla Ciebie - dajemy Ci szansę! 💪
      </p>
    </div>
  )
}


