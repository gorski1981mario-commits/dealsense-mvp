'use client'

import { useState } from 'react'
import { Mail, Lock, Trash2, Bell, Globe, Shield, BarChart3, Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [newDeals, setNewDeals] = useState(true)
  const [priceDrops, setPriceDrops] = useState(false)
  const [echoVoice, setEchoVoice] = useState(true)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F9F8',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '24px'
        }}>
          Instellingen
        </h1>

        {/* ACCOUNT */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#6B7280',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            textTransform: 'uppercase'
          }}>
            ACCOUNT
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <Mail size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Email</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>user@example.com</div>
              </div>
              <button style={{
                fontSize: '13px',
                color: '#1E7F5C',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                Wijzig
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <Lock size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Wachtwoord</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>••••••••</div>
              </div>
              <button style={{
                fontSize: '13px',
                color: '#1E7F5C',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                Wijzig
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #FEE2E2',
              background: '#FEF2F2'
            }}>
              <Trash2 size={18} color="#DC2626" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#DC2626' }}>Account verwijderen</div>
              </div>
              <button style={{
                fontSize: '13px',
                color: '#DC2626',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                Verwijder
              </button>
            </div>
          </div>
        </div>

        {/* NOTIFICATIES */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#6B7280',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            textTransform: 'uppercase'
          }}>
            NOTIFICATIES
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={18} color="#6B7280" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Email notificaties</div>
                </div>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: emailNotifications ? '#1E7F5C' : '#E5E7EB',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: emailNotifications ? '22px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={18} color="#6B7280" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Nieuwe deals</div>
                </div>
              </div>
              <button
                onClick={() => setNewDeals(!newDeals)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: newDeals ? '#1E7F5C' : '#E5E7EB',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: newDeals ? '22px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={18} color="#6B7280" />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Prijsdalingen</div>
                </div>
              </div>
              <button
                onClick={() => setPriceDrops(!priceDrops)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: priceDrops ? '#1E7F5C' : '#E5E7EB',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: priceDrops ? '22px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* PAKKET */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#6B7280',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            textTransform: 'uppercase'
          }}>
            PAKKET
          </div>

          <div style={{
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #E5E7EB',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
              Huidig pakket: <span style={{ color: '#1E7F5C' }}>FREE</span>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
              Scans: 3/3 gebruikt
            </div>
            <button style={{
              background: '#1E7F5C',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}>
              Upgrade naar PLUS →
            </button>
          </div>
        </div>

        {/* ECHO */}
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#6B7280',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            textTransform: 'uppercase'
          }}>
            ECHO
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Voice ingeschakeld</div>
              </div>
              <button
                onClick={() => setEchoVoice(!echoVoice)}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: echoVoice ? '#1E7F5C' : '#E5E7EB',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'white',
                  position: 'absolute',
                  top: '2px',
                  left: echoVoice ? '22px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>

            <div style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '4px' }}>
                Tokens gebruikt
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                5,234 / 10,000 (FREE)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
