export const revalidate = 60

export default function VoorwaardenPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Algemene Voorwaarden
      </h1>
      
      <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '32px' }}>
        Laatst bijgewerkt: 16 maart 2026
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
          DealSense rekent een commissie op de besparing die je maakt:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li><strong>FREE pakket:</strong> 10% commissie (na 3 gratis scans)</li>
          <li><strong>PLUS pakket:</strong> 9% commissie (€19,99/maand)</li>
          <li><strong>PRO pakket:</strong> 9% commissie (€29,99/maand)</li>
          <li><strong>FINANCE pakket:</strong> 9% commissie (€39,99/maand)</li>
        </ul>
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#374151',
          fontFamily: 'monospace'
        }}>
          Commissie = (Oorspronkelijke prijs - Beste prijs) × percentage
          <br />
          Voorbeeld PLUS: (€100 - €80) × 9% = €1,80
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          4. Betalingen & Abonnementen
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Alle betalingen worden veilig verwerkt via Stripe. We accepteren creditcards, debitcards en iDEAL.
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Abonnementen worden maandelijks automatisch verlengd</li>
          <li>Je kunt op elk moment opzeggen via je account instellingen</li>
          <li>Bij opzegging blijft je pakket actief tot het einde van de betaalde periode</li>
          <li>Geen restitutie voor gedeeltelijk gebruikte maanden</li>
          <li>Prijswijzigingen worden 30 dagen van tevoren aangekondigd</li>
        </ul>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          5. Privacy & Gegevensbescherming (GDPR)
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          DealSense respecteert je privacy en voldoet aan de AVG (GDPR). We verzamelen en verwerken de volgende gegevens:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li><strong>Anonieme gebruikers:</strong> Device ID (lokaal opgeslagen), scan geschiedenis, geen persoonlijke gegevens</li>
          <li><strong>Account gebruikers:</strong> E-mailadres, betaalgegevens (via Stripe), pakket informatie</li>
          <li><strong>Cookies:</strong> Alleen functionele cookies voor sessie management (geen tracking cookies)</li>
          <li><strong>Data retentie:</strong> Scan geschiedenis wordt 90 dagen bewaard, account gegevens tot verwijdering</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Je hebt recht op inzage, correctie en verwijdering van je gegevens. Neem contact op via{' '}
          <a href="mailto:privacy@dealsense.nl" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            privacy@dealsense.nl
          </a>
          . Zie onze{' '}
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
          9. Intellectueel Eigendom
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Alle content op DealSense.nl, inclusief maar niet beperkt tot teksten, afbeeldingen, logo's, software en AI-modellen, 
          is eigendom van DealSense en beschermd door auteursrecht. Je mag deze content niet kopiëren, reproduceren of 
          hergebruiken zonder schriftelijke toestemming.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          10. Geschillenbeslechting
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Bij geschillen proberen we eerst tot een oplossing te komen via direct contact. Lukt dit niet, dan is Nederlands recht 
          van toepassing en zijn de rechtbanken in Amsterdam bevoegd.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          11. Referral Programma
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Gebruikers met een betaald pakket ontvangen een unieke referral code. Vrienden die zich aanmelden met deze code 
          krijgen 2% korting op hun eerste maand. De referrer krijgt 2% korting bij verlenging. Referral kortingen zijn 
          niet cumulatief en kunnen niet worden gecombineerd met andere acties.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          12. Contact
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
          <strong>DealSense B.V.</strong>
          <br />
          KVK-nummer: [in aanvraag]
          <br />
          BTW-nummer: [in aanvraag]
          <br />
          Adres: Amsterdam, Nederland
          <br />
          E-mail: info@dealsense.nl
          <br />
          Privacy: privacy@dealsense.nl
        </div>
      </div>
    </div>
  )
}
