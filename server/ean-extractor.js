/**
 * EAN EXTRACTOR
 * Ekstrakcja kodów EAN z URL i HTML
 */

function extractEANFromURL(url) {
  if (!url) return null;
  
  // Pattern: 13-cyfrowy kod EAN
  const eanMatch = url.match(/\b(\d{13})\b/);
  if (eanMatch) return eanMatch[1];
  
  return null;
}

function extractEANFromHTML(html) {
  if (!html) return null;
  
  // Szukaj EAN w meta tags, JSON-LD, itp.
  const patterns = [
    /"gtin13"\s*:\s*"(\d{13})"/,
    /"ean"\s*:\s*"(\d{13})"/,
    /content="(\d{13})"/,
    /\b(\d{13})\b/
  ];
  
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

module.exports = {
  extractEANFromURL,
  extractEANFromHTML
};
