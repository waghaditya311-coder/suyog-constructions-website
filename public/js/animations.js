/**
 * Suyog Constructions — animations.js
 * Dynamic enhancements:
 *   1. Cursor spotlight + ring
 *   2. Hero parallax (scroll + mouse)
 *   3. Typewriter effect on hero title
 *   4. 3D tilt on service/project cards
 *   5. Magnetic button effect
 *   6. Page-load staggered entrance
 *   7. Marquee ticker (injected dynamically)
 */
(function () {
  'use strict';

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  // Detect touch
  const isTouch = () => window.matchMedia('(hover: none)').matches;


  // ══════════════════════════════════════════════════════════════════════════
  // 1. CURSOR SPOTLIGHT + RING
  // ══════════════════════════════════════════════════════════════════════════
  if (!isTouch()) {
    const spotlight = document.createElement('div');
    spotlight.className = 'cursor-spotlight';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    document.body.append(spotlight, ring);

    let mx = -999, my = -999;
    let ringX = -999, ringY = -999;
    let raf = null;

    function updateSpotlight() {
      spotlight.style.left = `${mx}px`;
      spotlight.style.top  = `${my}px`;
    }

    // Ring follows with slight lag
    function animateRing() {
      ringX += (mx - ringX) * 0.12;
      ringY += (my - ringY) * 0.12;
      ring.style.left = `${ringX}px`;
      ring.style.top  = `${ringY}px`;
      raf = requestAnimationFrame(animateRing);
    }

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      spotlight.classList.remove('hidden');
      ring.classList.remove('hidden');
      updateSpotlight();
    });

    document.addEventListener('mouseleave', () => {
      spotlight.classList.add('hidden');
      ring.classList.add('hidden');
    });

    // Expand ring on interactive elements
    const interactiveSelectors = 'a, button, .service-card, .project-card, .stat-box, .btn, [data-tilt]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        ring.classList.add('hovering');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveSelectors)) {
        ring.classList.remove('hovering');
      }
    });

    animateRing();
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 2. HERO PARALLAX — SCROLL + MOUSE TRACKING
  // ══════════════════════════════════════════════════════════════════════════
  const heroBg      = document.getElementById('hero-bg');
  const heroOverlay = document.querySelector('.hero-overlay');
  const heroSection = document.getElementById('hero');

  // Scroll parallax
  if (heroBg && heroSection) {
    function onScrollParallax() {
      const scrollY   = window.scrollY;
      const heroH     = heroSection.offsetHeight;
      if (scrollY > heroH) return;
      const progress  = scrollY / heroH;
      heroBg.style.transform = `translateY(${progress * 40}%) scale(1.08)`;
    }
    window.addEventListener('scroll', onScrollParallax, { passive: true });
    onScrollParallax();
  }

  // Mouse-tracking parallax on hero
  if (!isTouch() && heroSection && heroOverlay) {
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const cx   = (e.clientX - rect.left) / rect.width  - 0.5; // -0.5 to 0.5
      const cy   = (e.clientY - rect.top)  / rect.height - 0.5;
      heroOverlay.style.transform = `translate(${cx * 20}px, ${cy * 10}px)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      heroOverlay.style.transform = 'translate(0, 0)';
    });
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 3. TYPEWRITER EFFECT — HERO TITLE
  // ══════════════════════════════════════════════════════════════════════════
  const heroTitle = $('.hero-title');

  function typewriteHeroTitle(titleEl) {
    if (!titleEl) return;

    // Build word groups preserving spans and <br>
    // We'll reconstruct char-by-char after a short page-load delay
    const originalHTML = titleEl.innerHTML;

    // Parse into tokens: text chars, <br>, <span> … </span>
    function* tokenize(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
      const root = doc.querySelector('div');
      for (const node of root.childNodes) {
        if (node.nodeType === Node.TEXT_NODE) {
          for (const ch of node.textContent) {
            yield { type: 'char', value: ch };
          }
        } else if (node.nodeName === 'BR') {
          yield { type: 'br' };
        } else if (node.nodeName === 'SPAN') {
          yield { type: 'span-open', classes: node.className };
          for (const ch of node.textContent) {
            yield { type: 'char', value: ch, insideSpan: true };
          }
          yield { type: 'span-close' };
        }
      }
    }

    const tokens = [...tokenize(originalHTML)];

    // Clear title
    titleEl.innerHTML = '';
    titleEl.style.opacity = '1';
    titleEl.style.transform = 'none';

    let currentSpan = null;
    let container = titleEl;

    // Insert cursor
    const cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    cursor.style.height = '0.85em';
    titleEl.appendChild(cursor);

    let i = 0;
    const BASE_DELAY = 28; // ms per character
    const SPACE_DELAY = 14;

    function renderNext() {
      if (i >= tokens.length) {
        // Remove cursor after a moment
        setTimeout(() => cursor.remove(), 1200);
        return;
      }

      const token = tokens[i++];

      if (token.type === 'br') {
        const br = document.createElement('br');
        titleEl.insertBefore(br, cursor);
        setTimeout(renderNext, BASE_DELAY * 3);

      } else if (token.type === 'span-open') {
        currentSpan = document.createElement('span');
        currentSpan.className = token.classes;
        titleEl.insertBefore(currentSpan, cursor);
        container = currentSpan;
        setTimeout(renderNext, 0);

      } else if (token.type === 'span-close') {
        currentSpan = null;
        container = titleEl;
        setTimeout(renderNext, 0);

      } else if (token.type === 'char') {
        const charEl = document.createElement('span');
        charEl.className = 'char-reveal';
        charEl.style.animationDelay = '0ms';
        charEl.textContent = token.value === ' ' ? '\u00A0' : token.value;

        if (container !== titleEl) {
          container.appendChild(charEl);
        } else {
          titleEl.insertBefore(charEl, cursor);
        }

        const delay = token.value === ' ' ? SPACE_DELAY : BASE_DELAY;
        setTimeout(renderNext, delay);
      }
    }

    // Start typewriter after page entrance animation (~600ms)
    setTimeout(renderNext, 700);
  }

  if (heroTitle) {
    // Prevent the default reveal animation for the hero title
    heroTitle.classList.remove('reveal');
    heroTitle.style.opacity = '0';
    typewriteHeroTitle(heroTitle);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 4. 3D CARD TILT
  // ══════════════════════════════════════════════════════════════════════════
  const TILT_MAX = 10; // degrees

  function addTilt(cards) {
    cards.forEach(card => {
      if (isTouch()) return;

      // Add tilt-card class and shine overlay
      card.classList.add('tilt-card');
      const shine = document.createElement('div');
      shine.className = 'tilt-shine';
      card.style.position = card.style.position || 'relative';
      card.prepend(shine);

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx   = (e.clientX - rect.left)  / rect.width  - 0.5; // -0.5 to 0.5
        const cy   = (e.clientY - rect.top)    / rect.height - 0.5;
        const rotX = clamp(-cy * TILT_MAX * 2, -TILT_MAX, TILT_MAX);
        const rotY = clamp( cx * TILT_MAX * 2, -TILT_MAX, TILT_MAX);

        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
        card.style.transition = 'transform 0.08s linear, box-shadow 0.2s ease';
        card.style.boxShadow  = `
          ${-rotY * 2}px ${rotX * 2}px 40px rgba(0,0,0,0.4),
          0 0 30px rgba(201,168,76,0.15)
        `;

        // Shine position (relative within card)
        const mx = ((e.clientX - rect.left) / rect.width)  * 100;
        const my = ((e.clientY - rect.top)  / rect.height) * 100;
        shine.style.setProperty('--mx', `${mx}%`);
        shine.style.setProperty('--my', `${my}%`);
      });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease';
        card.style.transform  = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        card.style.boxShadow  = '';
      });
    });
  }

  // Apply to service cards and project cards
  // Use setTimeout to ensure DOM is fully painted
  setTimeout(() => {
    addTilt($$('.service-card'));
    addTilt($$('.project-card'));
    addTilt($$('.stat-box'));
  }, 200);

  // Re-apply to dynamically added project cards (if projects.js loads them)
  const projectsGrid = document.getElementById('featured-projects-grid') || document.querySelector('.projects-grid');
  if (projectsGrid) {
    const tiltMutObserver = new MutationObserver(() => {
      addTilt($$('.project-card:not(.tilt-card)', projectsGrid));
    });
    tiltMutObserver.observe(projectsGrid, { childList: true });
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 5. MAGNETIC BUTTON EFFECT
  // ══════════════════════════════════════════════════════════════════════════
  if (!isTouch()) {
    $$('.btn-primary, .btn-secondary, .nav-cta').forEach(btn => {
      btn.classList.add('magnetic');

      btn.addEventListener('mousemove', (e) => {
        const rect  = btn.getBoundingClientRect();
        const cx    = e.clientX - rect.left - rect.width  / 2;
        const cy    = e.clientY - rect.top  - rect.height / 2;
        btn.style.transform = `translate(${cx * 0.25}px, ${cy * 0.35}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      });
    });
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 6. PAGE-LOAD STAGGERED ENTRANCE
  // ══════════════════════════════════════════════════════════════════════════
  const entranceEls = [
    '.navbar',
    '.hero-badge',
    '.hero-description',
    '.hero-actions',
    '.hero-trust',
    '.hero-scroll-indicator',
  ];

  // Mark them hidden initially via JS (prevents flash)
  entranceEls.forEach((sel) => {
    const el = $(sel);
    if (el) el.classList.add('page-load-hidden');
  });

  window.addEventListener('DOMContentLoaded', () => {}, { once: true });

  // Trigger after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      entranceEls.forEach((sel, idx) => {
        const el = $(sel);
        if (!el) return;
        setTimeout(() => {
          el.classList.remove('page-load-hidden');
          el.classList.add('page-load-enter');
          el.style.animationDelay = '0ms';
        }, idx * 90);
      });
    });
  });


  // ══════════════════════════════════════════════════════════════════════════
  // 7. MARQUEE TICKER (injected between stats & projects sections)
  // ══════════════════════════════════════════════════════════════════════════
  const stats     = document.getElementById('stats');
  const projects  = document.getElementById('featured-projects');

  if (stats && projects) {
    const items = [
      { icon: '🏗️', text: '500+ Projects Completed' },
      { icon: '⭐', text: 'ISO Certified Quality' },
      { icon: '⏱️', text: '98% On-Time Delivery' },
      { icon: '🏠', text: 'Residential Excellence' },
      { icon: '🏢', text: 'Commercial Construction' },
      { icon: '🔨', text: 'Expert Renovation' },
      { icon: '👷', text: '50+ Expert Professionals' },
      { icon: '📍', text: 'Serving All of Pune' },
      { icon: '💰', text: 'Transparent Pricing' },
      { icon: '🎨', text: 'Premium Interior Design' },
    ];

    // Duplicate for seamless loop
    const allItems = [...items, ...items];

    const band  = document.createElement('div');
    band.className = 'marquee-band';
    band.setAttribute('aria-hidden', 'true');

    const track = document.createElement('div');
    track.className = 'marquee-track';

    allItems.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'marquee-item';
      el.innerHTML = `
        <span class="marquee-icon">${item.icon}</span>
        <span>${item.text}</span>
        ${idx < allItems.length - 1 ? '<span class="marquee-sep"></span>' : ''}
      `;
      track.appendChild(el);
    });

    band.appendChild(track);
    stats.insertAdjacentElement('afterend', band);
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 8. FLOATING HERO BADGES
  // ══════════════════════════════════════════════════════════════════════════
  const heroContent = $('.hero-content');
  const hero        = document.getElementById('hero');

  if (hero && heroContent) {
    const badges = [
      { icon: '🏆', strong: 'Award Winning', sub: 'Construction Company' },
      { icon: '✅', strong: '500+ Happy Clients', sub: 'Across Pune' },
    ];

    badges.forEach((b, idx) => {
      const el = document.createElement('div');
      el.className = 'hero-float-badge';
      el.style.animationDelay = `${idx * 2}s`;
      el.innerHTML = `
        <div class="hero-float-badge-icon">${b.icon}</div>
        <div class="hero-float-badge-text">
          <strong>${b.strong}</strong>
          <span>${b.sub}</span>
        </div>
      `;
      hero.appendChild(el);
    });
  }


  // ══════════════════════════════════════════════════════════════════════════
  // 9. SHIMMER on HERO TITLE ACCENT
  // ══════════════════════════════════════════════════════════════════════════
  // Applied after typewriter completes — will set class on span.hero-title-accent
  setTimeout(() => {
    $$('.hero-title-accent').forEach(el => {
      el.classList.add('shimmer-text');
    });
  }, 3500);


  // ══════════════════════════════════════════════════════════════════════════
  // 10. SCROLL PROGRESS BAR
  // ══════════════════════════════════════════════════════════════════════════
  const bar = document.createElement('div');
  bar.id = 'scroll-progress-bar';
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; height: 3px; width: 0%;
    background: linear-gradient(90deg, #C9A84C, #E8C97A, #C9A84C);
    background-size: 200% auto;
    animation: shimmer 2s linear infinite;
    z-index: 9999; pointer-events: none;
    transition: width 0.1s linear;
    box-shadow: 0 0 8px rgba(201, 168, 76, 0.5);
  `;
  document.body.prepend(bar);

  window.addEventListener('scroll', () => {
    const docH    = document.documentElement.scrollHeight - window.innerHeight;
    const pct     = docH > 0 ? (window.scrollY / docH) * 100 : 0;
    bar.style.width = `${pct}%`;
  }, { passive: true });


  // ══════════════════════════════════════════════════════════════════════════
  // 11. SECTION ACTIVE HIGHLIGHT in NAVBAR
  // ══════════════════════════════════════════════════════════════════════════
  // Only on homepage — highlight section in nav as user scrolls
  if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-links .nav-link');

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            // Home is active when hero is in view
            if (href === '/' || href === '/index.html') {
              link.classList.toggle('active', entry.target.id === 'hero');
            }
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(s => sectionObserver.observe(s));
  }

})();
