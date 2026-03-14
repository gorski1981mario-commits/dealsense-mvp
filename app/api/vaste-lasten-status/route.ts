import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { energy, internet, mobile, insurance, tv } = body

    const total = (parseFloat(energy) || 0) + (parseFloat(internet) || 0) + 
                  (parseFloat(mobile) || 0) + (parseFloat(insurance) || 0) + 
                  (parseFloat(tv) || 0)

    const potentialSavings = total * 0.15

    return NextResponse.json({
      success: true,
      total,
      potentialSavings,
      yearlyTotal: total * 12,
      yearlySavings: potentialSavings * 12,
      recommendations: [
        { category: 'Energie', currentAvg: energy, bestPrice: parseFloat(energy) * 0.85 },
        { category: 'Internet', currentAvg: internet, bestPrice: parseFloat(internet) * 0.90 }
      ]
    })

  } catch (error) {
    return NextResponse.json({ error: 'Server fout' }, { status: 500 })
  }
}
