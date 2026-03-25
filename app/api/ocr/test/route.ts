// OCR Test Endpoint - Test OCR with sample documents
// GET /api/ocr/test

import { NextResponse } from 'next/server'

export async function GET() {
  const sampleDocuments = {
    energy: {
      text: `
ESSENT ENERGIE
Klantnummer: ES-123456789
Factuur datum: 15-03-2026

Maandelijkse kosten
Elektriciteit: €89.50
Gas: €45.30
Totaal: €134.80

Verbruik
Elektriciteit: 350 kWh
Gas: 125 m³

Contract einddatum: 31-12-2026
      `.trim(),
      expectedFields: {
        provider: 'Essent',
        contractNumber: 'ES-123456789',
        monthlyPrice: 134.80,
        monthlyUsage: 350,
        endDate: '31-12-2026'
      }
    },
    telecom: {
      text: `
KPN MOBIEL
Accountnummer: KPN-987654321
Factuurdatum: 15-03-2026

Abonnement kosten
Onbeperkt Bellen & SMS: €15.00
10 GB Data: €20.00
Totaal: €35.00

Uw abonnement
Data: 10 GB
Belminuten: Onbeperkt

Contract loopt tot: 01-06-2026
      `.trim(),
      expectedFields: {
        provider: 'KPN',
        contractNumber: 'KPN-987654321',
        monthlyPrice: 35.00,
        dataGB: 10,
        endDate: '01-06-2026'
      }
    },
    insurance: {
      text: `
AEGON VERZEKERINGEN
Polisnummer: AEG-555666777
Datum: 15-03-2026

Autoverzekering
Premie per maand: €89.95
Type: WA + Casco
Dekking: Volledig

Verzekerde: Jan de Vries
Kenteken: AB-123-CD
      `.trim(),
      expectedFields: {
        provider: 'Aegon',
        policyNumber: 'AEG-555666777',
        monthlyPremium: 89.95,
        insuranceType: 'auto'
      }
    }
  }

  return NextResponse.json({
    success: true,
    message: 'OCR test samples',
    samples: sampleDocuments,
    usage: {
      endpoint: '/api/ocr/scan',
      method: 'POST',
      body: 'FormData with file and userId',
      response: 'OCRResult with fields extracted'
    }
  })
}
