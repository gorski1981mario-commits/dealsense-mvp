// BETONOWY BRANDING AGENT ECHO - NIE ZMIENIAĆ!
// Design ze strony: E (zielone) + ch (niebieskie) + ● (czarne kółko)

export default function AgentEchoLogo() {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderRadius: '8px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '20px'
    }}>
      {/* Logo Echo - BETONOWY DESIGN */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline'
      }}>
        {/* E - standard brand green */}
        <span style={{
          color: '#15803d',
          fontWeight: 700,
          fontSize: '28px',
          lineHeight: 1
        }}>
          E
        </span>
        
        {/* ch - niebieskie, niższe od E */}
        <span style={{
          color: '#3b82f6',
          fontWeight: 700,
          fontSize: '24px',
          lineHeight: 1
        }}>
          ch
        </span>
        
        {/* o - czarne kółko, wielkość proporcjonalna do ch */}
        <span style={{
          color: '#000',
          fontSize: '26px',
          lineHeight: 1,
          position: 'relative',
          top: '-2px'
        }}>
          ●
        </span>
      </div>
      
      {/* Tagline */}
      <span style={{
        color: '#374151',
        fontSize: '16px',
        fontWeight: 400
      }}>
        Je persoonlijke AI agent
      </span>
    </div>
  )
}


