'use client'

import jsPDF from 'jspdf'
import 'jspdf-autotable'

interface ConfigurationData {
  configId: string
  userId: string
  sector: string
  userProfile?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    postcode?: string
    houseNumber?: string
    street?: string
    city?: string
  }
  parameters: Record<string, any>
  timestamp: string
}

export const generateConfigurationPDF = (config: ConfigurationData) => {
  const doc = new jsPDF()
  
  // Header - DealSense.nl branding
  doc.setFillColor(30, 127, 92) // #1E7F5C - DealSense green
  doc.rect(0, 0, 210, 40, 'F')
  
  // Logo text "D.nl"
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('D.nl', 15, 25)
  
  // Full name
  doc.setFontSize(14)
  doc.setFont('helvetica', 'normal')
  doc.text('DealSense.nl', 15, 33)
  
  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('DOWÓD KONFIGURACJI', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Oficjalny dokument potwierdzający parametry', 105, 28, { align: 'center' })
  
  // Configuration details
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  
  let yPos = 50
  
  // Configuration ID
  doc.text('Configuration ID:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(config.configId, 70, yPos)
  
  yPos += 8
  
  // Date
  doc.setFont('helvetica', 'bold')
  doc.text('Data utworzenia:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  const date = new Date(config.timestamp)
  doc.text(date.toLocaleString('nl-NL', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }), 70, yPos)
  
  yPos += 8
  
  // User ID
  doc.setFont('helvetica', 'bold')
  doc.text('User ID:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(config.userId, 70, yPos)
  
  yPos += 8
  
  // Sector
  doc.setFont('helvetica', 'bold')
  doc.text('Sektor:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(getSectorName(config.sector), 70, yPos)
  
  yPos += 15
  
  // Separator line
  doc.setDrawColor(229, 231, 235) // #E5E7EB
  doc.setLineWidth(0.5)
  doc.line(15, yPos, 195, yPos)
  
  yPos += 10
  
  // Parameters section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 127, 92)
  doc.text('PARAMETRY KONFIGURACJI', 15, yPos)
  
  yPos += 10
  
  // Parameters table
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(10)
  
  const tableData = Object.entries(config.parameters).map(([key, value]) => [
    formatParameterName(key),
    formatParameterValue(value)
  ])
  
  ;(doc as any).autoTable({
    startY: yPos,
    head: [['Parameter', 'Waarde']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 127, 92],
      textColor: [255, 255, 255],
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    alternateRowStyles: {
      fillColor: [247, 249, 248]
    }
  })
  
  // Footer
  const finalY = (doc as any).lastAutoTable.finalY + 20
  
  doc.setDrawColor(229, 231, 235)
  doc.line(15, finalY, 195, finalY)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(107, 114, 128)
  doc.text(
    'Ten dokument dient als bewijs van de geconfigureerde parameters',
    105,
    finalY + 8,
    { align: 'center' }
  )
  doc.text(
    'en kan worden gebruikt bij het afsluiten van een contract.',
    105,
    finalY + 14,
    { align: 'center' }
  )
  
  // Bottom branding
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(30, 127, 92)
  doc.text('DealSense B.V.', 105, finalY + 25, { align: 'center' })
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('www.dealsense.nl', 105, finalY + 30, { align: 'center' })
  
  // Save PDF
  doc.save(`dowod-konfiguracji-${config.configId}.pdf`)
}

// Helper functions
const getSectorName = (sector: string): string => {
  const sectorNames: Record<string, string> = {
    energy: 'Energie',
    insurance: 'Verzekering',
    telecom: 'Telecom',
    mortgage: 'Hypotheek',
    loan: 'Lening',
    leasing: 'Leasing',
    creditcard: 'Creditcard',
    vacation: 'Vakantie'
  }
  return sectorNames[sector] || sector
}

const formatParameterName = (key: string): string => {
  const nameMap: Record<string, string> = {
    energyType: 'Type energie',
    electricityUsage: 'Stroomverbruik',
    gasUsage: 'Gasverbruik',
    contractType: 'Contract type',
    postcode: 'Postcode',
    houseNumber: 'Huisnummer',
    greenEnergy: 'Groene energie',
    solarPanels: 'Zonnepanelen',
    smartMeter: 'Slimme meter',
    insuranceType: 'Type verzekering',
    coverage: 'Dekking',
    age: 'Leeftijd',
    bonusMalus: 'Bonus-malus',
    vehicleValue: 'Waarde voertuig',
    // Add more mappings as needed
  }
  return nameMap[key] || key
}

const formatParameterValue = (value: any): string => {
  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nee'
  }
  if (typeof value === 'number') {
    return value.toString()
  }
  return String(value)
}

export default generateConfigurationPDF
