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
  Lock,
  Package,
  Wallet,
  Star,
  EyeOff
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
  description: 'Jouw persoonlijke assistent voor productadvies.',
  features: [
    'Productadvies op maat',
    'Garantie-informatie',
    'Bespaartips',
    'Realtime antwoorden',
    '24/7 beschikbaar'
  ]
}

// GHOST MODE
const ghostModeItem = {
  title: 'Ghost Mode',
  description: 'Price monitoring - mis nooit meer een deal.',
  features: [
    'Prijsupdates',
    'Notificaties bij prijsdalingen',
    'Realtime voorraadstatus',
    '24h monitoring (PLUS pakket)'
  ]
}

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [userPackage, setUserPackage] = useState<PackageType>('free')
  const [showEchoInfo, setShowEchoInfo] = useState(false)
  const [showGhostModeInfo, setShowGhostModeInfo] = useState(false)
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
    // Reset scroll position to top when navigating
    setTimeout(() => window.scrollTo(0, 0), 100)
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

      {/* Upgrade Prompt Modal - ODPIĘTE (PRO/FINANCE backup) */}

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
        <div style={{ padding: '60px 24px 120px 24px' }}>
          {/* PAKKETTEN Section */}
          <div style={{ marginBottom: '32px' }}>
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
                  background: '#15803d',
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
              color: '#15803d',
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
                color: '#15803d',
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

            {/* DIENSTEN - ODPIĘTE (PRO/FINANCE backup w _BACKUP_PRO_FINANCE) */}

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

          {/* ECHO AI ASSISTENT - Expandable */}
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
            <div 
              onClick={() => setShowEchoInfo(!showEchoInfo)}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span style={{ color: '#15803d', fontWeight: 700, fontSize: '20px', lineHeight: 1 }}>E</span>
                    <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '16px', lineHeight: 1 }}>ch</span>
                    <span style={{ color: '#000', fontSize: '20px', lineHeight: 1, position: 'relative', top: '-2px' }}>●</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>AI Assistent</span>
                </div>
              </div>
              
              {showEchoInfo && (
                <div style={{ marginTop: '8px', paddingLeft: '28px' }}>
                  <div style={{ fontSize: '12px', color: '#111827', marginBottom: '12px', lineHeight: '1.5', fontWeight: 600 }}>
                    {aiAssistantItem.description}
                  </div>
                  <div style={{ fontSize: '11px', color: '#111827', fontWeight: 500 }}>
                    {aiAssistantItem.features.map((feature, idx) => (
                      <div key={idx} style={{ marginBottom: '4px' }}>• {feature}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* GHOST MODE - Expandable */}
          <div style={{ marginTop: '4px' }}>
            <div 
              onClick={() => setShowGhostModeInfo(!showGhostModeInfo)}
              style={{
                padding: '10px 16px',
                background: 'transparent',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <EyeOff size={20} strokeWidth={2} color="#15803d" />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>Ghost Mode</span>
                </div>
              </div>
              
              {showGhostModeInfo && (
                <div style={{ marginTop: '8px', paddingLeft: '28px' }}>
                  <div style={{ fontSize: '12px', color: '#111827', marginBottom: '12px', lineHeight: '1.5', fontWeight: 600 }}>
                    {ghostModeItem.description}
                  </div>
                  <div style={{ fontSize: '11px', color: '#111827', fontWeight: 500 }}>
                    {ghostModeItem.features.map((feature, idx) => (
                      <div key={idx} style={{ marginBottom: '4px' }}>• {feature}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}





