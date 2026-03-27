/**
 * COUNTRY CONFIG
 */

function inferCountryFromHostname(hostname) {
  if (!hostname) return 'NL';
  if (hostname.includes('.nl')) return 'NL';
  if (hostname.includes('.be')) return 'BE';
  return 'NL';
}

module.exports = {
  inferCountryFromHostname
};
