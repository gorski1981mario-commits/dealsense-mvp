'use client'

import { useState, useEffect } from 'react'
import { EyeOff } from 'lucide-react'

interface GhostModeProps {
  packageType: 'plus' | 'pro' | 'finance'
  userId: string
}

export default function GhostMode({ packageType, userId }: GhostModeProps) {
  const [isActive, setIsActive] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [monitoredProducts, setMonitoredProducts] = useState<any[]>([])

  // Duration based on package
  const getDuration = () => {
    switch (packageType) {
      case 'plus': return 24 * 60 * 60 // 24 hours
      case 'pro': return 7 * 24 * 60 * 60 // 7 days
      case 'finance': return 30 * 24 * 60 * 60 // 30 days
      default: return 24 * 60 * 60
    }
  }
  
  const getDurationLabel = () => {
    switch (packageType) {
      case 'plus': return '24 uur'
      case 'pro': return '7 dagen'
      case 'finance': return '30 dagen'
      default: return '24 uur'
    }
  }
  
  const duration = getDuration()
  const durationLabel = getDurationLabel()

  useEffect(() => {
    loadGhostModeStatus()
  }, [userId])

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isActive, timeRemaining])

  const loadGhostModeStatus = () => {
    const ghostData = localStorage.getItem(`ghost_mode_${userId}`)
    if (ghostData) {
      const { active, expiresAt, products } = JSON.parse(ghostData)
      const now = Date.now()
      if (active && expiresAt > now) {
        setIsActive(true)
        setTimeRemaining(Math.floor((expiresAt - now) / 1000))
        setMonitoredProducts(products || [])
      }
    }
  }

  const activateGhostMode = () => {
    const expiresAt = Date.now() + (duration * 1000)
    const ghostData = {
      active: true,
      expiresAt,
      products: monitoredProducts,
      packageType
    }
    localStorage.setItem(`ghost_mode_${userId}`, JSON.stringify(ghostData))
    setIsActive(true)
    setTimeRemaining(duration)
  }

  const deactivateGhostMode = () => {
    localStorage.removeItem(`ghost_mode_${userId}`)
    setIsActive(false)
    setTimeRemaining(0)
  }

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    
    if (packageType === 'finance' || packageType === 'pro') {
      // Show days for PRO (7d) and FINANCE (30d)
      if (days > 0) {
        return `${days}d ${hours}u ${mins}m`
      }
      return `${hours}u ${mins}m`
    } else {
      // PLUS: show only hours and minutes
      return `${hours}u ${mins}m`
    }
  }

  return (
    <div style={{
      marginTop: '24px',
      padding: '20px',
      background: isActive 
        ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)'
        : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      borderRadius: '12px',
      border: isActive ? '1px solid #404040' : '1px solid #cbd5e1',
      color: isActive ? 'white' : '#1e1e1e'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <EyeOff 
            size={24} 
            color={isActive ? '#86efac' : '#64748b'}
            strokeWidth={2}
          />
        </div>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '4px' }}>
            Ghost Mode
          </div>
          <div style={{ fontSize: '12px', opacity: 0.8 }}>
            {packageType === 'plus' && 'Automatische prijsbewaking (24u)'}
            {packageType === 'pro' && 'Geavanceerde monitoring (7 dagen)'}
            {packageType === 'finance' && 'Premium monitoring (30 dagen)'}
          </div>
        </div>
      </div>

      {isActive ? (
        <>
          <div style={{
            padding: '16px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '13px', marginBottom: '8px', opacity: 0.9 }}>
              Actief - Tijd over:
            </div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#86efac' }}>
              {formatTime(timeRemaining)}
            </div>
          </div>

          <div style={{ fontSize: '12px', marginBottom: '12px', opacity: 0.8 }}>
            📊 Gemonitorde producten: {monitoredProducts.length}
          </div>

          <button
            onClick={deactivateGhostMode}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Deactiveer Ghost Mode
          </button>
        </>
      ) : (
        <>
          <div style={{ fontSize: '13px', marginBottom: '16px', opacity: 0.8 }}>
            Activeer Ghost Mode om prijzen automatisch te monitoren voor {durationLabel}.
          </div>

          <div style={{
            padding: '12px',
            background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(37,139,82,0.08)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '12px'
          }}>
            <div style={{ marginBottom: '6px' }}>✓ Automatische prijsupdates</div>
            <div style={{ marginBottom: '6px' }}>✓ Notificaties bij prijsdalingen</div>
            <div style={{ marginBottom: '6px' }}>✓ Realtime voorraadstatus</div>
            {packageType === 'finance' && (
              <div>⚡ Premium 30-dagen monitoring</div>
            )}
            {packageType === 'pro' && (
              <div>⭐ Geavanceerde 7-dagen monitoring</div>
            )}
          </div>

          <button
            onClick={activateGhostMode}
            style={{
              width: '100%',
              padding: '12px',
              background: '#15803d',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 6px rgba(21, 128, 61, 0.3)'
            }}
          >
            Activeer Ghost Mode ({durationLabel})
          </button>
        </>
      )}
    </div>
  )
}
