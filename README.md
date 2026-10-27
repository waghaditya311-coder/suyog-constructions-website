# Suyog Constructions Website

Professional business website for Suyog Constructions.

## Tech Stack
- **Frontend:** HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend:** Node.js + Express.js
- **Database:** SQLite (better-sqlite3)
- **Email:** Nodemailer
- **Auth:** JWT

## Project Structure
```
suyog-constructions/
├── documents/          ← Design documents
├── public/             ← Frontend (HTML, CSS, JS, images)
│   ├── css/
│   ├── js/
│   ├── images/
│   └── *.html
├── src/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   └── services/
├── data/               ← SQLite database file
├── scripts/            ← Setup scripts
├── .env.example
├── server.js
└── package.json
```

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Initialize database:**
   ```bash
   npm run init-db
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Visit:** `http://localhost:3000`

## Environment Variables
See `.env.example` for all required variables.

## Admin Panel
Visit `/admin` to access the admin dashboard.
Default credentials are set during `npm run init-db`.
