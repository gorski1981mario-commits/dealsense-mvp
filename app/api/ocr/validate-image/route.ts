// Image Quality Validation - PRZED OCR
// Odrzuca bardzo złe zdjęcia (rozmazane, ciemne, pogięte)

import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

export const runtime = 'nodejs'

interface ValidationResult {
  isValid: boolean
  quality: 'excellent' | 'good' | 'acceptable' | 'poor' | 'rejected'
  score: number
  issues: string[]
  suggestions: string[]
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        isValid: false,
        quality: 'rejected',
        score: 0,
        issues: ['No file provided'],
        suggestions: []
      } as ValidationResult, { status: 400 })
    }

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate image quality
    const validation = await validateImageQuality(buffer)

    return NextResponse.json(validation)

  } catch (error) {
    console.error('Image validation error:', error)
    return NextResponse.json({
      isValid: false,
      quality: 'rejected',
      score: 0,
      issues: ['Validation failed'],
      suggestions: ['Try uploading a different image']
    } as ValidationResult, { status: 500 })
  }
}

/**
 * Validate image quality using multiple checks
 */
async function validateImageQuality(buffer: Buffer): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    quality: 'excellent',
    score: 100,
    issues: [],
    suggestions: []
  }

  try {
    const image = sharp(buffer)
    const metadata = await image.metadata()
    const stats = await image.stats()

    // 1. CHECK RESOLUTION
    const minWidth = 800
    const minHeight = 600
    
    if (!metadata.width || !metadata.height) {
      result.issues.push('Nie można odczytać rozmiaru zdjęcia')
      result.score -= 50
    } else if (metadata.width < minWidth || metadata.height < minHeight) {
      result.issues.push(`Zdjęcie za małe (${metadata.width}×${metadata.height}px)`)
      result.suggestions.push(`Minimalna rozdzielczość: ${minWidth}×${minHeight}px`)
      result.score -= 30
    }

    // 2. CHECK BRIGHTNESS (too dark or too bright)
    const brightness = calculateBrightness(stats)
    
    if (brightness < 30) {
      result.issues.push('Zdjęcie za ciemne')
      result.suggestions.push('Zrób zdjęcie przy lepszym oświetleniu')
      result.score -= 25
    } else if (brightness > 220) {
      result.issues.push('Zdjęcie prześwietlone')
      result.suggestions.push('Zmniejsz oświetlenie lub wyłącz flesz')
      result.score -= 20
    }

    // 3. CHECK CONTRAST (low contrast = blurry/faded)
    const contrast = calculateContrast(stats)
    
    if (contrast < 20) {
      result.issues.push('Zbyt niski kontrast (rozmazane lub wyblakłe)')
      result.suggestions.push('Zrób ostrzejsze zdjęcie')
      result.score -= 30
    }

    // 4. CHECK BLUR (using Laplacian variance)
    const blurScore = await detectBlur(buffer)
    
    if (blurScore < 100) {
      result.issues.push('Zdjęcie rozmazane')
      result.suggestions.push('Ustabilizuj telefon i zrób wyraźne zdjęcie')
      result.score -= 35
    } else if (blurScore < 200) {
      result.issues.push('Zdjęcie lekko rozmazane')
      result.suggestions.push('Spróbuj zrobić ostrzejsze zdjęcie')
      result.score -= 15
    }

    // 5. CHECK SKEW/ROTATION (using edge detection)
    const skewAngle = await detectSkew(buffer)
    
    if (Math.abs(skewAngle) > 15) {
      result.issues.push(`Zdjęcie przekrzywione (${Math.round(skewAngle)}°)`)
      result.suggestions.push('Trzymaj telefon prosto nad dokumentem')
      result.score -= 20
    } else if (Math.abs(skewAngle) > 5) {
      result.issues.push('Zdjęcie lekko przekrzywione')
      result.suggestions.push('Spróbuj trzymać telefon bardziej prosto')
      result.score -= 10
    }

    // 6. CHECK FILE SIZE (too small = compressed/low quality)
    const fileSizeKB = buffer.length / 1024
    
    if (fileSizeKB < 50) {
      result.issues.push('Plik za mały (zbyt mocno skompresowany)')
      result.suggestions.push('Użyj wyższej jakości zdjęcia')
      result.score -= 20
    }

    // DETERMINE QUALITY LEVEL
    if (result.score >= 80) {
      result.quality = 'excellent'
    } else if (result.score >= 65) {
      result.quality = 'good'
    } else if (result.score >= 50) {
      result.quality = 'acceptable'
    } else if (result.score >= 30) {
      result.quality = 'poor'
    } else {
      result.quality = 'rejected'
      result.isValid = false
    }

    // REJECT if score too low
    if (result.score < 30) {
      result.isValid = false
      result.suggestions.unshift('❌ Zdjęcie zbyt słabej jakości - zrób nowe zdjęcie')
    }

    console.log(`Image quality: ${result.quality} (${result.score}/100)`)

    return result

  } catch (error) {
    console.error('Quality check error:', error)
    return {
      isValid: false,
      quality: 'rejected',
      score: 0,
      issues: ['Błąd analizy zdjęcia'],
      suggestions: ['Spróbuj innego zdjęcia']
    }
  }
}

/**
 * Calculate average brightness (0-255)
 */
function calculateBrightness(stats: sharp.Stats): number {
  const channels = stats.channels
  const avgBrightness = channels.reduce((sum, ch) => sum + ch.mean, 0) / channels.length
  return avgBrightness
}

/**
 * Calculate contrast (standard deviation)
 */
function calculateContrast(stats: sharp.Stats): number {
  const channels = stats.channels
  const avgStdDev = channels.reduce((sum, ch) => sum + ch.stdev, 0) / channels.length
  return avgStdDev
}

/**
 * Detect blur using Laplacian variance
 * Higher = sharper, Lower = blurrier
 */
async function detectBlur(buffer: Buffer): Promise<number> {
  try {
    // Convert to grayscale and get raw pixels
    const { data, info } = await sharp(buffer)
      .resize(800, 800, { fit: 'inside' })
      .grayscale()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Calculate Laplacian variance (edge detection)
    let variance = 0
    const width = info.width
    const height = info.height

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x
        
        // Laplacian kernel
        const laplacian = 
          -1 * data[idx - width - 1] + -1 * data[idx - width] + -1 * data[idx - width + 1] +
          -1 * data[idx - 1] + 8 * data[idx] + -1 * data[idx + 1] +
          -1 * data[idx + width - 1] + -1 * data[idx + width] + -1 * data[idx + width + 1]
        
        variance += laplacian * laplacian
      }
    }

    variance = variance / ((width - 2) * (height - 2))

    return variance

  } catch (error) {
    console.error('Blur detection error:', error)
    return 0
  }
}

/**
 * Detect skew angle (rotation)
 * Returns angle in degrees (-45 to +45)
 */
async function detectSkew(buffer: Buffer): Promise<number> {
  try {
    // Simplified skew detection using edge analysis
    // In production, use Hough transform or similar
    
    const { data, info } = await sharp(buffer)
      .resize(800, 800, { fit: 'inside' })
      .grayscale()
      .threshold(128)
      .raw()
      .toBuffer({ resolveWithObject: true })

    // For now, return 0 (no skew)
    // TODO: Implement proper Hough line detection
    return 0

  } catch (error) {
    console.error('Skew detection error:', error)
    return 0
  }
}

