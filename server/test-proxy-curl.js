// Test proxy with simple curl command
require('dotenv').config();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testProxyCurl() {
  console.log('🧪 TESTING PROXY WITH CURL\n');
  console.log('='.repeat(70));
  
  const proxyUrl = `http://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`;
  
  console.log('\n📋 PROXY CONFIG:');
  console.log(`Host: ${process.env.PROXY_HOST}`);
  console.log(`Port: ${process.env.PROXY_PORT}`);
  console.log(`Username: ${process.env.PROXY_USERNAME}`);
  console.log(`Password: ${process.env.PROXY_PASSWORD.substring(0, 4)}...`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 1: Check IP without proxy\n');
  
  try {
    const { stdout } = await execPromise('curl -s https://api.ipify.org?format=json');
    const data = JSON.parse(stdout);
    console.log(`✅ Your IP: ${data.ip}`);
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('\n🔍 TEST 2: Check IP with proxy\n');
  
  try {
    const cmd = `curl -x "${proxyUrl}" -s https://api.ipify.org?format=json`;
    console.log(`Command: curl -x "http://USER:PASS@${process.env.PROXY_HOST}:${process.env.PROXY_PORT}" ...`);
    
    const { stdout, stderr } = await execPromise(cmd, { timeout: 30000 });
    
    if (stderr) {
      console.log(`⚠️  Stderr: ${stderr}`);
    }
    
    if (stdout) {
      try {
        const data = JSON.parse(stdout);
        console.log(`✅ Proxy IP: ${data.ip}`);
        console.log('✅ Proxy working!');
        return true;
      } catch (e) {
        console.log(`❌ Invalid response: ${stdout}`);
        return false;
      }
    } else {
      console.log('❌ No response from proxy');
      return false;
    }
  } catch (error) {
    console.log(`❌ Proxy failed: ${error.message}`);
    
    if (error.message.includes('timeout')) {
      console.log('\n⚠️  TIMEOUT - Possible issues:');
      console.log('   1. Proxy credentials incorrect');
      console.log('   2. Proxy not activated yet (check IPRoyal dashboard)');
      console.log('   3. Network/firewall blocking proxy connection');
    }
    
    if (error.message.includes('407')) {
      console.log('\n⚠️  407 Proxy Authentication Required');
      console.log('   → Check username/password in .env');
    }
    
    return false;
  }
  
  console.log('\n' + '='.repeat(70));
}

testProxyCurl()
  .then((success) => {
    if (success) {
      console.log('\n✅ Proxy test PASSED!');
      console.log('\n💡 NEXT STEPS:');
      console.log('   1. Proxy is working correctly');
      console.log('   2. Ready to test real product scraping');
      console.log('   3. Run: node test-real-products.js');
    } else {
      console.log('\n❌ Proxy test FAILED');
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('   1. Check IPRoyal dashboard - is proxy active?');
      console.log('   2. Verify credentials in .env match dashboard');
      console.log('   3. Try generating new credentials in IPRoyal');
      console.log('   4. Contact IPRoyal support if issue persists');
    }
    console.log('\n' + '='.repeat(70));
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('\n❌ Test error:', err.message);
    process.exit(1);
  });
