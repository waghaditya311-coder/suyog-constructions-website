# Database Design — Suyog Constructions Website

## Database: SQLite (better-sqlite3)
**File:** `data/suyog.db`

---

## Entity Relationship Diagram

```
┌─────────────────────┐         ┌──────────────────────────┐
│      inquiries      │         │         projects          │
├─────────────────────┤         ├──────────────────────────┤
│ id (PK)             │         │ id (PK)                  │
│ name                │         │ title                    │
│ email               │         │ description              │
│ phone               │         │ category                 │
│ service_type        │         │ location                 │
│ budget_range        │         │ status                   │
│ project_location    │         │ area_sqft                │
│ message             │         │ year_completed           │
│ status              │         │ client_name              │
│ created_at          │         │ image_urls (JSON)        │
│ updated_at          │         │ featured                 │
└─────────────────────┘         │ created_at               │
                                │ updated_at               │
                                └──────────────────────────┘

┌─────────────────────┐         ┌──────────────────────────┐
│   contact_messages  │         │       testimonials        │
├─────────────────────┤         ├──────────────────────────┤
│ id (PK)             │         │ id (PK)                  │
│ name                │         │ client_name              │
│ email               │         │ project_type             │
│ phone               │         │ rating                   │
│ subject             │         │ review_text              │
│ message             │         │ is_active                │
│ is_read             │         │ created_at               │
│ created_at          │         └──────────────────────────┘
└─────────────────────┘
```

---

## Table Definitions

### 1. `inquiries` — Customer Quotation Requests

```sql
CREATE TABLE inquiries (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT    NOT NULL,
    email           TEXT    NOT NULL,
    phone           TEXT    NOT NULL,
    service_type    TEXT    NOT NULL,  -- 'residential', 'commercial', 'renovation', 'interior', 'other'
    budget_range    TEXT,              -- '10L-25L', '25L-50L', '50L-1Cr', '1Cr+'
    project_location TEXT,
    message         TEXT    NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'new',  -- 'new', 'contacted', 'in_progress', 'closed'
    created_at      DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at      DATETIME NOT NULL DEFAULT (datetime('now'))
);
```

### 2. `contact_messages` — General Contact Form Submissions

```sql
CREATE TABLE contact_messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL,
    phone       TEXT,
    subject     TEXT    NOT NULL,
    message     TEXT    NOT NULL,
    is_read     INTEGER NOT NULL DEFAULT 0,  -- 0=unread, 1=read
    created_at  DATETIME NOT NULL DEFAULT (datetime('now'))
);
```

### 3. `projects` — Portfolio Projects

```sql
CREATE TABLE projects (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    title           TEXT    NOT NULL,
    description     TEXT    NOT NULL,
    category        TEXT    NOT NULL,  -- 'residential', 'commercial', 'renovation', 'interior'
    location        TEXT    NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'completed',  -- 'completed', 'ongoing', 'upcoming'
    area_sqft       INTEGER,
    year_completed  INTEGER,
    client_name     TEXT,
    image_urls      TEXT,              -- JSON array of image paths
    featured        INTEGER NOT NULL DEFAULT 0,  -- 0=no, 1=yes
    created_at      DATETIME NOT NULL DEFAULT (datetime('now')),
    updated_at      DATETIME NOT NULL DEFAULT (datetime('now'))
);
```

### 4. `testimonials` — Client Testimonials

```sql
CREATE TABLE testimonials (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name     TEXT    NOT NULL,
    project_type    TEXT,
    rating          INTEGER NOT NULL DEFAULT 5,  -- 1-5
    review_text     TEXT    NOT NULL,
    is_active       INTEGER NOT NULL DEFAULT 1,
    created_at      DATETIME NOT NULL DEFAULT (datetime('now'))
);
```

---

## Indexes

```sql
-- Fast lookup for inquiry status filtering
CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created ON inquiries(created_at DESC);

-- Project filtering by category and status
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_featured ON projects(featured);

-- Unread contact messages
CREATE INDEX idx_contacts_is_read ON contact_messages(is_read);
```

---

## Seed Data (Initial)

The database will be seeded with:
- 8 sample projects across all categories
- 5 client testimonials
- Default admin credentials (hashed)

---

## Backup Strategy

- SQLite database file backed up daily via cron job
- Backup stored in `/backups/suyog-YYYY-MM-DD.db`
- Retain last 30 days of backups
