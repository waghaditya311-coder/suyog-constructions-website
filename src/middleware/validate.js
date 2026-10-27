const { body, validationResult } = require('express-validator');

// ── Inquiry Form Validation ──────────────────────────────────────────────────
const inquiryValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian mobile number'),

  body('service_type')
    .trim()
    .notEmpty().withMessage('Service type is required')
    .isIn(['residential', 'commercial', 'renovation', 'interior', 'other'])
    .withMessage('Invalid service type'),

  body('budget_range')
    .optional()
    .isIn(['', 'under-10L', '10L-25L', '25L-50L', '50L-1Cr', '1Cr-2Cr', 'above-2Cr'])
    .withMessage('Invalid budget range'),

  body('project_location')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Location must be under 200 characters'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
];

// ── Contact Form Validation ──────────────────────────────────────────────────
const contactValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit mobile number'),

  body('subject')
    .trim()
    .notEmpty().withMessage('Subject is required')
    .isLength({ min: 3, max: 200 }).withMessage('Subject must be between 3 and 200 characters'),

  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ min: 10, max: 2000 }).withMessage('Message must be between 10 and 2000 characters'),
];

// ── Validation Result Handler ────────────────────────────────────────────────
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMap = {};
    errors.array().forEach(err => {
      if (!errorMap[err.path]) {
        errorMap[err.path] = err.msg;
      }
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please check your inputs.',
      errors: errorMap,
    });
  }
  next();
}

module.exports = {
  inquiryValidationRules,
  contactValidationRules,
  handleValidationErrors,
};
