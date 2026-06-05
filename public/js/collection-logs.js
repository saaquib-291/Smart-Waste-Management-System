document.addEventListener('DOMContentLoaded', async () => {
  const admin = await checkAuth();
  if (!admin) return;
  document.getElementById('sidebar').innerHTML = getSidebarHTML();
  initSidebar('collection-logs');
  loadDropdowns();
  loadLogs();
});

async function loadDropdowns() {
  try {
    const [routes, drivers, vehicles] = await Promise.all([
      API.get('/api/routes'),
      API.get('/api/drivers'),
      API.get('/api/vehicles'),
    ]);

    const routeSelect = document.getElementById('log-route');
    routes.forEach(r => {
      routeSelect.innerHTML += `<option value="${r.route_id}">${r.route_name}</option>`;
    });

    const driverSelect = document.getElementById('log-driver');
    drivers.forEach(d => {
      driverSelect.innerHTML += `<option value="${d.driver_id}">${d.full_name}</option>`;
    });

    const vehicleSelect = document.getElementById('log-vehicle');
    vehicles.forEach(v => {
      vehicleSelect.innerHTML += `<option value="${v.vehicle_id}">${v.plate_number} (${v.type})</option>`;
    });
  } catch (err) {
    console.error(err);
  }
}

async function loadLogs() {
  try {
    const params = new URLSearchParams();
    const from = document.getElementById('filter-from').value;
    const to = document.getElementById('filter-to').value;
    if (from) params.set('from', from);
    if (to) params.set('to', to);

    const logs = await API.get(`/api/collection-logs?${params}`);
    const tbody = document.getElementById('logs-table');

    if (logs.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8"><div class="empty-state"><div class="empty-state-icon">📝</div><div class="empty-state-title">No logs found</div></div></td></tr>';
      return;
    }

    tbody.innerHTML = logs.map(l => `
      <tr>
        <td><strong>#${l.log_id}</strong></td>
        <td>${formatDate(l.collection_date)}</td>
        <td>${l.route ? l.route.route_name : '—'}</td>
        <td>${l.driver ? l.driver.full_name : '—'}</td>
        <td>${l.vehicle ? `${l.vehicle.plate_number}` : '—'}</td>
        <td><strong>${parseFloat(l.waste_collected_kg).toLocaleString()} kg</strong></td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${l.notes || '—'}</td>
        <td>
          <button class="btn btn-ghost btn-sm text-danger" onclick="deleteLog(${l.log_id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddLog() {
  document.getElementById('log-form').reset();
  document.getElementById('log-date').value = new Date().toISOString().split('T')[0];
  openModal('log-modal');
}

async function saveLog() {
  const data = {
    route_id: parseInt(document.getElementById('log-route').value),
    driver_id: parseInt(document.getElementById('log-driver').value),
    vehicle_id: parseInt(document.getElementById('log-vehicle').value),
    collection_date: document.getElementById('log-date').value,
    waste_collected_kg: parseFloat(document.getElementById('log-waste').value),
    notes: document.getElementById('log-notes').value || null,
  };

  try {
    await API.post('/api/collection-logs', data);
    showToast('Collection log created');
    closeModal('log-modal');
    loadLogs();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteLog(id) {
  if (!confirm('Delete this log?')) return;
  try {
    await API.delete(`/api/collection-logs/${id}`);
    showToast('Log deleted');
    loadLogs();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
