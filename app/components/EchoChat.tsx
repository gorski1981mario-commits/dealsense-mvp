'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Mic, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[] // Quick reply suggestions
}

interface ConversationContext {
  mode: 'idle' | 'onboarding' | 'configurator' // What Echo is doing
  configuratorType?: 'insurance' | 'vacation' | 'energy' | 'telecom' | 'subscriptions'
  collectedData: Record<string, any> // Data collected from conversation
  currentStep: number // Which question we're on
}

export default function EchoChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [messagesLeft, setMessagesLeft] = useState(0)
  const [dailyLimit, setDailyLimit] = useState(0)
  const [userPackage, setUserPackage] = useState<'free' | 'plus' | 'pro' | 'finance'>('free')
  const [isLoading, setIsLoading] = useState(false)
  const [context, setContext] = useState<ConversationContext>({
    mode: 'idle',
    collectedData: {},
    currentStep: 0
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Detect user package and set daily limits
  useEffect(() => {
    const pkg = (localStorage.getItem('dealsense_package') || 'free') as 'free' | 'plus' | 'pro' | 'finance'
    setUserPackage(pkg)
    
    // Daily limits based on package (reduced by 35%)
    const limits = {
      free: 0,      // No Echo for FREE without subscription
      plus: 65,     // €0.72/month cost
      pro: 130,     // €1.43/month cost
      finance: 195  // €2.15/month cost
    }
    
    const limit = limits[pkg]
    setDailyLimit(limit)
    
    // Check daily usage from localStorage
    const today = new Date().toDateString()
    const stored = localStorage.getItem('dealsense_echo_usage')
    
    if (stored) {
      const { date, count } = JSON.parse(stored)
      if (date === today) {
        setMessagesLeft(Math.max(0, limit - count))
      } else {
        // New day - reset counter
        localStorage.setItem('dealsense_echo_usage', JSON.stringify({ date: today, count: 0 }))
        setMessagesLeft(limit)
      }
    } else {
      localStorage.setItem('dealsense_echo_usage', JSON.stringify({ date: today, count: 0 }))
      setMessagesLeft(limit)
    }
  }, [])
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Inactivity timeout (5 minutes)
  useEffect(() => {
    if (isOpen && messages.length > 0) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
      
      inactivityTimerRef.current = setTimeout(() => {
        setMessages([])
        setIsOpen(false)
      }, 300000) // 5 minutes
    }

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current)
      }
    }
  }, [isOpen, messages])

  const handleSend = async () => {
    if (!input.trim()) return

    if (userPackage === 'free') {
      alert('⚠️ Agent Echo is alleen beschikbaar voor PLUS, PRO en FINANCE abonnees. Upgrade om Echo te gebruiken!')
      return
    }

    if (messagesLeft <= 0) {
      alert(`⚠️ Je hebt je dagelijkse limiet bereikt (${dailyLimit}/${dailyLimit} berichten). Probeer morgen opnieuw!`)
      return
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setMessagesLeft(prev => prev - 1)
    
    // Update daily usage counter
    const today = new Date().toDateString()
    const stored = localStorage.getItem('dealsense_echo_usage')
    if (stored) {
      const { count } = JSON.parse(stored)
      localStorage.setItem('dealsense_echo_usage', JSON.stringify({ date: today, count: count + 1 }))
    }

    // Process user input and generate intelligent response
    const response = await processUserInput(input.toLowerCase(), context)
    
    setTimeout(() => {
      setMessages(prev => [...prev, response])
      setIsLoading(false)
    }, 800)
  }

  // Intelligent conversation processing
  const processUserInput = async (userInput: string, ctx: ConversationContext): Promise<Message> => {
    // Detect intent
    const intents = {
      insurance: /ubezpieczeni|verzekering|auto|motor|zorg|woon|leven|reis|aansprakelijk/i,
      vacation: /wakacje|vakantie|hotel|vlucht|reis naar|urlaub/i,
      energy: /energia|energie|stroom|gas|elektriciteit/i,
      telecom: /internet|telefon|mobiel|tv|ziggo|kpn/i,
      subscriptions: /abonnement|netflix|spotify|disney/i,
      optimize: /oszczędz|bespaar|goedkoper|optimaliseer|verbeteren/i
    }

    // PRO/FINANCE: Start configurator conversation
    if (userPackage === 'pro' || userPackage === 'finance') {
      // Detect which configurator user wants
      if (intents.vacation.test(userInput) && ctx.mode === 'idle') {
        setContext({ mode: 'configurator', configuratorType: 'vacation', collectedData: {}, currentStep: 0 })
        return {
          role: 'assistant',
          content: '✈️ Super! Ik help je met het vinden van de perfecte vakantie.\n\nWaar wil je naartoe? (bijv. Spanje, Italië, Thailand)',
          suggestions: ['🇪🇸 Spanje', '🇮🇹 Italië', '🇹🇭 Thailand', '🇬🇷 Griekenland']
        }
      }

      if (intents.insurance.test(userInput) && ctx.mode === 'idle') {
        setContext({ mode: 'configurator', configuratorType: 'insurance', collectedData: {}, currentStep: 0 })
        return {
          role: 'assistant',
          content: '🛡️ Ik help je met verzekeringen! Welke verzekering zoek je?',
          suggestions: ['🚗 Auto', '🏠 Woon', '❤️ Zorg', '✈️ Reis']
        }
      }

      // Continue conversation flow
      if (ctx.mode === 'configurator' && ctx.configuratorType === 'vacation') {
        return handleVacationFlow(userInput, ctx)
      }

      if (ctx.mode === 'configurator' && ctx.configuratorType === 'insurance') {
        return handleInsuranceFlow(userInput, ctx)
      }
    }

    // PLUS: Show potential savings, suggest upgrade
    if (userPackage === 'plus') {
      if (intents.optimize.test(userInput)) {
        return {
          role: 'assistant',
          content: '� Ik kan je helpen besparen! Maar om automatisch configuraties in te vullen, heb je PRO of FINANCE nodig.\n\nUpgrade naar PRO voor:\n✨ Auto-fill configuraties\n📊 Persoonlijke analyse\n🎯 Beste deals\n\nWil je upgraden?',
          suggestions: ['Upgrade naar PRO', 'Vertel meer', 'Nee, bedankt']
        }
      }
    }

    // Default helpful response
    return {
      role: 'assistant',
      content: '👋 Ik ben Echo, je persoonlijke AI assistent!\n\nIk kan je helpen met:\n🛡️ Verzekeringen\n✈️ Vakanties\n⚡ Energie\n📱 Internet & TV\n\nWaar kan ik je mee helpen?',
      suggestions: ['Verzekeringen', 'Vakanties', 'Energie besparen']
    }
  }

  // Vacation configurator conversation flow
  const handleVacationFlow = (userInput: string, ctx: ConversationContext): Message => {
    const step = ctx.currentStep
    
    if (step === 0) {
      // Collect destination
      setContext({...ctx, collectedData: {...ctx.collectedData, destination: userInput}, currentStep: 1})
      return {
        role: 'assistant',
        content: `Geweldig! ${userInput} is een mooie keuze 🌴\n\nWanneer wil je vertrekken?`,
        suggestions: ['Deze zomer', 'Volgende maand', 'December 2026']
      }
    }

    if (step === 1) {
      // Collect dates
      setContext({...ctx, collectedData: {...ctx.collectedData, dates: userInput}, currentStep: 2})
      return {
        role: 'assistant',
        content: 'Perfect! Hoeveel personen gaan er mee?',
        suggestions: ['1 persoon', '2 personen', '4 personen (gezin)']
      }
    }

    if (step === 2) {
      // Collect travelers
      setContext({...ctx, collectedData: {...ctx.collectedData, travelers: userInput}, currentStep: 3})
      return {
        role: 'assistant',
        content: 'Top! Wat is belangrijker voor je?',
        suggestions: ['🏷️ Goedkoopste', '⚖️ Prijs + Kwaliteit', '⭐ Beste kwaliteit']
      }
    }

    if (step === 3) {
      // Collect filter preference (not budget!)
      const filterMap: Record<string, string> = {
        '🏷️ Goedkoopste': 'cheapest',
        '⚖️ Prijs + Kwaliteit': 'balanced',
        '⭐ Beste kwaliteit': 'quality'
      }
      const filter = filterMap[userInput] || 'balanced'
      setContext({...ctx, collectedData: {...ctx.collectedData, filterType: filter}, currentStep: 4})
      
      return {
        role: 'assistant',
        content: `✅ Perfect! Ik heb alle info:\n\n📍 ${ctx.collectedData.destination}\n📅 ${ctx.collectedData.dates}\n👥 ${ctx.collectedData.travelers}\n🎯 ${userInput}\n\nIk doorzoek nu de markt met Ranking 4.0 (AI + kwant)...\n\n⏳ Analyseer 50% e-commerce giganten + 50% niszowe biura...`,
        suggestions: ['Bekijk TOP 3 deals', 'Wijzig gegevens']
      }
    }

    return { role: 'assistant', content: 'Ik begrijp je niet helemaal. Kun je het anders formuleren?' }
  }

  // Insurance configurator conversation flow
  const handleInsuranceFlow = (userInput: string, ctx: ConversationContext): Message => {
    // Similar flow for insurance
    return { role: 'assistant', content: '🛡️ Insurance flow coming soon...' }
  }

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice input niet ondersteund in deze browser')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'nl-NL'
    recognition.continuous = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }

    recognition.start()
  }

  return (
    <>
      {/* Floating Button - Echo Branding */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E7F5C 0%, #3b82f6 40%, #111827 70%, #E6F4EE 100%)',
            border: '3px solid white',
            boxShadow: '0 4px 16px rgba(30, 127, 92, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            transition: 'all 0.15s ease',
            animation: 'echo-pulse 2s ease-in-out infinite'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 4px 24px rgba(30, 127, 92, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(30, 127, 92, 0.3)'
          }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            background: '#1E7F5C',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageCircle size={20} color="white" strokeWidth={2.5} />
          </div>
        </button>
      )}
      
      <style jsx>{`
        @keyframes echo-pulse {
          0%, 100% {
            box-shadow: 0 4px 16px rgba(30, 127, 92, 0.3);
          }
          50% {
            box-shadow: 0 4px 24px rgba(30, 127, 92, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
          }
        }
      `}</style>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '340px',
          maxWidth: '90vw',
          height: '480px',
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          border: '1px solid #E5E7EB'
        }}>
          {/* Header */}
          <div style={{
            background: '#E6F4EE',
            padding: '14px 16px',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #1E7F5C'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '2px',
                marginBottom: '4px'
              }}>
                <span style={{ color: '#1E7F5C', fontWeight: 700, fontSize: '18px' }}>E</span>
                <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '15px' }}>ch</span>
                <div style={{
                  width: '10px',
                  height: '10px',
                  background: '#111827',
                  borderRadius: '50%',
                  marginLeft: '2px'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                {messagesLeft}/{dailyLimit} berichten vandaag
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <X size={18} color="#111827" />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#6B7280',
                fontSize: '14px',
                marginTop: '40px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>👋</div>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Hallo! Ik ben Echo</div>
                <div>Jouw persoonlijke AI agent voor deals</div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: msg.role === 'user' ? '#1E7F5C' : '#F3F4F6',
                    color: msg.role === 'user' ? 'white' : '#111827',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.content}
                  </div>
                </div>
                
                {/* Quick reply suggestions */}
                {msg.role === 'assistant' && msg.suggestions && idx === messages.length - 1 && (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '6px',
                    marginTop: '8px',
                    marginLeft: '8px'
                  }}>
                    {msg.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setInput(suggestion)
                          setTimeout(() => handleSend(), 100)
                        }}
                        style={{
                          padding: '6px 12px',
                          background: 'white',
                          border: '1px solid #1E7F5C',
                          borderRadius: '16px',
                          fontSize: '12px',
                          color: '#1E7F5C',
                          cursor: 'pointer',
                          fontWeight: 500
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: '#F3F4F6',
                  fontSize: '14px'
                }}>
                  <span>●</span>
                  <span style={{ animation: 'pulse 1s infinite' }}>●</span>
                  <span>●</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px',
            borderTop: '1px solid #E5E7EB'
          }}>
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              <button
                onClick={handleVoiceInput}
                disabled={isListening}
                style={{
                  background: isListening ? '#1E7F5C' : 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Mic size={18} color={isListening ? 'white' : '#6B7280'} />
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type een bericht..."
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />

              <button
                onClick={handleSend}
                disabled={!input.trim()}
                style={{
                  background: input.trim() ? '#1E7F5C' : '#E5E7EB',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Send size={18} color="white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
