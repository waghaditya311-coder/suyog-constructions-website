# Frontend Design System — Suyog Constructions Website

---

## Site Map & Page Structure

```
suyog-constructions/
│
├── index.html              ← Home Page
├── about.html              ← About Us
├── services.html           ← Our Services
├── projects.html           ← Projects Portfolio
├── contact.html            ← Contact Us
│
├── css/
│   ├── variables.css       ← Design tokens
│   ├── base.css            ← Reset + base styles
│   ├── components.css      ← Reusable UI components
│   └── pages.css           ← Page-specific styles
│
├── js/
│   ├── main.js             ← Navigation, mobile menu, common
│   ├── home.js             ← Home page animations
│   ├── projects.js         ← Portfolio filtering + API calls
│   ├── contact.js          ← Contact form logic
│   └── inquiry.js          ← Inquiry form logic
│
├── images/
│   ├── logo.svg
│   ├── hero-bg.jpg
│   └── projects/
│
└── public/
    ├── sitemap.xml
    └── robots.txt
```

---

## Design System

### Color Palette

| Token                | Value     | Usage                              |
|----------------------|-----------|------------------------------------|
| `--color-primary`    | `#1A1A2E` | Dark navy — backgrounds            |
| `--color-secondary`  | `#16213E` | Slightly lighter navy              |
| `--color-accent`     | `#C9A84C` | Gold — headings, CTAs, highlights  |
| `--color-accent-light` | `#E8C97A` | Light gold hover                 |
| `--color-surface`    | `#0F3460` | Card backgrounds                   |
| `--color-text`       | `#F0EFE9` | Primary text (off-white)           |
| `--color-text-muted` | `#A8A8B3` | Secondary/muted text               |
| `--color-success`    | `#4CAF50` | Form success messages              |
| `--color-error`      | `#F44336` | Form error messages                |
| `--color-white`      | `#FFFFFF` | Pure white                         |

### Typography

| Token             | Font Family               | Weight   | Usage                |
|-------------------|---------------------------|----------|----------------------|
| `--font-heading`  | `'Playfair Display', serif` | 700, 800 | Section headings    |
| `--font-body`     | `'Inter', sans-serif`     | 400, 500 | Body text           |
| `--font-accent`   | `'Montserrat', sans-serif`| 600      | Buttons, labels     |

### Font Scale

| Token          | Size   | Usage                  |
|----------------|--------|------------------------|
| `--text-xs`    | 0.75rem | Labels, badges        |
| `--text-sm`    | 0.875rem | Small body            |
| `--text-base`  | 1rem    | Body text             |
| `--text-lg`    | 1.125rem | Large body           |
| `--text-xl`    | 1.25rem | Sub-headings          |
| `--text-2xl`   | 1.5rem  | Section subheadings   |
| `--text-3xl`   | 1.875rem | Section headings      |
| `--text-4xl`   | 2.25rem | Page headings         |
| `--text-5xl`   | 3rem    | Hero heading          |
| `--text-6xl`   | 3.75rem | Large hero            |

### Spacing & Layout

- 8px grid system
- Max content width: 1280px
- Responsive breakpoints: 480px / 768px / 1024px / 1280px

### Shadows & Effects

| Token               | Value                                              |
|---------------------|----------------------------------------------------|
| `--shadow-sm`       | `0 1px 3px rgba(0,0,0,0.3)`                        |
| `--shadow-md`       | `0 4px 16px rgba(0,0,0,0.4)`                       |
| `--shadow-lg`       | `0 8px 32px rgba(0,0,0,0.5)`                       |
| `--shadow-glow`     | `0 0 20px rgba(201,168,76,0.3)`                    |
| `--glass-bg`        | `rgba(255,255,255,0.05)`                           |
| `--glass-border`    | `1px solid rgba(201,168,76,0.2)`                   |
| `--border-radius-sm`| `4px`                                              |
| `--border-radius-md`| `8px`                                              |
| `--border-radius-lg`| `16px`                                             |
| `--border-radius-xl`| `24px`                                             |

---

## Page Layouts

### Home Page Sections
1. **Navigation** — Sticky, transparent → solid on scroll
2. **Hero Section** — Full-screen with parallax background, headline, CTA buttons
3. **Stats Bar** — Animated counters: 15+ Years, 500+ Projects, 50+ Experts, 100% Satisfaction
4. **Services Overview** — 4 service cards with icons
5. **Featured Projects** — 3-column grid of top projects
6. **Why Choose Us** — Feature list with icons
7. **Testimonials** — Carousel/slider of client reviews
8. **CTA Banner** — "Start Your Project Today" with WhatsApp button
9. **Footer** — Links, social media, address, copyright

### About Page Sections
1. **Page Hero** — Title banner with background image
2. **Company Story** — Text + image layout
3. **Vision & Mission** — Two-column cards
4. **Team/Expertise** — Areas of expertise grid
5. **Timeline** — Company milestones

### Services Page Sections
1. **Page Hero**
2. **Services Grid** — Detailed service cards (Residential, Commercial, Renovation, Interior, Structural)
3. **Process** — How we work (step-by-step)
4. **CTA** — Get a quote

### Projects Page Sections
1. **Page Hero**
2. **Filter Bar** — All / Residential / Commercial / Renovation / Interior / Ongoing
3. **Project Grid** — Masonry/card grid, loads via API
4. **Load More** — Pagination button

### Contact Page Sections
1. **Page Hero**
2. **Contact Info Cards** — Phone, email, address
3. **Google Maps Embed**
4. **Contact Form** — General inquiry
5. **Inquiry Form** — Detailed project quotation
6. **WhatsApp CTA**

---

## Component Library

### Buttons
- `.btn-primary` — Gold background, dark text
- `.btn-secondary` — Transparent with gold border
- `.btn-whatsapp` — Green with WhatsApp icon

### Cards
- `.project-card` — Image, overlay on hover, title, category badge
- `.service-card` — Icon, title, description, hover lift
- `.stat-card` — Large number, label

### Forms
- `.form-group` — Label + input with floating labels
- `.form-control` — Input/select/textarea with gold focus ring
- `.form-error` — Red error message below field
- `.form-success` — Green success state

### Navigation
- `.navbar` — Sticky with blur backdrop
- `.nav-link` — Underline animation on hover
- `.hamburger` — Mobile menu toggle

---

## Animations & Interactions

| Animation           | Trigger          | Description                              |
|---------------------|------------------|------------------------------------------|
| Hero parallax       | Scroll           | Background moves slower than content     |
| Counter animation   | Scroll into view | Numbers count up from 0                  |
| Card hover lift     | Mouse hover      | `translateY(-8px)` + shadow increase     |
| Section fade-in     | Scroll into view | IntersectionObserver fade + slide up     |
| Project filter      | Click            | Smooth hide/show with CSS transitions    |
| Form validation     | Input blur       | Real-time validation feedback            |
| Testimonial slider  | Auto / manual    | Smooth transition carousel               |
| Navbar transition   | Scroll           | Transparent → dark blur on scroll        |

---

## Mobile Responsiveness

- Mobile-first CSS approach
- Hamburger menu for mobile navigation
- Single-column layouts on mobile
- Touch-friendly tap targets (min 44px)
- Optimized font sizes for small screens
- Lazy-loaded images for performance
