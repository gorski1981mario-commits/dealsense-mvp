import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, category } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Query is verplicht' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      query,
      category,
      results: [],
      message: 'Query verwerkt'
    })

  } catch (error) {
    return NextResponse.json({ error: 'Server fout' }, { status: 500 })
  }
}

