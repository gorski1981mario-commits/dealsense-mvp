// DealSense Constants - FREE & PLUS packages only

export const PACKAGES = {
  free: {
    name: 'FREE',
    price: 0,
    scansLimit: 3,
    hasGhostMode: false,
    ghostModeDuration: 0,
    commission: 0.10, // 10%
  },
  plus: {
    name: 'PLUS',
    price: 19.99,
    scansLimit: Infinity,
    hasGhostMode: true,
    ghostModeDuration: 24 * 60 * 60, // 24h in seconds
    commission: 0.09, // 9%
  },
} as const

export const API_BASE_URL = 'https://dealsense-aplikacja.onrender.com'

export const COLORS = {
  primary: '#15803d',
  primaryDark: '#166534',
  secondary: '#f59e0b',
  background: '#ffffff',
  surface: '#f9fafb',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  error: '#dc2626',
  success: '#15803d',
  warning: '#f59e0b',
}
