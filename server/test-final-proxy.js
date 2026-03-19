// Final proxy test - verify IPRoyal works end-to-end
require('dotenv').config();
const GotFetcher = require('./crawler/lib/got-fetcher');
const cheerio = require('cheerio');

async function testFinalProxy() {
  console.log('🧪 FINAL IPROYAL PROXY TEST\n');
  console.log('='.repeat(70));
  
  const fetcher = new GotFetcher({
    enabled: true,
    provider: 'iproyal',
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  });
  
  console.log('\n📋 Testing IPRoyal Residential Proxy\n');
  
  const tests = [
    {
      name: 'IP Check',
      url: 'https://api.ipify.org?format=json',
      check: (html) => {
        const data = JSON.parse(html);
        return { success: true, ip: data.ip };
      }
    },
    {
      name: 'Bol.com Homepage',
      url: 'https://www.bol.com/nl/nl/',
      check: (html) => {
        const $ = cheerio.load(html);
        const hasContent = html.includes('bol.com') || html.includes('Bol');
        const size = (html.length / 1024).toFixed(2);
        return { success: hasContent, size: `${size} KB` };
      }
    },
    {
      name: 'MediaMarkt Homepage',
      url: 'https://www.mediamarkt.nl/',
      check: (html) => {
        const hasContent = html.includes('MediaMarkt') || html.includes('media');
        const size = (html.length / 1024).toFixed(2);
        return { success: hasContent, size: `${size} KB` };
      }
    },
    {
      name: 'Coolblue Homepage',
      url: 'https://www.coolblue.nl/',
      check: (html) => {
        const hasContent = html.includes('Coolblue') || html.includes('coolblue');
        const size = (html.length / 1024).toFixed(2);
        return { success: hasContent, size: `${size} KB` };
      }
    }
  ];
  
  let passedTests = 0;
  let proxyIP = null;
  
  for (const test of tests) {
    try {
      console.log('='.repeat(70));
      console.log(`\n🔍 TEST: ${test.name}\n`);
      console.log(`URL: ${test.url}`);
      
      const startTime = Date.now();
      const html = await fetcher.fetch(test.url);
      const duration = Date.now() - startTime;
      
      const result = test.check(html);
      
      if (result.success) {
        console.log(`✅ PASS (${duration}ms)`);
        if (result.ip) {
          proxyIP = result.ip;
          console.log(`Proxy IP: ${result.ip}`);
        }
        if (result.size) {
          console.log(`Page size: ${result.size}`);
        }
        passedTests++;
      } else {
        console.log(`❌ FAIL (${duration}ms)`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 FINAL RESULTS\n');
  console.log(`Tests passed: ${passedTests}/${tests.length}`);
  console.log(`Success rate: ${((passedTests / tests.length) * 100).toFixed(0)}%`);
  
  if (proxyIP) {
    console.log(`\nProxy IP: ${proxyIP}`);
    console.log('✅ IPRoyal proxy is working!');
  }
  
  console.log('\n' + '='.repeat(70));
  
  if (passedTests === tests.length) {
    console.log('\n🎉 ALL TESTS PASSED!\n');
    console.log('✅ IPRoyal proxy fully functional');
    console.log('✅ Can fetch pages through proxy');
    console.log('✅ Ready for production crawler');
    console.log('\n💡 Integration complete - crawler can use IPRoyal proxy');
  } else if (passedTests >= tests.length / 2) {
    console.log('\n✅ MAJORITY PASSED\n');
    console.log('IPRoyal proxy is working');
    console.log('Some tests failed but core functionality OK');
  } else {
    console.log('\n❌ TESTS FAILED\n');
    console.log('Check proxy configuration');
  }
  
  console.log('='.repeat(70));
  
  return passedTests >= tests.length / 2;
}

testFinalProxy()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
