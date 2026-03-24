interface PackageBadgeProps {
  type: 'free' | 'plus' | 'pro' | 'finance' | 'zakelijk'
  label: string
}

export default function PackageBadge({ type, label }: PackageBadgeProps) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      background: 'rgba(37,139,82,0.12)',
      color: '#258b52',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: 700
    }}>
      {label}
    </span>
  )
}




