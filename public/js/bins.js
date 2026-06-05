/**
 * Bins page logic — CRUD, filters, fill level bars
 */

document.addEventListener('DOMContentLoaded', async () => {
  const admin = await checkAuth();
  if (!admin) return;
  document.getElementById('sidebar').innerHTML = getSidebarHTML();
  initSidebar('bins');
  loadZoneOptions();
  loadBins();
});

async function loadZoneOptions() {
  try {
    const zones = await API.get('/api/zones');
    const filterSelect = document.getElementById('filter-zone');
    const formSelect = document.getElementById('bin-zone');
    zones.forEach(z => {
      filterSelect.innerHTML += `<option value="${z.zone_id}">${z.zone_name}</option>`;
      formSelect.innerHTML += `<option value="${z.zone_id}">${z.zone_name} (${z.district})</option>`;
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadBins() {
  try {
    const params = new URLSearchParams();
    const zone = document.getElementById('filter-zone').value;
    const status = document.getElementById('filter-status').value;
    const type = document.getElementById('filter-type').value;
    if (zone) params.set('zone_id', zone);
    if (status) params.set('status', status);
    if (type) params.set('bin_type', type);

    const bins = await API.get(`/api/bins?${params}`);
    const tbody = document.getElementById('bins-table');

    if (bins.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">🗑️</div><div class="empty-state-title">No bins found</div></div></td></tr>';
      return;
    }

    tbody.innerHTML = bins.map(bin => {
      const fill = bin.latest_reading ? parseFloat(bin.latest_reading.fill_level_pct) : 0;
      const temp = bin.latest_reading ? parseFloat(bin.latest_reading.temperature).toFixed(1) + '°C' : '—';
      const fillClass = getFillLevelClass(fill);
      return `
        <tr>
          <td><strong>#${bin.bin_id}</strong></td>
          <td>${bin.zone ? bin.zone.zone_name : '—'}</td>
          <td>${bin.district}</td>
          <td><span class="badge badge-info">${bin.bin_type}</span></td>
          <td>${getStatusBadge(bin.status)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="fill-bar" style="flex:1;">
                <div class="fill-bar-inner ${fillClass}" style="width:${fill}%"></div>
              </div>
              <span style="font-size:0.8125rem;min-width:38px;">${fill.toFixed(0)}%</span>
            </div>
          </td>
          <td>${temp}</td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="editBin(${bin.bin_id})">✏️</button>
            <button class="btn btn-ghost btn-sm text-danger" onclick="deleteBin(${bin.bin_id})">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function editBin(id) {
  // Fetch and populate form
  API.get(`/api/bins/${id}`).then(bin => {
    document.getElementById('bin-modal-title').textContent = 'Edit Bin';
    document.getElementById('bin-edit-id').value = bin.bin_id;
    document.getElementById('bin-zone').value = bin.zone_id;
    document.getElementById('bin-type').value = bin.bin_type;
    document.getElementById('bin-district').value = bin.district;
    document.getElementById('bin-lat').value = bin.lat;
    document.getElementById('bin-lng').value = bin.lng;
    document.getElementById('bin-status').value = bin.status;
    openModal('bin-modal');
  }).catch(err => showToast(err.message, 'error'));
}

async function saveBin() {
  const id = document.getElementById('bin-edit-id').value;
  const data = {
    zone_id: parseInt(document.getElementById('bin-zone').value),
    bin_type: document.getElementById('bin-type').value,
    district: document.getElementById('bin-district').value,
    lat: parseFloat(document.getElementById('bin-lat').value),
    lng: parseFloat(document.getElementById('bin-lng').value),
    status: document.getElementById('bin-status').value,
  };

  try {
    if (id) {
      await API.put(`/api/bins/${id}`, data);
      showToast('Bin updated successfully');
    } else {
      await API.post('/api/bins', data);
      showToast('Bin created successfully');
    }
    closeModal('bin-modal');
    document.getElementById('bin-form').reset();
    document.getElementById('bin-edit-id').value = '';
    document.getElementById('bin-modal-title').textContent = 'Add New Bin';
    loadBins();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteBin(id) {
  if (!confirm('Are you sure you want to delete this bin?')) return;
  try {
    await API.delete(`/api/bins/${id}`);
    showToast('Bin deleted');
    loadBins();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
