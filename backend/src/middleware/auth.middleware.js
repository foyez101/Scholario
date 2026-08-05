const { verifyJWT } = require('../utils/jwt');
const AppError = require('../utils/AppError');

// Reads "Authorization: Bearer <token>" from the request header,
// verifies it, and attaches the decoded { id, role } to req.user
// so later route handlers know who's making the request.
function verifyToken(req, res, next) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = header.split(' ')[1];
    const decoded = verifyJWT(token);

    req.user = decoded; // { id, role, iat, exp }
    next();
  } catch (err) {
    next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = verifyToken;
