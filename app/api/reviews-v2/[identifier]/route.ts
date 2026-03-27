/**
 * API ENDPOINT V2: /api/reviews-v2/[identifier]
 * 
 * UNIWERSALNY - działa na WSZYSTKO:
 * - Produkty (EAN, URL, nazwa)
 * - Usługi (nazwa, URL)
 * - Miejsca (nazwa, adres)
 * 
 * GET /api/reviews-v2/8806094934850
 * GET /api/reviews-v2/8806094934850?category=electronics
 * GET /api/reviews-v2/iPhone%2015%20Pro?category=electronics
 * GET /api/reviews-v2/Aegon%20autoverzekering?category=insurance
 * 
 * Returns AI-analyzed reviews from multiple sources
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const startTime = Date.now();
  const { identifier } = await params;
  const category = request.nextUrl.searchParams.get('category') || null;
  const forceRefresh = request.nextUrl.searchParams.get('force') === 'true';
  
  try {
    // Call backend reviews module V2
    const { getReviewsAnalysis } = require('@/server/reviews');
    
    const result = await getReviewsAnalysis(identifier, {
      category,
      forceRefresh,
      timeout: 8000 // 8s max (więcej źródeł = więcej czasu)
    });
    
    if (result.error) {
      return NextResponse.json(
        { 
          error: result.error,
          identifier,
          category: result.category || category,
          responseTime: Date.now() - startTime
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      ...result,
      responseTime: Date.now() - startTime,
      api_version: 'v2',
      truth_database: 'DealSense Truth Database - prawdziwe opinie, zero fejków'
    });
    
  } catch (error: any) {
    console.error('[API Reviews V2] Error:', error.message);
    
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        identifier,
        category,
        responseTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Submit user review (crowdsourcing)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ identifier: string }> }
) {
  const startTime = Date.now();
  const { identifier } = await params;
  
  try {
    const body = await request.json();
    const { submitUserReview } = require('@/server/reviews/crowdsourcing');
    
    const result = await submitUserReview(body.userId, {
      identifier,
      category: body.category,
      rating: body.rating,
      text: body.text,
      pros: body.pros,
      cons: body.cons,
      verified: body.verified
    });
    
    return NextResponse.json({
      ...result,
      responseTime: Date.now() - startTime
    });
    
  } catch (error: any) {
    console.error('[API Reviews V2] Submit error:', error.message);
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to submit review',
        identifier,
        responseTime: Date.now() - startTime
      },
      { status: 400 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
