/**
 * ECHO Chat API Endpoint
 * Integracja ECHO Core z DealSense
 * 
 * POWERED BY: HYBRID (SaverCore + Gemini 1.5 Flash + Supabase Memory)
 * 
 * ARCHITEKTURA:
 * - Memory System (Supabase) - user preferences + conversation history
 * - Rate Limiting (per package) - bezpieczniki na koszty
 * - Router (keyword-based) - decyduje intent
 * - SaverCore (products/vacation) - real data z backend
 * - Gemini 1.5 Flash (general) - natural language understanding
 * 
 * ZAKRES: SZEROKI (pełny potencjał)
 * - Core competence: Finanse, zakupy, oszczędności
 * - General: Strategia, planowanie, życie, nauka, zdrowie, wszystko
 * - Forbidden: Kod, porno, przemoc, nielegalne
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getUserPreferences,
  getConversationHistory,
  saveConversationMessage,
  canUserMakeRequest,
  trackUsage
} from '@/lib/supabase/memory';
import { callGemini } from '@/lib/gemini/client';

// Import SaverCore
const { SaverCore } = require('@/echo-liveos/src/core/SaverCore');

// Initialize SaverCore (singleton)
let saverCoreInstance: any = null;

function getSaverCore() {
  if (!saverCoreInstance) {
    saverCoreInstance = new SaverCore({
      enableCache: true,
      cacheSize: 10000,
      cacheTTL: 3600000,  // 1h
      routerTimeout: 2000,
      specialistTimeout: 5000
    });
  }
  return saverCoreInstance;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let body: any;
  
  try {
    body = await request.json();
    const { message, userId, sessionId, packageType = 'FREE' } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({
        success: false,
        error: 'Message is required',
        fallbackResponse: 'Sorry, ik heb geen bericht ontvangen.'
      }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { status: 400 });
    }

    console.log(`[ECHO Chat] ${userId} (${packageType}): "${message}"`);

    // ============================================
    // 1. LOAD MEMORY (preferences + history)
    // ============================================
    const [preferences, history] = await Promise.all([
      getUserPreferences(userId),
      getConversationHistory(userId, sessionId || 'default', 10)
    ]);

    console.log(`[ECHO Chat] Loaded ${Object.keys(preferences).length} preferences, ${history.length} history messages`);

    // ============================================
    // 2. ROUTE (determine intent + method)
    // ============================================
    const saverCore = getSaverCore();
    const routing = await saverCore.router.route(message);
    
    console.log(`[ECHO Chat] Routed to: ${routing.intent} (confidence: ${routing.confidence})`);

    // Determine method (real_data, template, or gemini)
    let method = 'template';
    if (routing.intent === 'products' || routing.intent === 'vacation') {
      method = 'real_data';
    } else if (routing.intent === 'general' || routing.confidence < 0.6) {
      method = 'gemini';
    }

    console.log(`[ECHO Chat] Method: ${method}`);

    // ============================================
    // 3. RATE LIMITING (check before processing)
    // ============================================
    const rateLimitCheck = await canUserMakeRequest(userId, packageType, method);

    if (!rateLimitCheck.allowed) {
      console.log(`[ECHO Chat] Rate limit exceeded: ${rateLimitCheck.reason}`);
      
      return NextResponse.json({
        success: false,
        error: 'Rate limit exceeded',
        reason: rateLimitCheck.reason,
        usage: {
          today: rateLimitCheck.daily_usage,
          month: rateLimitCheck.monthly_usage
        },
        quotas: rateLimitCheck.quotas
      }, { status: 429 });
    }

    console.log(`[ECHO Chat] Rate limit OK - Today: ${rateLimitCheck.daily_usage.total_requests}/${rateLimitCheck.quotas.echo_requests_per_day}`);

    // ============================================
    // 4. PROCESS (SaverCore or Gemini)
    // ============================================
    let responseText: string;
    let tokensUsed = 0;
    let costUsd = 0;

    if (method === 'real_data' || method === 'template') {
      // Use SaverCore (products/vacation with real data, or templates)
      const result = await saverCore.process(message, { userId, sessionId, preferences, history });
      responseText = result.response;
      
      console.log(`[ECHO Chat] SaverCore response (${result.method}): ${responseText.substring(0, 100)}...`);
    } else {
      // Use Gemini 1.5 Flash (general queries)
      const geminiResult = await callGemini(message, preferences, history);
      responseText = geminiResult.text;
      tokensUsed = geminiResult.tokensUsed.total;
      costUsd = geminiResult.costUsd;
      
      console.log(`[ECHO Chat] Gemini response: ${responseText.substring(0, 100)}... (tokens: ${tokensUsed}, cost: $${costUsd.toFixed(6)})`);
    }

    // ============================================
    // 5. SAVE TO MEMORY
    // ============================================
    await Promise.all([
      saveConversationMessage(userId, sessionId || 'default', 'user', message, routing.intent, method),
      saveConversationMessage(userId, sessionId || 'default', 'assistant', responseText, routing.intent, method)
    ]);

    // ============================================
    // 6. TRACK USAGE (for rate limiting + analytics)
    // ============================================
    await trackUsage(userId, packageType, routing.intent, method, tokensUsed, costUsd);

    const processingTime = Date.now() - startTime;

    console.log(`[ECHO Chat] Completed in ${processingTime}ms`);

    // ============================================
    // 7. RETURN RESPONSE
    // ============================================
    return NextResponse.json({
      success: true,
      response: responseText,
      confidence: routing.confidence || 0.8,
      ethicalScore: 1.0,
      suggestions: getSuggestions(routing.intent),
      scope: mapIntentToScope(routing.intent),
      intent: routing.intent,
      method: method,
      processingTime: processingTime,
      usage: {
        today: rateLimitCheck.daily_usage,
        month: rateLimitCheck.monthly_usage
      }
    });

  } catch (error: any) {
    console.error('[ECHO Chat] Error:', error.message);
    console.error('[ECHO Chat] Stack:', error.stack);
    
    // Fallback
    return NextResponse.json({
      success: true,
      response: 'Sorry, ik kan je vraag nu niet beantwoorden. Probeer het opnieuw of neem contact op met support.',
      confidence: 0.3,
      ethicalScore: 1.0,
      suggestions: [
        'Hoe werkt DealSense?',
        'Welke pakketten zijn er?',
        'Help me met mijn strategie'
      ],
      scope: 'general',
      intent: 'error',
      method: 'fallback',
      error: true,
      errorMessage: error.message
    });
  }
}

/**
 * Map intent to scope
 */
