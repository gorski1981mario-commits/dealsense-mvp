// Convert SVG to PNG icons for PWA
const fs = require('fs');
const { exec } = require('child_process');

// Check if sharp is installed
try {
  require.resolve('sharp');
  console.log('Sharp is installed, using it...');
  convertWithSharp();
} catch (e) {
  console.log('Sharp not installed, using alternative method...');
  convertWithCanvas();
}

async function convertWithSharp() {
  const sharp = require('sharp');
  const svgBuffer = fs.readFileSync('public/icon.svg');
  
  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile('public/icon-192.png');
  console.log('✅ Created icon-192.png');
  
  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/icon-512.png');
  console.log('✅ Created icon-512.png');
}

function convertWithCanvas() {
  console.log('Please use generate-icons.html in browser to create PNG icons');
  console.log('Or install sharp: npm install sharp');
}

// Run if called directly
if (require.main === module) {
  convertWithSharp().catch(() => convertWithCanvas());
}
