'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Laptop, 
  Home,
  Shirt,
  Heart,
  Dumbbell,
  Car,
  Baby,
  Armchair,
  PawPrint,
  Wrench,
  Plane, 
  Shield, 
  Zap,
  Smartphone,
  Wifi,
  Tv,
  Banknote,
  FileText,
  CreditCard,
  Calendar,
  BarChart3,
  ListChecks,
  Mail, 
  Settings,
  ShieldCheck,
  HelpCircle,
  Users,
  Lock
} from 'lucide-react'
import { PackageType, hasConfiguratorAccess } from '../_lib/package-access'
import { getDeviceId } from '../_lib/utils'

interface MenuItem {
  icon: any
  title: string
  path: string
}

// PRODUKTY - Scannen (uproszczone)
const productCategories: MenuItem[] = [
  { icon: Laptop, title: 'Scan producten (alle categorieën)', path: '/' }
]

// DIENSTEN - Vergelijken (info only, no navigation)
// This is now handled as expandable section, not navigation

// FUNCTIES
const otherItems: MenuItem[] = [
  { icon: BarChart3, title: 'Mijn statistieken', path: '/statistics' },
  { icon: Mail, title: 'Contact', path: 'mailto:info@dealsense.nl' },
  { icon: Settings, title: 'Instellingen', path: '/settings' },
  { icon: ShieldCheck, title: 'Veiligheid & Vertrouwen', path: '/veiligheid' },
  { icon: HelpCircle, title: 'Hoe het werkt', path: '/hoe-het-werkt' },
  { icon: Users, title: 'Waarom geen partnerschappen', path: '/waarom-geen-partnerschappen' }
]

