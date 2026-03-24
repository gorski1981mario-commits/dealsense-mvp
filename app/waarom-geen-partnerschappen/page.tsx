export const revalidate = 60

export default function WaaromGeenPartnerschappenPage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>
        Waarom geen partnerschappen?
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Wij werken niet samen met winkels. Dat is onze kracht.
      </p>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          Wat andere prijsvergelijkers doen
        </h2>
        <div style={{
          padding: '20px',
          background: '#F7F9F8',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          marginBottom: '12px'
        }}>
          <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
            <li>Commissie van winkels voor hogere posities</li>
            <li>Alleen "partner winkels" worden getoond</li>
            <li>Betere deals worden verborgen</li>
            <li>Verdienen meer als jij meer betaalt</li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#1e40af' }}>
          Wat wij anders doen
        </h2>
        <div style={{
          padding: '20px',
          background: '#f9fafb',
          borderRadius: '12px',
          border: '2px solid #1e40af',
          marginBottom: '12px'
        }}>
          <ul style={{ fontSize: '14px', color: '#1e40af', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
            <li>Scannen van alle winkels zonder uitzonderingen</li>
            <li>Altijd de beste prijs, ongeacht partnerships</li>
            <li>Verdienen alleen bij jouw besparing</li>
            <li>Onze belangen zijn gelijk aan jouw belangen</li>
          </ul>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          Onze filosofie
        </h2>
        <div style={{
          padding: '20px',
          background: '#F7F9F8',
          borderRadius: '12px',
          border: '1px solid #E5E7EB'
        }}>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', margin: 0 }}>
            <strong>"Wij zijn aan jouw kant."</strong>
            <br /><br />
            Andere prijsvergelijkers zijn advertentieplatforms die verdienen aan partnerships. 
            Wij verdienen alleen als jij bespaart. Geen verborgen deals, geen voorkeursbehandeling.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
          Voorbeeld
        </h2>
        <div style={{
          padding: '20px',
          background: '#F7F9F8',
          border: '1px solid #E5E7EB',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', color: '#111827', lineHeight: '1.8' }}>
            <strong>Laptop van €899:</strong>
            <br /><br />
            <strong>Andere vergelijker:</strong>
            <br />
            Partner Shop A: €850
            <br />
            Shop B: verborgen (geen partner)
            <br />
            Jij betaalt: €850
            <br /><br />
            <strong style={{ color: '#15803d' }}>DealSense:</strong>
            <br />
            Oorspronkelijke prijs: €899,00
            <br />
            DealSense vindt: €765,00
            <br />
            Besparing: €134,00 (€899 - €765)
            <br />
            Commissie (10%): €13,40 (€134 × 10%)
            <br />
            <strong>Jij betaalt: €778,40</strong> (€765 + €13,40)
            <br /><br />
            <strong style={{ color: '#15803d' }}>Besparing vs Partner Shop A: €71,60</strong>
            <br />
            <strong style={{ color: '#15803d' }}>Besparing vs oorspronkelijke prijs: €120,60</strong>
          </div>
        </div>
      </div>

    </div>
  )
}




