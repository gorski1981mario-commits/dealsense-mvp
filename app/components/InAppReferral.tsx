'use client'

import { useState } from 'react'
import { Search, Send, Check, X, Users } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  packageType: 'plus' | 'pro' | 'finance'
  deviceId: string
}

interface InAppReferralProps {
  currentUserId: string
  currentUserPackage: 'plus' | 'pro' | 'finance'
  onClose: () => void
}

export default function InAppReferral({ currentUserId, currentUserPackage, onClose }: InAppReferralProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    
    try {
      // IMPORTANT: In production, search Supabase users table
      const response = await fetch('/api/users/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery,
          currentUserId 
        })
      })

      const data = await response.json()
      
      if (data.users) {
        setSearchResults(data.users)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setSearching(false)
    }
  }

  const handleSendReferral = async () => {
    if (!selectedUser) return

    setSending(true)

    try {
      const deviceId = localStorage.getItem('device_id') || 'unknown'
      
      // Generate device-bound token
      const generateResponse = await fetch('/api/referral/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId,
          userPackage: currentUserPackage,
          userId: currentUserId
        })
      })

      const tokenData = await generateResponse.json()

      // Send token to selected user IN-APP
      const sendResponse = await fetch('/api/referral/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: tokenData.tokenId,
          fromUserId: currentUserId,
          toUserId: selectedUser.id,
          toDeviceId: selectedUser.deviceId
        })
      })

      const sendData = await sendResponse.json()

      if (sendData.success) {
        setSent(true)
        setTimeout(() => {
          onClose()
        }, 2000)
      }
    } catch (error) {
      console.error('Send error:', error)
      alert('Fout bij verzenden. Probeer opnieuw.')
    } finally {
      setSending(false)
    }
  }

  const packageNames = {
    plus: 'PLUS',
    pro: 'PRO',
    finance: 'FINANCE'
  }

  const packageColors = {
    plus: '#3B82F6',
    pro: '#8B5CF6',
    finance: '#F59E0B'
  }

  if (sent) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#10B981', marginBottom: '8px' }}>
            Referral verzonden!
          </div>
          <div style={{ fontSize: '14px', color: '#6B7280' }}>
            {selectedUser?.name} ontvangt je referral code
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '500px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              🎁 Deel Referral
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>
              Zoek familie of vrienden in DealSense
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={24} color="#6B7280" />
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search 
                size={18} 
                color="#9CA3AF" 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Zoek: naam, email, telefoon..."
                style={{
                  width: '100%',
                  padding: '12px 12px 12px 40px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              style={{
                padding: '12px 20px',
                background: searching ? '#9CA3AF' : '#1E7F5C',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: (searching || !searchQuery.trim()) ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {searching ? 'Zoeken...' : 'Zoek'}
            </button>
          </div>

          <div style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
            💡 Tip: Zoek op "Tata", "Mama", "Opa", of naam
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
              <Users size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Gevonden gebruikers ({searchResults.length})
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  style={{
                    padding: '12px',
                    border: `2px solid ${selectedUser?.id === user.id ? '#1E7F5C' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedUser?.id === user.id ? '#F0FDF4' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        {user.email}
                      </div>
                    </div>
                    <div style={{
                      padding: '4px 8px',
                      background: packageColors[user.packageType],
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700
                    }}>
                      {packageNames[user.packageType]}
                    </div>
                  </div>
                  {selectedUser?.id === user.id && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#10B981', fontWeight: 600 }}>
                      <Check size={14} style={{ display: 'inline', marginRight: '4px' }} />
                      Geselecteerd
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchResults.length === 0 && searchQuery && !searching && (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6B7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
              Geen gebruikers gevonden
            </div>
            <div style={{ fontSize: '12px' }}>
              Probeer een andere zoekopdracht
            </div>
          </div>
        )}

        {/* Send Button */}
        {selectedUser && (
          <button
            onClick={handleSendReferral}
            disabled={sending}
            style={{
              width: '100%',
              padding: '14px',
              background: sending ? '#9CA3AF' : '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {sending ? (
              'Verzenden...'
            ) : (
              <>
                <Send size={18} />
                Stuur Referral naar {selectedUser.name}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
