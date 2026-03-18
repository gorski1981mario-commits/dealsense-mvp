'use client'

import { useState, useEffect } from 'react'
import { Mail, Lock, Trash2, Bell, Globe, Shield, BarChart3, Settings as SettingsIcon, Fingerprint, Copy, Check, User, MapPin, Home, Phone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { AuthService } from '../_lib/auth'
import { BiometricAuth } from '../_lib/biometric'

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
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  
  useEffect(() => {
    checkBiometric()
  }, [])

  const checkBiometric = async () => {
    const available = await BiometricAuth.isAvailable()
    setBiometricAvailable(available)
    setBiometricEnabled(BiometricAuth.hasRegistered())
    
    const user = AuthService.getCurrentUser()
    if (user?.backupCodes) {
      setBackupCodes(user.backupCodes)
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

  const handleBiometricToggle = async () => {
    if (biometricEnabled) {
      // Disable biometric
      BiometricAuth.remove()
      AuthService.disableBiometric()
      setBiometricEnabled(false)
      setBackupCodes([])
    } else {
      // Enable biometric
      const userId = localStorage.getItem('dealsense_device_id') || 'user_' + Date.now()
      const success = await BiometricAuth.register(userId)
      
      if (success) {
        const result = await AuthService.enableBiometric()
        if (result.success && result.backupCodes) {
          setBiometricEnabled(true)
          setBackupCodes(result.backupCodes)
          setShowBackupCodes(true)
        }
      }
    }
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
                  background: emailNotifications ? '#10b981' : '#E5E7EB',
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
                  background: newDeals ? '#10b981' : '#E5E7EB',
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
                  background: priceDrops ? '#10b981' : '#E5E7EB',
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
                  background: ghostModeAlerts ? '#10b981' : '#E5E7EB',
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
            marginBottom: '12px',
            background: 'transparent'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
              Huidig pakket: <span style={{ color: '#10b981' }}>{packageNames[userPackage]}</span>
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
                    background: '#10b981',
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
            color: '#6B7280',
            letterSpacing: '0.5px',
            marginBottom: '16px',
            textTransform: 'uppercase'
          }}>
            BEVEILIGING
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Biometric Toggle */}
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
                  <Fingerprint size={18} color="#6B7280" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                      Biometrische authenticatie
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {biometricEnabled ? 'Actief' : 'Niet actief'}
                    </div>
                  </div>
                </div>
                {biometricAvailable && (
                  <button
                    onClick={handleBiometricToggle}
                    style={{
                      width: '44px',
                      height: '24px',
                      borderRadius: '12px',
                      background: biometricEnabled ? '#10b981' : '#E5E7EB',
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
                      left: biometricEnabled ? '22px' : '2px',
                      transition: 'left 0.2s'
                    }} />
                  </button>
                )}
              </div>
              {!biometricAvailable && (
                <div style={{
                  padding: '8px 12px',
                  background: '#FEF2F2',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#DC2626'
                }}>
                  Biometrie niet beschikbaar op dit apparaat
                </div>
              )}
              {biometricEnabled && (
                <div style={{
                  padding: '8px 12px',
                  background: '#f0fdf4',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#15803d'
                }}>
                  ✓ Je kunt nu inloggen met vingerafdruk of gezichtsherkenning
                </div>
              )}
            </div>

            {/* Backup Codes */}
            {biometricEnabled && backupCodes.length > 0 && (
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
                      color: '#10b981',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <Mail size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Email</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>user@example.com</div>
              </div>
              <button style={{
                fontSize: '13px',
                color: '#10b981',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <Lock size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Wachtwoord</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>••••••••</div>
              </div>
              <button style={{
                fontSize: '13px',
                color: '#10b981',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <User size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Naam</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>Jan de Vries</div>
              </div>
              <button style={{
                fontSize: '13px',
                color: '#10b981',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <MapPin size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Postcode</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>1234 AB</div>
              </div>
              <button style={{
                fontSize: '13px',
                color: '#10b981',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <Home size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Huisnummer</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>42</div>
              </div>
              <button style={{
                fontSize: '13px',
                color: '#10b981',
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
              border: '1px solid #E5E7EB',
              background: 'transparent'
            }}>
              <Phone size={18} color="#6B7280" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>Telefoon</div>
                <div style={{ fontSize: '13px', color: '#6B7280' }}>+31 6 12345678</div>
              </div>
              <button style={{
                fontSize: '13px',
                color: '#10b981',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}>
                Wijzig
              </button>
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
              color: '#10b981',
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
                      background: echoNotifications ? '#10b981' : '#E5E7EB',
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
                      background: echoUsed >= echoLimit ? '#DC2626' : '#10b981',
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
              </>
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
                    <div style={{ marginBottom: '4px' }}>• Je pakket abonnement (PLUS/PRO/FINANCE)</div>
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
    </div>
  )
}
