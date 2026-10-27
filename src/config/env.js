/**
 * Environment configuration with validation
 * Centralizes all env variable access with sensible defaults
 */

const config = {
  // Server
  port:    parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database
  dbPath: process.env.DB_PATH || './data/suyog.db',

  // JWT
  jwtSecret:   process.env.JWT_SECRET || 'changeme_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',

  // SMTP / Email
  smtp: {
    host:   process.env.SMTP_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user:   process.env.SMTP_USER || '',
    pass:   process.env.SMTP_PASS || '',
  },

  // Company info
  company: {
    name:    process.env.COMPANY_NAME    || 'Suyog Constructions',
    phone:   process.env.COMPANY_PHONE   || '',
    email:   process.env.COMPANY_EMAIL   || '',
    address: process.env.COMPANY_ADDRESS || '',
  },

  // Admin
  adminEmail: process.env.ADMIN_EMAIL || '',

  // WhatsApp
  whatsappNumber: process.env.WHATSAPP_NUMBER || '',

  // Derived
  get isProduction() { return this.nodeEnv === 'production'; },
  get isDevelopment() { return this.nodeEnv === 'development'; },
};

/**
 * Warn about missing critical env vars (only in production)
 */
function validateConfig() {
  const warnings = [];

  if (config.isProduction) {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'changeme_in_production') {
      warnings.push('JWT_SECRET is not set or using default — CHANGE THIS in production!');
    }
    if (!process.env.SMTP_USER) {
      warnings.push('SMTP_USER is not set — email notifications will be disabled.');
    }
    if (!process.env.ADMIN_EMAIL) {
      warnings.push('ADMIN_EMAIL is not set — admin notifications will not be sent.');
    }
  }

  warnings.forEach(w => console.warn(`⚠️  [CONFIG] ${w}`));
}

validateConfig();

module.exports = config;
