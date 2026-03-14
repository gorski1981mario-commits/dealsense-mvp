export const revalidate = 60

export default function HoeHetWerktPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Hoe het werkt
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        In 3 simpele stappen vind je de beste deal. Geen gedoe, geen verborgen kosten.
      </p>

      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '12px',
          border: '1px solid #86efac'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#258b52',
            minWidth: '40px'
          }}>
            1
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Plak product URL en prijs
            </h2>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
              Kopieer de link van het product dat je wilt kopen (bijv. van Bol.com, Coolblue, MediaMarkt). 
              Vul de huidige prijs in. Dat is alles!
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          marginBottom: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          borderRadius: '12px',
          border: '1px solid #93c5fd'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#2563eb',
            minWidth: '40px'
          }}>
            2
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Wij scannen 100+ winkels
            </h2>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
              Onze AI scant in 3-15 seconden meer dan 100 Nederlandse webshops. We vergelijken prijzen, 
              ratings, levertijden en betrouwbaarheid. Alles automatisch.
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          padding: '20px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '12px',
          border: '1px solid #fbbf24'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 900,
            color: '#d97706',
            minWidth: '40px'
          }}>
            3
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Jij ziet de beste 3 deals
            </h2>
            <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.6' }}>
              We tonen je de top 3 aanbiedingen met de grootste besparing. Je ziet direct hoeveel je bespaart 
              en bij welke winkel. Klik, koop, bespaar!
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '48px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
          Wat maakt DealSense anders?
        </h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              ⚡ Supersnel
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Resultaten in 3-15 seconden. Geen eindeloos wachten.
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              🎯 Altijd de beste deal
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Onze AI filtert automatisch slechte aanbiedingen en scams.
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              👻 Ghost Mode
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Laat ons 24/7 monitoren. Je krijgt een melding zodra de prijs daalt.
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px' }}>
              💰 Eerlijke commissie
            </div>
            <div style={{ fontSize: '13px', color: '#374151' }}>
              Alleen 10% van je besparing. Bespaar je €50? Dan betaal je €5.
            </div>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: '48px',
        padding: '24px',
        background: 'linear-gradient(135deg, #258b52 0%, #1e7043 100%)',
        borderRadius: '12px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px' }}>
          Klaar om te besparen?
        </div>
        <div style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.9 }}>
          Probeer het gratis. 3 scans, geen registratie nodig.
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
          Start nu gratis
        </a>
      </div>
    </div>
  )
}
