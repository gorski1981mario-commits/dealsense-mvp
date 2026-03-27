// Shared utility functions for all pages
// Used by: FREE, PLUS, PRO, FINANCE pages

/**
 * Device fingerprint - generates unique ID for session tracking
 * Stores ID in localStorage as 'dealsense_device_id'
 */
export function getDeviceId(): string {
  if (typeof window === 'undefined') return ''
  
  let id = localStorage.getItem('dealsense_device_id')
  if (!id) {
    id = `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem('dealsense_device_id', id)
  }
  return id
}

/**
 * Toast notification helper
 * Shows a temporary message at the bottom of the screen
 */
export function showToast(message: string): void {
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.textContent = message
  document.body.appendChild(toast)
  
  setTimeout(() => toast.classList.add('show'), 100)
  setTimeout(() => {
    toast.classList.remove('show')
    setTimeout(() => document.body.removeChild(toast), 300)
  }, 3000)
}

/**
 * Confetti animation
 * Creates falling confetti effect for celebrations
 */
export function createConfetti(): void {
  const colors = ['#1E7F5C', '#1E7F5C', '#1E7F5C', '#1E7F5C']
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div')
    confetti.className = 'confetti'
    confetti.style.left = Math.random() * 100 + '%'
    confetti.style.top = '-10px'
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)]
    confetti.style.animationDelay = Math.random() * 0.5 + 's'
    document.body.appendChild(confetti)
    
    setTimeout(() => document.body.removeChild(confetti), 3000)
  }
}

