'use client'

// Auto-Fill Preview Component
// Shows parsed product data after Scanner fills it

interface AutoFillPreviewProps {
  productName?: string
  price?: number
  shop?: string
  category?: string
  ean?: string
}

export default function AutoFillPreview({
  productName,
  price,
  shop,
  category,
  ean
}: AutoFillPreviewProps) {
  // Don't show if no data
  if (!productName && !price && !shop) {
    return null
  }

  return (
    <div style={{
      marginTop: '16px',
      marginBottom: '24px',
      padding: '16px',
      background: '#E6F4EE',
      border: '2px solid #86efac',
      borderRadius: '12px'
    }}>
      <div style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#15803d',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '18px' }}>✓</span>
        Auto-gevuld
      </div>

      <div style={{
        display: 'grid',
        gap: '8px',
        fontSize: '13px'
      }}>
        {productName && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#15803d', fontWeight: 600, minWidth: '80px' }}>Product:</span>
            <span style={{ color: '#111827', fontWeight: 500 }}>{productName}</span>
          </div>
        )}

        {price && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#15803d', fontWeight: 600, minWidth: '80px' }}>Prijs:</span>
            <span style={{ color: '#111827', fontWeight: 500 }}>€{price.toFixed(2)}</span>
          </div>
        )}

        {shop && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#15803d', fontWeight: 600, minWidth: '80px' }}>Shop:</span>
            <span style={{ color: '#111827', fontWeight: 500 }}>{shop}</span>
          </div>
        )}

        {category && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#15803d', fontWeight: 600, minWidth: '80px' }}>Categorie:</span>
            <span style={{ color: '#111827', fontWeight: 500 }}>{category}</span>
          </div>
        )}

        {ean && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <span style={{ color: '#15803d', fontWeight: 600, minWidth: '80px' }}>EAN:</span>
            <span style={{ color: '#111827', fontWeight: 500, fontSize: '11px' }}>{ean}</span>
          </div>
        )}
      </div>
    </div>
  )
}