// AI ASSISTENT
const aiAssistantItem = {
  title: 'Echo AI Assistent',
  description: 'Stel vragen over producten, garanties en besparingen. Beschikbaar in PLUS, PRO en FINANCE pakketten.',
  features: [
    'Productadvies op maat',
    'Garantie-informatie',
    'Bespaartips',
    'Financieel advies (FINANCE)'
  ]
}

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [userPackage, setUserPackage] = useState<PackageType>('free')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [showDienstenInfo, setShowDienstenInfo] = useState(false)
  const router = useRouter()
  const userId = typeof window !== 'undefined' ? getDeviceId() : 'user_demo'

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPackage = localStorage.getItem(`package_${userId}`) as PackageType
      setUserPackage(savedPackage || 'free')
    }
  }, [userId])

  const handleItemClick = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '8px',
          right: '20px',
          zIndex: 1001,
          background: 'white',
          border: '2px solid #E5E7EB',
          borderRadius: '12px',
          padding: '10px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{
          width: '24px',
          height: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{
            width: '100%',
            height: '3px',
            background: '#111827',
            borderRadius: '2px',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(45deg) translateY(8px)' : 'none'
          }} />
          <div style={{
            width: '100%',
            height: '3px',
            background: '#111827',
            borderRadius: '2px',
            opacity: isOpen ? 0 : 1,
            transition: 'all 0.3s ease'
          }} />
          <div style={{
            width: '100%',
            height: '3px',
            background: '#111827',
            borderRadius: '2px',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(-45deg) translateY(-8px)' : 'none'
          }} />
        </div>
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div
          onClick={() => setShowUpgradePrompt(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1002,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              border: '2px solid #F59E0B'
            }}
          >
            <div style={{
              width: '64px',
              height: '64px',
              background: '#F59E0B',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px'
            }}>
              <Lock size={32} color="white" strokeWidth={2} />
            </div>

            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#92400E', marginBottom: '12px', textAlign: 'center' }}>
              Diensten Configurators
            </h3>

            <p style={{ fontSize: '16px', color: '#78350F', marginBottom: '24px', textAlign: 'center', lineHeight: '1.6' }}>
              Je hebt momenteel het <strong>{userPackage.toUpperCase()}</strong> pakket.
              <br />
              Upgrade naar <strong>PRO</strong> voor toegang tot configurators.
            </p>

            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              textAlign: 'left'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#92400E', marginBottom: '12px' }}>
                PRO pakket - €29.99/maand:
              </div>
              <div style={{ fontSize: '14px', color: '#78350F', marginBottom: '8px' }}>
                ✓ Onbeperkt scans - producten én diensten
              </div>
              <div style={{ fontSize: '14px', color: '#78350F', marginBottom: '8px' }}>
                ✓ Ghost Mode (20 dagen)
              </div>
              <div style={{ fontSize: '14px', color: '#78350F', marginBottom: '8px' }}>
                ✓ 4 Diensten Configurators
              </div>
              <div style={{ fontSize: '14px', color: '#78350F' }}>
                ✓ Slechts 9% commissie
              </div>
            </div>

            <button
              onClick={() => {
                setShowUpgradePrompt(false)
                setIsOpen(false)
                router.push('/pro')
              }}
              style={{
                width: '100%',
                padding: '14px 32px',
                background: '#F59E0B',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 6px rgba(245, 158, 11, 0.3)',
                marginBottom: '12px'
              }}
            >
              Upgrade naar PRO →
            </button>

            <button
              onClick={() => setShowUpgradePrompt(false)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'transparent',
                color: '#92400E',
                border: 'none',
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

      {/* Menu Panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '400px',
        maxWidth: '90vw',
        background: 'white',
        zIndex: 1000,
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease',
        overflowY: 'auto',
        boxShadow: '-4px 0 16px rgba(0,0,0,0.1)'
      }}>
        <div style={{ padding: '60px 24px 48px 24px' }}>
          {/* Menu Title */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '24px'
          }}>
            Menu
          </h2>

          {/* PAKKETTEN Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1E7F5C',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              PAKKETTEN
            </h3>
            <div style={{
              background: '#F7F9F8',
              borderRadius: '12px',
              padding: '16px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Bekijk onze paketten voor meer functies
              </div>
              <button
                onClick={() => handleItemClick('/packages')}
                style={{
                  background: '#1E7F5C',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Bekijk paketten →
              </button>
            </div>
          </div>

          {/* FUNCTIES Section */}
          <div>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1E7F5C',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              FUNCTIES
            </h3>

            {/* PRODUKTY */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#1E7F5C',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                textTransform: 'uppercase'
              }}>
                PRODUCTEN (Scannen)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {productCategories.map((item, idx) => {
                  const IconComponent = item.icon
                  return (
                    <div
                      key={idx}
                      onClick={() => handleItemClick(item.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <IconComponent size={18} color="#111827" strokeWidth={2} />
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                        {item.title}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* DIENSTEN CONFIGURATORS - Expandable Info */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#1E7F5C',
                letterSpacing: '0.5px',
                marginBottom: '12px',
                textTransform: 'uppercase'
              }}>
                DIENSTEN (Vergelijken)
              </div>
              
              {/* Clickable header to expand/collapse */}
              <div
                onClick={() => setShowDienstenInfo(!showDienstenInfo)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: showDienstenInfo ? '#F0FDF4' : 'transparent'
                }}
              >
                <ListChecks size={18} color="#111827" strokeWidth={2} />
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827', flex: 1 }}>
                  Diensten Configurators
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  {showDienstenInfo ? '▼' : '▶'}
                </div>
              </div>

              {/* Expandable content */}
              {showDienstenInfo && (
                <div style={{ 
                  marginTop: '8px', 
                  padding: '12px 16px',
                  background: '#F9FAFB',
                  borderRadius: '8px',
                  fontSize: '13px',
                  lineHeight: '1.6'
                }}>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontWeight: 600, color: '#1E7F5C', marginBottom: '6px' }}>
                      📦 PRO Pakket:
                    </div>
                    <div style={{ color: '#374151', paddingLeft: '12px' }}>
                      • Vakanties<br />
                      • Verzekeringen<br />
                      • Energie<br />
                      • Telecom
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontWeight: 600, color: '#258b52', marginBottom: '6px' }}>
                      💰 FINANCE Pakket:
                    </div>
                    <div style={{ color: '#374151', paddingLeft: '12px' }}>
                      • Alle PRO configurators +<br />
                      • Hypotheek<br />
                      • Leasing<br />
                      • Lening<br />
                      • Creditcard
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* INNE FUNCTIES */}
            <div style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {otherItems.map((item, idx) => {
                  const IconComponent = item.icon
                  return (
                    <div
                      key={idx}
                      onClick={() => handleItemClick(item.path)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <IconComponent size={18} color="#111827" strokeWidth={2} />
                      <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                        {item.title}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* ECHO AI ASSISTENT - Osobna sekcja */}
          <div style={{ marginTop: '32px', paddingTop: '24px', paddingBottom: '32px', borderTop: '1px solid #E5E7EB' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#6B7280',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              AI ASSISTENT
            </h3>
            <div style={{
              padding: '16px',
              paddingBottom: '20px',
              background: 'linear-gradient(135deg, #E6F4EE 0%, #dcfce7 100%)',
              borderRadius: '12px',
              border: '1px solid #86efac'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                  <span style={{ color: '#1E7F5C', fontWeight: 700, fontSize: '20px', lineHeight: 1 }}>E</span>
                  <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}>ch</span>
                  <span style={{ color: '#000', fontSize: '20px', lineHeight: 1, position: 'relative', top: '-2px' }}>●</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>AI Assistent</span>
              </div>
              <div style={{ fontSize: '12px', color: '#374151', marginBottom: '12px', lineHeight: '1.5' }}>
                {aiAssistantItem.description}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                {aiAssistantItem.features.map((feature, idx) => (
                  <div key={idx} style={{ marginBottom: '4px' }}>• {feature}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
