'use client'

import { useState, useEffect } from 'react'
import { Mail, Lock, Trash2, Bell, Globe, Shield, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const [userPackage, setUserPackage] = useState<'free' | 'plus' | 'pro' | 'finance'>('free')
  const [echoLimit, setEchoLimit] = useState(0)
  const [echoUsed, setEchoUsed] = useState(0)
  const [scansUsed, setScansUsed] = useState(0)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [newDeals, setNewDeals] = useState(true)
  const [priceDrops, setPriceDrops] = useState(false)
  const [echoNotifications, setEchoNotifications] = useState(true)
  const [ghostModeAlerts, setGhostModeAlerts] = useState(true)
  
  useEffect(() => {
    // Load real user data from localStorage
    const pkg = (localStorage.getItem('dealsense_package') || 'free') as 'free' | 'plus' | 'pro' | 'finance'
    setUserPackage(pkg)
    
    // Echo limits
    const limits = { free: 0, plus: 65, pro: 130, finance: 195 }
    setEchoLimit(limits[pkg])
    
    // Echo usage
    const today = new Date().toDateString()
    const usageData = JSON.parse(localStorage.getItem('dealsense_echo_usage') || '{}')
    setEchoUsed(usageData[today] || 0)
    
    // Scans used
    const scans = parseInt(localStorage.getItem('dealsense_scans_used') || '0')
    setScansUsed(scans)
    
    // Load notification preferences
    const notifPrefs = JSON.parse(localStorage.getItem('dealsense_notifications') || '{}')
    setEmailNotifications(notifPrefs.email !== false)
    setNewDeals(notifPrefs.newDeals !== false)
    setPriceDrops(notifPrefs.priceDrops !== false)
    setEchoNotifications(notifPrefs.echo !== false)
    setGhostModeAlerts(notifPrefs.ghostMode !== false)
  }, [])
  
  const saveNotificationPreference = (key: string, value: boolean) => {
    const prefs = JSON.parse(localStorage.getItem('dealsense_notifications') || '{}')
    prefs[key] = value
    localStorage.setItem('dealsense_notifications', JSON.stringify(prefs))
  }
  
  const handleEmailToggle = () => {
    const newValue = !emailNotifications
    setEmailNotifications(newValue)
    saveNotificationPreference('email', newValue)
  }
  
  const handleNewDealsToggle = () => {
    const newValue = !newDeals
    setNewDeals(newValue)
    saveNotificationPreference('newDeals', newValue)
  }
  
  const handlePriceDropsToggle = () => {
    const newValue = !priceDrops
    setPriceDrops(newValue)
    saveNotificationPreference('priceDrops', newValue)
  }
  
  const handleEchoNotificationsToggle = () => {
    const newValue = !echoNotifications
    setEchoNotifications(newValue)
    saveNotificationPreference('echo', newValue)
  }
  
  const handleGhostModeToggle = () => {
    const newValue = !ghostModeAlerts
    setGhostModeAlerts(newValue)
    saveNotificationPreference('ghostMode', newValue)
  }
  
  const packageNames = { free: 'FREE', plus: 'PLUS', pro: 'PRO', finance: 'FINANCE' }
  const packagePrices = { free: '€0', plus: '€19,99/mnd', pro: '€29,99/mnd', finance: '€39,99/mnd' }

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
                onClick={handleEmailToggle}
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
                onClick={handleNewDealsToggle}
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
                onClick={handlePriceDropsToggle}
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
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Ghost Mode alerts</div>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Prijsdalingen voor gemonitorde producten</div>
                </div>
              </div>
              <button
                onClick={handleGhostModeToggle}
                style={{
                  width: '44px',
                  height: '24px',
                  borderRadius: '12px',
                  background: ghostModeAlerts ? '#1E7F5C' : '#E5E7EB',
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
                  left: ghostModeAlerts ? '22px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* PAKIET */}
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
              Huidig pakket: <span style={{ color: '#1E7F5C' }}>{packageNames[userPackage]}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>
              Prijs: {packagePrices[userPackage]}
            </div>
            {userPackage === 'free' && (
              <>
                <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                  Scans: {scansUsed}/3 gebruikt
                </div>
                <button 
                  onClick={() => router.push('/packages')}
                  style={{
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
              </>
            )}
            {userPackage !== 'free' && (
              <div style={{ fontSize: '13px', color: '#6B7280' }}>
                Onbeperkt scannen ✓
              </div>
            )}
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
            {userPackage === 'free' ? (
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #FEE2E2',
                background: '#FEF2F2'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#DC2626', marginBottom: '4px' }}>
                  Echo niet beschikbaar
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                  Upgrade naar PLUS, PRO of FINANCE voor Echo AI assistent
                </div>
              </div>
            ) : (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Echo notificaties</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>Meldingen wanneer Echo antwoordt</div>
                  </div>
                  <button
                    onClick={handleEchoNotificationsToggle}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      background: echoNotifications ? '#1E7F5C' : '#E5E7EB',
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
                      left: echoNotifications ? '22px' : '2px',
                      transition: 'left 0.2s'
                    }} />
                  </button>
                </div>

                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                    Dagelijks limiet
                  </div>
                  <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                    {echoUsed} / {echoLimit} berichten gebruikt vandaag
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#E5E7EB',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${echoLimit > 0 ? (echoUsed / echoLimit) * 100 : 0}%`,
                      height: '100%',
                      background: echoUsed >= echoLimit ? '#DC2626' : '#1E7F5C',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
