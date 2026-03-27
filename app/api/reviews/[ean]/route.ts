/**
 * API ENDPOINT: /api/reviews/[ean]
 * 
 * GET /api/reviews/8806094934850
 * GET /api/reviews/8806094934850?force=true
 * 
 * Returns AI-analyzed reviews from multiple sources
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ean: string }> }
) {
  const startTime = Date.now();
  const { ean } = await params;
  const forceRefresh = request.nextUrl.searchParams.get('force') === 'true';
  
  try {
    // Call backend reviews module
    const { getReviewsAnalysis } = require('@/server/reviews');
    
    const result = await getReviewsAnalysis(ean, {
      forceRefresh,
      timeout: 6000 // 6s max
    });
    
    if (result.error) {
      return NextResponse.json(
        { 
          error: result.error,
          ean,
          responseTime: Date.now() - startTime
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ...result,
      responseTime: Date.now() - startTime
    });
    
  } catch (error: any) {
    console.error('[API Reviews] Error:', error.message);
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        ean,
        responseTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
