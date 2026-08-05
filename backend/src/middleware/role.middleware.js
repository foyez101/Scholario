const AppError = require('../utils/AppError');

// Usage: restrictTo('ADMIN', 'TEACHER')
// Must run AFTER verifyToken on a route, since it relies on req.user
// already being set.
function restrictTo(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to do this', 403));
    }
    next();
  };
}

module.exports = restrictTo;
