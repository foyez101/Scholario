const { validationResult } = require('express-validator');
const AppError = require('./AppError');

// Runs after express-validator's check(...) rules on a route.
// If any of them failed, turns them into one readable error.
function runValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    return next(new AppError(message, 400));
  }
  next();
}

module.exports = runValidation;
