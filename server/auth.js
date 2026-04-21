/**
 * AUTH MODULE
 */

function createVerifyToken(secret) {
  // Return middleware function for Express
  return (req, res, next) => {
    // Simple auth middleware - just pass through for testing
    req.user = { email: 'test@example.com' };
    next();
  };
}

module.exports = { createVerifyToken };
