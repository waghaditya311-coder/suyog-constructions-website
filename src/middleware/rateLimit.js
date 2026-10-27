const rateLimit = require('express-rate-limit');

/**
 * Global rate limiter — applied to all /api/ routes
 * 200 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            200,
  standardHeaders: true,
  legacyHeaders:  false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});

/**
 * Strict limiter for inquiry submissions
 * 5 requests per hour per IP
 */
const inquiryLimiter = rateLimit({
  windowMs:       60 * 60 * 1000,
  max:            5,
  standardHeaders: true,
  legacyHeaders:  false,
  message: { success: false, message: 'Too many inquiry submissions. Please try again after an hour.' },
});

/**
 * Moderate limiter for contact form
 * 10 requests per hour per IP
 */
const contactLimiter = rateLimit({
  windowMs:       60 * 60 * 1000,
  max:            10,
  standardHeaders: true,
  legacyHeaders:  false,
  message: { success: false, message: 'Too many messages sent. Please try again after an hour.' },
});

/**
 * Strict limiter for admin login attempts
 * 10 attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs:       15 * 60 * 1000,
  max:            10,
  standardHeaders: true,
  legacyHeaders:  false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

module.exports = { globalLimiter, inquiryLimiter, contactLimiter, loginLimiter };
