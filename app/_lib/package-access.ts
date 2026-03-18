// Package Access Control
// Determines which features/configurators are available for each package tier

export type PackageType = 'free' | 'plus' | 'pro' | 'finance' | 'zakelijk'

export interface PackageAccess {
  hasQRScanner: boolean
  hasUnlimitedScans: boolean
  hasGhostMode: boolean
  ghostModeDays: number
  hasConfigurators: boolean
  hasProConfigurators: boolean
  hasFinanceConfigurators: boolean
  hasBillsOptimizer: boolean
  commission: number
}

export const PACKAGE_ACCESS: Record<PackageType, PackageAccess> = {
  free: {
    hasQRScanner: true,
    hasUnlimitedScans: false,
    hasGhostMode: false,
    ghostModeDays: 0,
    hasConfigurators: false,
    hasProConfigurators: false,
    hasFinanceConfigurators: false,
    hasBillsOptimizer: false,
    commission: 15
  },
  plus: {
    hasQRScanner: true,
    hasUnlimitedScans: true,
    hasGhostMode: true,
    ghostModeDays: 10,
    hasConfigurators: false,
    hasProConfigurators: false,
    hasFinanceConfigurators: false,
    hasBillsOptimizer: false,
    commission: 12
  },
  pro: {
    hasQRScanner: true,
    hasUnlimitedScans: true,
    hasGhostMode: true,
    ghostModeDays: 20,
    hasConfigurators: true,
    hasProConfigurators: true,
    hasFinanceConfigurators: false,
    hasBillsOptimizer: false,
    commission: 9
  },
  finance: {
    hasQRScanner: true,
    hasUnlimitedScans: true,
    hasGhostMode: true,
    ghostModeDays: 30,
    hasConfigurators: true,
    hasProConfigurators: true,
    hasFinanceConfigurators: true,
    hasBillsOptimizer: true,
    commission: 9
  },
  zakelijk: {
    hasQRScanner: true,
    hasUnlimitedScans: true,
    hasGhostMode: true,
    ghostModeDays: 90,
    hasConfigurators: true,
    hasProConfigurators: true,
    hasFinanceConfigurators: true,
    hasBillsOptimizer: true,
    commission: 5
  }
}

// Check if user has access to a specific configurator
export function hasConfiguratorAccess(
  userPackage: PackageType,
  configuratorType: 'pro' | 'finance'
): boolean {
  const access = PACKAGE_ACCESS[userPackage]
  
  if (configuratorType === 'pro') {
    return access.hasProConfigurators
  }
  
  if (configuratorType === 'finance') {
    return access.hasFinanceConfigurators
  }
  
  return false
}

// Get available configurators for user package
export function getAvailableConfigurators(userPackage: PackageType): ('pro' | 'finance')[] {
  const access = PACKAGE_ACCESS[userPackage]
  const available: ('pro' | 'finance')[] = []
  
  if (access.hasProConfigurators) {
    available.push('pro')
  }
  
  if (access.hasFinanceConfigurators) {
    available.push('finance')
  }
  
  return available
}

// Get upgrade message for locked feature
export function getUpgradeMessage(
  currentPackage: PackageType,
  requiredFeature: 'pro' | 'finance'
): string {
  if (requiredFeature === 'pro') {
    return 'Upgrade naar PRO (€29.99/maand) voor toegang tot diensten configurators'
  }
  
  if (requiredFeature === 'finance') {
    return 'Upgrade naar FINANCE (€39.99/maand) voor toegang tot alle configurators inclusief finance opties'
  }
  
  return 'Upgrade je pakket voor toegang tot deze functie'
}

// Get recommended package for user
export function getRecommendedPackage(currentPackage: PackageType): PackageType | null {
  if (currentPackage === 'free') return 'plus'
  if (currentPackage === 'plus') return 'pro'
  if (currentPackage === 'pro') return 'finance'
  return null
}
