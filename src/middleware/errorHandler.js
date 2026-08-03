// Catches errors passed via next(err) from anywhere in the app
// and sends back a consistent JSON shape instead of an HTML stack trace.
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.statusCode || 500;
  const message = err.message || 'Something went wrong';

  res.status(status).json({
    success: false,
    message,
    // Only leak stack traces outside production
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

// Catches requests to routes that don't exist
function notFound(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFound };
