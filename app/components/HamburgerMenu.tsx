'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Wallet, 
  Plane, 
  Shield, 
  BarChart3, 
  Mail, 
  Settings,
  ShieldCheck,
  HelpCircle,
  Users,
  Smile
} from 'lucide-react'

interface MenuItem {
  icon: any
  title: string
  path: string
}

const menuItems: MenuItem[] = [
  {
    icon: Wallet,
    title: 'Mijn vaste lasten',
    path: '/vaste-lasten'
  },
  {
    icon: Plane,
    title: 'Vakanties',
    path: '/vacations'
  },
  {
    icon: Shield,
    title: 'Verzekeringen',
    path: '/insurance'
  },
  {
    icon: BarChart3,
    title: 'Mijn statistieken',
    path: '/statistics'
  },
  {
    icon: Mail,
    title: 'Contact',
    path: 'mailto:info@dealsense.nl'
  },
  {
    icon: Settings,
    title: 'Instellingen',
    path: '/settings'
  },
  {
    icon: ShieldCheck,
    title: 'Veiligheid & Vertrouwen',
    path: '/veiligheid'
  },
  {
    icon: HelpCircle,
    title: 'Hoe het werkt',
    path: '/hoe-het-werkt'
  },
  {
    icon: Users,
    title: 'Waarom geen partnerschappen',
    path: '/waarom-geen-partnerschappen'
  }
]

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

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
          top: '20px',
          right: '20px',
          zIndex: 1001,
          background: 'white',
          border: '2px solid #E5E7EB',
          borderRadius: '12px',
          padding: '12px',
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
        <div style={{ padding: '80px 24px 24px 24px' }}>
          {/* Menu Title */}
          <h2 style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#111827',
            marginBottom: '24px'
          }}>
            Menu
          </h2>

          {/* PAKIETY Section */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#6B7280',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              PAKIETY
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
              color: '#6B7280',
              letterSpacing: '0.5px',
              marginBottom: '16px'
            }}>
              FUNCTIES
            </h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              {menuItems.map((item, idx) => {
                const IconComponent = item.icon
                return (
                  <div
                    key={idx}
                    onClick={() => handleItemClick(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#E6F4EE'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <IconComponent size={20} color="#111827" strokeWidth={2} />
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 500,
                      color: '#111827'
                    }}>
                      {item.title}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
