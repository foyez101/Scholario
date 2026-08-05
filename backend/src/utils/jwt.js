const jwt = require('jsonwebtoken');

// Creates a signed token containing whatever payload we give it
// (we'll pass { id, role } so later requests know who's asking and what they're allowed to do).
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function verifyJWT(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { generateToken, verifyJWT };
