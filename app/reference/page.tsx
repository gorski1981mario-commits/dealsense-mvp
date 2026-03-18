export const revalidate = 60

export default function ReferencePage() {
  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}>
        📚 Reference
      </h1>
      
      <p style={{ fontSize: '16px', color: '#374151', marginBottom: '32px', lineHeight: '1.6' }}>
        Technische documentatie en API reference voor developers.
      </p>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
          API Endpoints
        </h2>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', fontFamily: 'monospace' }}>
              POST /api/scan-qr
            </div>
            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
              QR code scanning endpoint
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
              Rate limit: 10 requests/minute per IP
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', fontFamily: 'monospace' }}>
              POST /api/compare
            </div>
            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
              Price comparison endpoint
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
              Rate limit: Package-dependent
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', fontFamily: 'monospace' }}>
              GET /api/pricing-plans
            </div>
            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '8px' }}>
              Get available pricing plans
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
              Public endpoint
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
          Response Formats
        </h2>
        
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '10px',
          fontSize: '13px',
          fontFamily: 'monospace',
          overflow: 'auto'
        }}>
          {`{
  "success": true,
  "action": "unlock",
  "message": "QR code gescand",
  "data": {
    "qrData": "...",
    "type": "plus",
    "timestamp": 1710425000000
  },
  "remaining": 9
}`}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '16px' }}>
          Error Codes
        </h2>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{
            padding: '12px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>400</span>
            <span style={{ fontSize: '13px', color: '#374151' }}>Bad Request</span>
          </div>
          <div style={{
            padding: '12px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>429</span>
            <span style={{ fontSize: '13px', color: '#374151' }}>Rate Limit Exceeded</span>
          </div>
          <div style={{
            padding: '12px',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: 'monospace' }}>500</span>
            <span style={{ fontSize: '13px', color: '#374151' }}>Internal Server Error</span>
          </div>
        </div>
      </div>

      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderRadius: '12px',
        border: '1px solid #93c5fd'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
          📖 Full Documentation
        </div>
        <div style={{ fontSize: '13px', color: '#374151' }}>
          Voor volledige API documentatie, neem contact op via{' '}
          <a href="mailto:dev@dealsense.nl" style={{ color: '#2563eb', textDecoration: 'underline' }}>
            dev@dealsense.nl
          </a>
        </div>
      </div>
    </div>
  )
}



