document.addEventListener('DOMContentLoaded', async () => {
  const admin = await checkAuth();
  if (!admin) return;
  document.getElementById('sidebar').innerHTML = getSidebarHTML();
  initSidebar('zones');
  loadZones();
});

async function loadZones() {
  try {
    const zones = await API.get('/api/zones');
    const grid = document.getElementById('zones-grid');
    const tbody = document.getElementById('zones-table');

    const typeColors = {
      residential: 'green',
      commercial: 'blue',
      industrial: 'amber',
    };
    const typeIcons = {
      residential: '🏘️',
      commercial: '🏪',
      industrial: '🏭',
    };

    // Cards
    grid.innerHTML = zones.map(z => `
      <div class="fleet-card">
        <div class="fleet-card-icon stat-icon ${typeColors[z.zone_type] || 'green'}">
          ${typeIcons[z.zone_type] || '📍'}
        </div>
        <div class="fleet-card-title">${z.zone_name}</div>
        <div class="fleet-card-subtitle">${z.district} · ${z.zone_type}</div>
        <div class="fleet-card-meta">
          <span>🗑️ ${z.bin_count} bins</span>
          <span class="badge badge-info">${z.zone_type}</span>
        </div>
      </div>
    `).join('');

    // Table
    tbody.innerHTML = zones.map(z => `
      <tr>
        <td><strong>#${z.zone_id}</strong></td>
        <td>${z.zone_name}</td>
        <td>${z.district}</td>
        <td><span class="badge badge-info">${z.zone_type}</span></td>
        <td><strong>${z.bin_count}</strong></td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="editZone(${z.zone_id})">✏️</button>
          <button class="btn btn-ghost btn-sm text-danger" onclick="deleteZone(${z.zone_id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddZone() {
  document.getElementById('zone-form').reset();
  document.getElementById('zone-edit-id').value = '';
  document.getElementById('zone-modal-title').textContent = 'Add Zone';
  openModal('zone-modal');
}

function editZone(id) {
  API.get(`/api/zones/${id}`).then(z => {
    document.getElementById('zone-modal-title').textContent = 'Edit Zone';
    document.getElementById('zone-edit-id').value = z.zone_id;
    document.getElementById('zone-name').value = z.zone_name;
    document.getElementById('zone-district').value = z.district;
    document.getElementById('zone-type').value = z.zone_type;
    openModal('zone-modal');
  }).catch(err => showToast(err.message, 'error'));
}

async function saveZone() {
  const id = document.getElementById('zone-edit-id').value;
  const data = {
    zone_name: document.getElementById('zone-name').value,
    district: document.getElementById('zone-district').value,
    zone_type: document.getElementById('zone-type').value,
  };

  try {
    if (id) {
      await API.put(`/api/zones/${id}`, data);
      showToast('Zone updated');
    } else {
      await API.post('/api/zones', data);
      showToast('Zone created');
    }
    closeModal('zone-modal');
    loadZones();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteZone(id) {
  if (!confirm('Delete this zone? All bins in this zone will lose their zone assignment.')) return;
  try {
    await API.delete(`/api/zones/${id}`);
    showToast('Zone deleted');
    loadZones();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
