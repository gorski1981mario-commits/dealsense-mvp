// Test GotFetcher with IPRoyal proxy
require('dotenv').config();
const GotFetcher = require('./crawler/lib/got-fetcher');

async function testGotFetcher() {
  console.log('🧪 TESTING GOT FETCHER WITH IPROYAL\n');
  console.log('='.repeat(70));
  
  const fetcher = new GotFetcher({
    enabled: true,
    provider: 'iproyal',
    username: process.env.PROXY_USERNAME,
    password: process.env.PROXY_PASSWORD
  });
  
  console.log('\n📋 PROXY CONFIG:');
  console.log(`Provider: iproyal`);
  console.log(`Enabled: true`);
  
  try {
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 1: MediaMarkt.nl\n');
    
    const url1 = 'https://www.mediamarkt.nl/';
    console.log(`URL: ${url1}`);
    console.log('Fetching...');
    
    const html1 = await fetcher.fetch(url1);
    console.log(`✅ Success! HTML length: ${html1.length} bytes`);
    
    if (html1.includes('MediaMarkt') || html1.includes('media')) {
      console.log('✅ Site content found!');
    }
    
    const needsJS1 = fetcher.needsJavaScript(html1);
    console.log(`Needs JavaScript: ${needsJS1 ? 'Yes (use Playwright)' : 'No (got is fine)'}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 2: Bol.com\n');
    
    const url2 = 'https://www.bol.com/nl/nl/';
    console.log(`URL: ${url2}`);
    console.log('Fetching...');
    
    const html2 = await fetcher.fetch(url2);
    console.log(`✅ Success! HTML length: ${html2.length} bytes`);
    
    if (html2.includes('bol.com') || html2.includes('Bol')) {
      console.log('✅ Site content found!');
    }
    
    const needsJS2 = fetcher.needsJavaScript(html2);
    console.log(`Needs JavaScript: ${needsJS2 ? 'Yes (use Playwright)' : 'No (got is fine)'}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('\n🔍 TEST 3: Coolblue.nl\n');
    
    const url3 = 'https://www.coolblue.nl/';
    console.log(`URL: ${url3}`);
    console.log('Fetching...');
    
    const html3 = await fetcher.fetch(url3);
    console.log(`✅ Success! HTML length: ${html3.length} bytes`);
    
    if (html3.includes('Coolblue') || html3.includes('coolblue')) {
      console.log('✅ Site content found!');
    }
    
    const needsJS3 = fetcher.needsJavaScript(html3);
    console.log(`Needs JavaScript: ${needsJS3 ? 'Yes (use Playwright)' : 'No (got is fine)'}`);
    
    const stats = fetcher.getStats();
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 STATS\n');
    console.log(`Total requests: ${stats.requestCount}`);
    console.log(`Provider: ${stats.provider}`);
    console.log(`Proxy enabled: ${stats.enabled}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('\n✅ GOT FETCHER WITH IPROYAL - SUCCESS!\n');
    console.log('🎉 All 3 product pages fetched!');
    console.log('✅ IPRoyal proxy working with got');
    console.log('✅ Ready for crawler integration');
    console.log('\n💡 NEXT: Use GotFetcher as primary, fallback to Playwright for JS sites');
    console.log('='.repeat(70));
    
    return true;
    
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    if (error.message === 'NEEDS_PLAYWRIGHT') {
      console.log('⚠️  Site needs JavaScript - would fallback to Playwright');
    }
    return false;
  }
}

testGotFetcher()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  });
