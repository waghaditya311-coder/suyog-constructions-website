const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/suyog.db';

// Ensure data directory exists
const dataDir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
  }
  return db;
}

function initializeDatabase() {
  const database = getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      name             TEXT    NOT NULL,
      email            TEXT    NOT NULL,
      phone            TEXT    NOT NULL,
      service_type     TEXT    NOT NULL,
      budget_range     TEXT,
      project_location TEXT,
      message          TEXT    NOT NULL,
      status           TEXT    NOT NULL DEFAULT 'new',
      created_at       DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at       DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contact_messages (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      phone       TEXT,
      subject     TEXT    NOT NULL,
      message     TEXT    NOT NULL,
      is_read     INTEGER NOT NULL DEFAULT 0,
      created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      title           TEXT    NOT NULL,
      description     TEXT    NOT NULL,
      category        TEXT    NOT NULL,
      location        TEXT    NOT NULL,
      status          TEXT    NOT NULL DEFAULT 'completed',
      area_sqft       INTEGER,
      year_completed  INTEGER,
      client_name     TEXT,
      image_urls      TEXT    DEFAULT '[]',
      featured        INTEGER NOT NULL DEFAULT 0,
      created_at      DATETIME NOT NULL DEFAULT (datetime('now')),
      updated_at      DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name     TEXT    NOT NULL,
      project_type    TEXT,
      rating          INTEGER NOT NULL DEFAULT 5,
      review_text     TEXT    NOT NULL,
      is_active       INTEGER NOT NULL DEFAULT 1,
      created_at      DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admins (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      username    TEXT    NOT NULL UNIQUE,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,
      created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);
    CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(featured);
    CREATE INDEX IF NOT EXISTS idx_contacts_is_read ON contact_messages(is_read);
  `);

  seedDatabase(database);
  console.log('✅  Database initialized successfully');
  return database;
}

function seedDatabase(database) {
  // Seed projects if empty
  const projectCount = database.prepare('SELECT COUNT(*) as count FROM projects').get();
  if (projectCount.count === 0) {
    const insertProject = database.prepare(`
      INSERT INTO projects (title, description, category, location, status, area_sqft, year_completed, client_name, image_urls, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const projects = [
      ['Shree Villa — Luxury Residence', 'A stunning 4BHK luxury bungalow featuring contemporary architecture, premium finishes, and smart home integration. This project showcases our expertise in high-end residential construction.', 'residential', 'Kothrud, Pune', 'completed', 3200, 2024, 'Mr. Anil Shinde', '[]', 1],
      ['Sunrise Commercial Complex', 'A modern 6-story commercial complex with state-of-the-art infrastructure, dedicated parking, and energy-efficient design. Perfect for offices and retail establishments.', 'commercial', 'Baner, Pune', 'completed', 15000, 2024, 'Sunrise Realty Pvt. Ltd.', '[]', 1],
      ['Green Meadows Apartments', 'A residential apartment project with 48 units spread across 4 floors. Features landscaped gardens, clubhouse, gym, and 24/7 security.', 'residential', 'Hinjewadi, Pune', 'completed', 28000, 2023, 'Green Meadows Society', '[]', 1],
      ['Heritage Hotel Renovation', 'Complete renovation of a heritage property into a boutique hotel. Preserved original architectural elements while adding modern amenities and interiors.', 'renovation', 'Shivajinagar, Pune', 'completed', 8500, 2023, 'Heritage Hospitality Group', '[]', 0],
      ['Tech Park Office Block', 'A premium 3-block office complex designed for leading IT companies. Includes modern workspaces, conference facilities, cafeteria, and rooftop terrace.', 'commercial', 'Magarpatta, Pune', 'completed', 42000, 2022, 'TechSpace Developers', '[]', 0],
      ['Sai Residency', 'An elegant 32-unit residential complex offering 2BHK and 3BHK apartments. Features a modern design with open spaces, children\'s play area, and senior citizen amenities.', 'residential', 'Wakad, Pune', 'completed', 18500, 2023, 'Sai Housing Society', '[]', 0],
      ['Metro Business Centre', 'Ongoing construction of a 10-story mixed-use development with offices on upper floors and retail/commercial space on lower levels.', 'commercial', 'Viman Nagar, Pune', 'ongoing', 35000, null, 'Metro Developers', '[]', 0],
      ['Luxury Interior — Kapoor Residence', 'Complete interior design and execution for a 2500 sqft penthouse apartment. Custom furniture, premium materials, and innovative lighting design.', 'interior', 'Koregaon Park, Pune', 'completed', 2500, 2024, 'Mr. Vikram Kapoor', '[]', 0],
    ];

    projects.forEach(p => insertProject.run(...p));
  }

  // Seed testimonials if empty
  const testCount = database.prepare('SELECT COUNT(*) as count FROM testimonials').get();
  if (testCount.count === 0) {
    const insertTestimonial = database.prepare(`
      INSERT INTO testimonials (client_name, project_type, rating, review_text)
      VALUES (?, ?, ?, ?)
    `);

    const testimonials = [
      ['Mr. Ramesh Patil', 'Residential Construction', 5, 'Suyog Constructions built our dream home exactly as we envisioned. The quality of work is exceptional, and the team was professional and punctual throughout the project. Highly recommended!'],
      ['Ms. Priya Sharma', 'Interior Design', 5, 'We are absolutely thrilled with our home interior. The team understood our requirements perfectly and delivered a stunning result within budget. Their attention to detail is remarkable.'],
      ['Mr. Suresh Mehta', 'Commercial Construction', 5, 'Our office complex was completed on time and within budget. Suyog Constructions demonstrated excellent project management and construction quality. We\'re very satisfied clients.'],
      ['Mrs. Kavita Desai', 'Home Renovation', 4, 'The renovation of our old house was done beautifully. The team was cooperative, handled all challenges professionally, and delivered great results. Would definitely work with them again.'],
      ['Mr. Anand Joshi', 'Residential Construction', 5, 'Building our bungalow with Suyog Constructions was a wonderful experience. They maintained complete transparency about costs and timelines, and the final result exceeded our expectations.'],
    ];

    testimonials.forEach(t => insertTestimonial.run(...t));
  }
}

module.exports = { getDb, initializeDatabase };
