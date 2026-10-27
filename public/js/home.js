/**
 * Suyog Constructions — home.js
 * Homepage-specific: hero particles, testimonial slider, auto counters, particle effects
 */
(function () {
  'use strict';

  // ── Hero Particles ────────────────────────────────────────────────────────────
  const particlesContainer = document.getElementById('particles');

  if (particlesContainer) {
    for (let i = 0; i < 25; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        animation-duration: ${Math.random() * 15 + 10}s;
        animation-delay: ${Math.random() * 10}s;
        opacity: ${Math.random() * 0.5 + 0.2};
      `;
      particlesContainer.appendChild(particle);
    }
  }


  // ── Testimonials Slider ───────────────────────────────────────────────────────
  const track    = document.getElementById('testimonials-track');
  const slides   = document.querySelectorAll('.testimonial-slide');
  const dotsWrap = document.getElementById('testimonial-dots');
  const prevBtn  = document.getElementById('testimonial-prev');
  const nextBtn  = document.getElementById('testimonial-next');

  if (track && slides.length > 0) {
    let current  = 0;
    let autoplay = null;

    // Create dots
    const dots = [];
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap?.appendChild(dot);
      dots.push(dot);
    });

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function nextSlide() { goTo(current + 1); }
    function prevSlide() { goTo(current - 1); }

    function startAutoplay() {
      autoplay = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
      clearInterval(autoplay);
    }

    prevBtn?.addEventListener('click', () => { stopAutoplay(); prevSlide(); startAutoplay(); });
    nextBtn?.addEventListener('click', () => { stopAutoplay(); nextSlide(); startAutoplay(); });

    // Touch/swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
      }
    });

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

})();
