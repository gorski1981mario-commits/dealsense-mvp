// DealSense Bookmarklet - Token URL System
// Drag to bookmarks bar or add as bookmark

javascript:(function(){
  // Get current page URL
  const currentUrl = window.location.href;
  
  // Check if it's a supported shop
  const supportedShops = [
    'bol.com',
    'amazon.nl',
    'coolblue.nl',
    'mediamarkt.nl',
    'wehkamp.nl'
  ];
  
  const isSupported = supportedShops.some(shop => currentUrl.includes(shop));
  
  if (!isSupported) {
    alert('❌ Deze winkel wordt nog niet ondersteund.\n\nOndersteunde winkels:\n- bol.com\n- Amazon.nl\n- Coolblue.nl\n- MediaMarkt.nl\n- Wehkamp.nl');
    return;
  }
  
  // Generate token (base64 encoded URL)
  const token = btoa(currentUrl);
  
  // Open DealSense with token
  const dealsenseUrl = `https://dealsense-mvp.vercel.app/?token=${token}`;
  
  // Option 1: Open in new tab
  window.open(dealsenseUrl, '_blank');
  
  // Option 2: Show confirmation (uncomment if preferred)
  // if (confirm('✓ Product gevonden!\n\nOpen DealSense om de beste prijs te vinden?')) {
  //   window.open(dealsenseUrl, '_blank');
  // }
})();
