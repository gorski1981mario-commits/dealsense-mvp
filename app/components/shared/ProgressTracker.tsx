'use client'

interface ProgressTrackerProps {
  percentage: number
  validCount: number
  totalFields: number
  showWarning: boolean
}

export default function ProgressTracker({ 
  percentage, 
  validCount, 
  totalFields, 
  showWarning 
}: ProgressTrackerProps) {
  return (
    <>
      {/* Progress Container */}
      <div style={{
        background: '#E6F4EE',
        border: '2px solid #10b981',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#10b981'
          }}>
            Voortgang configuratie
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#10b981'
          }}>
            {percentage}%
          </div>
        </div>
        
        <div style={{
          background: 'white',
          borderRadius: '8px',
          height: '12px',
          overflow: 'hidden'
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #10b981 0%, #15803d 100%)',
            height: '100%',
            width: `${percentage}%`,
            transition: 'width 0.3s ease',
            borderRadius: '8px'
          }} />
        </div>
        
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: '#374151'
        }}>
          {validCount} van {totalFields} velden correct ingevuld
        </div>
      </div>

      {/* Warning Banner */}
      {showWarning && (
        <div style={{
          background: '#FEF3C7',
          border: '2px solid #F59E0B',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <span style={{
            fontSize: '13px',
            color: '#92400E',
            fontWeight: 600
          }}>
            Bevestig alle velden door ze aan te klikken en een keuze te maken
          </span>
        </div>
      )}
    </>
  )
}
