import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Prompt creation validation
export const validatePromptCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Content must be between 10 and 5000 characters'),
  
  body('category')
    .isIn(['writing', 'development', 'marketing', 'education', 'business', 'analytics'])
    .withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  
  body('isPaid')
    .isBoolean()
    .withMessage('isPaid must be a boolean'),
  
  body('price')
    .if(body('isPaid').equals(true))
    .isFloat({ min: 0.01 })
    .withMessage('Price must be greater than 0 for paid prompts'),
  
  handleValidationErrors
];

// Plan creation validation
export const validatePlanCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Plan name must be between 2 and 50 characters'),
  
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a valid number'),
  
  body('features')
    .isArray({ min: 1 })
    .withMessage('Features must be an array with at least one item'),
  
  body('playgroundSessions')
    .isInt({ min: -1 })
    .withMessage('Playground sessions must be a number (-1 for unlimited)'),
  
  handleValidationErrors
];
