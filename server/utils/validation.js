import { body, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules
export const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('color')
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Valid hex color code is required (e.g., #FF5733)'),
];

export const budgetValidation = [
  body('categoryId').isMongoId().withMessage('Valid category ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
  body('year').isInt({ min: 2020 }).withMessage('Valid year is required'),
];

export const expenseValidation = [
  body('categoryId').isMongoId().withMessage('Valid category ID is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('description').optional().isString().trim(),
];

