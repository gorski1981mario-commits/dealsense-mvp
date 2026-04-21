/**
 * CHECK MEMORY DATA IN SUPABASE
 * Sprawdza czy dane są zapisane w bazie
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aclsuakanhrjgapktnoq.supabase.co';
const anonKey = 'sb_publishable_DtO4_R1AMu17ipnbqB6cUw_Z64qmr73';

const supabase = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function checkData() {
  console.log('🔍 CHECKING MEMORY DATA IN SUPABASE\n');
  console.log('='.repeat(60));

  // Check conversation_history
  console.log('\n[1/3] Conversation History:');
  const { data: history, error: historyError } = await supabase
    .from('conversation_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (historyError) {
    console.log(`❌ Error: ${historyError.message}`);
  } else {
    console.log(`✅ Found ${history.length} messages`);
    history.forEach((msg, i) => {
      console.log(`   ${i + 1}. [${msg.role}] ${msg.content.substring(0, 50)}... (${msg.intent}, ${msg.method})`);
    });
  }

  // Check user_preferences
  console.log('\n[2/3] User Preferences:');
  const { data: prefs, error: prefsError } = await supabase
    .from('user_preferences')
    .select('*')
    .limit(5);

  if (prefsError) {
    console.log(`❌ Error: ${prefsError.message}`);
  } else {
    console.log(`✅ Found ${prefs.length} preferences`);
    prefs.forEach((pref, i) => {
      console.log(`   ${i + 1}. ${pref.user_id}: ${pref.preference_key} = ${JSON.stringify(pref.preference_value)}`);
    });
  }

  // Check echo_usage
  console.log('\n[3/3] Usage Tracking:');
  const { data: usage, error: usageError } = await supabase
    .from('echo_usage')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (usageError) {
    console.log(`❌ Error: ${usageError.message}`);
  } else {
    console.log(`✅ Found ${usage.length} usage records`);
    usage.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.user_id} (${u.package}): ${u.request_type} - ${u.method} ($${u.cost_usd})`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ MEMORY DATA CHECK COMPLETED\n');
}

checkData().catch(console.error);
