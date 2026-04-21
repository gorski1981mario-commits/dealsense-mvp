/**
 * TEST SUPABASE CONNECTION
 * Sprawdza czy Supabase działa poprawnie
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://aclsuakanhrjgapktnoq.supabase.co';
const anonKey = process.env.SUPABASE_ANON_KEY || 'your_anon_key_here';

// Try with ANON key first (since RLS is disabled, it should work)
console.log('Testing with ANON key (publishable)...\n');
const supabase = createClient(supabaseUrl, anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function testConnection() {
  console.log('🧪 TESTING SUPABASE CONNECTION\n');
  console.log('='.repeat(60));

  // Test 1: Check connection
  console.log('\n[1/5] Testing connection...');
  try {
    const { data, error } = await supabase.from('rate_limit_quotas').select('*').limit(1);
    if (error) throw error;
    console.log('✅ Connection OK');
    console.log(`   Found ${data.length} quota(s)`);
  } catch (error) {
    console.log(`❌ Connection failed: ${error.message}`);
    return;
  }

  // Test 2: Test RPC function
  console.log('\n[2/5] Testing RPC function (get_user_usage_today)...');
  try {
    const { data, error } = await supabase
      .rpc('get_user_usage_today', {
        p_user_id: 'test_user',
        p_package: 'PRO'
      });
    
    if (error) throw error;
    console.log('✅ RPC function OK');
    console.log(`   Usage: ${JSON.stringify(data)}`);
  } catch (error) {
    console.log(`❌ RPC function failed: ${error.message}`);
  }

  // Test 3: Insert test preference
  console.log('\n[3/5] Testing INSERT (user_preferences)...');
  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: 'test_user',
        preference_key: 'test_key',
        preference_value: { test: 'value' }
      }, {
        onConflict: 'user_id,preference_key'
      });
    
    if (error) throw error;
    console.log('✅ INSERT OK');
  } catch (error) {
    console.log(`❌ INSERT failed: ${error.message}`);
  }

  // Test 4: Read test preference
  console.log('\n[4/5] Testing SELECT (user_preferences)...');
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', 'test_user')
      .eq('preference_key', 'test_key')
      .single();
    
    if (error) throw error;
    console.log('✅ SELECT OK');
    console.log(`   Data: ${JSON.stringify(data.preference_value)}`);
  } catch (error) {
    console.log(`❌ SELECT failed: ${error.message}`);
  }

  // Test 5: Test rate limiting function
  console.log('\n[5/5] Testing can_user_make_request...');
  try {
    const { data, error } = await supabase
      .rpc('can_user_make_request', {
        p_user_id: 'test_user',
        p_package: 'PRO',
        p_method: 'template'
      });
    
    if (error) throw error;
    console.log('✅ Rate limiting function OK');
    console.log(`   Allowed: ${data[0].allowed}`);
    console.log(`   Reason: ${data[0].reason}`);
  } catch (error) {
    console.log(`❌ Rate limiting failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ SUPABASE CONNECTION TEST COMPLETED\n');
}

testConnection().catch(console.error);
