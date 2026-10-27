require('dotenv').config();
const bcrypt = require('bcryptjs');
const { initializeDatabase, getDb } = require('../src/config/database');

console.log('🔧 Initializing Suyog Constructions database...\n');
initializeDatabase();

const db = getDb();

// Create default admin account
const existingAdmin = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('SuyogAdmin@2024', 10);
  db.prepare('INSERT INTO admins (username, email, password) VALUES (?, ?, ?)').run(
    'admin',
    'admin@suyogconstructions.com',
    hashedPassword
  );
  console.log('✅ Admin account created:');
  console.log('   Username: admin');
  console.log('   Password: SuyogAdmin@2024');
  console.log('   ⚠️  Please change the password after first login!\n');
} else {
  console.log('ℹ️  Admin account already exists.\n');
}

console.log('🎉 Database setup complete!');
console.log('📦 Run `npm run dev` to start the server.\n');
process.exit(0);
