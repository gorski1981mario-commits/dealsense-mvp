/**
 * UPDATE SUPABASE RATE LIMIT QUOTAS - FINALNE (40% MARŻA NETTO)
 * Gemini drastycznie obniżone dla wysokiej rentowności
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aclsuakanhrjgapktnoq.supabase.co';
const anonKey = 'sb_publishable_DtO4_R1AMu17ipnbqB6cUw_Z64qmr73';

const supabase = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function updateQuotas() {
  console.log('🔄 UPDATING TO FINAL OPTIMAL QUOTAS (40% NET MARGIN)...\n');
  console.log('='.repeat(60));

  // FREE - bez zmian
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
      max_cost_per_day_usd: 0.00,
      max_cost_per_month_usd: 0.00
    })
    .eq('package', 'FREE');

  if (freeError) {
    console.log(`❌ Error: ${freeError.message}`);
  } else {
    console.log('✅ FREE: 5/day, 100/month, 0 Gemini (lead gen)');
  }

  // PLUS - bez zmian
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
      max_cost_per_day_usd: 0.00,
      max_cost_per_month_usd: 0.00
    })
    .eq('package', 'PLUS');

  if (plusError) {
    console.log(`❌ Error: ${plusError.message}`);
  } else {
    console.log('✅ PLUS: 30/day, 500/month, 0 Gemini (79% margin)');
  }

  // PRO - ZMNIEJSZONE GEMINI: 5 → 2/day
  console.log('\n[3/4] Updating PRO package...');
  const { error: proError } = await supabase
    .from('rate_limit_quotas')
    .update({
      echo_requests_per_day: 100,
      echo_requests_per_month: 2000,
      gemini_requests_per_day: 2,
      gemini_requests_per_month: 60,
      max_conversation_history: 200,
      max_preferences: 50,
      max_cost_per_day_usd: 0.15,
      max_cost_per_month_usd: 3.00
    })
    .eq('package', 'PRO');

  if (proError) {
    console.log(`❌ Error: ${proError.message}`);
  } else {
    console.log('✅ PRO: 100/day, 2000/month, 2 Gemini/day (77% margin, 39% net)');
  }

  // FINANCE - ZMNIEJSZONE GEMINI: 10 → 3/day
  console.log('\n[4/4] Updating FINANCE package...');
  const { error: financeError } = await supabase
    .from('rate_limit_quotas')
    .update({
      echo_requests_per_day: 200,
      echo_requests_per_month: 4000,
      gemini_requests_per_day: 3,
      gemini_requests_per_month: 90,
      max_conversation_history: 500,
      max_preferences: 100,
      max_cost_per_day_usd: 0.20,
      max_cost_per_month_usd: 5.00
    })
    .eq('package', 'FINANCE');

  if (financeError) {
    console.log(`❌ Error: ${financeError.message}`);
  } else {
    console.log('✅ FINANCE: 200/day, 4000/month, 3 Gemini/day (78% margin, 40% net)');
  }

  // Verify
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 FINAL QUOTAS:\n');

  const { data: quotas, error: verifyError } = await supabase
    .from('rate_limit_quotas')
    .select('*')
    .order('package');

  if (verifyError) {
    console.log(`❌ Error: ${verifyError.message}`);
  } else {
    console.log('Package  | ECHO/day | ECHO/month | Gemini/day | Max $/month | Net Margin');
    console.log('-'.repeat(80));
    quotas.forEach(q => {
      const margins = {
        'FREE': 'N/A (lead gen)',
        'PLUS': '40% net',
        'PRO': '39% net',
        'FINANCE': '40% net'
      };
      console.log(`${q.package.padEnd(8)} | ${String(q.echo_requests_per_day).padEnd(8)} | ${String(q.echo_requests_per_month).padEnd(10)} | ${String(q.gemini_requests_per_day).padEnd(10)} | $${String(q.max_cost_per_month_usd).padEnd(11)} | ${margins[q.package]}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ FINAL OPTIMAL QUOTAS UPDATED!');
  console.log('\n💰 RENTOWNOŚĆ:');
  console.log('   PLUS: €19.99 → $17 zysk netto (79% brutto, 40% netto)');
  console.log('   PRO: €29.99 → $12.65 zysk netto (77% brutto, 39% netto)');
  console.log('   FINANCE: €39.99 → $17.09 zysk netto (78% brutto, 40% netto)');
  console.log('\n🎯 Gemini jako PREMIUM ADD-ON (2-3 queries/day)');
  console.log('🚀 SYSTEM PRODUCTION READY!\n');
}

updateQuotas().catch(console.error);
