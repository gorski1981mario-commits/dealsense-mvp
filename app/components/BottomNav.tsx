'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Layers, CirclePlus, Star } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()
  const [currentPackage, setCurrentPackage] = useState<string>('free')

  useEffect(() => {
    if (pathname === '/') {
      setCurrentPackage('free')
    } else if (pathname === '/plus') {
      setCurrentPackage('plus')
    }
    // PRO/FINANCE ODPIĘTE - backup w _BACKUP_PRO_FINANCE
    // else if (pathname === '/pro') {
    //   setCurrentPackage('pro')
    // } else if (pathname === '/finance') {
    //   setCurrentPackage('finance')
    // }
  }, [pathname])

  return (
    <nav className="bottom-nav">
      <a href="/" className={`nav-item ${currentPackage === 'free' ? 'active' : ''}`}>
        <Layers size={20} strokeWidth={2} />
        <span>FREE</span>
      </a>
      <a href="/plus" className={`nav-item ${currentPackage === 'plus' ? 'active' : ''}`}>
        <CirclePlus size={20} strokeWidth={2} />
        <span>PLUS</span>
      </a>
      {/* PRO/FINANCE ODPIĘTE - backup w _BACKUP_PRO_FINANCE */}
      {/* <a href="/pro" className={`nav-item ${currentPackage === 'pro' ? 'active' : ''}`}>
        <Star size={20} strokeWidth={2} />
        <span>PRO</span>
      </a>
      <a href="/finance" className={`nav-item ${currentPackage === 'finance' ? 'active' : ''}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"/>
          <path d="m19 9-5 5-4-4-3 3"/>
        </svg>
        <span>FINANCE</span>
      </a> */}
    </nav>
  )
}
