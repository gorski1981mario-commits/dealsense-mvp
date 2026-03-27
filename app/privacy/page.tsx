export default function PrivacyPage() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      lineHeight: '1.6',
      color: '#374151'
    }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '24px', color: '#15803d' }}>
        Privacy Policy - DealSense
      </h1>
      
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
        Laatste update: 27 maart 2026
      </p>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#15803d' }}>
          1. Welke gegevens verzamelen we?
        </h2>
        <p style={{ marginBottom: '12px' }}>
          DealSense verzamelt minimale gegevens om de dienst te kunnen leveren:
        </p>
        <ul style={{ marginLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Device ID:</strong> Een anonieme identifier voor scan tracking</li>
          <li><strong>Scan geschiedenis:</strong> Lokaal opgeslagen op uw apparaat</li>
          <li><strong>Product zoekopdrachten:</strong> Tijdelijk opgeslagen voor resultaten</li>
        </ul>
        <p>
          <strong>We verzamelen GEEN:</strong> Naam, e-mailadres, telefoonnummer, betaalgegevens, of andere persoonlijke informatie.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#15803d' }}>
          2. Hoe gebruiken we uw gegevens?
        </h2>
        <ul style={{ marginLeft: '24px' }}>
          <li>Product prijzen vergelijken van verschillende webshops</li>
          <li>Scan limiet bijhouden (FREE package: 3 scans)</li>
          <li>Zoekresultaten verbeteren</li>
          <li>App prestaties optimaliseren</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#15803d' }}>
          3. Delen we uw gegevens?
        </h2>
        <p style={{ marginBottom: '12px' }}>
          <strong>NEE.</strong> We delen uw gegevens niet met derden.
        </p>
        <p>
          Wanneer u op een aanbieding klikt, wordt u doorgestuurd naar de webshop. 
          Vanaf dat moment is de privacy policy van die webshop van toepassing.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#15803d' }}>
          4. Cookies
        </h2>
        <p>
          DealSense gebruikt alleen essentiële cookies voor:
        </p>
        <ul style={{ marginLeft: '24px' }}>
          <li>Device ID opslaan (localStorage)</li>
          <li>Scan geschiedenis (localStorage)</li>
          <li>App instellingen (localStorage)</li>
        </ul>
        <p style={{ marginTop: '12px' }}>
          We gebruiken GEEN tracking cookies of analytics van derden.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#15803d' }}>
          5. Beveiliging
        </h2>
        <p>
          Alle communicatie verloopt via HTTPS (versleuteld). 
          Uw scan geschiedenis wordt alleen lokaal op uw apparaat opgeslagen.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#15803d' }}>
          6. Uw rechten
        </h2>
        <p>U heeft het recht om:</p>
        <ul style={{ marginLeft: '24px' }}>
          <li>Uw scan geschiedenis te verwijderen (via app instellingen)</li>
          <li>De app te verwijderen (alle lokale data wordt gewist)</li>
          <li>Contact met ons op te nemen voor vragen</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#15803d' }}>
          7. Kinderen
        </h2>
        <p>
          DealSense is bedoeld voor gebruikers van 18 jaar en ouder. 
          We verzamelen niet bewust gegevens van minderjarigen.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#15803d' }}>
          8. Wijzigingen
        </h2>
        <p>
          We kunnen deze privacy policy updaten. 
          Wijzigingen worden op deze pagina gepubliceerd met een nieuwe datum.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px', color: '#15803d' }}>
          9. Contact
        </h2>
        <p>
          Voor vragen over privacy:
        </p>
        <ul style={{ marginLeft: '24px', listStyle: 'none' }}>
          <li>📧 Email: support@dealsense.nl</li>
          <li>🌐 Website: https://dealsense.nl</li>
        </ul>
      </section>

      <div style={{
        marginTop: '48px',
        padding: '24px',
        background: '#f3f4f6',
        borderRadius: '8px',
        borderLeft: '4px solid #15803d'
      }}>
        <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          📌 Samenvatting
        </p>
        <p style={{ fontSize: '14px' }}>
          DealSense respecteert uw privacy. We verzamelen alleen een anonieme Device ID 
          en slaan uw scan geschiedenis lokaal op. We delen geen data met derden. 
          Alle communicatie is versleuteld (HTTPS).
        </p>
      </div>
    </div>
  )
}
