// 5 Manual Tests - Real NL Shops with IPRoyal Proxy
require('dotenv').config();
const GotFetcher = require('./crawler/lib/got-fetcher');
const cheerio = require('cheerio');

async function test5ShopsManual() {
  console.log('🧪 5 MANUAL TESTS - REAL NL SHOPS\n');
  console.log('='.repeat(70));
  
  const fetcher = new GotFetcher({
    enabled: true,
    provider: 'iproyal',
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  });
  
  console.log('\n📋 IPRoyal Proxy: ENABLED\n');
  
  // 5 different shop types - manual selection
  const tests = [
    {
      id: 1,
      shop: 'Alternate.nl',
      category: 'Electronics (Niszowy)',
      url: 'https://www.alternate.nl/',
      checkContent: (html) => {
        return html.includes('Alternate') || html.includes('alternate');
      }
    },
    {
      id: 2,
      shop: 'Azerty.nl',
      category: 'Computer Shop (Niszowy)',
      url: 'https://www.azerty.nl/',
      checkContent: (html) => {
        return html.includes('azerty') || html.includes('AZERTY');
      }
    },
    {
      id: 3,
      shop: 'Expert.nl',
      category: 'Electronics Chain',
      url: 'https://www.expert.nl/',
      checkContent: (html) => {
        return html.includes('Expert') || html.includes('expert');
      }
    },
    {
      id: 4,
      shop: 'Wehkamp.nl',
      category: 'Fashion & Electronics',
      url: 'https://www.wehkamp.nl/',
      checkContent: (html) => {
        return html.includes('Wehkamp') || html.includes('wehkamp');
      }
    },
    {
      id: 5,
      shop: 'BCC.nl',
      category: 'Electronics & Appliances',
      url: 'https://www.bcc.nl/',
      checkContent: (html) => {
        return html.includes('BCC') || html.includes('bcc');
      }
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log('='.repeat(70));
    console.log(`\n🔍 TEST ${test.id}/5: ${test.shop}\n`);
    console.log(`Category: ${test.category}`);
    console.log(`URL: ${test.url}`);
    console.log('\nFetching through IPRoyal proxy...');
    
    const startTime = Date.now();
    
    try {
      const html = await fetcher.fetch(test.url);
      const duration = Date.now() - startTime;
      const sizeKB = (html.length / 1024).toFixed(2);
      
      const contentFound = test.checkContent(html);
      const $ = cheerio.load(html);
      const bodyText = $('body').text().trim();
      const hasContent = bodyText.length > 1000;
      
      const success = contentFound && hasContent;
      
      console.log(`\n⏱️  Time: ${duration}ms`);
      console.log(`📦 Size: ${sizeKB} KB`);
      console.log(`📄 Content: ${bodyText.length} chars`);
      
      if (success) {
        console.log(`✅ SUCCESS - ${test.shop} loaded correctly`);
        results.push({ ...test, success: true, duration, sizeKB });
      } else {
        console.log(`⚠️  PARTIAL - Page loaded but content unclear`);
        results.push({ ...test, success: false, duration, sizeKB, reason: 'Content check failed' });
      }
      
      // Check if needs JavaScript
      const needsJS = fetcher.needsJavaScript(html);
      if (needsJS) {
        console.log(`⚠️  Needs JavaScript rendering (would use Playwright)`);
      }
      
    } catch (error) {
      const duration = Date.now() - startTime;
      console.log(`\n❌ FAILED - ${error.message}`);
      console.log(`⏱️  Time: ${duration}ms`);
      
      results.push({ 
        ...test, 
        success: false, 
        duration, 
        error: error.message 
      });
    }
    
    // Delay between tests (respect rate limits)
    console.log('\nWaiting 3s before next test...');
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 FINAL RESULTS - 5 MANUAL TESTS\n');
  console.log('='.repeat(70));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\n✅ Successful: ${successful}/5`);
  console.log(`❌ Failed: ${failed}/5`);
  console.log(`📈 Success Rate: ${((successful / 5) * 100).toFixed(0)}%`);
  
  console.log('\n' + '-'.repeat(70));
  console.log('\nDETAILED BREAKDOWN:\n');
  
  results.forEach((r, i) => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} Test ${i + 1}: ${r.shop}`);
    console.log(`   Category: ${r.category}`);
    console.log(`   Time: ${r.duration}ms`);
    if (r.sizeKB) console.log(`   Size: ${r.sizeKB} KB`);
    if (r.error) console.log(`   Error: ${r.error}`);
    if (r.reason) console.log(`   Reason: ${r.reason}`);
    console.log('');
  });
  
  console.log('='.repeat(70));
  
  if (successful === 5) {
    console.log('\n🎉 PERFECT! All 5 shops accessible through IPRoyal proxy!');
    console.log('✅ Crawler ready for production with 1,047 domains');
  } else if (successful >= 3) {
    console.log('\n✅ GOOD! Majority of shops working');
    console.log(`${successful}/5 shops accessible - proxy is functional`);
  } else {
    console.log('\n⚠️  ISSUES DETECTED');
    console.log('Check failed shops and adjust strategy');
  }
  
  console.log('\n' + '='.repeat(70));
  
  return successful >= 3;
}

test5ShopsManual()
  .then((success) => {
    console.log('\n✅ Manual testing complete');
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test error:', err.message);
    process.exit(1);
  });
