// OCR Feedback Loop API
// Saves user corrections to improve OCR accuracy over time

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

interface FeedbackEntry {
  documentType: string
  corrections: Record<string, { original: any; corrected: any }>
  timestamp: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { documentType, corrections, timestamp } = body

    if (!documentType || !corrections) {
      return NextResponse.json({
        success: false,
        error: 'Missing documentType or corrections'
      }, { status: 400 })
    }

    // Save to feedback log
    const feedbackEntry: FeedbackEntry = {
      documentType,
      corrections,
      timestamp: timestamp || Date.now()
    }

    // Append to JSONL file (one JSON per line)
    const feedbackPath = path.join(process.cwd(), 'ocr-feedback.jsonl')
    const line = JSON.stringify(feedbackEntry) + '\n'

    fs.appendFileSync(feedbackPath, line, 'utf8')

    console.log(`✓ OCR Feedback saved: ${Object.keys(corrections).length} corrections for ${documentType}`)

    // Analyze patterns (for future ML training)
    const patterns = analyzeCorrections(corrections)

    return NextResponse.json({
      success: true,
      message: 'Feedback saved',
      corrections: Object.keys(corrections).length,
      patterns
    })

  } catch (error) {
    console.error('Feedback save error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save feedback'
    }, { status: 500 })
  }
}

/**
 * Analyze correction patterns for ML training
 */
function analyzeCorrections(corrections: Record<string, { original: any; corrected: any }>): {
  commonErrors: string[]
  suggestions: string[]
} {
  const patterns = {
    commonErrors: [] as string[],
    suggestions: [] as string[]
  }

  Object.entries(corrections).forEach(([field, { original, corrected }]) => {
    const originalStr = String(original).toLowerCase()
    const correctedStr = String(corrected).toLowerCase()

    // Detect common OCR errors
    if (originalStr.includes('0') && correctedStr.includes('o')) {
      patterns.commonErrors.push('Confused 0 with O')
      patterns.suggestions.push('Improve number recognition')
    }

    if (originalStr.includes('1') && correctedStr.includes('l')) {
      patterns.commonErrors.push('Confused 1 with l')
      patterns.suggestions.push('Better digit/letter distinction')
    }

    if (originalStr.includes('5') && correctedStr.includes('s')) {
      patterns.commonErrors.push('Confused 5 with S')
      patterns.suggestions.push('Improve number recognition')
    }

    // Detect date format issues
    if (field.toLowerCase().includes('date')) {
      if (originalStr.includes('/') !== correctedStr.includes('/')) {
        patterns.commonErrors.push('Date separator confusion')
        patterns.suggestions.push('Normalize date formats')
      }
    }

    // Detect price issues
    if (field.toLowerCase().includes('price') || field.toLowerCase().includes('amount')) {
      const originalNum = parseFloat(originalStr.replace(/[^\d.,]/g, ''))
      const correctedNum = parseFloat(correctedStr.replace(/[^\d.,]/g, ''))
      
      if (Math.abs(originalNum - correctedNum) > 10) {
        patterns.commonErrors.push('Significant price difference')
        patterns.suggestions.push('Better decimal point detection')
      }
    }
  })

  return patterns
}

/**
 * GET: Retrieve feedback statistics
 */
export async function GET() {
  try {
    const feedbackPath = path.join(process.cwd(), 'ocr-feedback.jsonl')

    if (!fs.existsSync(feedbackPath)) {
      return NextResponse.json({
        success: true,
        totalFeedback: 0,
        byDocumentType: {},
        commonErrors: []
      })
    }

    const content = fs.readFileSync(feedbackPath, 'utf8')
    const lines = content.trim().split('\n').filter(l => l)
    const entries: FeedbackEntry[] = lines.map(l => JSON.parse(l))

    // Aggregate statistics
    const stats = {
      totalFeedback: entries.length,
      byDocumentType: {} as Record<string, number>,
      commonErrors: [] as string[],
      totalCorrections: 0
    }

    entries.forEach(entry => {
      stats.byDocumentType[entry.documentType] = 
        (stats.byDocumentType[entry.documentType] || 0) + 1
      
      stats.totalCorrections += Object.keys(entry.corrections).length

      // Collect common errors
      const patterns = analyzeCorrections(entry.corrections)
      stats.commonErrors.push(...patterns.commonErrors)
    })

    // Count error frequencies
    const errorCounts: Record<string, number> = {}
    stats.commonErrors.forEach(error => {
      errorCounts[error] = (errorCounts[error] || 0) + 1
    })

    // Top 5 most common errors
    const topErrors = Object.entries(errorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }))

    return NextResponse.json({
      success: true,
      ...stats,
      topErrors,
      avgCorrectionsPerDocument: (stats.totalCorrections / stats.totalFeedback).toFixed(2)
    })

  } catch (error) {
    console.error('Feedback stats error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get stats'
    }, { status: 500 })
  }
}

