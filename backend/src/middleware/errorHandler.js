// Catches errors passed via next(err) from anywhere in the app
// and sends back a consistent JSON shape instead of an HTML stack trace.
function errorHandler(err, req, res, next) {
  console.error(err);

  let status = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // Prisma throws raw, technical errors (with code snippets in the message)
  // for things like duplicate records. Translate the common ones into
  // clean, user-facing text instead of leaking that straight to the frontend.
  if (err.code === 'P2002') {
    status = 409;
    message = 'This already exists.';
  } else if (err.code === 'P2025') {
    status = 404;
    message = 'The requested item could not be found.';
  } else if (err.code === 'P2003') {
    status = 400;
    message = 'This action refers to something that no longer exists.';
  } else if (err.name === 'PrismaClientValidationError') {
    status = 400;
    message = 'Some of the submitted data was invalid.';
  }

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
