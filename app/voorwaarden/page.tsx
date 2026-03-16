export const revalidate = 60

export default function VoorwaardenPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
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
          3. Commissie & Prijzen
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          DealSense rekent een commissie op de besparing die je maakt. De commissie wordt alleen berekend 
          wanneer wij een lagere prijs vinden dan de door jou opgegeven basisprijs:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li><strong>FREE pakket:</strong> 10% commissie (na 3 gratis scans)</li>
          <li><strong>PLUS pakket:</strong> 9% commissie + €19,99/maand abonnement</li>
          <li><strong>PRO pakket:</strong> 9% commissie + €29,99/maand abonnement</li>
          <li><strong>FINANCE pakket:</strong> 9% commissie + €39,99/maand abonnement</li>
        </ul>
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#374151',
          fontFamily: 'monospace',
          marginBottom: '12px'
        }}>
          Commissie = (Oorspronkelijke prijs - Beste prijs) × percentage
          <br />
          Voorbeeld PLUS: (€100 - €80) × 9% = €1,80
        </div>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Geen besparing = geen commissie. Alle prijzen zijn inclusief BTW tenzij anders vermeld.
        </p>
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
          8. Beschikbaarheid & Onderhoud
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          DealSense streeft naar een beschikbaarheid van 99% op jaarbasis. We behouden ons het recht voor om:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Gepland onderhoud uit te voeren (waar mogelijk buiten kantooruren)</li>
          <li>De dienst tijdelijk te onderbreken voor updates of reparaties</li>
          <li>Functionaliteiten toe te voegen of te wijzigen zonder voorafgaande kennisgeving</li>
        </ul>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          9. Beëindiging & Opzegging
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Voor abonnementen gelden de volgende opzegvoorwaarden:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>Je kunt je abonnement op elk moment opzeggen via je account instellingen</li>
          <li>Opzegging gaat in aan het einde van de lopende betaalperiode</li>
          <li>Geen restitutie voor gedeeltelijk gebruikte periodes</li>
          <li>Bij niet-betaling kunnen we je toegang direct beëindigen</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          DealSense kan de overeenkomst met onmiddellijke ingang beëindigen bij misbruik, 
          fraude of schending van deze voorwaarden.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          10. Herroepingsrecht (Consumentenrecht)
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Als consument heb je recht op een bedenktijd van 14 dagen na aankoop van een abonnement, 
          zonder opgave van redenen. Dit recht vervalt wanneer:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginBottom: '12px' }}>
          <li>Je de dienst al hebt gebruikt (scans hebt uitgevoerd)</li>
          <li>Je expliciet hebt verzocht om directe toegang tot de dienst</li>
        </ul>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Voor herroeping neem je contact op via{' '}
          <a href="mailto:info@dealsense.nl" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            info@dealsense.nl
          </a>
          . Restitutie vindt plaats binnen 14 dagen.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          11. Force Majeure
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          DealSense is niet aansprakelijk voor het niet nakomen van verplichtingen als gevolg van 
          overmacht, waaronder: storingen bij derden (hosting, API's), internetproblemen, 
          natuurrampen, overheidsmaatregelen, of andere omstandigheden buiten onze controle.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          12. Wijziging Voorwaarden
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          We behouden ons het recht voor om deze voorwaarden te wijzigen. Materiële wijzigingen 
          worden 30 dagen van tevoren aangekondigd via e-mail (voor account gebruikers) of op deze pagina. 
          Gebruik van de dienst na wijziging betekent acceptatie van de nieuwe voorwaarden.
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
          10. Referral Programma
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Gebruikers met een betaald pakket ontvangen een unieke referral code. Vrienden die zich aanmelden met deze code 
          krijgen 2% korting op hun eerste maand. De referrer krijgt 2% korting bij verlenging. Referral kortingen zijn 
          niet cumulatief en kunnen niet worden gecombineerd met andere acties.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          11. Toepasselijk Recht & Geschillenbeslechting
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          Op deze voorwaarden is Nederlands recht van toepassing. Bij geschillen:
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Proberen we eerst tot een oplossing te komen via direct contact</li>
          <li>Consumenten kunnen zich wenden tot de Geschillencommissie Thuiswinkel</li>
          <li>Bij niet-oplossing zijn de rechtbanken in Amsterdam bevoegd</li>
        </ul>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          12. Slotbepalingen
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Indien een bepaling in deze voorwaarden nietig of vernietigbaar blijkt, blijven de overige 
          bepalingen volledig van kracht. De nietige bepaling wordt vervangen door een geldige bepaling 
          die de bedoeling van de oorspronkelijke bepaling zo dicht mogelijk benadert.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          13. Contact
        </h2>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          Vragen, klachten of opmerkingen over deze voorwaarden?
        </p>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', marginTop: '8px' }}>
          <li>Algemeen: <a href="mailto:info@dealsense.nl" style={{ color: '#2563eb', textDecoration: 'underline' }}>info@dealsense.nl</a></li>
          <li>Privacy: <a href="mailto:privacy@dealsense.nl" style={{ color: '#2563eb', textDecoration: 'underline' }}>privacy@dealsense.nl</a></li>
          <li>Klachten: <a href="mailto:klachten@dealsense.nl" style={{ color: '#2563eb', textDecoration: 'underline' }}>klachten@dealsense.nl</a></li>
        </ul>
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
