export const revalidate = 60

export default function EnginesOverviewPage() {
  const engines = [
    { name: 'FREE', path: '/engines/free', speed: '3s', accuracy: '85%', color: '#258b52' },
    { name: 'PLUS', path: '/engines/plus', speed: '5s', accuracy: '90%', color: '#15803d' },
    { name: 'PREMIUM', path: '/engines/premium', speed: '8s', accuracy: '95%', color: '#166534' },
    { name: 'PRO', path: '/engines/pro', speed: '10s', accuracy: '97%', color: '#14532d' },
    { name: 'PRO-FINANCE', path: '/engines/pro-finance', speed: '15s', accuracy: '99%', color: '#052e16' }
  ]

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        Scan Engines
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Verschillende scan engines geoptimaliseerd voor elk pakket.
      </p>

      <div style={{ display: 'grid', gap: '16px' }}>
        {engines.map(engine => (
          <a
            key={engine.name}
            href={engine.path}
            style={{
              padding: '20px',
              background: 'white',
              border: '2px solid #E2E8F0',
              borderRadius: '12px',
              textDecoration: 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
          >
            <div>
              <div style={{ 
                fontSize: '18px', 
                fontWeight: 700, 
                marginBottom: '8px',
                color: engine.color
              }}>
                {engine.name}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Speed: {engine.speed} • Accuracy: {engine.accuracy}
              </div>
            </div>
            <div style={{ fontSize: '24px' }}>→</div>
          </a>
        ))}
      </div>

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: '12px',
        border: '1px solid #86efac'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
          Hoe werken de engines?
        </h3>
        <ul style={{ fontSize: '14px', color: '#374151', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
          <li>FREE: Snelle scan, 3 winkels, basis resultaten</li>
          <li>PLUS: Uitgebreide scan, 10 winkels, betere accuracy</li>
          <li>PREMIUM: Deep scan, 20 winkels, hoge accuracy</li>
          <li>PRO: Full scan, 50+ winkels, zeer hoge accuracy</li>
          <li>PRO-FINANCE: Complete scan, 100+ bronnen, maximale accuracy</li>
        </ul>
      </div>
    </div>
  )
}
