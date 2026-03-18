'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '../_lib/auth'
import { Mail, Lock, ArrowRight, Github } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signin' | 'signup' | 'magic' | 'forgot'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [postcode, setPostcode] = useState('')
  const [huisnummer, setHuisnummer] = useState('')
  const [telefoon, setTelefoon] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [resetLinkSent, setResetLinkSent] = useState(false)

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await AuthService.signIn(email, password)
    
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'Inloggen mislukt')
    }
    setLoading(false)
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await AuthService.signUp(email, password, name)
    
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'Registratie mislukt')
    }
    setLoading(false)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await AuthService.sendMagicLink(email)
    
    if (result.success) {
      setMagicLinkSent(true)
    } else {
      setError(result.error || 'Kon geen magic link versturen')
    }
    setLoading(false)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const result = await AuthService.sendPasswordReset(email)
    
    if (result.success) {
      setResetLinkSent(true)
    } else {
      setError(result.error || 'Kon geen reset link versturen')
    }
    setLoading(false)
  }

  const handleOAuth = async (provider: 'google' | 'github' | 'apple') => {
    setLoading(true)
    setError(null)

    const result = await AuthService.signInWithOAuth(provider)
    
    if (result.success) {
      router.push('/')
    } else {
      setError(result.error || 'OAuth inloggen mislukt')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ 
            fontSize: '32px', 
            fontWeight: 900, 
            color: '#111827',
            textDecoration: 'none'
          }}>
            D<span style={{ color: '#111827' }}>.</span><span style={{ color: '#258b52' }}>nl</span>
          </a>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '8px' }}>
            AI aankoop assistent
          </p>
        </div>

        {/* Mode Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '1px solid #E5E7EB',
          paddingBottom: '12px'
        }}>
          <button
            onClick={() => setMode('signin')}
            style={{
              flex: 1,
              padding: '8px',
              background: mode === 'signin' ? 'rgba(37,139,82,0.08)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: mode === 'signin' ? '#258b52' : '#6B7280',
              cursor: 'pointer'
            }}
          >
            Inloggen
          </button>
          <button
            onClick={() => setMode('signup')}
            style={{
              flex: 1,
              padding: '8px',
              background: mode === 'signup' ? 'rgba(37,139,82,0.08)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: mode === 'signup' ? '#258b52' : '#6B7280',
              cursor: 'pointer'
            }}
          >
            Registreren
          </button>
          <button
            onClick={() => setMode('magic')}
            style={{
              flex: 1,
              padding: '8px',
              background: mode === 'magic' ? 'rgba(37,139,82,0.08)' : 'transparent',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: mode === 'magic' ? '#258b52' : '#6B7280',
              cursor: 'pointer'
            }}
          >
            Magic Link
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#991b1b',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Magic Link Success */}
        {magicLinkSent && (
          <div style={{
            padding: '16px',
            background: '#dcfce7',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#15803d',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            ✓ Magic link verstuurd naar {email}
            <br />
            <span style={{ fontSize: '12px' }}>Check je inbox en klik op de link</span>
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'signin' && (
          <form onSubmit={handleEmailSignIn}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jouw@email.nl"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Wachtwoord
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setMode('forgot')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#258b52',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Wachtwoord vergeten?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#258b52',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Bezig...' : 'Inloggen'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {mode === 'signup' && (
          <form onSubmit={handleEmailSignUp}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Naam (optioneel)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je naam"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jouw@email.nl"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Wachtwoord
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 tekens"
                  minLength={8}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Postcode (optioneel)
              </label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="1234 AB"
                pattern="[0-9]{4}\s?[A-Za-z]{2}"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Huisnummer (optioneel)
              </label>
              <input
                type="text"
                value={huisnummer}
                onChange={(e) => setHuisnummer(e.target.value)}
                placeholder="42"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Telefoon (optioneel)
              </label>
              <input
                type="tel"
                value={telefoon}
                onChange={(e) => setTelefoon(e.target.value)}
                placeholder="+31 6 12345678"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#258b52',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? 'Bezig...' : 'Account aanmaken'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {/* Magic Link Form */}
        {mode === 'magic' && !magicLinkSent && (
          <form onSubmit={handleMagicLink}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jouw@email.nl"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                We sturen je een link om in te loggen zonder wachtwoord
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#258b52',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Bezig...' : 'Verstuur Magic Link'}
            </button>
          </form>
        )}

        {/* Forgot Password Form */}
        {mode === 'forgot' && !resetLinkSent && (
          <form onSubmit={handlePasswordReset}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6B7280' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="jouw@email.nl"
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '8px' }}>
                We sturen je een link om je wachtwoord te resetten
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: '#258b52',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Bezig...' : 'Verstuur Reset Link'}
            </button>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setMode('signin')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6B7280',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                ← Terug naar inloggen
              </button>
            </div>
          </form>
        )}

        {/* Reset Link Success */}
        {resetLinkSent && (
          <div style={{
            padding: '16px',
            background: '#dcfce7',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#15803d',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            ✓ Reset link verstuurd naar {email}
            <br />
            <span style={{ fontSize: '12px' }}>Check je inbox en klik op de link om je wachtwoord te resetten</span>
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={() => {
                  setResetLinkSent(false)
                  setMode('signin')
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#15803d',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Terug naar inloggen
              </button>
            </div>
          </div>
        )}

        {/* OAuth Buttons */}
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: '12px', color: '#6B7280', textAlign: 'center', marginBottom: '16px' }}>
            Of log in met
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => handleOAuth('google')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
              </svg>
              Google
            </button>

            <button
              onClick={() => handleOAuth('github')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Github size={18} />
              GitHub
            </button>

            <button
              onClick={() => handleOAuth('apple')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="white">
                <path d="M14.94 5.19A4.38 4.38 0 0 0 13 6.5a3.75 3.75 0 0 1 .91 2.5 3.87 3.87 0 0 1-2.34 3.54 9.14 9.14 0 0 0 1.14 2.36c.52.77 1.06 1.54 1.9 1.56a2.14 2.14 0 0 0 1.51-.58 4.3 4.3 0 0 0 1.06-1.78 4.52 4.52 0 0 0 .35-1.78 4.38 4.38 0 0 0-2.59-4.13zm-3.44 11.3a3.75 3.75 0 0 1-2.5-1 7.73 7.73 0 0 1-1.9-2.5 11.53 11.53 0 0 1-1.2-3.54 5.38 5.38 0 0 1 .35-2.5 3.87 3.87 0 0 1 2.34-2.13 4.38 4.38 0 0 1 2.5-.35 4.3 4.3 0 0 1 2.13.91 3.75 3.75 0 0 1 1.31 1.78 3.87 3.87 0 0 1 .35 1.78 3.75 3.75 0 0 1-.91 2.5 4.38 4.38 0 0 1-2.13 1.31 4.3 4.3 0 0 1-2.34.74z"/>
              </svg>
              Apple
            </button>
          </div>
        </div>

        {/* Footer Links */}
        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#6B7280' }}>
          <a href="/privacy" style={{ color: '#258b52', textDecoration: 'none', marginRight: '16px' }}>
            Privacy
          </a>
          <a href="/voorwaarden" style={{ color: '#258b52', textDecoration: 'none' }}>
            Voorwaarden
          </a>
        </div>
      </div>
    </div>
  )
}
