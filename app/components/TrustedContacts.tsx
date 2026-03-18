'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, X, Check } from 'lucide-react'

interface TrustedContact {
  id: string
  name: string
  relationship: string
  userId?: string
  phoneNumber?: string
}

interface TrustedContactsProps {
  currentUserId: string
  onClose: () => void
}

export default function TrustedContacts({ currentUserId, onClose }: TrustedContactsProps) {
  const [contacts, setContacts] = useState<TrustedContact[]>([])
  const [adding, setAdding] = useState(false)
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phoneNumber: '' })
  const [saving, setSaving] = useState(false)

  const maxContacts = 5

  useEffect(() => {
    loadContacts()
  }, [])

  const loadContacts = async () => {
    try {
      const response = await fetch(`/api/trusted-contacts?userId=${currentUserId}`)
      const data = await response.json()
      if (data.contacts) {
        setContacts(data.contacts)
      }
    } catch (error) {
      console.error('Failed to load contacts:', error)
    }
  }

  const handleAddContact = async () => {
    if (!newContact.name || !newContact.relationship) {
      alert('Naam en relatie zijn verplicht')
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/trusted-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          contact: newContact
        })
      })

      const data = await response.json()

      if (data.success) {
        setContacts([...contacts, { ...newContact, id: data.contactId }])
        setNewContact({ name: '', relationship: '', phoneNumber: '' })
        setAdding(false)
      }
    } catch (error) {
      console.error('Failed to add contact:', error)
      alert('Fout bij toevoegen contact')
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveContact = async (contactId: string) => {
    try {
      await fetch(`/api/trusted-contacts/${contactId}`, {
        method: 'DELETE'
      })
      setContacts(contacts.filter(c => c.id !== contactId))
    } catch (error) {
      console.error('Failed to remove contact:', error)
    }
  }

  const relationshipSuggestions = [
    '👨 Vader', '👩 Moeder', '👴 Opa', '👵 Oma',
    '👨‍👩‍👦 Partner', '💑 Vrouw/Man', '👶 Zoon', '👧 Dochter',
    '👫 Broer', '👭 Zus', '👥 Vriend', '🤝 Collega'
  ]

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
              👥 Vertrouwde Contacten
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280' }}>
              Stel max {maxContacts} personen in voor snelle referral sharing
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

        {/* Info */}
        <div style={{
          padding: '12px',
          background: '#EFF6FF',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '13px',
          color: '#1E40AF',
          lineHeight: '1.5'
        }}>
          💡 <strong>Hoe werkt het?</strong><br />
          Voeg familie/vrienden toe. Wanneer je een referral verstuurt, krijgen zij automatisch een WhatsApp notificatie: "Je hebt een code ontvangen van [Naam]!"
        </div>

        {/* Contacts List */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
            Jouw contacten ({contacts.length}/{maxContacts})
          </div>

          {contacts.length === 0 && (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: '14px'
            }}>
              <Users size={48} style={{ margin: '0 auto 12px' }} color="#D1D5DB" />
              Nog geen contacten toegevoegd
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {contacts.map((contact) => (
              <div
                key={contact.id}
                style={{
                  padding: '12px',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    {contact.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>
                    {contact.relationship}
                    {contact.phoneNumber && ` • ${contact.phoneNumber}`}
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveContact(contact.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#EF4444'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Add Contact */}
        {!adding && contacts.length < maxContacts && (
          <button
            onClick={() => setAdding(true)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Plus size={18} />
            Voeg Contact Toe
          </button>
        )}

        {adding && (
          <div style={{
            padding: '16px',
            background: '#F0FDF4',
            borderRadius: '8px',
            border: '2px solid #10B981'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#065F46', marginBottom: '12px' }}>
              Nieuw Contact
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#047857', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Naam *
              </label>
              <input
                type="text"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                placeholder="bijv. Jan Kowalski"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1FAE5',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#047857', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Relatie *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                {relationshipSuggestions.slice(0, 6).map((rel) => (
                  <button
                    key={rel}
                    onClick={() => setNewContact({ ...newContact, relationship: rel })}
                    style={{
                      padding: '8px',
                      background: newContact.relationship === rel ? '#10B981' : 'white',
                      color: newContact.relationship === rel ? 'white' : '#065F46',
                      border: `1px solid ${newContact.relationship === rel ? '#10B981' : '#D1FAE5'}`,
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {rel}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={newContact.relationship}
                onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                placeholder="Of typ zelf..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1FAE5',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#047857', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Telefoonnummer (voor WhatsApp notificatie)
              </label>
              <input
                type="tel"
                value={newContact.phoneNumber}
                onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                placeholder="+31 6 12345678"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #D1FAE5',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleAddContact}
                disabled={saving || !newContact.name || !newContact.relationship}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: (saving || !newContact.name || !newContact.relationship) ? '#9CA3AF' : '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: (saving || !newContact.name || !newContact.relationship) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {saving ? 'Opslaan...' : (
                  <>
                    <Check size={16} />
                    Opslaan
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setAdding(false)
                  setNewContact({ name: '', relationship: '', phoneNumber: '' })
                }}
                style={{
                  padding: '10px 16px',
                  background: 'white',
                  color: '#6B7280',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Annuleer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
