interface ActionButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  fullWidth?: boolean
}

export default function ActionButton({ children, onClick, disabled = false, fullWidth = false }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? '100%' : 'auto',
        padding: fullWidth ? '14px' : '10px 20px',
        background: disabled ? '#9ca3af' : '#15803d',
        color: 'white',
        border: 'none',
        borderRadius: fullWidth ? '10px' : '8px',
        fontSize: fullWidth ? '16px' : '14px',
        fontWeight: fullWidth ? 700 : 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 4px 6px rgba(21, 128, 61, 0.3)'
      }}
    >
      {children}
    </button>
  )
}





