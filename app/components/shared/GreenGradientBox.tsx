interface GreenGradientBoxProps {
  children: React.ReactNode
  className?: string
}

export default function GreenGradientBox({ children, className = '' }: GreenGradientBoxProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #E6F4EE 0%, #E6F4EE 100%)',
      border: '1px solid #86efac',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '24px'
    }} className={className}>
      {children}
    </div>
  )
}





