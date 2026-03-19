// Social Media Share - Auto-generated share messages
// KOLEJNOŚĆ: WhatsApp → Facebook → Twitter → LinkedIn
// AUTO-FILL sumy oszczędności
// EMOJI: 💰🎉✨ (NIE 🚀!)

export interface ShareData {
  productName: string
  basePrice: number
  finalPrice: number
  savings: number
  shop: string
}

export class SocialShare {
  /**
   * GENERATE SHARE MESSAGES (2-3 STAŁE PROMPTY DO WYBORU)
   * User wybiera który mu się podoba
   * Auto-fill wszystkich danych
   */
  static generateMessages(data: ShareData): string[] {
    const { productName, savings } = data
    const savingsRounded = savings.toFixed(0)
    
    // 3 STAŁE PROMPTY (user wybiera który chce)
    return [
      // PROMPT 1: Krótki i konkretny
      `🎉 Oszczędziłem €${savingsRounded} na ${productName}!\n\nDzięki @DealSense 💰\n\n#oszczędzanie #dealsense`,
      
      // PROMPT 2: Z pytaniem (engagement)
      `💰 Kupiłem ${productName} i zaoszczędziłem €${savingsRounded}!\n\nA Ty ile przepłacasz? Sprawdź @DealSense ✨\n\n#deals #oszczędzanie`,
      
      // PROMPT 3: Z emocją
      `🤑 €${savingsRounded} mniej za ${productName}!\n\nNie mogę uwierzyć ile można zaoszczędzić z @DealSense! 🎉\n\n#dealsense #smart`
    ]
  }
  
  /**
   * LEGACY: Single message (backward compatibility)
   */
  static generateMessage(data: ShareData): string {
    return this.generateMessages(data)[0] // Default: pierwszy prompt
  }

  /**
   * SHARE TO WHATSAPP
   * Pierwsza opcja (najważniejsza!)
   * messageIndex: 0, 1, lub 2 (user wybiera który prompt)
   */
  static shareToWhatsApp(data: ShareData, messageIndex: number = 0): void {
    const messages = this.generateMessages(data)
    const message = messages[messageIndex] || messages[0]
    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/?text=${encodedMessage}`
    
    window.open(url, '_blank')
    
    console.log('[Social Share] WhatsApp:', message)
  }

  /**
   * SHARE TO FACEBOOK
   * messageIndex: 0, 1, lub 2 (user wybiera który prompt)
   */
  static shareToFacebook(data: ShareData, messageIndex: number = 0): void {
    const messages = this.generateMessages(data)
    const message = messages[messageIndex] || messages[0]
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://dealsense.nl')}&quote=${encodeURIComponent(message)}`
    
    window.open(url, '_blank', 'width=600,height=400')
    
    console.log('[Social Share] Facebook:', message)
  }

  /**
   * SHARE TO TWITTER
   * messageIndex: 0, 1, lub 2 (user wybiera który prompt)
   */
  static shareToTwitter(data: ShareData, messageIndex: number = 0): void {
    const messages = this.generateMessages(data)
    const message = messages[messageIndex] || messages[0]
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent('https://dealsense.nl')}`
    
    window.open(url, '_blank', 'width=600,height=400')
    
    console.log('[Social Share] Twitter:', message)
  }

  /**
   * SHARE TO LINKEDIN
   * messageIndex: 0, 1, lub 2 (user wybiera który prompt)
   */
  static shareToLinkedIn(data: ShareData, messageIndex: number = 0): void {
    const messages = this.generateMessages(data)
    const message = messages[messageIndex] || messages[0]
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://dealsense.nl')}`
    
    window.open(url, '_blank', 'width=600,height=400')
    
