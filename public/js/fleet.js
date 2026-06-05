document.addEventListener('DOMContentLoaded', async () => {
  const admin = await checkAuth();
  if (!admin) return;
  document.getElementById('sidebar').innerHTML = getSidebarHTML();
  initSidebar('fleet');
  loadVehicles();
  loadDrivers();
});

function switchTab(tab, btn) {
  document.querySelectorAll('.page-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('vehicles-section').classList.toggle('hidden', tab !== 'vehicles');
  document.getElementById('drivers-section').classList.toggle('hidden', tab !== 'drivers');
}

// ── Vehicles ────────────────────────────────────────
async function loadVehicles() {
  try {
    const vehicles = await API.get('/api/vehicles');
    const grid = document.getElementById('vehicles-grid');

    if (vehicles.length === 0) {
      grid.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🚛</div><div class="empty-state-title">No vehicles</div></div>';
      return;
    }

    const typeIcons = {
      'Compactor Truck': '🚛',
      'Mini Truck': '🚚',
      'Tipper Truck': '🚜',
      'Auto Rickshaw': '🛺',
    };
    const statusColors = {
      available: 'green',
      on_route: 'blue',
      maintenance: 'red',
    };

    grid.innerHTML = vehicles.map(v => `
      <div class="fleet-card">
        <div class="fleet-card-icon stat-icon ${statusColors[v.status] || 'green'}">
          ${typeIcons[v.type] || '🚛'}
        </div>
        <div class="fleet-card-title">${v.plate_number}</div>
        <div class="fleet-card-subtitle">${v.type}</div>
        <div class="fleet-card-meta">
          <span>Capacity: ${v.capacity_tonnes}t</span>
          <span>${getStatusBadge(v.status)}</span>
        </div>
        <div class="fleet-card-actions">
          <button class="btn btn-ghost btn-sm" onclick="editVehicle(${v.vehicle_id})">✏️ Edit</button>
          <button class="btn btn-ghost btn-sm text-danger" onclick="deleteVehicle(${v.vehicle_id})">🗑️</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddVehicle() {
  document.getElementById('vehicle-form').reset();
  document.getElementById('vehicle-edit-id').value = '';
  document.getElementById('vehicle-modal-title').textContent = 'Add Vehicle';
  openModal('vehicle-modal');
}

function editVehicle(id) {
  API.get(`/api/vehicles/${id}`).then(v => {
    document.getElementById('vehicle-modal-title').textContent = 'Edit Vehicle';
    document.getElementById('vehicle-edit-id').value = v.vehicle_id;
    document.getElementById('vehicle-type').value = v.type;
    document.getElementById('vehicle-plate').value = v.plate_number;
    document.getElementById('vehicle-capacity').value = v.capacity_tonnes;
    document.getElementById('vehicle-status').value = v.status;
    openModal('vehicle-modal');
  }).catch(err => showToast(err.message, 'error'));
}

async function saveVehicle() {
  const id = document.getElementById('vehicle-edit-id').value;
  const data = {
    type: document.getElementById('vehicle-type').value,
    plate_number: document.getElementById('vehicle-plate').value,
    capacity_tonnes: parseFloat(document.getElementById('vehicle-capacity').value),
    status: document.getElementById('vehicle-status').value,
  };

  try {
    if (id) {
      await API.put(`/api/vehicles/${id}`, data);
      showToast('Vehicle updated');
    } else {
      await API.post('/api/vehicles', data);
      showToast('Vehicle added');
    }
    closeModal('vehicle-modal');
    loadVehicles();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteVehicle(id) {
  if (!confirm('Delete this vehicle?')) return;
  try {
    await API.delete(`/api/vehicles/${id}`);
    showToast('Vehicle deleted');
    loadVehicles();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ── Drivers ─────────────────────────────────────────
async function loadDrivers() {
  try {
    const drivers = await API.get('/api/drivers');
    const tbody = document.getElementById('drivers-table');

    if (drivers.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5"><div class="empty-state"><div class="empty-state-icon">👤</div><div class="empty-state-title">No drivers</div></div></td></tr>';
      return;
    }

    tbody.innerHTML = drivers.map(d => `
      <tr>
        <td><strong>#${d.driver_id}</strong></td>
        <td>${d.full_name}</td>
        <td>${d.contact}</td>
        <td><code style="color:var(--primary-400);font-size:0.8125rem;">${d.license_no}</code></td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="editDriver(${d.driver_id})">✏️</button>
          <button class="btn btn-ghost btn-sm text-danger" onclick="deleteDriver(${d.driver_id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddDriver() {
  document.getElementById('driver-form').reset();
  document.getElementById('driver-edit-id').value = '';
  document.getElementById('driver-modal-title').textContent = 'Add Driver';
  openModal('driver-modal');
}

function editDriver(id) {
  API.get(`/api/drivers/${id}`).then(d => {
    document.getElementById('driver-modal-title').textContent = 'Edit Driver';
    document.getElementById('driver-edit-id').value = d.driver_id;
    document.getElementById('driver-name').value = d.full_name;
    document.getElementById('driver-contact').value = d.contact;
    document.getElementById('driver-license').value = d.license_no;
    openModal('driver-modal');
  }).catch(err => showToast(err.message, 'error'));
}

async function saveDriver() {
  const id = document.getElementById('driver-edit-id').value;
  const data = {
    full_name: document.getElementById('driver-name').value,
    contact: document.getElementById('driver-contact').value,
    license_no: document.getElementById('driver-license').value,
  };

  try {
    if (id) {
      await API.put(`/api/drivers/${id}`, data);
      showToast('Driver updated');
    } else {
      await API.post('/api/drivers', data);
      showToast('Driver added');
    }
    closeModal('driver-modal');
    loadDrivers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteDriver(id) {
  if (!confirm('Delete this driver?')) return;
  try {
    await API.delete(`/api/drivers/${id}`);
    showToast('Driver deleted');
    loadDrivers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
