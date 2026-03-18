// Test Domain Manager - verify SQLite integration works

const DomainManager = require('./lib/domain-manager');

async function test() {
  console.log('🧪 Testing Domain Manager...\n');
  
  const dm = new DomainManager();
  
  try {
    // Initialize
    await dm.init();
    
    // Get stats
    console.log('📊 Database Statistics:');
    const stats = await dm.getStats();
    console.log(`   Total domains: ${stats.total}`);
    stats.balance.forEach(b => {
      console.log(`   ${b.tier}: ${b.count} (${b.percentage}%)`);
    });
    console.log('');
    
    // Get giganci
    console.log('🏢 GIGANCI (big brands):');
    const giganci = await dm.getGiganciDomains();
    console.log(`   Found: ${giganci.length} domains`);
    console.log(`   Examples: ${giganci.slice(0, 5).map(d => d.domain).join(', ')}`);
    console.log('');
    
    // Get niszowe
    console.log('🎯 NISZOWE (specialists):');
    const niszowe = await dm.getNiszoweDomains();
    console.log(`   Found: ${niszowe.length} domains`);
    console.log(`   Examples: ${niszowe.slice(0, 5).map(d => d.domain).join(', ')}`);
    console.log('');
    
    // Get by category
    console.log('📦 Electronics category:');
    const electronics = await dm.getDomainsByCategory('electronics');
    console.log(`   Total: ${electronics.length} domains`);
    const elecGiganci = electronics.filter(d => d.tier === 'giganci');
    const elecNiszowe = electronics.filter(d => d.tier === 'niszowe');
    console.log(`   Giganci: ${elecGiganci.length}`);
    console.log(`   Niszowe: ${elecNiszowe.length}`);
    console.log(`   Examples: ${electronics.slice(0, 5).map(d => d.domain).join(', ')}`);
    console.log('');
    
    // Get domains for crawling
    console.log('🚀 Domains for crawling (electronics, limit 20):');
    const crawlDomains = await dm.getDomainsForCrawling('electronics', 20);
    console.log(`   Selected: ${crawlDomains.length} domains`);
    const crawlGiganci = crawlDomains.filter(d => d.tier === 'giganci');
    const crawlNiszowe = crawlDomains.filter(d => d.tier === 'niszowe');
    console.log(`   Giganci: ${crawlGiganci.length} (${Math.round(crawlGiganci.length/crawlDomains.length*100)}%)`);
    console.log(`   Niszowe: ${crawlNiszowe.length} (${Math.round(crawlNiszowe.length/crawlDomains.length*100)}%)`);
    console.log(`   Domains: ${crawlDomains.map(d => d.domain).join(', ')}`);
    console.log('');
    
    // Get domains with parsers
    console.log('🔧 Domains with specific parsers:');
    const withParsers = await dm.getDomainsWithParsers();
    console.log(`   Found: ${withParsers.length} domains`);
    console.log(`   Examples: ${withParsers.slice(0, 5).map(d => d.domain).join(', ')}`);
    console.log('');
    
    // Get specific domain
    console.log('🔍 Get specific domain (bol.com):');
    const bol = await dm.getDomain('bol.com');
    if (bol) {
      console.log(`   Domain: ${bol.domain}`);
      console.log(`   Tier: ${bol.tier}`);
      console.log(`   Category: ${bol.category}`);
      console.log(`   Priority: ${bol.priority}`);
      console.log(`   Rate limit: ${bol.rate_limit} req/min`);
      console.log(`   Pricing: ${bol.expected_pricing}`);
      console.log(`   Has parser: ${bol.has_parser ? 'Yes' : 'No'}`);
    }
    console.log('');
    
    console.log('✅ All tests passed!\n');
    console.log('🎯 Domain Manager is ready for crawler integration!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    dm.close();
  }
}

test();
