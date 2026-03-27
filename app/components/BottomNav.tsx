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
    <nav className="bottom-nav bottom-nav-two-items">
      <a href="/" className={`nav-item nav-item-large ${currentPackage === 'free' ? 'active' : ''}`}>
        <Layers size={20} strokeWidth={2} />
        <span>FREE</span>
      </a>
      <a href="/plus" className={`nav-item nav-item-large ${currentPackage === 'plus' ? 'active' : ''}`}>
        <CirclePlus size={20} strokeWidth={2} />
        <span>PLUS</span>
      </a>
    </nav>
  )
}
