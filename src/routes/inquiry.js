const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');
const { inquiryValidationRules, handleValidationErrors } = require('../middleware/validate');
const { sendInquiryNotification } = require('../services/email');
const { inquiryLimiter } = require('../middleware/rateLimit');

// POST /api/v1/inquiry
router.post('/', inquiryLimiter, inquiryValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, phone, service_type, budget_range, project_location, message } = req.body;
    const db = getDb();

    const stmt = db.prepare(`
      INSERT INTO inquiries (name, email, phone, service_type, budget_range, project_location, message)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, email, phone, service_type, budget_range || null, project_location || null, message);

    // Send email notification (non-blocking)
    sendInquiryNotification({ name, email, phone, service_type, budget_range, project_location, message })
      .catch(err => console.error('[EMAIL ERROR]', err.message));

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted successfully! Our team will contact you within 24 hours.',
      inquiry_id: result.lastInsertRowid,
    });
  } catch (error) {
    console.error('[INQUIRY ERROR]', error);
    res.status(500).json({ success: false, message: 'Failed to submit inquiry. Please try again.' });
  }
});

module.exports = router;
