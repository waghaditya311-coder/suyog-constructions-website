require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const { initializeDatabase } = require('./src/config/database');
const { globalLimiter } = require('./src/middleware/rateLimit');

const inquiryRoutes = require('./src/routes/inquiry');
const contactRoutes = require('./src/routes/contact');
const projectRoutes = require('./src/routes/projects');
const adminRoutes = require('./src/routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://maps.googleapis.com", "https://wa.me"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      frameSrc: ["https://www.google.com", "https://maps.google.com"],
      connectSrc: ["'self'"],
    },
  },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://suyogconstructions.com', 'https://www.suyogconstructions.com']
    : '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Global Rate Limiter ─────────────────────────────────────────────────────
app.use('/api/', globalLimiter);

// ── Static Files ────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1/inquiry', inquiryRoutes);
app.use('/api/v1/contact', contactRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/admin', adminRoutes);

// ── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Suyog Constructions API is running', timestamp: new Date().toISOString() });
});

// ── SPA Fallback — serve HTML pages ────────────────────────────────────────
const htmlPages = ['about', 'services', 'projects', 'contact'];
htmlPages.forEach(page => {
  app.get(`/${page}`, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `${page}.html`));
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Admin Panel ─────────────────────────────────────────────────────────────
app.get('/admin', (req, res) => {
  res.redirect('/admin/');
});
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

// ── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API endpoint not found' });
  }
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.stack);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message,
  });
});

// ── Start Server ─────────────────────────────────────────────────────────────
async function start() {
  try {
    initializeDatabase();
    app.listen(PORT, () => {
      console.log(`\n🏗️  Suyog Constructions Server`);
      console.log(`✅  Running on http://localhost:${PORT}`);
      console.log(`📦  Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
