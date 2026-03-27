/**
 * Commission Helper
 * 
 * Gedeelde logica voor commissie berekening voor alle pakketten
 * Elimineert ~40 regels gedupliceerde code
 */

import { COMMISSION } from '../constants'
import { PackageType } from '../package-access'

interface CommissionResult {
  rate: number        // Percentage (bijv. 10 voor 10%)
  rateDecimal: number // Decimaal (bijv. 0.1 voor 10%)
  amount: number      // Commissie bedrag
}

/**
 * Calculate commission for given amount and package type
 * 
 * @param amount - Base amount (savings, transaction value)
 * @param packageType - User's package (free, plus, pro, finance, zakelijk)
 * @returns Commission details (rate, amount)
 */
export function calculateCommission(
  amount: number,
  packageType: PackageType
): CommissionResult {
  // Get commission rate from constants (only FREE and PLUS active)
  // PRO/FINANCE/ZAKELIJK are on shelf, use default 9%
  const rateStr = (COMMISSION as any)[packageType] || '9%'
  const rate = parseFloat(rateStr.replace('%', ''))
  const rateDecimal = rate / 100
  
  return {
    rate,
    rateDecimal,
    amount: amount * rateDecimal
  }
}

/**
 * Calculate net savings after commission
 * 
 * @param savings - Gross savings
 * @param packageType - User's package
 * @param hasReferralCode - Whether user has referral code (-2% discount)
 * @returns Net savings after commission
 */
export function calculateNetSavings(
  savings: number,
  packageType: PackageType,
  hasReferralCode: boolean = false
): number {
  const { rateDecimal } = calculateCommission(savings, packageType)
  
  // Base: savings - commission
  let netSavings = savings * (1 - rateDecimal)
  
  // Referral code: +2% discount
  if (hasReferralCode) {
    netSavings = savings * (1 - rateDecimal + 0.02)
  }
  
  return netSavings
}

/**
 * Format commission for display
 * 
 * @param packageType - User's package
 * @returns Formatted commission string (e.g., "10%")
 */
export function formatCommission(packageType: PackageType): string {
  return (COMMISSION as any)[packageType] || '9%'
}
