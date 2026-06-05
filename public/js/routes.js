document.addEventListener('DOMContentLoaded', async () => {
  const admin = await checkAuth();
  if (!admin) return;
  document.getElementById('sidebar').innerHTML = getSidebarHTML();
  initSidebar('routes');
  loadRoutes();
});

async function loadRoutes() {
  try {
    const routes = await API.get('/api/routes');
    const tbody = document.getElementById('routes-table');

    if (routes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6"><div class="empty-state"><div class="empty-state-icon">🛣️</div><div class="empty-state-title">No routes found</div></div></td></tr>';
      return;
    }

    tbody.innerHTML = routes.map(r => {
      const days = r.schedule_days.split(',').map(d =>
        `<span class="badge badge-neutral" style="margin:1px;">${d.trim()}</span>`
      ).join(' ');
      return `
        <tr>
          <td><strong>#${r.route_id}</strong></td>
          <td>${r.route_name}</td>
          <td>${days}</td>
          <td>${r.start_time}</td>
          <td><span class="badge badge-info">${r.bin_count} bins</span></td>
          <td>
            <button class="btn btn-ghost btn-sm" onclick="editRoute(${r.route_id})">✏️</button>
            <button class="btn btn-ghost btn-sm text-danger" onclick="deleteRoute(${r.route_id})">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddRoute() {
  document.getElementById('route-form').reset();
  document.getElementById('route-edit-id').value = '';
  document.getElementById('route-modal-title').textContent = 'Add New Route';
  openModal('route-modal');
}

function editRoute(id) {
  API.get(`/api/routes/${id}`).then(r => {
    document.getElementById('route-modal-title').textContent = 'Edit Route';
    document.getElementById('route-edit-id').value = r.route_id;
    document.getElementById('route-name').value = r.route_name;
    document.getElementById('route-days').value = r.schedule_days;
    document.getElementById('route-time').value = r.start_time;
    openModal('route-modal');
  }).catch(err => showToast(err.message, 'error'));
}

async function saveRoute() {
  const id = document.getElementById('route-edit-id').value;
  const data = {
    route_name: document.getElementById('route-name').value,
    schedule_days: document.getElementById('route-days').value,
    start_time: document.getElementById('route-time').value,
  };

  try {
    if (id) {
      await API.put(`/api/routes/${id}`, data);
      showToast('Route updated');
    } else {
      await API.post('/api/routes', data);
      showToast('Route created');
    }
    closeModal('route-modal');
    loadRoutes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteRoute(id) {
  if (!confirm('Delete this route?')) return;
  try {
    await API.delete(`/api/routes/${id}`);
    showToast('Route deleted');
    loadRoutes();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
