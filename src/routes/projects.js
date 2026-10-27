const express = require('express');
const router = express.Router();
const { getDb } = require('../config/database');

// GET /api/v1/projects
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const { category, status, featured, limit = 20, page = 1 } = req.query;

    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (featured === 'true') {
      query += ' AND featured = 1';
    }

    query += ' ORDER BY featured DESC, created_at DESC';

    const limitNum = Math.min(parseInt(limit) || 20, 50);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const offset = (pageNum - 1) * limitNum;

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
    const { total } = db.prepare(countQuery).get(...params);

    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const projects = db.prepare(query).all(...params).map(p => ({
      ...p,
      image_urls: JSON.parse(p.image_urls || '[]'),
      featured: p.featured === 1,
    }));

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          total_pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('[PROJECTS ERROR]', error);
    res.status(500).json({ success: false, message: 'Failed to fetch projects.' });
  }
});

// GET /api/v1/projects/:id
router.get('/:id', (req, res) => {
  try {
    const db = getDb();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    res.json({
      success: true,
      data: {
        ...project,
        image_urls: JSON.parse(project.image_urls || '[]'),
        featured: project.featured === 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch project.' });
  }
});

// GET /api/v1/projects/testimonials/all
router.get('/testimonials/all', (req, res) => {
  try {
    const db = getDb();
    const testimonials = db.prepare('SELECT * FROM testimonials WHERE is_active = 1 ORDER BY created_at DESC').all();
    res.json({ success: true, data: testimonials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch testimonials.' });
  }
});

module.exports = router;
