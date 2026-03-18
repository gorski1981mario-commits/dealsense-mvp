'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PaywallMessage from '../PaywallMessage'
import { PackageType, hasConfiguratorAccess } from '../../_lib/package-access'
import { getDeviceId } from '../../_lib/utils'
import { checkAccess, FEATURE_FLAGS } from '../../_lib/feature-flags'

interface ConfiguratorGuardProps {
  requiredPackage: 'pro' | 'finance'
  configuratorName: string
  children: React.ReactNode
}

export default function ConfiguratorGuard({ requiredPackage, configuratorName, children }: ConfiguratorGuardProps) {
  const [userPackage, setUserPackage] = useState<PackageType>('free')
  const [isLoading, setIsLoading] = useState(true)
  const userId = typeof window !== 'undefined' ? getDeviceId() : 'user_demo'
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPackage = localStorage.getItem(`package_${userId}`) as PackageType
      setUserPackage(savedPackage || 'free')
      setIsLoading(false)
    }
  }, [userId])

  const userHasAccess = hasConfiguratorAccess(userPackage, requiredPackage)
  const hasAccess = checkAccess(userHasAccess)

  if (isLoading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        fontSize: '16px',
        color: '#6B7280'
      }}>
        Laden...
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
          {configuratorName}
        </h1>
        <PaywallMessage 
          currentPackage={userPackage}
          requiredPackage={requiredPackage}
          featureName={configuratorName}
        />
      </div>
    )
  }

  return <>{children}</>
}



