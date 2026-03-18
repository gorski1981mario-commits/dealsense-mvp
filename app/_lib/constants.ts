// Shared constants for all pages
// Colors, texts, and icons used across the application

/**
 * Color palette
 * Main green theme colors used throughout the app
 */
export const COLORS = {
  // Primary greens
  primary: '#258b52',
  primaryDark: '#15803d',
  primaryLight: '#166534',
  primaryExtraLight: '#14532d',
  
  // Success/positive
  success: '#258b52',
  successBg: '#f0fdf4',
  successBorder: '#86efac',
  
  // Gradients
  gradientGreenStart: '#f0fdf4',
  gradientGreenEnd: '#dcfce7',
  gradientPrimaryStart: '#258b52',
  gradientPrimaryEnd: '#1e7043',
  
  // Neutral colors
  gray50: '#f8fafc',
  gray100: '#f1f5f9',
  gray200: '#e2e8f0',
  gray300: '#cbd5e1',
  gray400: '#94a3b8',
  gray500: '#64748b',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1e293b',
  gray900: '#0f172a',
  
  // Text colors
  textPrimary: '#1e1e1e',
  textSecondary: '#374151',
  textMuted: '#64748b',
  
  // Status colors
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#2563eb',
  
  // Package badge colors
  packageBadgeBg: 'rgba(37,139,82,0.12)',
  packageBadgeText: '#258b52',
} as const

/**
 * Application texts
 * Shared text content used across pages
 */
export const TEXTS = {
  appName: 'DealSense.nl',
  appNameShort: 'D.nl',
  tagline: 'AI aankoop assistent',
  
  // Package names
  packageFree: 'FREE',
  packagePlus: 'PLUS',
  packagePro: 'PRO',
  packageFinance: 'FINANCE',
  packageZakelijk: 'ZAKELIJK B2B',
  
  // Common actions
  upgradeNow: 'Upgrade nu',
  scanNow: 'Scan nu',
  startCamera: 'Start Camera',
  stopCamera: 'Stop Camera',
  
  // Messages
  scanSuccess: '✓ Vergelijking voltooid!',
  scanError: '❌ Scan mislukt',
  biometricRequired: 'Biometrische verificatie vereist',
  
  // Menu sections
  menuPackages: 'PAKETTEN',
  menuFunctions: 'FUNCTIES',
} as const

/**
 * Package pricing
 */
export const PRICING = {
  free: '€0',
  plus: '€9,99',
  pro: '€19,99',
  finance: '€39,99',
  zakelijk: '€59,99',
} as const

/**
 * Commission rates (on transaction value, not subscription price)
 * FREE: 10% commission on transaction
 * PLUS/PRO/FINANCE: 9% commission on transaction
 * ZAKELIJK B2B: 10% commission on B2B transaction
 */
export const COMMISSION = {
  free: '10%',
  plus: '9%',
  pro: '9%',
  finance: '9%',
  zakelijk: '10%',
} as const

/**
 * Feature limits
 */
export const LIMITS = {
  freeScans: 3,
  freeCategories: 10,
  plusCategories: 10,
  proCategories: 16,
  financeCategories: 21,
} as const

/**
 * Ghost Mode durations (in seconds)
 */
export const GHOST_MODE = {
  plus: 24 * 60 * 60,      // 24 hours
  pro: 24 * 60 * 60,       // 24 hours
  finance: 5 * 60,         // 5 minutes
} as const

/**
 * API endpoints
 */
export const API = {
  backendUrl: process.env.BACKEND_URL || 'https://dealsense-aplikacja.onrender.com',
  scanEndpoint: '/scan',
  agentEchoSavings: '/api/agent-echo/savings',
  agentEchoStock: '/api/agent-echo/stock',
  agentEchoDelivery: '/api/agent-echo/delivery',
  agentEchoWarranty: '/api/agent-echo/warranty',
  agentEchoBenefits: '/api/agent-echo/benefits',
} as const
