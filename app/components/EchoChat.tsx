'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Mic, Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function EchoChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [messagesLeft, setMessagesLeft] = useState(10) // FREE: 10 messages
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null)

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

    if (messagesLeft <= 0) {
      alert('⚠️ Je hebt je limiet bereikt (10/10 berichten). Upgrade naar PLUS voor unlimited chat!')
      return
    }

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setMessagesLeft(prev => prev - 1)

    // Simulate AI response (replace with actual OpenAI API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: '🔍 Ik help je graag met het vinden van de beste deals! Waar ben je naar op zoek?'
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
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
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(30, 127, 92, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <MessageCircle size={26} color="white" />
        </button>
      )}

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
            background: 'linear-gradient(135deg, #1E7F5C 0%, #15803d 100%)',
            padding: '14px 16px',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '2px',
                marginBottom: '4px'
              }}>
                <span style={{ color: '#E6F4EE', fontWeight: 700, fontSize: '18px' }}>E</span>
                <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '15px' }}>ch</span>
                <div style={{
                  width: '10px',
                  height: '10px',
                  background: 'white',
                  borderRadius: '50%',
                  marginLeft: '2px'
                }} />
              </div>
              <div style={{ fontSize: '11px', color: '#E6F4EE' }}>
                {messagesLeft}/10 berichten
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
              <X size={18} color="white" />
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
              <div
                key={idx}
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
                  lineHeight: '1.5'
                }}>
                  {msg.content}
                </div>
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
