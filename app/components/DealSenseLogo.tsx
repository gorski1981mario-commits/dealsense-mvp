// KANONICZNE LOGO DEALSENSE - JEDNO ŹRÓDŁO PRAWDY
// Używaj tego komponentu wszędzie zamiast kopiować HTML

export default function DealSenseLogo({ size = 24 }: { size?: number }) {
  return (
    <span style={{
      fontSize: `${size}px`,
      fontWeight: 900,
      color: '#1e1e1e',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'inline-block'
    }}>
      D<span style={{ color: '#1e1e1e' }}>.</span><span style={{ color: '#15803d' }}>nl</span>
    </span>
  )
}

// Export jako SVG dla ikon PWA
export function DealSenseLogoSVG({ width = 512, height = 512 }: { width?: number, height?: number }) {
  const scale = width / 512
  const fontSize = 240 * scale
  
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={width} height={height} fill="white" rx={80 * scale}/>
      <text 
        x={100 * scale} 
        y={320 * scale} 
        fontFamily="system-ui, -apple-system, sans-serif" 
        fontSize={fontSize} 
        fontWeight="900" 
        fill="#1e1e1e"
      >
        D.nl
      </text>
    </svg>
  )
}
