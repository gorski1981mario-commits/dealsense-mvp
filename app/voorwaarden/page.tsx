export const revalidate = 60

export default function VoorwaardenPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Algemene Voorwaarden
      </h1>
      
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
        Laatst bijgewerkt: 14 maart 2026
      </p>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          1. Dienstverlening
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          DealSense.nl biedt een prijsvergelijkingsdienst aan waarmee gebruikers producten kunnen vergelijken 
          tussen verschillende Nederlandse webshops. We garanderen niet dat alle prijzen altijd 100% actueel zijn, 
          maar doen ons best om de meest recente informatie te tonen.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          2. Gratis Scans
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Nieuwe gebruikers krijgen 3 gratis scans. Deze scans zijn bedoeld om de dienst uit te proberen. 
          Na 3 scans is een upgrade naar een betaald pakket (Plus, Pro of Finance) vereist voor verdere scans.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          3. Commissie
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          DealSense rekent een commissie van 10% op de besparing die je maakt. Deze commissie wordt berekend 
          als volgt:
        </p>
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#374151',
          fontFamily: 'monospace'
        }}>
          Commissie = (Oorspronkelijke prijs - Beste prijs) × 10%
          <br />
          Voorbeeld: (€100 - €80) × 10% = €2
        </div>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginTop: '12px' }}>
          Voor het Finance pakket is de commissie 0%.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          4. Betalingen
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Alle betalingen worden verwerkt via Stripe. We accepteren creditcards, debitcards en iDEAL. 
          Betalingen zijn eenmalig en geven toegang tot het gekozen pakket zonder vervaldatum.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          5. Privacy
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          We respecteren je privacy. We slaan geen persoonlijke gegevens op tenzij je een account aanmaakt. 
          Alle scans zijn anoniem. Zie onze{' '}
          <a href="/veiligheid" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            Privacy & Veiligheid pagina
          </a>
          {' '}voor meer informatie.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          6. Aansprakelijkheid
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          DealSense is niet aansprakelijk voor:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginTop: '8px' }}>
          <li>Onjuiste prijsinformatie van externe webshops</li>
          <li>Uitverkochte producten</li>
          <li>Wijzigingen in prijzen na het scannen</li>
          <li>Kwaliteit of levering van producten (dit is de verantwoordelijkheid van de verkopende winkel)</li>
        </ul>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          7. Gebruik van de Dienst
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Je mag DealSense niet gebruiken voor:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginTop: '8px' }}>
          <li>Geautomatiseerde scraping of bots</li>
          <li>Misbruik van de gratis scans (bijv. meerdere accounts aanmaken)</li>
          <li>Commercieel hergebruik van onze data zonder toestemming</li>
        </ul>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          8. Wijzigingen
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          We behouden ons het recht voor om deze voorwaarden op elk moment te wijzigen. 
          Wijzigingen worden van kracht zodra ze op deze pagina worden gepubliceerd.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          9. Contact
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Vragen over deze voorwaarden? Neem contact op via{' '}
          <a href="mailto:info@dealsense.nl" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            info@dealsense.nl
          </a>
        </p>
      </div>

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: '#f8fafc',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.6' }}>
          <strong>DealSense.nl</strong>
          <br />
          KVK: [nummer]
          <br />
          BTW: [nummer]
          <br />
          Adres: Amsterdam, Nederland
        </div>
      </div>
    </div>
  )
}
