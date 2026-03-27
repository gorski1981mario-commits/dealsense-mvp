'use client'

import { useState, useEffect } from 'react'
import { Mail, Lock, Trash2, Bell, Globe, Shield, BarChart3, Settings as SettingsIcon, Fingerprint, Copy, Check, User, MapPin, Home, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AuthService } from '../_lib/auth'
import { PatternLock } from '../_lib/pattern-lock'
import PatternLockGrid from '../components/PatternLockGrid'

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
  const [echoAutoConfig, setEchoAutoConfig] = useState(false)
  const [ghostModeAlerts, setGhostModeAlerts] = useState(true)
  const [patternLockEnabled, setPatternLockEnabled] = useState(false)
  const [showPatternSetup, setShowPatternSetup] = useState(false)
  const [patternMode, setPatternMode] = useState<'setup' | 'confirm'>('setup')
  const [setupPattern, setSetupPattern] = useState<number[]>([])
  const [patternError, setPatternError] = useState('')
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  
  // Account fields
  const [accountData, setAccountData] = useState({
    email: 'user@example.com',
    name: 'Jan de Vries',
    postcode: '1234 AB',
    city: 'Amsterdam',
    phone: '+31 6 12345678'
  })
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempValue, setTempValue] = useState('')
  
  useEffect(() => {
    checkPatternLock()
  }, [])

  const checkPatternLock = () => {
    setPatternLockEnabled(PatternLock.hasRegistered())
    if (PatternLock.hasRegistered()) {
      setBackupCodes(PatternLock.getBackupCodes())
    }
  }
  
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

    // Load Echo notifications
    const echoNotifsStored = localStorage.getItem('echo_notifications')
    if (echoNotifsStored) {
      setEchoNotifications(JSON.parse(echoNotifsStored))
    }

    // Load Echo auto-config
    const echoAutoConfigStored = localStorage.getItem('echo_auto_config')
    if (echoAutoConfigStored) {
      setEchoAutoConfig(JSON.parse(echoAutoConfigStored))
    }

    // Load account data
    const accountStored = localStorage.getItem('dealsense_account')
    if (accountStored) {
      setAccountData(JSON.parse(accountStored))
    }
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
    localStorage.setItem('echo_notifications', JSON.stringify(newValue))
  }

  const handleEchoAutoConfigToggle = () => {
    const newValue = !echoAutoConfig
    setEchoAutoConfig(newValue)
    localStorage.setItem('echo_auto_config', JSON.stringify(newValue))
  }
  
  const handleGhostModeToggle = () => {
    const newValue = !ghostModeAlerts
    setGhostModeAlerts(newValue)
    saveNotificationPreference('ghostMode', newValue)
  }

  const handlePatternLockToggle = () => {
    if (patternLockEnabled) {
      PatternLock.remove()
      setPatternLockEnabled(false)
      setBackupCodes([])
    } else {
      setShowPatternSetup(true)
      setPatternMode('setup')
      setSetupPattern([])
      setPatternError('')
    }
  }

  const handlePatternComplete = (pattern: number[]) => {
    if (patternMode === 'setup') {
      setSetupPattern(pattern)
      setPatternMode('confirm')
      setPatternError('Teken hetzelfde patroon om te bevestigen')
    } else if (patternMode === 'confirm') {
      if (pattern.length === setupPattern.length && pattern.every((p, i) => p === setupPattern[i])) {
        const result = PatternLock.register(setupPattern)
        if (result.success && result.backupCodes) {
          setPatternLockEnabled(true)
          setBackupCodes(result.backupCodes)
          setShowPatternSetup(false)
          setShowBackupCodes(true)
          setPatternError('')
        }
      } else {
        setPatternError('Patronen komen niet overeen. Probeer opnieuw.')
        setPatternMode('setup')
        setSetupPattern([])
      }
    }
  }

  const handlePatternClear = () => {
    setPatternError('')
  }

  const copyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const copyAllCodes = () => {
    const allCodes = backupCodes.join('\n')
    navigator.clipboard.writeText(allCodes)
    setCopiedIndex(-1)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleEditField = (field: string) => {
    setEditingField(field)
    setTempValue(accountData[field as keyof typeof accountData])
  }

  const handleSaveField = (field: string) => {
    setAccountData({ ...accountData, [field]: tempValue })
    localStorage.setItem('dealsense_account', JSON.stringify({ ...accountData, [field]: tempValue }))
    setEditingField(null)
    setTempValue('')
  }

  const handleCancelEdit = () => {
    setEditingField(null)
    setTempValue('')
  }
  
  const packageNames = { free: 'FREE', plus: 'PLUS', pro: 'PRO', finance: 'FINANCE' }
  const packagePrices = { free: '€0', plus: '€19,99/mnd', pro: '€29,99/mnd', finance: '€39,99/mnd' }

  return (
    <div style={{
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontSize: '24px',
        fontWeight: 600,
        color: '#111827',
        marginBottom: '24px'
      }}>
        Instellingen
      </h1>

        {/* NOTIFICATIES */}
        <div style={{
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
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
                  background: emailNotifications ? '#15803d' : '#E5E7EB',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
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
                  background: newDeals ? '#15803d' : '#E5E7EB',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
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
                  background: priceDrops ? '#15803d' : '#E5E7EB',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
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
                  background: ghostModeAlerts ? '#15803d' : '#E5E7EB',
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
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
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
            marginBottom: '12px',
            background: 'transparent'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
              Huidig pakket: <span style={{ color: '#15803d' }}>{packageNames[userPackage]}</span>
            </div>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '4px' }}>
              Prijs: {packagePrices[userPackage]}
            </div>
            {userPackage === 'free' && (
              <>
                <div style={{ fontSize: '13px', marginBottom: '12px' }}>
                  <span style={{ color: '#111827' }}>Scans: </span><span style={{ color: '#3b82f6', fontWeight: 600 }}>{scansUsed}/3</span><span style={{ color: '#111827' }}> gebruikt</span>
                </div>
                <button 
                  onClick={() => router.push('/packages')}
                  style={{
                    background: '#15803d',
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

        {/* BEVEILIGING */}
        <div style={{
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            textTransform: 'uppercase'
          }}>
            BEVEILIGING
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Pattern Lock Toggle */}
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Lock size={18} color="#6B7280" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                      Patroonvergrendeling
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {patternLockEnabled ? 'Actief' : 'Niet actief'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePatternLockToggle}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: patternLockEnabled ? '#15803d' : '#E5E7EB',
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
                    left: patternLockEnabled ? '22px' : '2px',
                    transition: 'left 0.2s'
                  }} />
                </button>
              </div>
              {patternLockEnabled && (
                <div style={{
                  padding: '8px 12px',
                  background: '#E6F4EE',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#15803d'
                }}>
                  ✓ Patroonvergrendeling actief
                </div>
              )}
            </div>

            {/* Backup Codes */}
            {patternLockEnabled && backupCodes.length > 0 && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                      Backup codes
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {backupCodes.length} codes beschikbaar
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBackupCodes(!showBackupCodes)}
                    style={{
                      fontSize: '13px',
                      color: '#15803d',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    {showBackupCodes ? 'Verberg' : 'Toon'}
                  </button>
                </div>

                {showBackupCodes && (
                  <>
                    <div style={{
                      padding: '12px',
                      background: '#fef3c7',
                      border: '1px solid #fbbf24',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#92400e',
                      marginBottom: '12px'
                    }}>
                      ⚠️ Elke code kan maar 1x gebruikt worden. Bewaar ze veilig!
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      {backupCodes.map((code, index) => (
                        <div
                          key={index}
                          onClick={() => copyCode(code, index)}
                          style={{
                            padding: '8px',
                            background: '#f9fafb',
                            border: '1px solid #E5E7EB',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            color: '#111827',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <span>{code}</span>
                          {copiedIndex === index ? (
                            <Check size={14} color="#15803d" />
                          ) : (
                            <Copy size={14} color="#6B7280" />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={copyAllCodes}
                      style={{
                        width: '100%',
                        padding: '8px',
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#374151',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      {copiedIndex === -1 ? (
                        <>
                          <Check size={14} color="#15803d" />
                          Gekopieerd!
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Kopieer alle codes
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ACCOUNT */}
        <div style={{
          marginBottom: '16px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#111827',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <Mail size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Email</div>
                {editingField === 'email' ? (
                  <input
                    type="email"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    style={{
                      fontSize: '13px',
                      padding: '4px 8px',
                      border: '1px solid #15803d',
                      borderRadius: '4px',
                      width: '100%',
                      marginTop: '4px'
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{accountData.email}</div>
                )}
              </div>
              {editingField === 'email' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleSaveField('email')} style={{
                    fontSize: '13px',
                    color: '#15803d',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}>
                    Opslaan
                  </button>
                  <button onClick={handleCancelEdit} style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    Annuleren
                  </button>
                </div>
              ) : (
                <button onClick={() => handleEditField('email')} style={{
                  fontSize: '13px',
                  color: '#15803d',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Wijzig
                </button>
              )}
            </div>

            {/* Wachtwoord - special handling for password */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <Lock size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Wachtwoord</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>••••••••</div>
              </div>
              <button onClick={() => alert('Wachtwoord wijzigen via email verificatie (coming soon)')} style={{
                fontSize: '13px',
                color: '#15803d',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                Wijzig
              </button>
            </div>

            {/* Naam */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <User size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Naam</div>
                {editingField === 'name' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    style={{
                      fontSize: '13px',
                      padding: '4px 8px',
                      border: '1px solid #15803d',
                      borderRadius: '4px',
                      width: '100%',
                      marginTop: '4px'
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{accountData.name}</div>
                )}
              </div>
              {editingField === 'name' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleSaveField('name')} style={{
                    fontSize: '13px',
                    color: '#15803d',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}>
                    Opslaan
                  </button>
                  <button onClick={handleCancelEdit} style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    Annuleren
                  </button>
                </div>
              ) : (
                <button onClick={() => handleEditField('name')} style={{
                  fontSize: '13px',
                  color: '#15803d',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Wijzig
                </button>
              )}
            </div>

            {/* Postcode */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <MapPin size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Postcode</div>
                {editingField === 'postcode' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    style={{
                      fontSize: '13px',
                      padding: '4px 8px',
                      border: '1px solid #15803d',
                      borderRadius: '4px',
                      width: '100%',
                      marginTop: '4px'
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{accountData.postcode}</div>
                )}
              </div>
              {editingField === 'postcode' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleSaveField('postcode')} style={{
                    fontSize: '13px',
                    color: '#15803d',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}>
                    Opslaan
                  </button>
                  <button onClick={handleCancelEdit} style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    Annuleren
                  </button>
                </div>
              ) : (
                <button onClick={() => handleEditField('postcode')} style={{
                  fontSize: '13px',
                  color: '#15803d',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Wijzig
                </button>
              )}
            </div>

            {/* City */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <Home size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Stad</div>
                {editingField === 'city' ? (
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    style={{
                      fontSize: '13px',
                      padding: '4px 8px',
                      border: '1px solid #15803d',
                      borderRadius: '4px',
                      width: '100%',
                      marginTop: '4px'
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{accountData.city}</div>
                )}
              </div>
              {editingField === 'city' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleSaveField('city')} style={{
                    fontSize: '13px',
                    color: '#15803d',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}>
                    Opslaan
                  </button>
                  <button onClick={handleCancelEdit} style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    Annuleren
                  </button>
                </div>
              ) : (
                <button onClick={() => handleEditField('city')} style={{
                  fontSize: '13px',
                  color: '#15803d',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Wijzig
                </button>
              )}
            </div>

            {/* Phone */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <Phone size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Telefoon</div>
                {editingField === 'phone' ? (
                  <input
                    type="tel"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    style={{
                      fontSize: '13px',
                      padding: '4px 8px',
                      border: '1px solid #15803d',
                      borderRadius: '4px',
                      width: '100%',
                      marginTop: '4px'
                    }}
                    autoFocus
                  />
                ) : (
                  <div style={{ fontSize: '13px', color: '#6B7280' }}>{accountData.phone}</div>
                )}
              </div>
              {editingField === 'phone' ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleSaveField('phone')} style={{
                    fontSize: '13px',
                    color: '#15803d',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}>
                    Opslaan
                  </button>
                  <button onClick={handleCancelEdit} style={{
                    fontSize: '13px',
                    color: '#6B7280',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer'
                  }}>
                    Annuleren
                  </button>
                </div>
              ) : (
                <button onClick={() => handleEditField('phone')} style={{
                  fontSize: '13px',
                  color: '#15803d',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                  Wijzig
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ECHO */}
        <div>
          <div style={{
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'baseline',
            gap: '2px'
          }}>
            <span style={{
              color: '#15803d',
              fontWeight: 700,
              fontSize: '20px',
              lineHeight: 1
            }}>
              E
            </span>
            <span style={{
              color: '#3b82f6',
              fontWeight: 700,
              fontSize: '17px',
              lineHeight: 1
            }}>
              ch
            </span>
            <span style={{
              color: '#000',
              fontSize: '19px',
              lineHeight: 1,
              position: 'relative',
              top: '-1px'
            }}>
              ●
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {userPackage === 'free' && (
              <div style={{
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #FEE2E2',
                background: '#FEF2F2',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#DC2626', marginBottom: '4px' }}>
                  Echo niet beschikbaar
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>
                  Upgrade naar PLUS voor Echo AI assistent
                </div>
              </div>
            )}
            
            {userPackage !== 'free' ? (
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
                      background: echoNotifications ? '#15803d' : '#E5E7EB',
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
              </>
            ) : null}

            {userPackage !== 'free' && (
              <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: 'transparent'
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
                      background: echoUsed >= echoLimit ? '#DC2626' : '#15803d',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
            )}
          </div>
        </div>

        {/* ACCOUNT VERWIJDEREN - Na sam dół */}
        <div style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '2px solid #FEE2E2'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#DC2626',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            textTransform: 'uppercase'
          }}>
            GEVAARLIJKE ZONE
          </div>

          {/* Collapsed button */}
          {!showDeleteAccount && (
            <button
              onClick={() => setShowDeleteAccount(true)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #FEE2E2',
                background: '#FEF2F2',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Trash2 size={20} color="#DC2626" />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#DC2626' }}>
                  Account permanent verwijderen
                </div>
                <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                  Klik om details te bekijken
                </div>
              </div>
              <div style={{ fontSize: '20px', color: '#DC2626' }}>›</div>
            </button>
          )}

          {/* Expanded content */}
          {showDeleteAccount && (
            <div style={{
              padding: '20px',
              borderRadius: '12px',
              border: '2px solid #FEE2E2',
              background: '#FEF2F2'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                <Trash2 size={24} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#DC2626', marginBottom: '8px' }}>
                    Account permanent verwijderen
                  </div>
                  <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
                    ⚠️ <strong>Let op:</strong> Deze actie kan NIET ongedaan worden gemaakt!
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#6B7280', 
                    lineHeight: '1.6',
                    paddingLeft: '16px',
                    borderLeft: '3px solid #FEE2E2'
                  }}>
                    <div style={{ marginBottom: '6px' }}>
                      <strong>Je verliest permanent:</strong>
                    </div>
                    <div style={{ marginBottom: '4px' }}>• Alle toegang tot je Agent Echo AI assistent</div>
                    <div style={{ marginBottom: '4px' }}>• Al je opgeslagen configuraties en scans</div>
                    <div style={{ marginBottom: '4px' }}>• Je scan geschiedenis en besparingen</div>
                    <div style={{ marginBottom: '4px' }}>• Ghost Mode monitoring en prijsalerts</div>
                    <div style={{ marginBottom: '4px' }}>• Je pakket abonnement (PLUS)</div>
                    <div style={{ marginBottom: '4px' }}>• Alle persoonlijke instellingen en voorkeuren</div>
                    <div style={{ marginBottom: '4px' }}>• Biometrische authenticatie en backup codes</div>
                    <div style={{ marginBottom: '12px' }}>• Referral codes en commissies</div>
                    <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#DC2626' }}>
                      Deze data kan NOOIT meer worden hersteld na verwijdering.
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button 
                  onClick={() => setShowDeleteAccount(false)}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#6B7280',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Annuleren
                </button>
                <button style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'white',
                  background: '#DC2626',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  Verwijder mijn account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pattern Setup Modal */}
        {showPatternSetup && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
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
              maxWidth: '400px',
              width: '100%'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>
                {patternMode === 'setup' ? 'Teken je patroon' : 'Bevestig je patroon'}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
                {patternMode === 'setup' 
                  ? 'Verbind minimaal 4 punten om je patroon te maken'
                  : 'Teken hetzelfde patroon om te bevestigen'}
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <PatternLockGrid
                  onPatternComplete={handlePatternComplete}
                  onPatternClear={handlePatternClear}
                />
              </div>

              {patternError && (
                <div style={{
                  padding: '12px',
                  background: patternMode === 'confirm' && patternError.includes('niet overeen') ? '#FEF2F2' : '#EFF6FF',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: patternMode === 'confirm' && patternError.includes('niet overeen') ? '#DC2626' : '#1e40af',
                  marginBottom: '16px'
                }}>
                  {patternError}
                </div>
              )}

              <button
                onClick={() => {
                  setShowPatternSetup(false)
                  setPatternMode('setup')
                  setSetupPattern([])
                  setPatternError('')
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#E5E7EB',
                  color: '#111827',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Annuleren
              </button>
            </div>
          </div>
        )}

        {/* Backup Codes Modal */}
        {showBackupCodes && backupCodes.length > 0 && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
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
              maxWidth: '400px',
              width: '100%'
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#111827' }}>
                Backup codes
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                Bewaar deze codes veilig. Je hebt ze nodig als je je patroon vergeet.
              </p>

              <div style={{
                background: '#F9FAFB',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                {backupCodes.map((code, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px',
                    marginBottom: index < backupCodes.length - 1 ? '8px' : 0,
                    background: 'white',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                  }}>
                    <span>{code}</span>
                    <button
                      onClick={() => copyCode(code, index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedIndex === index ? '#15803d' : '#6B7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px'
                      }}
                    >
                      {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => copyAllCodes()}
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
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {copiedIndex === -1 ? <Check size={16} /> : <Copy size={16} />}
                {copiedIndex === -1 ? 'Gekopieerd!' : 'Kopieer alle codes'}
              </button>

              <button
                onClick={() => setShowBackupCodes(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#E5E7EB',
                  color: '#111827',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sluiten
              </button>
            </div>
          </div>
        )}
    </div>
  )
}





