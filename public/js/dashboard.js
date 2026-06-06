/**
 * Dashboard page — charts, map, stats, activity feed
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Auth check
  const admin = await checkAuth();
  if (!admin) return;

  // Init sidebar
  document.getElementById('sidebar').innerHTML = getSidebarHTML();
  initSidebar('dashboard');

  // Update clock
  const clockEl = document.getElementById('current-time');
  function updateClock() {
    clockEl.textContent = new Date().toLocaleString('en-IN', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }
  updateClock();
  setInterval(updateClock, 30000);

  // Load everything
  loadStats();
  loadFillTrend();
  loadComplaintBreakdown();
  loadWasteByZone();
  loadMap();
  loadActivity();
});

// ── Stats ───────────────────────────────────────────
async function loadStats() {
  try {
    const s = await API.get('/api/dashboard/stats');
    document.getElementById('stat-total-bins').textContent = s.totalBins;
    document.getElementById('stat-avg-fill').textContent = s.avgFillLevel + '%';
    document.getElementById('stat-complaints').textContent = s.activeComplaints;
    document.getElementById('stat-collections').textContent = s.todayCollections;
    document.getElementById('stat-week-waste').textContent = Number(s.weekWaste).toLocaleString();
    document.getElementById('stat-critical').textContent = s.criticalBins;
  } catch (err) {
    console.error('Stats error:', err);
  }
}

// ── Fill Trend Chart ────────────────────────────────
async function loadFillTrend() {
  try {
    const data = await API.get('/api/dashboard/fill-trend');
    const ctx = document.getElementById('fillTrendChart').getContext('2d');

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Avg Fill Level (%)',
          data: data.map(d => d.avg_fill),
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#10b981',
          pointBorderColor: '#0f172a',
          pointBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: { color: '#64748b', font: { size: 11 } },
          },
          y: {
            min: 0,
            max: 100,
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: {
              color: '#64748b',
              font: { size: 11 },
              callback: v => v + '%',
            },
          },
        },
      },
    });
  } catch (err) {
    console.error('Fill trend error:', err);
  }
}

// ── Complaint Breakdown Chart ───────────────────────
async function loadComplaintBreakdown() {
  try {
    const data = await API.get('/api/dashboard/complaint-breakdown');
    const ctx = document.getElementById('complaintChart').getContext('2d');

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#ec4899'];

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.category.replace(/_/g, ' ')),
        datasets: [{
          data: data.map(d => parseInt(d.count)),
          backgroundColor: colors.slice(0, data.length),
          borderColor: '#0f172a',
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#94a3b8',
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10,
              font: { size: 11 },
            },
          },
        },
      },
    });
  } catch (err) {
    console.error('Complaint chart error:', err);
  }
}

// ── Waste by Zone Chart ─────────────────────────────
async function loadWasteByZone() {
  try {
    const data = await API.get('/api/dashboard/waste-by-zone');
    const ctx = document.getElementById('wasteByZoneChart').getContext('2d');

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.zone_name),
        datasets: [{
          label: 'Waste (kg)',
          data: data.map(d => d.waste_kg),
          backgroundColor: [
            'rgba(16, 185, 129, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(236, 72, 153, 0.7)',
          ],
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 11 } },
          },
          y: {
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
            ticks: { color: '#64748b', font: { size: 11 } },
          },
        },
      },
    });
  } catch (err) {
    console.error('Waste by zone error:', err);
  }
}

// ── Leaflet Map ─────────────────────────────────────
async function loadMap() {
  try {
    const bins = await API.get('/api/bins');

    // Center on average coordinates
    let avgLat = 12.9716, avgLng = 77.5946;
    if (bins.length > 0) {
      avgLat = bins.reduce((s, b) => s + parseFloat(b.lat), 0) / bins.length;
      avgLng = bins.reduce((s, b) => s + parseFloat(b.lng), 0) / bins.length;
    }

    const map = L.map('bin-map').setView([avgLat, avgLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    bins.forEach(bin => {
      const fill = bin.latest_reading ? parseFloat(bin.latest_reading.fill_level_pct) : 0;
      let color = '#22c55e'; // green
      if (fill >= 80) color = '#ef4444'; // red
      else if (fill >= 50) color = '#f59e0b'; // amber

      const marker = L.circleMarker([parseFloat(bin.lat), parseFloat(bin.lng)], {
        radius: 8,
        fillColor: color,
        color: '#0f172a',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      }).addTo(map);

      marker.bindPopup(`
        <strong>Bin #${bin.bin_id}</strong><br>
        <b>Type:</b> ${bin.bin_type}<br>
        <b>District:</b> ${bin.district}<br>
        <b>Status:</b> ${bin.status}<br>
        <b>Fill Level:</b> ${fill.toFixed(1)}%<br>
        <b>Zone:</b> ${bin.zone ? bin.zone.zone_name : '—'}
      `);
    });
  } catch (err) {
    console.error('Map error:', err);
    document.getElementById('bin-map').innerHTML = '<div class="empty-state"><div class="empty-state-icon">🗺️</div><div class="empty-state-title">Map unavailable</div></div>';
  }
}

// ── Recent Activity ─────────────────────────────────
async function loadActivity() {
  try {
    const activities = await API.get('/api/dashboard/recent-activity');
    const feed = document.getElementById('activity-feed');

    if (activities.length === 0) {
      feed.innerHTML = '<li class="empty-state"><div class="empty-state-text">No recent activity</div></li>';
      return;
    }

    feed.innerHTML = activities.map(a => `
      <li class="activity-item">
        <div class="activity-icon ${a.type}">
          ${a.type === 'complaint' ? '⚠️' : '✅'}
        </div>
        <div class="activity-content">
          <div class="activity-message">${a.message}</div>
          <div class="activity-time">${timeAgo(a.time)} · ${getStatusBadge(a.status)}</div>
        </div>
      </li>
    `).join('');
  } catch (err) {
    console.error('Activity error:', err);
  }
}
