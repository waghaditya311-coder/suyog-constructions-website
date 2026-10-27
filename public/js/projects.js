/**
 * Suyog Constructions — projects.js
 * Portfolio page: fetch projects from API, filter, render, paginate
 */
(function () {
  'use strict';

  const grid        = document.getElementById('projects-grid');
  const loadingEl   = document.getElementById('projects-loading');
  const emptyEl     = document.getElementById('projects-empty');
  const loadMoreWrap = document.getElementById('load-more-wrap');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const filterBtns  = document.querySelectorAll('.filter-btn');

  const CATEGORY_EMOJIS = {
    residential: '🏠',
    commercial:  '🏢',
    renovation:  '🔨',
    interior:    '🎨',
    structural:  '🏗️',
    ongoing:     '🚧',
  };

  const LIMIT = 6;
  let currentFilter = 'all';
  let currentPage   = 1;
  let allProjects   = [];
  let totalProjects = 0;

  // ── Fetch Projects ─────────────────────────────────────────────────────────
  async function fetchProjects(filter, page) {
    let url = `/api/v1/projects?limit=${LIMIT}&page=${page}`;
    if (filter !== 'all' && filter !== 'ongoing') {
      url += `&category=${filter}`;
    } else if (filter === 'ongoing') {
      url += `&status=ongoing`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch projects');
    const data = await res.json();
    return data;
  }

  // ── Render Project Card ────────────────────────────────────────────────────
  function createProjectCard(project) {
    const emoji = CATEGORY_EMOJIS[project.category] || '🏗️';
    const statusBadge = project.status === 'ongoing'
      ? `<span class="badge badge-blue" style="position:absolute;top:12px;right:12px;z-index:2;">🚧 Ongoing</span>`
      : '';

    return `
      <article class="project-card" data-category="${project.category}" data-status="${project.status}">
        <div class="project-img-wrap">
          <div class="project-img-placeholder">${emoji}</div>
          ${statusBadge}
          <div class="project-overlay">
            <span class="project-view-btn">View Details</span>
          </div>
        </div>
        <div class="project-info">
          <span class="project-category">${project.category.charAt(0).toUpperCase() + project.category.slice(1)}</span>
          <h3 class="project-title">${project.title}</h3>
          <p style="font-size: var(--text-sm); color: var(--color-text-muted); line-height: 1.5; margin-bottom: var(--space-3); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${project.description}
          </p>
          <div class="project-meta">
            <span class="project-meta-item">📍 ${project.location}</span>
            ${project.area_sqft ? `<span class="project-meta-item">📐 ${project.area_sqft.toLocaleString()} sqft</span>` : ''}
          </div>
          ${project.year_completed ? `<div style="margin-top: var(--space-2);"><span class="badge badge-gold">✅ Completed ${project.year_completed}</span></div>` : ''}
        </div>
      </article>
    `;
  }

  // ── Load & Render ──────────────────────────────────────────────────────────
  async function loadProjects(filter, page, append = false) {
    if (!append) {
      loadingEl.style.display = 'block';
      emptyEl.style.display   = 'none';
      loadMoreWrap.style.display = 'none';
      if (!append) grid.innerHTML = '';
    }
    loadMoreBtn && (loadMoreBtn.disabled = true);

    try {
      const response = await fetchProjects(filter, page);
      const projects  = response.data.projects;
      const pagination = response.data.pagination;

      totalProjects = pagination.total;

      if (projects.length === 0 && !append) {
        loadingEl.style.display = 'none';
        emptyEl.style.display   = 'block';
        return;
      }

      projects.forEach(p => {
        const div = document.createElement('div');
        div.innerHTML = createProjectCard(p);
        const card = div.firstElementChild;
        // Animate in
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        grid.appendChild(card);
        requestAnimationFrame(() => {
          card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        });
      });

      allProjects = append ? [...allProjects, ...projects] : projects;

      // Show/hide load more
      if (allProjects.length < totalProjects) {
        loadMoreWrap.style.display = 'block';
      } else {
        loadMoreWrap.style.display = 'none';
      }

    } catch (err) {
      console.error('[PROJECTS]', err);
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: var(--space-12);">
          <p style="color: var(--color-error);">Failed to load projects. Please refresh the page.</p>
        </div>
      `;
    } finally {
      loadingEl.style.display = 'none';
      if (loadMoreBtn) loadMoreBtn.disabled = false;
    }
  }

  // ── Filters ────────────────────────────────────────────────────────────────
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      currentPage   = 1;
      allProjects   = [];
      loadProjects(currentFilter, currentPage);
    });
  });

  // ── Load More ──────────────────────────────────────────────────────────────
  loadMoreBtn?.addEventListener('click', () => {
    currentPage++;
    loadProjects(currentFilter, currentPage, true);
  });

  // ── Initial Load ───────────────────────────────────────────────────────────
  loadProjects('all', 1);

})();
