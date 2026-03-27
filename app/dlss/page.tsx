'use client'

import { useState } from 'react'

export default function DLSSPage() {
  const [category, setCategory] = useState('electronics')
  const [loading, setLoading] = useState(false)

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    setTimeout(() => {
      setLoading(false)
      alert(`DLSS scan voor categorie: ${category}`)
    }, 2000)
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        DLSS - Deep Learning Smart Scan
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        AI-powered scan die leert van je voorkeuren en steeds betere resultaten geeft.
      </p>

      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
        borderRadius: '12px',
        border: '1px solid #a78bfa',
        marginBottom: '32px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          🧠 AI Learning
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          DLSS analyseert je scan geschiedenis en leert welke winkels en deals jij het beste vindt. 
          Hoe meer je scant, hoe slimmer het wordt.
        </div>
      </div>

      <form onSubmit={handleScan}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
            Categorie
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              fontSize: '16px',
              background: 'white'
            }}
          >
            <option value="electronics">Elektronika</option>
            <option value="home">Dom i ogród</option>
            <option value="fashion">Moda</option>
            <option value="health">Zdrowie i uroda</option>
            <option value="sports">Sport i fitness</option>
            <option value="auto">Auto</option>
            <option value="toys">Zabawki</option>
            <option value="furniture">Meble</option>
            <option value="pets">Zwierzęta</option>
            <option value="tools">Narzędzia</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            background: loading ? '#9ca3af' : '#15803d',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'AI Scannen...' : 'Start DLSS Scan'}
        </button>
      </form>

      <div style={{ marginTop: '48px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>
          Hoe werkt DLSS?
        </h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              1. Leren van je keuzes
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              DLSS analyseert welke deals je kiest en welke je overslaat.
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              2. Personalisatie
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Resultaten worden aangepast aan jouw voorkeuren (prijs vs kwaliteit, snelle levering, etc).
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              3. Steeds beter
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Na 10+ scans kent DLSS je voorkeuren en geeft alleen deals die bij jou passen.
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'linear-gradient(135deg, #E6F4EE 0%, #E6F4EE 100%)',
        borderRadius: '12px',
        border: '1px solid #86efac'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Privacy
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          Je scan data wordt alleen lokaal opgeslagen en nooit gedeeld. DLSS leert alleen van jouw gedrag.
        </div>
      </div>
    </div>
  )
}





