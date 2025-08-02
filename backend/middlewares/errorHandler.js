import logger from '../utils/logger.js';

// Custom error class
class AppError extends Error {
  constructor(message, statusCode, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
};

// Handle different types of errors
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, ErrorTypes.VALIDATION_ERROR);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400, ErrorTypes.DUPLICATE_ERROR);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400, ErrorTypes.VALIDATION_ERROR);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401, ErrorTypes.AUTHENTICATION_ERROR);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401, ErrorTypes.AUTHENTICATION_ERROR);

// Send error response in development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: {
      status: err.status,
      code: err.code,
      message: err.message,
      stack: err.stack,
      details: err.details,
    },
  });
};

// Send error response in production
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    
    res.status(500).json({
      success: false,
      error: {
        code: ErrorTypes.SERVER_ERROR,
        message: 'Something went wrong!',
      },
    });
  }
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
  });

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('UNHANDLED PROMISE REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  
  logger.error('Unhandled Promise Rejection:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  
  logger.error('Uncaught Exception:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
  });
  
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (server) => {
  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully...`);
    
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
    
    // Force close server after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

// Validation error helper
const createValidationError = (field, message) => {
  return new AppError(`Validation failed for ${field}: ${message}`, 400, ErrorTypes.VALIDATION_ERROR);
};

// Not found error helper
const createNotFoundError = (resource) => {
  return new AppError(`${resource} not found`, 404, ErrorTypes.NOT_FOUND_ERROR);
};

// Authorization error helper
const createAuthorizationError = (message = 'Access denied') => {
  return new AppError(message, 403, ErrorTypes.AUTHORIZATION_ERROR);
};

// Rate limit error helper
const createRateLimitError = (message = 'Too many requests') => {
  return new AppError(message, 429, ErrorTypes.RATE_LIMIT_ERROR);
};

// Payment error helper
const createPaymentError = (message) => {
  return new AppError(message, 400, ErrorTypes.PAYMENT_ERROR);
};

// External API error helper
const createExternalApiError = (service, message) => {
  return new AppError(`${service} API error: ${message}`, 502, ErrorTypes.EXTERNAL_API_ERROR);
};

// Database error helper
const createDatabaseError = (message) => {
  return new AppError(`Database error: ${message}`, 500, ErrorTypes.DATABASE_ERROR);
};

export {
  AppError,
  ErrorTypes,
  globalErrorHandler,
  asyncHandler,
  gracefulShutdown,
  createValidationError,
  createNotFoundError,
  createAuthorizationError,
  createRateLimitError,
  createPaymentError,
  createExternalApiError,
  createDatabaseError,
};
