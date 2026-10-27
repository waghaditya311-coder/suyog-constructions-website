# System Architecture — Suyog Constructions Website

## Overview

The Suyog Constructions website is a **static-first, progressively enhanced** web application. It uses a lightweight backend (Node.js + Express) only for form handling (inquiry submissions, contact forms, email notifications). The frontend is a multi-page HTML/CSS/JS site served via the Node server.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                           │
│   Browser (Mobile / Tablet / Desktop)                           │
│   HTML5 + CSS3 + Vanilla JS                                     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP / HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                        SERVER LAYER                             │
│   Node.js + Express.js                                          │
│   ┌─────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│   │ Static File │  │  REST API    │  │   Email Service       │ │
│   │   Server    │  │  /api/v1/*   │  │   (Nodemailer/SMTP)   │ │
│   └─────────────┘  └──────┬───────┘  └───────────────────────┘ │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                       DATA LAYER                                │
│   SQLite (via better-sqlite3)                                   │
│   ┌───────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│   │  inquiries    │  │    projects      │  │   contacts     │  │
│   └───────────────┘  └──────────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Choices

| Layer        | Technology         | Reason                                              |
|--------------|--------------------|-----------------------------------------------------|
| Frontend     | HTML5 / CSS3 / JS  | Zero dependency, fast load, SEO-friendly            |
| Backend      | Node.js + Express  | Lightweight, easy deployment, good ecosystem        |
| Database     | SQLite             | Simple, file-based, no separate server needed       |
| Email        | Nodemailer         | Reliable SMTP integration for inquiry notifications |
| Maps         | Google Maps Embed  | Easy integration, no API key needed for embed       |
| WhatsApp     | WhatsApp Click API | wa.me link — no backend integration needed          |

---

## Deployment Architecture

```
┌─────────────────────────────────┐
│     Production Environment      │
│  VPS / Cloud VM (Ubuntu 22.04)  │
│                                 │
│  ┌────────────────────────────┐ │
│  │   Nginx (Reverse Proxy)    │ │
│  │   Port 80/443 → 3000       │ │
│  └────────────┬───────────────┘ │
│               │                 │
│  ┌────────────▼───────────────┐ │
│  │   Node.js App (PM2)        │ │
│  │   Port 3000                │ │
│  └────────────────────────────┘ │
│                                 │
│  SSL: Let's Encrypt (Certbot)   │
└─────────────────────────────────┘
```

---

## Security Considerations

- Input validation and sanitization on all form fields (server-side)
- CSRF protection via token middleware
- Rate limiting on `/api/v1/inquiry` (max 5 requests/hour per IP)
- Helmet.js for HTTP security headers
- Environment variables for all secrets (no hardcoded credentials)
- SQL parameterized queries (no string concatenation)

---

## Performance Targets

| Metric               | Target          |
|----------------------|-----------------|
| First Contentful Paint | < 1.5s        |
| Largest Contentful Paint | < 2.5s      |
| Time to Interactive  | < 3s            |
| PageSpeed Score      | > 90            |
| Mobile Score         | > 85            |

---

## SEO Strategy

- Semantic HTML5 (header, main, section, article, footer)
- Meta tags: title, description, keywords, og:tags
- Schema.org structured data (LocalBusiness, ConstructionBusiness)
- Sitemap.xml and robots.txt
- Canonical URLs
- Alt text for all images
- Lazy loading for project images
