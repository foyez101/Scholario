// A small error class that carries an HTTP status code,
// so our error-handling middleware knows what status to respond with.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
