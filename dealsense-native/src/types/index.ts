// Core types for DealSense Native

export type PackageType = 'free' | 'plus'

export interface ScanResult {
  ean: string
  productName: string
  basePrice: number
  offers: Offer[]
  savings: number
  timestamp: number
}

export interface Offer {
  shop: string
  price: number
  url: string
  shipping?: number
  inStock: boolean
}

export interface UserProfile {
  userId: string
  deviceId: string
  packageType: PackageType
  scansUsed: number
  scansRemaining: number
  createdAt: number
}

export interface ScanRecord {
  id: string
  userId: string
  ean: string
  productName: string
  savings: number
  timestamp: number
}
