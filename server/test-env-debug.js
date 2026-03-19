// Debug .env loading
require('dotenv').config();

console.log('='.repeat(70));
console.log('DEBUG: .env LOADING TEST\n');

console.log('PROXY_HOST:', process.env.PROXY_HOST);
console.log('PROXY_PORT:', process.env.PROXY_PORT);
console.log('PROXY_USERNAME:', process.env.PROXY_USERNAME);
console.log('\nPROXY_PASSWORD (full):');
console.log(process.env.PROXY_PASSWORD);
console.log('\nPassword length:', process.env.PROXY_PASSWORD?.length);
console.log('='.repeat(70));
