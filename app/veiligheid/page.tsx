export const revalidate = 60

import { Lock, ShieldCheck, Mail } from 'lucide-react'

export default function VeiligheidPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Veiligheid & Vertrouwen
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Bij DealSense nemen we jouw privacy en veiligheid serieus. Hier lees je hoe we jouw gegevens beschermen.
      </p>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={20} strokeWidth={2} color="#15803d" /> Gegevensbeveiliging
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '16px' }}>
          We slaan geen persoonlijke gegevens op. Alle scans zijn anoniem en worden alleen in-memory verwerkt. 
          Na 24 uur worden alle sessiegegevens automatisch verwijderd.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} strokeWidth={2} color="#15803d" /> GDPR Compliant
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '16px' }}>
          We voldoen aan alle GDPR-richtlijnen. Je hebt altijd het recht om je gegevens in te zien, 
          te wijzigen of te verwijderen.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} strokeWidth={2} color="#15803d" /> Anti-Scam Bescherming
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '16px' }}>
          Onze TrustDelta-algoritme controleert alle winkels op betrouwbaarheid. We filteren automatisch 
          verdachte aanbiedingen en waarschuwen je voor mogelijke scams.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} strokeWidth={2} color="#15803d" /> Veilige Betalingen
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '16px' }}>
          Alle betalingen worden verwerkt via Stripe, een van de veiligste betalingsproviders ter wereld. 
          We zien of bewaren nooit je creditcardgegevens.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={20} strokeWidth={2} color="#15803d" /> Contact
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Vragen over privacy of veiligheid? Neem contact op via{' '}
          <a href="mailto:privacy@dealsense.nl" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            privacy@dealsense.nl
          </a>
        </p>
      </div>

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '12px',
        border: '2px solid #1e40af'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: '#1e40af' }}>
          ✓ Jouw gegevens zijn veilig bij ons
        </div>
        <div style={{ fontSize: '13px', color: '#1e40af' }}>
          We gebruiken industry-standard encryptie en volgen alle Nederlandse en Europese privacywetten.
        </div>
      </div>
    </div>
  )
}





