/**
 * Suyog Constructions — admin.js
 * Admin dashboard: auth guard, navigation, data fetching, CRUD operations
 */
(function () {
  'use strict';

  // ── Auth Guard ────────────────────────────────────────────────────────────
  const token    = localStorage.getItem('admin_token');
  const username = localStorage.getItem('admin_username');

  if (!token) {
    window.location.href = '/admin/login.html';
    return;
  }

  // Set username in sidebar
  const usernameEl = document.getElementById('sidebar-username');
  if (usernameEl) usernameEl.textContent = username || 'Admin';

  // ── API Helper ────────────────────────────────────────────────────────────
  async function apiRequest(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      logout();
      return null;
    }

    return res.json();
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  function showToast(message, type = 'success', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<span>${icons[type] || '•'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  function logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    window.location.href = '/admin/login.html';
  }

  document.getElementById('logout-btn')?.addEventListener('click', logout);
  document.getElementById('topbar-logout-btn')?.addEventListener('click', logout);

  // ── Sidebar Navigation ────────────────────────────────────────────────────
  const sections = ['overview', 'inquiries', 'contacts', 'projects'];
  let activeSection = 'overview';

  function showSection(name) {
    if (!sections.includes(name)) return;
    activeSection = name;

    sections.forEach(s => {
      const sec = document.getElementById(`section-${s}`);
      const nav = document.getElementById(`nav-${s}`);
      if (sec) sec.style.display = s === name ? 'block' : 'none';
      if (nav) nav.classList.toggle('active', s === name);
    });

    // Load data for the section
    if (name === 'overview')   loadOverview();
    if (name === 'inquiries')  loadInquiries();
    if (name === 'contacts')   loadContacts();
    if (name === 'projects')   loadProjects();

    // Close sidebar on mobile
    closeMobileSidebar();
  }

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
  });

  // "View All" links within sections
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.goto));
  });

  // ── Mobile Sidebar ────────────────────────────────────────────────────────
  const sidebar        = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebarToggle  = document.getElementById('sidebar-toggle');

  function openMobileSidebar() {
    sidebar?.classList.add('open');
    sidebarOverlay?.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileSidebar() {
    sidebar?.classList.remove('open');
    sidebarOverlay?.classList.remove('visible');
    document.body.style.overflow = '';
  }

  sidebarToggle?.addEventListener('click', openMobileSidebar);
  sidebarOverlay?.addEventListener('click', closeMobileSidebar);


  // ══════════════════════════════════════════════════════════════════════════
  // OVERVIEW
  // ══════════════════════════════════════════════════════════════════════════
  async function loadOverview() {
    try {
      const [inquiryData, contactData, projectData] = await Promise.all([
        apiRequest('/api/v1/admin/inquiries?limit=5&page=1'),
        apiRequest('/api/v1/admin/contacts'),
        apiRequest('/api/v1/projects?limit=50'),
      ]);

      if (!inquiryData || !contactData || !projectData) return;

      // Stats
      const totalInquiries = inquiryData.data.total;
      const newInquiries   = inquiryData.data.inquiries.filter(i => i.status === 'new').length;
      const totalMessages  = contactData.data.length;
      const totalProjects  = projectData.data.pagination.total;

      setEl('stat-total-inquiries', totalInquiries);
      setEl('stat-new-inquiries', newInquiries);
      setEl('stat-total-messages', totalMessages);
      setEl('stat-total-projects', totalProjects);

      // Update badges
      if (newInquiries > 0) {
        const badge = document.getElementById('inquiries-badge');
        if (badge) { badge.textContent = newInquiries; badge.style.display = 'inline-flex'; }
      }

      const unreadContacts = contactData.data.filter(m => !m.is_read).length;
      if (unreadContacts > 0) {
        const badge = document.getElementById('contacts-badge');
        if (badge) { badge.textContent = unreadContacts; badge.style.display = 'inline-flex'; }
      }

      // Recent inquiries table
      const tbody = document.getElementById('recent-inquiries-body');
      if (tbody) {
        if (inquiryData.data.inquiries.length === 0) {
          tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">No inquiries yet.</td></tr>';
        } else {
          tbody.innerHTML = inquiryData.data.inquiries.slice(0, 5).map(inq => `
            <tr onclick="openInquiryDetail(${inq.id})" style="cursor:pointer;">
              <td class="font-medium" style="color:var(--text-primary);">${escHtml(inq.name)}</td>
              <td style="text-transform:capitalize;">${escHtml(inq.service_type)}</td>
              <td>${escHtml(inq.phone)}</td>
              <td>${statusBadge(inq.status)}</td>
              <td class="text-muted">${formatDate(inq.created_at)}</td>
            </tr>
          `).join('');
        }
      }

    } catch (err) {
      console.error('[OVERVIEW]', err);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INQUIRIES
  // ══════════════════════════════════════════════════════════════════════════
  let inquiryPage   = 1;
  let inquiryStatus = '';

  async function loadInquiries(page = 1) {
    inquiryPage = page;

    const tbody = document.getElementById('inquiries-body');
    if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="loading-cell"><div class="spinner" style="width:24px;height:24px;"></div></td></tr>';

    try {
      let url = `/api/v1/admin/inquiries?page=${page}&limit=15`;
      if (inquiryStatus) url += `&status=${inquiryStatus}`;

      const data = await apiRequest(url);
      if (!data) return;

      const { inquiries, total } = data.data;

      if (inquiries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading-cell">No inquiries found.</td></tr>';
        document.getElementById('inquiries-pagination').innerHTML = '';
        return;
      }

      tbody.innerHTML = inquiries.map(inq => `
        <tr onclick="openInquiryDetail(${inq.id})" title="Click to view details">
          <td class="text-muted">#${inq.id}</td>
          <td>
            <div class="font-semibold" style="color:var(--text-primary);">${escHtml(inq.name)}</div>
            <div class="text-muted" style="font-size:0.75rem;">${escHtml(inq.email)}</div>
          </td>
          <td>${escHtml(inq.phone)}</td>
          <td style="text-transform:capitalize;">${escHtml(inq.service_type)}</td>
          <td class="text-muted">${escHtml(inq.budget_range || '—')}</td>
          <td class="text-truncate text-muted">${escHtml(inq.project_location || '—')}</td>
          <td>${statusBadge(inq.status)}</td>
          <td class="text-muted">${formatDate(inq.created_at)}</td>
          <td onclick="event.stopPropagation()">
            <div style="display:flex;gap:0.25rem;">
              <button class="btn-icon" onclick="openInquiryDetail(${inq.id})" title="View">👁️</button>
            </div>
          </td>
        </tr>
      `).join('');

      renderPagination('inquiries-pagination', total, 15, page, (p) => loadInquiries(p));

    } catch (err) {
      console.error('[INQUIRIES]', err);
      if (tbody) tbody.innerHTML = '<tr><td colspan="9" class="loading-cell" style="color:var(--red);">Failed to load inquiries.</td></tr>';
    }
  }

  // Filter
  document.getElementById('inquiry-status-filter')?.addEventListener('change', (e) => {
    inquiryStatus = e.target.value;
    loadInquiries(1);
  });

  document.getElementById('refresh-inquiries-btn')?.addEventListener('click', () => loadInquiries(inquiryPage));

  // Open Inquiry Detail Modal
  let allInquiries = [];

  window.openInquiryDetail = async function (id) {
    try {
      // Get from current page data via fetching
      const data = await apiRequest(`/api/v1/admin/inquiries?limit=50&page=1`);
      const inq = data?.data?.inquiries?.find(i => i.id === id);
      if (!inq) { showToast('Inquiry not found.', 'error'); return; }

      const body = document.getElementById('inquiry-modal-body');
      body.innerHTML = `
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-key">Name</span>
            <span class="detail-value">${escHtml(inq.name)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-key">Status</span>
            <span class="detail-value">${statusBadge(inq.status)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-key">Email</span>
            <span class="detail-value">
              <a href="mailto:${escHtml(inq.email)}" style="color:var(--gold);text-decoration:none;">${escHtml(inq.email)}</a>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-key">Phone</span>
            <span class="detail-value">
              <a href="tel:${escHtml(inq.phone)}" style="color:var(--gold);text-decoration:none;">${escHtml(inq.phone)}</a>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-key">Service Type</span>
            <span class="detail-value" style="text-transform:capitalize;">${escHtml(inq.service_type)}</span>
          </div>
          <div class="detail-item">
            <span class="detail-key">Budget Range</span>
            <span class="detail-value">${escHtml(inq.budget_range || '—')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-key">Project Location</span>
            <span class="detail-value">${escHtml(inq.project_location || '—')}</span>
          </div>
          <div class="detail-item">
            <span class="detail-key">Received</span>
            <span class="detail-value">${formatDateFull(inq.created_at)}</span>
          </div>
          <div class="detail-item full-width">
            <span class="detail-key">Project Message</span>
            <div class="detail-message">${escHtml(inq.message)}</div>
          </div>
        </div>
      `;

      // Status action buttons
      const statuses = [
        { value: 'new',         label: '🆕 New',          cls: 'status-new' },
        { value: 'contacted',   label: '📞 Contacted',     cls: 'status-contacted' },
        { value: 'in_progress', label: '⚙️ In Progress',  cls: 'status-in_progress' },
        { value: 'closed',      label: '✅ Closed',        cls: 'status-closed' },
      ];

      const actionsEl = document.getElementById('modal-status-actions');
      actionsEl.innerHTML = statuses.map(s => `
        <button
          class="status-action-btn ${s.cls}"
          style="${inq.status === s.value ? 'opacity:1;box-shadow:0 0 0 2px var(--gold);' : 'opacity:0.6;'}"
          onclick="updateInquiryStatus(${inq.id}, '${s.value}', this)"
        >${s.label}</button>
      `).join('');

      document.getElementById('inquiry-modal-title').textContent = `Inquiry #${inq.id} — ${inq.name}`;
      document.getElementById('inquiry-modal-backdrop').style.display = 'flex';
      document.body.style.overflow = 'hidden';

    } catch (err) {
      console.error('[INQUIRY DETAIL]', err);
      showToast('Failed to load inquiry details.', 'error');
    }
  };

  window.updateInquiryStatus = async function (id, status, btn) {
    try {
      const data = await apiRequest(`/api/v1/admin/inquiries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });

      if (data?.success) {
        showToast(`Status updated to "${status.replace('_', ' ')}"`, 'success');
        // Update button highlight
        document.querySelectorAll('.modal-status-actions .status-action-btn').forEach(b => {
          b.style.opacity = '0.6';
          b.style.boxShadow = '';
        });
        btn.style.opacity = '1';
        btn.style.boxShadow = '0 0 0 2px var(--gold)';
        // Refresh the list in background
        if (activeSection === 'inquiries') loadInquiries(inquiryPage);
        if (activeSection === 'overview')  loadOverview();
      } else {
        showToast('Failed to update status.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    }
  };

  // Close inquiry modal
  document.getElementById('close-inquiry-modal')?.addEventListener('click', closeInquiryModal);
  document.getElementById('inquiry-modal-backdrop')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeInquiryModal();
  });

  function closeInquiryModal() {
    document.getElementById('inquiry-modal-backdrop').style.display = 'none';
    document.body.style.overflow = '';
  }


  // ══════════════════════════════════════════════════════════════════════════
  // CONTACTS / MESSAGES
  // ══════════════════════════════════════════════════════════════════════════
  async function loadContacts() {
    const grid = document.getElementById('messages-grid');
    grid.innerHTML = '<div class="loading-cell" style="text-align:center;padding:3rem;"><div class="spinner"></div></div>';

    try {
      const data = await apiRequest('/api/v1/admin/contacts');
      if (!data) return;

      const messages = data.data;

      if (messages.length === 0) {
        grid.innerHTML = '<div class="loading-cell" style="text-align:center;padding:3rem;">No messages received yet.</div>';
        return;
      }

      grid.innerHTML = messages.map(msg => `
        <div class="message-card ${msg.is_read ? 'read' : 'unread'}">
          <div class="message-header">
            <div>
              <div class="message-from">${escHtml(msg.name)}</div>
              <div class="message-email">
                <a href="mailto:${escHtml(msg.email)}" style="color:var(--text-secondary);text-decoration:none;">${escHtml(msg.email)}</a>
              </div>
            </div>
            ${msg.is_read ? '<span class="status-badge status-read">Read</span>' : '<span class="status-badge status-unread">New</span>'}
          </div>
          <div class="message-subject">${escHtml(msg.subject)}</div>
          <div class="message-body">${escHtml(msg.message)}</div>
          <div class="message-footer">
            <span class="message-date">${formatDate(msg.created_at)}</span>
            <div style="display:flex;gap:0.5rem;align-items:center;">
              ${msg.phone ? `<a href="tel:${escHtml(msg.phone)}" class="btn-icon" title="Call ${escHtml(msg.phone)}">📞</a>` : ''}
              <a href="mailto:${escHtml(msg.email)}" class="btn-icon" title="Reply by email">✉️</a>
            </div>
          </div>
        </div>
      `).join('');

    } catch (err) {
      console.error('[CONTACTS]', err);
      grid.innerHTML = '<div class="loading-cell" style="text-align:center;padding:3rem;color:var(--red);">Failed to load messages.</div>';
    }
  }

  document.getElementById('refresh-contacts-btn')?.addEventListener('click', loadContacts);


  // ══════════════════════════════════════════════════════════════════════════
  // PROJECTS
  // ══════════════════════════════════════════════════════════════════════════
  const CATEGORY_EMOJIS = {
    residential: '🏠', commercial: '🏢', renovation: '🔨',
    interior: '🎨', structural: '🏗️',
  };

  async function loadProjects() {
    const grid = document.getElementById('projects-admin-grid');
    grid.innerHTML = '<div class="loading-cell" style="text-align:center;padding:3rem;"><div class="spinner"></div></div>';

    try {
      const data = await apiRequest('/api/v1/projects?limit=50');
      if (!data) return;

      const projects = data.data.projects;

      if (projects.length === 0) {
        grid.innerHTML = '<div class="loading-cell" style="text-align:center;padding:3rem;">No projects found. Add your first project!</div>';
        return;
      }

      grid.innerHTML = projects.map(proj => `
        <div class="project-admin-card">
          <div class="project-admin-thumb">
            <span>${CATEGORY_EMOJIS[proj.category] || '🏗️'}</span>
            ${proj.featured ? '<span class="project-admin-featured">⭐ Featured</span>' : ''}
          </div>
          <div class="project-admin-body">
            <div class="project-admin-title" title="${escHtml(proj.title)}">${escHtml(proj.title)}</div>
            <div class="project-admin-meta">📍 ${escHtml(proj.location)}</div>
            <div class="project-admin-meta" style="text-transform:capitalize;">
              ${escHtml(proj.category)} • ${proj.status === 'ongoing' ? '🚧 Ongoing' : `✅ ${proj.year_completed || 'Completed'}`}
            </div>
            <div class="project-admin-actions">
              <button class="btn-secondary" style="flex:1;font-size:0.8rem;" onclick="editProject(${proj.id})">✏️ Edit</button>
              <button class="btn-danger" onclick="deleteProject(${proj.id}, '${escHtml(proj.title)}')">🗑️</button>
            </div>
          </div>
        </div>
      `).join('');

    } catch (err) {
      console.error('[PROJECTS]', err);
      grid.innerHTML = '<div class="loading-cell" style="text-align:center;padding:3rem;color:var(--red);">Failed to load projects.</div>';
    }
  }

  // ── Project Modal ──────────────────────────────────────────────────────────
  const projectModal         = document.getElementById('project-modal-backdrop');
  const projectForm          = document.getElementById('project-form');
  const projectModalTitle    = document.getElementById('project-modal-title');
  const projectIdInput       = document.getElementById('project-id');

  function openProjectModal(title = 'Add Project') {
    projectModalTitle.textContent = title;
    projectModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeProjectModal() {
    projectModal.style.display = 'none';
    document.body.style.overflow = '';
    projectForm.reset();
    projectIdInput.value = '';
  }

  document.getElementById('add-project-btn')?.addEventListener('click', () => openProjectModal('Add Project'));
  document.getElementById('close-project-modal')?.addEventListener('click', closeProjectModal);
  document.getElementById('cancel-project-btn')?.addEventListener('click', closeProjectModal);

  projectModal?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeProjectModal();
  });

  window.editProject = async function (id) {
    try {
      const data = await apiRequest(`/api/v1/projects/${id}`);
      if (!data?.data) { showToast('Project not found.', 'error'); return; }

      const p = data.data;
      document.getElementById('project-id').value      = p.id;
      document.getElementById('proj-title').value      = p.title;
      document.getElementById('proj-category').value   = p.category;
      document.getElementById('proj-description').value = p.description;
      document.getElementById('proj-location').value   = p.location;
      document.getElementById('proj-status').value     = p.status;
      document.getElementById('proj-area').value       = p.area_sqft || '';
      document.getElementById('proj-year').value       = p.year_completed || '';
      document.getElementById('proj-client').value     = p.client_name || '';
      document.getElementById('proj-featured').checked = p.featured;

      openProjectModal('Edit Project');
    } catch (err) {
      showToast('Failed to load project.', 'error');
    }
  };

  window.deleteProject = async function (id, title) {
    if (!confirm(`Delete project "${title}"? This cannot be undone.`)) return;

    try {
      const data = await apiRequest(`/api/v1/admin/projects/${id}`, { method: 'DELETE' });
      if (data?.success) {
        showToast('Project deleted successfully.', 'success');
        loadProjects();
      } else {
        showToast('Failed to delete project.', 'error');
      }
    } catch (err) {
      showToast('Network error.', 'error');
    }
  };

  // Save project (create or update)
  projectForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id          = document.getElementById('project-id').value;
    const title       = document.getElementById('proj-title').value.trim();
    const category    = document.getElementById('proj-category').value;
    const description = document.getElementById('proj-description').value.trim();
    const location    = document.getElementById('proj-location').value.trim();
    const status      = document.getElementById('proj-status').value;
    const area_sqft   = parseInt(document.getElementById('proj-area').value) || null;
    const year_completed = parseInt(document.getElementById('proj-year').value) || null;
    const client_name = document.getElementById('proj-client').value.trim() || null;
    const featured    = document.getElementById('proj-featured').checked;

    if (!title || !category || !description || !location) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    const saveBtn = document.getElementById('save-project-btn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    const payload = { title, category, description, location, status, area_sqft, year_completed, client_name, featured };

    try {
      let data;
      if (id) {
        data = await apiRequest(`/api/v1/admin/projects/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        data = await apiRequest('/api/v1/admin/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      if (data?.success) {
        showToast(id ? 'Project updated!' : 'Project added!', 'success');
        closeProjectModal();
        loadProjects();
      } else {
        showToast(data?.message || 'Failed to save project.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Project';
    }
  });


  // ══════════════════════════════════════════════════════════════════════════
  // PAGINATION HELPER
  // ══════════════════════════════════════════════════════════════════════════
  function renderPagination(containerId, total, limit, currentPage, onPage) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(total / limit);

    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = `<span class="pagination-info">Page ${currentPage} of ${totalPages} (${total} total)</span>`;

    html += `<button class="pagination-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="(${onPage})(${currentPage - 1})">← Prev</button>`;

    // Page numbers (max 5 visible)
    const start = Math.max(1, currentPage - 2);
    const end   = Math.min(totalPages, start + 4);
    for (let p = start; p <= end; p++) {
      html += `<button class="pagination-btn ${p === currentPage ? 'active' : ''}" onclick="(${onPage})(${p})">${p}</button>`;
    }

    html += `<button class="pagination-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="(${onPage})(${currentPage + 1})">Next →</button>`;

    container.innerHTML = html;
  }


  // ══════════════════════════════════════════════════════════════════════════
  // UTILITY HELPERS
  // ══════════════════════════════════════════════════════════════════════════
  function escHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
  }

  function formatDateFull(dateStr) {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });
    } catch { return dateStr; }
  }

  function statusBadge(status) {
    const labels = {
      new:         '🆕 New',
      contacted:   '📞 Contacted',
      in_progress: '⚙️ In Progress',
      closed:      '✅ Closed',
    };
    return `<span class="status-badge status-${escHtml(status)}">${labels[status] || escHtml(status)}</span>`;
  }

  // ── Keyboard: close modals on Escape ───────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (document.getElementById('inquiry-modal-backdrop').style.display !== 'none') closeInquiryModal();
      if (document.getElementById('project-modal-backdrop').style.display !== 'none') closeProjectModal();
    }
  });

  // ── Initial Load ───────────────────────────────────────────────────────────
  showSection('overview');

})();
