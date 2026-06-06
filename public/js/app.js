/**
 * Smart Waste Management System — Shared App Utilities
 */

// ── Theme Management ────────────────────────────────
function initTheme() {
  const stored = localStorage.getItem('swm-theme');
  const theme = stored || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('swm-theme', next);
}

// Apply theme immediately on script load (prevents flash)
initTheme();

// ── API Helper ──────────────────────────────────────
const API = {
  async request(url, options = {}) {
    const defaults = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
    };
    const config = { ...defaults, ...options };
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    const response = await fetch(url, config);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Request failed (${response.status})`);
    }
    return data;
  },
  get: (url) => API.request(url),
  post: (url, body) => API.request(url, { method: 'POST', body }),
  put: (url, body) => API.request(url, { method: 'PUT', body }),
  delete: (url) => API.request(url, { method: 'DELETE' }),
};

// ── Toast Notifications ─────────────────────────────
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── Auth Check ──────────────────────────────────────
async function checkAuth() {
  try {
    const data = await API.get('/api/auth/me');
    return data.admin;
  } catch {
    // Not authenticated — redirect to login
    if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
      window.location.href = '/index.html';
    }
    return null;
  }
}

// ── Logout ──────────────────────────────────────────
async function logout() {
  try {
    await API.post('/api/auth/logout');
  } catch (e) {
    // ignore
  }
  window.location.href = '/index.html';
}

// ── Sidebar Setup ───────────────────────────────────
function initSidebar(activePage) {
  // Highlight active nav item
  document.querySelectorAll('.nav-item').forEach((item) => {
    if (item.dataset.page === activePage) {
      item.classList.add('active');
    }
  });

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }

  // Theme toggle button
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
}

// ── Modal Helpers ───────────────────────────────────
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('active');
    document.body.style.overflow = '';
  }
});

// ── Utility Functions ───────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(dateStr);
}

function getFillLevelClass(pct) {
  const val = parseFloat(pct);
  if (val >= 80) return 'high';
  if (val >= 50) return 'medium';
  return 'low';
}

function getStatusBadge(status) {
  const map = {
    active: 'badge-success',
    available: 'badge-success',
    pending: 'badge-warning',
    in_progress: 'badge-info',
    resolved: 'badge-success',
    maintenance: 'badge-danger',
    inactive: 'badge-neutral',
    on_route: 'badge-info',
    completed: 'badge-success',
  };
  const cls = map[status] || 'badge-neutral';
  return `<span class="badge ${cls}">${status.replace(/_/g, ' ')}</span>`;
}

// ── Generate Sidebar HTML ───────────────────────────
function getSidebarHTML() {
  return `
    <div class="sidebar-header">
      <div class="sidebar-logo">♻️</div>
      <div class="sidebar-brand">
        <h2>SmartWaste</h2>
        <span>Management System</span>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-section">
        <div class="nav-section-title">Overview</div>
        <a href="/dashboard.html" class="nav-item" data-page="dashboard">
          <span class="nav-icon">📊</span> Dashboard
        </a>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">Management</div>
        <a href="/bins.html" class="nav-item" data-page="bins">
          <span class="nav-icon">🗑️</span> Bins
        </a>
        <a href="/zones.html" class="nav-item" data-page="zones">
          <span class="nav-icon">📍</span> Zones
        </a>
        <a href="/complaints.html" class="nav-item" data-page="complaints">
          <span class="nav-icon">📋</span> Complaints
        </a>
      </div>
      <div class="nav-section">
        <div class="nav-section-title">Operations</div>
        <a href="/routes.html" class="nav-item" data-page="routes">
          <span class="nav-icon">🛣️</span> Routes
        </a>
        <a href="/collection-logs.html" class="nav-item" data-page="collection-logs">
          <span class="nav-icon">📝</span> Collection Logs
        </a>
        <a href="/fleet.html" class="nav-item" data-page="fleet">
          <span class="nav-icon">🚛</span> Fleet & Drivers
        </a>
      </div>
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-footer-actions">
        <button class="theme-toggle" id="theme-toggle-btn" title="Toggle light/dark theme">
          <span class="icon-sun">☀️</span>
          <span class="icon-moon">🌙</span>
        </button>
      </div>
      <div class="user-card" id="logout-btn" title="Click to logout">
        <div class="user-avatar">A</div>
        <div class="user-info">
          <div class="user-name">Admin</div>
          <div class="user-role">Administrator</div>
        </div>
      </div>
    </div>
  `;
}
