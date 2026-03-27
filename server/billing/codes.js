/**
 * BILLING CODES
 * Kody rabatowe i promocyjne
 */

const codes = new Map();

function createCode(userId, planId) {
  const code = `${planId.toUpperCase()}${Date.now()}`;
  codes.set(code, { userId, planId, used: false, createdAt: Date.now() });
  return code;
}

function consumeCode(code) {
  const codeData = codes.get(code);
  if (!codeData || codeData.used) return null;
  codeData.used = true;
  return codeData;
}

function createPromoCode(code, discount, planId) {
  codes.set(code, { 
    type: 'promo', 
    discount, 
    planId, 
    used: false, 
    createdAt: Date.now() 
  });
  return code;
}

function redeemPromoCode(code) {
  const codeData = codes.get(code);
  if (!codeData || codeData.used || codeData.type !== 'promo') return null;
  codeData.used = true;
  return codeData;
}

module.exports = {
  createCode,
  consumeCode,
  createPromoCode,
  redeemPromoCode
};
