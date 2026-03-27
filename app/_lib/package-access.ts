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
  hasReferralCode: boolean // PLUS/PRO/FINANCE get referral codes
  referralDiscount: number // -2% discount for friend + owner
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
    commission: 10, // FREE: 10% commission
    hasReferralCode: false, // FREE users don't get referral codes
    referralDiscount: 0
  },
  plus: {
    hasQRScanner: true,
    hasUnlimitedScans: true,
    hasGhostMode: true,
    ghostModeDays: 1, // PLUS: 24 hours monitoring
    hasConfigurators: false,
    hasProConfigurators: false,
    hasFinanceConfigurators: false,
    hasBillsOptimizer: false,
    commission: 9, // PLUS: 9% commission
    hasReferralCode: true, // PLUS gets referral code PLUS2026
    referralDiscount: 2 // -2% for friend on first month, -2% for owner on renewal
  },
  pro: {
    hasQRScanner: true,
    hasUnlimitedScans: true,
    hasGhostMode: true,
    ghostModeDays: 2, // PRO: 48 hours monitoring
    hasConfigurators: true,
    hasProConfigurators: true,
    hasFinanceConfigurators: false,
    hasBillsOptimizer: false,
    commission: 9, // PRO: 9% commission
    hasReferralCode: true, // PRO gets referral code PRO2026
    referralDiscount: 2 // -2% for friend on first month, -2% for owner on renewal
  },
  finance: {
    hasQRScanner: true,
    hasUnlimitedScans: true,
    hasGhostMode: true,
    ghostModeDays: 7, // FINANCE: 7 days monitoring
    hasConfigurators: true,
    hasProConfigurators: true,
    hasFinanceConfigurators: true,
    hasBillsOptimizer: true,
    commission: 9, // FINANCE: 9% commission
    hasReferralCode: true, // FINANCE gets referral code FINANCE2026
    referralDiscount: 2 // -2% for friend on first month, -2% for owner on renewal
  },
  zakelijk: {
    // ⚠️ ZAKELIJK B2B - OFLAGOWANY (FEATURE_FLAGS.ZAKELIJK_ENABLED = false)
    // €59.99/mnd - B2B Procurement, 10 industries, RFQ
    // DO DOPRACOWANIA - może być najważniejszy pakiet!
    // Gigantyczne przebicia w przemyśle!
    hasQRScanner: true,
    hasUnlimitedScans: true,
    hasGhostMode: true,
    ghostModeDays: 14, // ZAKELIJK: 14 days monitoring
    hasConfigurators: true,
    hasProConfigurators: true,
    hasFinanceConfigurators: true,
    hasBillsOptimizer: true,
    commission: 9, // ZAKELIJK: 9% commission (z referral -2% = 7%)
    hasReferralCode: true, // ZAKELIJK gets referral code B2B2026
    referralDiscount: 2 // -2% for friend on first month, -2% for owner on renewal (9% - 2% = 7%)
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

// Calculate final commission with referral discount
export function calculateFinalCommission(
  userPackage: PackageType,
  hasActiveReferral: boolean = false
): number {
  const access = PACKAGE_ACCESS[userPackage]
  let commission = access.commission
  
  // Apply referral discount if user has active referral code
  if (hasActiveReferral && access.hasReferralCode) {
    commission = Math.max(0, commission - access.referralDiscount)
  }
  
  return commission
}

// Get commission display text (for UI)
export function getCommissionText(
  userPackage: PackageType,
  hasActiveReferral: boolean = false
): string {
  const baseCommission = PACKAGE_ACCESS[userPackage].commission
  const finalCommission = calculateFinalCommission(userPackage, hasActiveReferral)
  
  if (hasActiveReferral && baseCommission !== finalCommission) {
    return `${finalCommission}% (was ${baseCommission}%, -2% referral discount)`
  }
  
  return `${finalCommission}%`
}

