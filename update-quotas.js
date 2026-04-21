/**
 * UPDATE SUPABASE RATE LIMIT QUOTAS
 * Aktualizuje limity na optymalne (99%+ marża)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aclsuakanhrjgapktnoq.supabase.co';
const anonKey = 'sb_publishable_DtO4_R1AMu17ipnbqB6cUw_Z64qmr73';

const supabase = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function updateQuotas() {
  console.log('🔄 UPDATING RATE LIMIT QUOTAS...\n');
  console.log('='.repeat(60));

  // FREE
  console.log('\n[1/4] Updating FREE package...');
  const { error: freeError } = await supabase
    .from('rate_limit_quotas')
    .update({
      echo_requests_per_day: 5,
      echo_requests_per_month: 100,
      gemini_requests_per_day: 0,
      gemini_requests_per_month: 0,
      max_conversation_history: 10,
      max_preferences: 5,
      max_cost_per_day_usd: 0.02,
      max_cost_per_month_usd: 0.50
    })
    .eq('package', 'FREE');

  if (freeError) {
    console.log(`❌ Error: ${freeError.message}`);
  } else {
    console.log('✅ FREE updated: 5/day, 100/month, 0 Gemini');
  }

  // PLUS
  console.log('\n[2/4] Updating PLUS package...');
  const { error: plusError } = await supabase
    .from('rate_limit_quotas')
    .update({
      echo_requests_per_day: 30,
      echo_requests_per_month: 500,
      gemini_requests_per_day: 0,
      gemini_requests_per_month: 0,
      max_conversation_history: 50,
      max_preferences: 20,
      max_cost_per_day_usd: 0.10,
      max_cost_per_month_usd: 2.00
    })
    .eq('package', 'PLUS');

  if (plusError) {
    console.log(`❌ Error: ${plusError.message}`);
  } else {
    console.log('✅ PLUS updated: 30/day, 500/month, 0 Gemini');
  }

  // PRO
  console.log('\n[3/4] Updating PRO package...');
  const { error: proError } = await supabase
    .from('rate_limit_quotas')
    .update({
      echo_requests_per_day: 100,
      echo_requests_per_month: 2000,
      gemini_requests_per_day: 5,
      gemini_requests_per_month: 100,
      max_conversation_history: 200,
      max_preferences: 50,
      max_cost_per_day_usd: 0.50,
      max_cost_per_month_usd: 10.00
    })
    .eq('package', 'PRO');

  if (proError) {
    console.log(`❌ Error: ${proError.message}`);
  } else {
    console.log('✅ PRO updated: 100/day, 2000/month, 5 Gemini/day');
  }

  // FINANCE
  console.log('\n[4/4] Updating FINANCE package...');
  const { error: financeError } = await supabase
    .from('rate_limit_quotas')
    .update({
      echo_requests_per_day: 200,
      echo_requests_per_month: 4000,
      gemini_requests_per_day: 10,
      gemini_requests_per_month: 200,
      max_conversation_history: 500,
      max_preferences: 100,
      max_cost_per_day_usd: 1.00,
      max_cost_per_month_usd: 20.00
    })
    .eq('package', 'FINANCE');

  if (financeError) {
    console.log(`❌ Error: ${financeError.message}`);
  } else {
    console.log('✅ FINANCE updated: 200/day, 4000/month, 10 Gemini/day');
  }

  // Verify
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 VERIFYING NEW QUOTAS:\n');

  const { data: quotas, error: verifyError } = await supabase
    .from('rate_limit_quotas')
    .select('*')
    .order('package');

  if (verifyError) {
    console.log(`❌ Error: ${verifyError.message}`);
  } else {
    quotas.forEach(q => {
      console.log(`${q.package.padEnd(8)} | ${q.echo_requests_per_day}/day, ${q.echo_requests_per_month}/month | Gemini: ${q.gemini_requests_per_day}/day | Max: $${q.max_cost_per_month_usd}/month`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ QUOTAS UPDATED SUCCESSFULLY!\n');
}

updateQuotas().catch(console.error);
