/**
 * Suyog Constructions — main.js
 * Shared utilities: navigation, scroll, reveal animations, toast, back-to-top, WhatsApp
 */
(function () {
  'use strict';

  // ── Navigation ──────────────────────────────────────────────────────────────
  const navbar       = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileNav    = document.getElementById('mobile-nav');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }

  function toggleMobileNav() {
    const isOpen = hamburgerBtn?.classList.toggle('open');
    mobileNav?.classList.toggle('open', isOpen);
    hamburgerBtn?.setAttribute('aria-expanded', String(isOpen));
    mobileNav?.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileNav() {
    hamburgerBtn?.classList.remove('open');
    mobileNav?.classList.remove('open');
    hamburgerBtn?.setAttribute('aria-expanded', 'false');
    mobileNav?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Set active nav link
  function setActiveNavLink() {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    document.querySelectorAll('.nav-link').forEach(link => {
      const linkPath = new URL(link.href).pathname.replace(/\/$/, '') || '/';
      link.classList.toggle('active', linkPath === currentPath);
    });
  }

  hamburgerBtn?.addEventListener('click', toggleMobileNav);

  // Close mobile nav on link click
  document.querySelectorAll('.mobile-nav .nav-link, .mobile-nav .nav-cta').forEach(link => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (mobileNav?.classList.contains('open') &&
        !mobileNav.contains(e.target) &&
        !hamburgerBtn?.contains(e.target)) {
      closeMobileNav();
    }
  });

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();
  setActiveNavLink();


  // ── Scroll Reveal Animations ─────────────────────────────────────────────────
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger child reveals
        const siblings = Array.from(entry.target.parentElement?.querySelectorAll('.reveal') || []);
        const delay = siblings.indexOf(entry.target) * 80;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));


  // ── Counter Animation ────────────────────────────────────────────────────────
  function animateCounter(el, target, duration = 2000) {
    const start = performance.now();
    const startVal = 0;

    function update(timestamp) {
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + (target - startVal) * easedProgress);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target;
    }
    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target, 10);
        if (!isNaN(target)) animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));


  // ── Back to Top ───────────────────────────────────────────────────────────────
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    backToTop?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  // ── Toast Notification ────────────────────────────────────────────────────────
  window.showToast = function (message, type = 'success', duration = 5000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : '❌'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };


  // ── Smooth Scroll for Anchor Links ───────────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const offset = navbar ? navbar.offsetHeight + 16 : 80;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth',
        });
      }
    });
  });


  // ── Handle hash on page load (for #inquiry etc.) ─────────────────────────────
  if (window.location.hash) {
    setTimeout(() => {
      const hash = window.location.hash.slice(1);
      const target = document.getElementById(hash);
      if (target) {
        const offset = navbar ? navbar.offsetHeight + 16 : 80;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth',
        });
      }
    }, 300);
  }

})();