    console.log('[Social Share] LinkedIn:', message)
  }

  /**
   * GET SHARE BUTTONS HTML
   * Gotowe przyciski do wklejenia w UI
   * KOLEJNOŚĆ: WhatsApp → Facebook → Twitter → LinkedIn
   * User wybiera 1 z 3 promptów przed share
   */
  static getShareButtonsHTML(data: ShareData): string {
    const savings = data.savings.toFixed(0)
    const messages = this.generateMessages(data)
    
    return `
      <div class="social-share-container" style="margin-top: 16px; padding: 16px; background: #f0fdf4; border-radius: 12px; border: 2px solid #86efac;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <span style="font-size: 24px;">🎉</span>
          <span style="font-weight: 600; font-size: 18px; color: #166534;">Oszczędziłeś €${savings}!</span>
        </div>
        
        <!-- 3 PROMPTY DO WYBORU -->
        <div style="margin-bottom: 12px;">
          <p style="font-size: 14px; color: #166534; margin-bottom: 8px; font-weight: 600;">Wybierz wiadomość:</p>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="display: flex; align-items: start; gap: 8px; padding: 8px; background: white; border-radius: 8px; cursor: pointer; border: 2px solid #d1fae5;">
              <input type="radio" name="shareMessage" value="0" checked style="margin-top: 4px;">
              <span style="font-size: 13px; color: #166534;">${messages[0].replace(/\n/g, '<br>')}</span>
            </label>
            <label style="display: flex; align-items: start; gap: 8px; padding: 8px; background: white; border-radius: 8px; cursor: pointer; border: 2px solid #d1fae5;">
              <input type="radio" name="shareMessage" value="1" style="margin-top: 4px;">
              <span style="font-size: 13px; color: #166534;">${messages[1].replace(/\n/g, '<br>')}</span>
            </label>
            <label style="display: flex; align-items: start; gap: 8px; padding: 8px; background: white; border-radius: 8px; cursor: pointer; border: 2px solid #d1fae5;">
              <input type="radio" name="shareMessage" value="2" style="margin-top: 4px;">
              <span style="font-size: 13px; color: #166534;">${messages[2].replace(/\n/g, '<br>')}</span>
            </label>
          </div>
        </div>
        
        <!-- SOCIAL BUTTONS -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <button 
            onclick="shareToWhatsApp()" 
            style="flex: 1; min-width: 120px; padding: 12px 16px; background: #25D366; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;"
          >
            <span style="font-size: 20px;">📱</span>
            WhatsApp
          </button>
          
          <button 
            onclick="shareToFacebook()" 
            style="flex: 1; min-width: 120px; padding: 12px 16px; background: #1877F2; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;"
          >
            <span style="font-size: 20px;">📘</span>
            Facebook
          </button>
          
          <button 
            onclick="shareToTwitter()" 
            style="flex: 1; min-width: 120px; padding: 12px 16px; background: #1DA1F2; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;"
          >
            <span style="font-size: 20px;">🐦</span>
            Twitter
          </button>
          
          <button 
            onclick="shareToLinkedIn()" 
            style="flex: 1; min-width: 120px; padding: 12px 16px; background: #0A66C2; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;"
          >
            <span style="font-size: 20px;">💼</span>
            LinkedIn
          </button>
        </div>
      </div>
    `
  }

  /**
   * COPY MESSAGE TO CLIPBOARD
   * Fallback jeśli user chce skopiować zamiast share
   */
  static async copyToClipboard(data: ShareData): Promise<boolean> {
    const message = this.generateMessage(data)
    
    try {
      await navigator.clipboard.writeText(message)
      console.log('[Social Share] Copied to clipboard:', message)
      return true
    } catch (error) {
      console.error('[Social Share] Failed to copy:', error)
      return false
    }
  }
}

// Global functions for HTML buttons
if (typeof window !== 'undefined') {
  // Helper: Get selected message index
  const getSelectedMessageIndex = (): number => {
    const selected = document.querySelector('input[name="shareMessage"]:checked') as HTMLInputElement
    return selected ? parseInt(selected.value) : 0
  }
  
  (window as any).shareToWhatsApp = () => {
    const data = (window as any).__shareData
    const messageIndex = getSelectedMessageIndex()
    if (data) SocialShare.shareToWhatsApp(data, messageIndex)
  }
  
  (window as any).shareToFacebook = () => {
    const data = (window as any).__shareData
    const messageIndex = getSelectedMessageIndex()
    if (data) SocialShare.shareToFacebook(data, messageIndex)
  }
  
  (window as any).shareToTwitter = () => {
    const data = (window as any).__shareData
    const messageIndex = getSelectedMessageIndex()
    if (data) SocialShare.shareToTwitter(data, messageIndex)
  }
  
  (window as any).shareToLinkedIn = () => {
    const data = (window as any).__shareData
    const messageIndex = getSelectedMessageIndex()
    if (data) SocialShare.shareToLinkedIn(data, messageIndex)
  }
}
