export const revalidate = 60

export default function PreviewPage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        👁️ Preview
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Bekijk een voorbeeld van hoe DealSense werkt voordat je begint.
      </p>

      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderRadius: '12px',
        border: '1px solid #93c5fd',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
          Voorbeeld Scan
        </h2>
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            Product: Samsung Galaxy S24
          </div>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '4px' }}>
            Oorspronkelijke prijs: €899
          </div>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '16px' }}>
            Scan tijd: 3.2 seconden
          </div>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{
            padding: '16px',
            background: 'white',
            borderRadius: '10px',
            border: '2px solid #258b52'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>1. Coolblue</span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#258b52' }}>€765</span>
            </div>
            <div style={{ fontSize: '12px', color: '#374151', marginBottom: '8px' }}>
              Rating: 4.5/5 • 1,250 reviews
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#258b52' }}>
              Besparing: €134 (15%)
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>2. MediaMarkt</span>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>€810</span>
            </div>
            <div style={{ fontSize: '12px', color: '#374151', marginBottom: '8px' }}>
              Rating: 4.3/5 • 890 reviews
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#258b52' }}>
              Besparing: €89 (10%)
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #E2E8F0'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>3. Bol.com</span>
              <span style={{ fontSize: '18px', fontWeight: 700 }}>€828</span>
            </div>
            <div style={{ fontSize: '12px', color: '#374151', marginBottom: '8px' }}>
              Rating: 4.7/5 • 2,100 reviews
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#258b52' }}>
              Besparing: €71 (8%)
            </div>
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'linear-gradient(135deg, #E6F4EE 0%, #E6F4EE 100%)',
          borderRadius: '10px',
          border: '1px solid #86efac'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
            💰 Jouw besparing
          </div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#258b52', marginBottom: '8px' }}>
            €134
          </div>
          <div style={{ fontSize: '13px', color: '#374151' }}>
            Commissie (10%): €13,40 • Netto besparing: €120,60
          </div>
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
          Klaar om te beginnen?
        </div>
        <div style={{ fontSize: '14px', marginBottom: '20px', opacity: 0.9 }}>
          Probeer het gratis met 3 scans.
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




