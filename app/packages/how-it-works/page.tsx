export const revalidate = 60

export default function PackagesHowItWorksPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Hoe werken de paketten?
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Kies het pakket dat bij jou past. Alle paketten zijn eenmalig te betalen, geen abonnement.
      </p>

      <div style={{ display: 'grid', gap: '24px', marginBottom: '48px' }}>
        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: '12px',
          border: '2px solid #2563eb'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#2563eb' }}>
            FREE - Probeer gratis
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>€0</div>
          <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>3 gratis scans (lifetime)</li>
            <li>Alleen totale besparing zichtbaar</li>
            <li>Geen winkelnamen of links</li>
            <li>Ideaal om te testen</li>
          </ul>
        </div>

        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '12px',
          border: '2px solid #fbbf24'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#d97706' }}>
            PLUS - Voor regelmatige shoppers
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>€19,99</div>
          <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Onbeperkt scans</li>
            <li>Top 3 deals met winkelnamen + links</li>
            <li>Ghost Mode (24h monitoring)</li>
            <li>10 shopping categorieën</li>
            <li>10% commissie op besparing</li>
          </ul>
        </div>

        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: '12px',
          border: '2px solid #2563eb'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#1e40af' }}>
            PRO - Voor professionals
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>€29,99</div>
          <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Alles van PLUS</li>
            <li>16 categorieën (shopping + services)</li>
            <li>Vacations & Insurance modules</li>
            <li>PDF rapporten</li>
            <li>5% commissie op besparing</li>
          </ul>
        </div>

        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)',
          borderRadius: '12px',
          border: '2px solid #7c3aed'
        }}>
          <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', color: '#6b21a8' }}>
            FINANCE - Complete controle
          </div>
          <div style={{ fontSize: '32px', fontWeight: 900, marginBottom: '16px' }}>€39,99</div>
          <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Alles van PRO</li>
            <li>21 categorieën (all-in)</li>
            <li>Finance modules (hypotheek, leningen, leasing)</li>
            <li>Ghost Mode (5 min monitoring)</li>
            <li>OCR scan (foto's van bonnen)</li>
            <li>0% commissie</li>
          </ul>
        </div>
      </div>

      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: '12px',
        border: '1px solid #86efac',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
          Hoe werkt de commissie?
        </h3>
        <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6', marginBottom: '12px' }}>
          We verdienen alleen als jij bespaart. Geen besparing = geen kosten.
        </p>
        <div style={{
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#374151',
          fontFamily: 'monospace'
        }}>
          Voorbeeld PLUS (10% commissie):
          <br />
          Oorspronkelijke prijs: €100
          <br />
          Beste prijs gevonden: €80
          <br />
          Besparing: €20
          <br />
          Commissie: €20 × 10% = €2
          <br />
          <strong>Jij betaalt: €80 + €2 = €82 (€18 goedkoper!)</strong>
        </div>
      </div>

      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #258b52 0%, #1e7043 100%)',
        borderRadius: '12px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
          Welk pakket past bij jou?
        </div>
        <div style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.9 }}>
          Start gratis en upgrade wanneer je wilt.
        </div>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: 'white',
            color: '#258b52',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            textDecoration: 'none'
          }}
        >
          Probeer nu gratis
        </a>
      </div>
    </div>
  )
}



