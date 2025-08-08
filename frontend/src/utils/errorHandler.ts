import { toast } from '@/hooks/use-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  public status: number;
  public code: string;
  public details: any;

  constructor(message: string, status = 500, code = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Error type definitions
export const ErrorTypes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
} as const;

// Global error handler
export const handleError = (error: any, context?: string): AppError => {
  console.group(`🚨 Error in ${context || 'Unknown Context'}`);
  console.error('Original error:', error);

  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error?.response) {
    // Axios error with response
    const { status, data } = error.response;
    appError = new AppError(
      data?.message || getDefaultErrorMessage(status),
      status,
      getErrorCode(status),
      data
    );
  } else if (error?.request) {
    // Network error
    appError = new AppError(
      'Network error. Please check your internet connection.',
      0,
      ErrorTypes.NETWORK_ERROR
    );
  } else if (error instanceof Error) {
    // Generic JavaScript error
    appError = new AppError(
      error.message || 'An unexpected error occurred',
      500,
      ErrorTypes.SERVER_ERROR
    );
  } else {
    // Unknown error type
    appError = new AppError(
      'An unexpected error occurred',
      500,
      ErrorTypes.SERVER_ERROR,
      error
    );
  }

  console.error('Processed error:', appError);
  console.groupEnd();

  // Log to external service in production
  if (process.env.NODE_ENV === 'production') {
    logErrorToService(appError, context);
  }

  return appError;
};

// Show user-friendly error messages
export const showErrorToast = (error: any, context?: string) => {
  const appError = handleError(error, context);
  
  toast({
    title: getErrorTitle(appError.code),
    description: getUserFriendlyMessage(appError),
    variant: 'destructive',
  });
};

// Get error code based on HTTP status
const getErrorCode = (status: number): string => {
  switch (status) {
    case 400:
      return ErrorTypes.VALIDATION_ERROR;
    case 401:
      return ErrorTypes.AUTHENTICATION_ERROR;
    case 403:
      return ErrorTypes.AUTHORIZATION_ERROR;
    case 404:
      return ErrorTypes.NOT_FOUND_ERROR;
    case 429:
      return ErrorTypes.RATE_LIMIT_ERROR;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorTypes.SERVER_ERROR;
    default:
      return ErrorTypes.SERVER_ERROR;
  }
};

// Get default error message based on status
const getDefaultErrorMessage = (status: number): string => {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 429:
      return 'Too many requests. Please try again later.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
      return 'Bad gateway. The server is temporarily unavailable.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. The request took too long to process.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

// Get user-friendly error title
const getErrorTitle = (code: string): string => {
  switch (code) {
    case ErrorTypes.NETWORK_ERROR:
      return 'Connection Error';
    case ErrorTypes.AUTHENTICATION_ERROR:
      return 'Authentication Required';
    case ErrorTypes.AUTHORIZATION_ERROR:
      return 'Access Denied';
    case ErrorTypes.VALIDATION_ERROR:
      return 'Invalid Input';
    case ErrorTypes.NOT_FOUND_ERROR:
      return 'Not Found';
    case ErrorTypes.PAYMENT_ERROR:
      return 'Payment Error';
    case ErrorTypes.RATE_LIMIT_ERROR:
      return 'Rate Limit Exceeded';
    case ErrorTypes.SERVER_ERROR:
      return 'Server Error';
    default:
      return 'Error';
  }
};

// Get user-friendly error message
const getUserFriendlyMessage = (error: AppError): string => {
  switch (error.code) {
    case ErrorTypes.NETWORK_ERROR:
      return 'Please check your internet connection and try again.';
    case ErrorTypes.AUTHENTICATION_ERROR:
      return 'Please log in to continue.';
    case ErrorTypes.AUTHORIZATION_ERROR:
      return 'You don\'t have permission to perform this action.';
    case ErrorTypes.VALIDATION_ERROR:
      return error.message || 'Please check your input and try again.';
    case ErrorTypes.NOT_FOUND_ERROR:
      return 'The requested item could not be found.';
    case ErrorTypes.PAYMENT_ERROR:
      return 'Payment processing failed. Please try again or contact support.';
    case ErrorTypes.RATE_LIMIT_ERROR:
      return 'You\'re making requests too quickly. Please wait a moment and try again.';
    case ErrorTypes.SERVER_ERROR:
      return 'We\'re experiencing technical difficulties. Please try again later.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};

// Log error to external service (placeholder)
const logErrorToService = (error: AppError, context?: string) => {
  // In production, send to error tracking service like Sentry
  console.log('Logging error to external service:', { error, context });
  
  // Example Sentry integration:
  // Sentry.captureException(error, {
  //   tags: { context },
  //   extra: { details: error.details }
  // });
};

// Retry mechanism for failed requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error?.response?.status >= 400 && error?.response?.status < 500 && error?.response?.status !== 429) {
        console.log(`Not retrying client error: ${error?.response?.status}`);
        throw error;
      }

      // Don't retry on specific error codes that won't resolve with retry
      if ([400, 401, 403, 404, 422].includes(error?.response?.status)) {
        console.log(`Not retrying non-retryable error: ${error?.response?.status}`);
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      // No delay for immediate retry (admin-created data should be instantly available)
      console.log(`Retry attempt ${attempt}/${maxRetries} - immediate retry`);
    }
  }

  throw lastError;
};

// Async error handler for React components
export const asyncErrorHandler = (fn: Function) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      showErrorToast(error, fn.name);
      throw error;
    }
  };
};

// API response handler for authentication
export const handleApiResponse = async (response: Response, context?: string) => {
  const data = await response.json();

  if (!response.ok) {
    const error = new AppError(
      data.message || getDefaultErrorMessage(response.status),
      response.status,
      getErrorCode(response.status),
      data
    );

    if (context) {
      console.error(`API Error in ${context}:`, error);
    }

    throw error;
  }

  return data;
};

// Check if error is authentication related
export const isAuthError = (error: any): boolean => {
  return error?.status === 401 ||
         error?.code === ErrorTypes.AUTHENTICATION_ERROR ||
         error?.message?.toLowerCase().includes('token') ||
         error?.message?.toLowerCase().includes('unauthorized');
};
