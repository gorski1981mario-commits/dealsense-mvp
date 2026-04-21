/**
 * ECHO SEARCH API ENDPOINT
 * Proxy do backend SearchAPI - łączy SaverCore z prawdziwymi danymi
 * 
 * Używa istniejącego backend:
 * - /api/market (Google Shopping - produkty)
 * - /api/vacation/search (Google Hotels + Flights - wakacje)
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { intent, query, ...params } = body;

    console.log(`[ECHO Search] Intent: ${intent}, Query: "${query}"`);

    // PRODUCTS - Google Shopping API
    if (intent === 'products') {
      try {
        const response = await fetch(`${BACKEND_URL}/api/market`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            product_name: query,
            ean: params.ean || null
          }),
          signal: AbortSignal.timeout(15000) // 15s timeout
        });

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        
        console.log(`[ECHO Search] Products: ${data.count || 0} offers found`);

        return NextResponse.json({
          success: true,
          intent: 'products',
          query: query,
          count: data.count || 0,
          offers: data.offers || [],
          cached: data.cached || false,
          processingTime: data.processingTime || 0
        });

      } catch (error: any) {
        console.error('[ECHO Search] Products error:', error.message);
        
        return NextResponse.json({
          success: false,
          intent: 'products',
          error: error.message,
          fallback: true
        });
      }
    }

    // VACATION - Google Hotels + Flights API
    if (intent === 'vacation') {
      try {
        const response = await fetch(`${BACKEND_URL}/api/vacation/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            destination: params.destination || query,
            departureDate: params.departureDate || null,
            returnDate: params.returnDate || null,
            adults: params.adults || 2,
            children: params.children || 0,
            hotelClass: params.hotelClass || null,
            board: params.board || null
          }),
          signal: AbortSignal.timeout(30000) // 30s timeout (vacation search is slower)
        });

        if (!response.ok) {
          throw new Error(`Backend error: ${response.status}`);
        }

        const data = await response.json();
        
        console.log(`[ECHO Search] Vacation: ${data.offers?.length || 0} packages found`);

        return NextResponse.json({
          success: true,
          intent: 'vacation',
          query: query,
          offers: data.offers || [],
          basePrice: data.basePrice || null,
          savings: data.savings || null,
          processingTime: data.processingTime || 0
        });

      } catch (error: any) {
        console.error('[ECHO Search] Vacation error:', error.message);
        
        return NextResponse.json({
          success: false,
          intent: 'vacation',
          error: error.message,
          fallback: true
        });
      }
    }

    // UNSUPPORTED INTENT
    return NextResponse.json({
      success: false,
      error: 'Unsupported intent',
      supportedIntents: ['products', 'vacation']
    }, { status: 400 });

  } catch (error: any) {
    console.error('[ECHO Search] Error:', error.message);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
