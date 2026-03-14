export const revalidate = 60

export default function PagesOverviewPage() {
  const pages = [
    { name: 'Home (FREE)', path: '/', category: 'Paketten' },
    { name: 'Plus', path: '/plus', category: 'Paketten' },
    { name: 'Pro', path: '/pro', category: 'Paketten' },
    { name: 'Finance', path: '/finance', category: 'Paketten' },
    { name: 'Veiligheid & Vertrouwen', path: '/veiligheid', category: 'Info' },
    { name: 'Hoe het werkt', path: '/hoe-het-werkt', category: 'Info' },
    { name: 'Waarom geen partnerschappen', path: '/waarom-geen-partnerschappen', category: 'Info' },
    { name: 'Algemene voorwaarden', path: '/voorwaarden', category: 'Info' },
    { name: 'Mijn vaste lasten', path: '/vaste-lasten', category: 'Features' },
    { name: 'Vakanties', path: '/vacations', category: 'Features' },
    { name: 'Verzekeringen', path: '/insurance', category: 'Features' },
    { name: 'Goud & Edelmetalen', path: '/gold', category: 'Features' },
    { name: 'Rocket Scan', path: '/rocket', category: 'Features' },
    { name: 'Rakieta Scan', path: '/rakieta-scan', category: 'Features' },
    { name: 'Preview', path: '/preview', category: 'Features' },
    { name: 'Reference', path: '/reference', category: 'Features' },
    { name: 'Hoe werken paketten', path: '/packages/how-it-works', category: 'Info' }
  ]

  const groupedPages = pages.reduce((acc, page) => {
    if (!acc[page.category]) acc[page.category] = []
    acc[page.category].push(page)
    return acc
  }, {} as Record<string, typeof pages>)

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        📄 Alle Pagina's
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Overzicht van alle beschikbare pagina's in DealSense.
      </p>

      {Object.entries(groupedPages).map(([category, categoryPages]) => (
        <div key={category} style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
            {category}
          </h2>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {categoryPages.map((page) => (
              <a
                key={page.path}
                href={page.path}
                style={{
                  padding: '16px',
                  background: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                  {page.name}
                </span>
                <span style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                  {page.path}
                </span>
              </a>
            ))}
          </div>
        </div>
      ))}

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: '12px',
        border: '1px solid #86efac'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          Statistieken
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          Totaal aantal pagina's: {pages.length}
        </div>
      </div>
    </div>
  )
}
