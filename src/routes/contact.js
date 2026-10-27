const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');
const { contactValidationRules, handleValidationErrors } = require('../middleware/validate');
const { sendContactNotification } = require('../services/email');
const { contactLimiter } = require('../middleware/rateLimit');

// POST /api/v1/contact
router.post('/', contactLimiter, contactValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const db = getDb();

    const stmt = db.prepare(`
      INSERT INTO contact_messages (name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(name, email, phone || null, subject, message);

    sendContactNotification({ name, email, phone, subject, message })
      .catch(err => console.error('[EMAIL ERROR]', err.message));

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We will get back to you within 24 hours.',
    });
  } catch (error) {
    console.error('[CONTACT ERROR]', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;