function mapIntentToScope(intent: string): 'core' | 'general' | 'forbidden' {
  const coreIntents = ['products', 'vacation', 'insurance', 'telecom', 'energy', 'mortgage', 'loan', 'creditcard', 'subscriptions'];
  
  if (coreIntents.includes(intent)) {
    return 'core';
  }
  
  return 'general';
}

/**
 * Get suggestions based on intent
 */
function getSuggestions(intent: string): string[] {
  const suggestionMap: { [key: string]: string[] } = {
    products: [
      'Hoe werkt de scanner?',
      'Welke producten kan ik scannen?',
      'Hoeveel kan ik besparen?'
    ],
    vacation: [
      'Zoek hotels in Barcelona',
      'Vergelijk vluchten naar Spanje',
      'Beste vakantiedeals'
    ],
    insurance: [
      'Autoverzekering vergelijken',
      'Zorgverzekering opties',
      'Beste verzekering voor mij'
    ],
    telecom: [
      'Goedkope telefoon abonnementen',
      'Internet vergelijken',
      'Beste mobiele deal'
    ],
    energy: [
      'Energie contract vergelijken',
      'Goedkope stroomleverancier',
      'Gas en licht deals'
    ],
    mortgage: [
      'Hypotheek rente vergelijken',
      'Beste hypotheek voor mij',
      'Hypotheek berekenen'
    ],
    loan: [
      'Persoonlijke lening vergelijken',
      'Beste lening rente',
      'Lening aanvragen'
    ],
    creditcard: [
      'Creditcard vergelijken',
      'Beste creditcard voordelen',
      'Creditcard aanvragen'
    ],
    subscriptions: [
      'Abonnement opzeggen',
      'Abonnementen vergelijken',
      'Kosten besparen'
    ],
    general: [
      'Hoe kan ik meer besparen?',
      'Help me met mijn strategie',
      'Denk met me mee'
    ]
  };
  
  return suggestionMap[intent] || suggestionMap.general;
}

// SaverCore handles all processing internally
// No need for separate GPT-4 or fallback functions
