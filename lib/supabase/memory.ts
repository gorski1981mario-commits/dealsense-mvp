/**
 * SUPABASE MEMORY SYSTEM
 * User preferences + conversation history + rate limiting
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })
  : null;

// Log warning if Supabase is not configured
if (!isSupabaseConfigured) {
  console.warn('[Memory] Supabase not configured - memory features disabled');
}

// ============================================
// USER PREFERENCES
// ============================================

export interface UserPreference {
  id?: string;
  user_id: string;
  preference_key: string;
  preference_value: any;
  created_at?: string;
  updated_at?: string;
}

export async function saveUserPreference(
  userId: string,
  key: string,
  value: any
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: true }; // Fallback - no-op when Supabase not configured
  }

  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        preference_key: key,
        preference_value: value,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,preference_key'
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('[Memory] Save preference error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getUserPreference(
  userId: string,
  key: string
): Promise<any | null> {
  if (!supabase) {
    return null; // Fallback
  }

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preference_value')
      .eq('user_id', userId)
      .eq('preference_key', key)
      .single();

    if (error) throw error;

    return data?.preference_value || null;
  } catch (error: any) {
    console.error('[Memory] Get preference error:', error.message);
    return null;
  }
}

export async function getUserPreferences(
  userId: string
): Promise<Record<string, any>> {
  if (!supabase) {
    return {}; // Fallback
  }

  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('preference_key, preference_value')
      .eq('user_id', userId);

    if (error) throw error;

    const preferences: Record<string, any> = {};
    data?.forEach((pref) => {
      preferences[pref.preference_key] = pref.preference_value;
    });

    return preferences;
  } catch (error: any) {
    console.error('[Memory] Get preferences error:', error.message);
    return {};
  }
}

// ============================================
// CONVERSATION HISTORY
// ============================================

export interface ConversationMessage {
  id?: string;
  user_id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  method?: string;
  metadata?: any;
  created_at?: string;
}

export async function saveConversationMessage(
  userId: string,
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  intent?: string,
  method?: string,
  metadata?: any
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: true }; // Fallback
  }

  try {
    const { error } = await supabase
      .from('conversation_history')
      .insert({
        user_id: userId,
        session_id: sessionId,
        role,
        content,
        intent,
        method,
        metadata
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('[Memory] Save message error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getConversationHistory(
  userId: string,
  sessionId: string,
  limit: number = 10
): Promise<ConversationMessage[]> {
  if (!supabase) {
    return []; // Fallback
  }

  try {
    const { data, error } = await supabase
      .from('conversation_history')
      .select('*')
      .eq('user_id', userId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).reverse(); // Oldest first
  } catch (error: any) {
    console.error('[Memory] Get history error:', error.message);
    return [];
  }
}

// ============================================
// USAGE TRACKING
// ============================================

export interface UsageRecord {
  user_id: string;
  package: 'FREE' | 'PLUS' | 'PRO' | 'FINANCE';
  request_type: string;
  method: string;
  tokens_used?: number;
  cost_usd?: number;
}

export async function trackUsage(
  userId: string,
  packageType: 'FREE' | 'PLUS' | 'PRO' | 'FINANCE',
  requestType: string,
  method: string,
  tokensUsed: number = 0,
  costUsd: number = 0
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: true }; // Fallback
  }

  try {
    const yearMonth = new Date().toISOString().slice(0, 7); // '2026-04'

    const { error } = await supabase
      .from('echo_usage')
      .insert({
        user_id: userId,
        package: packageType,
        request_type: requestType,
        method,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        year_month: yearMonth
      });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('[Memory] Track usage error:', error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// RATE LIMITING
// ============================================

export interface RateLimitCheck {
  allowed: boolean;
  reason: string;
  daily_usage: {
    total_requests: number;
    gemini_requests: number;
    total_cost_usd: number;
  };
  monthly_usage: {
    total_requests: number;
    gemini_requests: number;
    total_cost_usd: number;
  };
  quotas: {
    package: string;
    echo_requests_per_day: number;
    echo_requests_per_month: number;
    gemini_requests_per_day: number;
    gemini_requests_per_month: number;
    max_cost_per_day_usd: number;
    max_cost_per_month_usd: number;
  };
}

export async function canUserMakeRequest(
  userId: string,
  packageType: 'FREE' | 'PLUS' | 'PRO' | 'FINANCE',
  method: string
): Promise<RateLimitCheck> {
  if (!supabase) {
    // Fallback - allow all requests when Supabase not configured
    return {
      allowed: true,
      reason: 'Supabase not configured, rate limiting disabled',
      daily_usage: { total_requests: 0, gemini_requests: 0, total_cost_usd: 0 },
      monthly_usage: { total_requests: 0, gemini_requests: 0, total_cost_usd: 0 },
      quotas: {
        package: packageType,
        echo_requests_per_day: 1000,
        echo_requests_per_month: 20000,
        gemini_requests_per_day: 100,
        gemini_requests_per_month: 1000,
        max_cost_per_day_usd: 10,
        max_cost_per_month_usd: 100
      }
    };
  }

  try {
    const { data, error } = await supabase
      .rpc('can_user_make_request', {
        p_user_id: userId,
        p_package: packageType,
        p_method: method
      })
      .single();

    if (error) throw error;

    return data as RateLimitCheck;
  } catch (error: any) {
    console.error('[Memory] Rate limit check error:', error.message);
    
    // Fallback - allow request but log error
    return {
      allowed: true,
      reason: 'Rate limit check failed, allowing request',
      daily_usage: { total_requests: 0, gemini_requests: 0, total_cost_usd: 0 },
      monthly_usage: { total_requests: 0, gemini_requests: 0, total_cost_usd: 0 },
      quotas: {
        package: packageType,
        echo_requests_per_day: 1000,
        echo_requests_per_month: 20000,
        gemini_requests_per_day: 100,
        gemini_requests_per_month: 1000,
        max_cost_per_day_usd: 10,
        max_cost_per_month_usd: 100
      }
    };
  }
}

export async function getUserUsageStats(
  userId: string,
  packageType: 'FREE' | 'PLUS' | 'PRO' | 'FINANCE'
): Promise<{
  today: { total_requests: number; gemini_requests: number; total_cost_usd: number };
  month: { total_requests: number; gemini_requests: number; total_cost_usd: number };
}> {
  try {
    // Get today's usage
    const { data: todayData, error: todayError } = await supabase
      .rpc('get_user_usage_today', {
        p_user_id: userId,
        p_package: packageType
      })
      .single();

    if (todayError) throw todayError;

    // Get month's usage
    const { data: monthData, error: monthError } = await supabase
      .rpc('get_user_usage_month', {
        p_user_id: userId,
        p_package: packageType
      })
      .single();

    if (monthError) throw monthError;

    return {
      today: todayData ? todayData : { total_requests: 0, gemini_requests: 0, total_cost_usd: 0 },
      month: monthData ? monthData : { total_requests: 0, gemini_requests: 0, total_cost_usd: 0 }
    };
  } catch (error: any) {
    console.error('[Memory] Get usage stats error:', error.message);
    return {
      today: { total_requests: 0, gemini_requests: 0, total_cost_usd: 0 },
      month: { total_requests: 0, gemini_requests: 0, total_cost_usd: 0 }
    };
  }
}
