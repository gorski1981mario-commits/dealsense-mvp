export const revalidate = 60

export default function WaaromGeenPartnerschappenPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Waarom geen partnerschappen?
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Wij werken niet samen met winkels. Dat is onze kracht. Hier lees je waarom.
      </p>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#dc2626' }}>
          ❌ Wat andere prijsvergelijkers doen
        </h2>
        <div style={{
          padding: '20px',
          background: '#fee2e2',
          borderRadius: '12px',
          border: '1px solid #fca5a5',
          marginBottom: '16px'
        }}>
          <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
            <li>Ze krijgen commissie van winkels om hoger in resultaten te staan</li>
            <li>Ze tonen alleen "partner winkels" - niet de goedkoopste</li>
            <li>Ze verbergen betere deals van niet-partners</li>
            <li>Ze verdienen meer als jij meer betaalt</li>
          </ul>
        </div>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          <strong>Resultaat:</strong> Jij betaalt meer, zij verdienen meer. Dat is niet eerlijk.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px', color: '#258b52' }}>
          ✓ Wat wij anders doen
        </h2>
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '12px',
          border: '1px solid #86efac',
          marginBottom: '16px'
        }}>
          <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
            <li>Wij scannen ALLE winkels - geen uitzonderingen</li>
            <li>Wij tonen altijd de goedkoopste - ook als het niet onze "partner" is</li>
            <li>Wij verdienen alleen als jij bespaart (10% van besparing)</li>
            <li>Hoe meer jij bespaart, hoe meer wij verdienen - onze belangen zijn gelijk</li>
          </ul>
        </div>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
          <strong>Resultaat:</strong> Jij bespaart maximaal, wij verdienen eerlijk. Win-win.
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          🎯 Onze filosofie
        </h2>
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: '12px',
          border: '1px solid #93c5fd'
        }}>
          <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', margin: 0 }}>
            <strong>"Wij zijn aan jouw kant, niet aan de kant van winkels."</strong>
            <br /><br />
            Andere prijsvergelijkers zijn eigenlijk advertentieplatforms. Ze verdienen geld door je naar 
            dure winkels te sturen die hen het meeste betalen.
            <br /><br />
            Wij zijn anders. Wij verdienen alleen als jij bespaart. Geen verborgen deals, geen voorkeursbehandeling, 
            geen bullshit. Gewoon de beste prijs, altijd.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '12px' }}>
          💡 Voorbeeld
        </h2>
        <div style={{
          padding: '20px',
          background: 'white',
          border: '1px solid #E2E8F0',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8' }}>
            <strong>Scenario:</strong> Je zoekt een laptop van €899
            <br /><br />
            <strong style={{ color: '#dc2626' }}>Andere vergelijker:</strong>
            <br />
            Toont "Partner Shop A" voor €850 (zij krijgen €20 commissie van winkel)
            <br />
            Verbergt "Shop B" voor €765 (geen partner, dus geen commissie)
            <br />
            <strong>Jij betaalt: €850</strong>
            <br /><br />
            <strong style={{ color: '#258b52' }}>DealSense:</strong>
            <br />
            Toont Shop B voor €765 (goedkoopste, altijd)
            <br />
            Jij bespaart €134, wij krijgen €13,40 (10% van besparing)
            <br />
            <strong>Jij betaalt: €765 + €13,40 = €778,40</strong>
            <br /><br />
            <strong style={{ color: '#258b52' }}>Jij bespaart €71,60 door DealSense te gebruiken!</strong>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '48px',
        padding: '24px',
        background: 'linear-gradient(135deg, #7c3aed 0%, #6b21a8 100%)',
        borderRadius: '12px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
          Transparantie is onze kracht
        </div>
        <div style={{ fontSize: '14px', opacity: 0.9 }}>
          Geen verborgen agenda. Geen dubieuze deals. Alleen jij en de beste prijs.
        </div>
      </div>
    </div>
  )
}
