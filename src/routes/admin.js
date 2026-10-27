const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/database');
const { authenticateAdmin } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');

// POST /api/v1/admin/login
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required.' });
    }

    const db = getDb();
    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);

    if (!admin || !bcrypt.compareSync(password, admin.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, token, username: admin.username });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

// GET /api/v1/admin/inquiries
router.get('/inquiries', authenticateAdmin, (req, res) => {
  const db = getDb();
  const { status, page = 1, limit = 20 } = req.query;
  let query = 'SELECT * FROM inquiries';
  const params = [];
  if (status) { query += ' WHERE status = ?'; params.push(status); }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  const limitNum = Math.min(parseInt(limit), 50);
  const offset = (parseInt(page) - 1) * limitNum;
  params.push(limitNum, offset);
  const inquiries = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM inquiries').get().count;
  res.json({ success: true, data: { inquiries, total } });
});

// PATCH /api/v1/admin/inquiries/:id
router.patch('/inquiries/:id', authenticateAdmin, (req, res) => {
  const { status } = req.body;
  const validStatuses = ['new', 'contacted', 'in_progress', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }
  const db = getDb();
  db.prepare("UPDATE inquiries SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, req.params.id);
  res.json({ success: true, message: 'Inquiry status updated.' });
});

// GET /api/v1/admin/contacts
router.get('/contacts', authenticateAdmin, (req, res) => {
  const db = getDb();
  const messages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 50').all();
  res.json({ success: true, data: messages });
});

// POST /api/v1/admin/projects
router.post('/projects', authenticateAdmin, (req, res) => {
  const { title, description, category, location, status, area_sqft, year_completed, client_name, image_urls, featured } = req.body;
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO projects (title, description, category, location, status, area_sqft, year_completed, client_name, image_urls, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(title, description, category, location, status || 'completed', area_sqft || null, year_completed || null, client_name || null, JSON.stringify(image_urls || []), featured ? 1 : 0);
  res.status(201).json({ success: true, message: 'Project added.', id: result.lastInsertRowid });
});

// PATCH /api/v1/admin/projects/:id
router.patch('/projects/:id', authenticateAdmin, (req, res) => {
  const { title, description, category, location, status, area_sqft, year_completed, client_name, image_urls, featured } = req.body;
  const db = getDb();
  db.prepare(`
    UPDATE projects SET title=?, description=?, category=?, location=?, status=?, area_sqft=?, year_completed=?, client_name=?, image_urls=?, featured=?, updated_at=datetime('now')
    WHERE id=?
  `).run(title, description, category, location, status, area_sqft, year_completed, client_name, JSON.stringify(image_urls || []), featured ? 1 : 0, req.params.id);
  res.json({ success: true, message: 'Project updated.' });
});

// DELETE /api/v1/admin/projects/:id
router.delete('/projects/:id', authenticateAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: 'Project deleted.' });
});

module.exports = router;
