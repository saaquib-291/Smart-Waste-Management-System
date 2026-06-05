document.addEventListener('DOMContentLoaded', async () => {
  const admin = await checkAuth();
  if (!admin) return;
  document.getElementById('sidebar').innerHTML = getSidebarHTML();
  initSidebar('complaints');
  loadComplaints();
});

async function loadComplaints() {
  try {
    const params = new URLSearchParams();
    const status = document.getElementById('filter-status').value;
    const category = document.getElementById('filter-category').value;
    if (status) params.set('status', status);
    if (category) params.set('category', category);

    const complaints = await API.get(`/api/complaints?${params}`);
    const tbody = document.getElementById('complaints-table');

    if (complaints.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7"><div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-title">No complaints found</div></div></td></tr>';
      return;
    }

    tbody.innerHTML = complaints.map(c => `
      <tr>
        <td><strong>#${c.complaint_id}</strong></td>
        <td>Bin #${c.bin_id} ${c.bin ? `(${c.bin.district})` : ''}</td>
        <td><span class="badge badge-info">${c.category.replace(/_/g, ' ')}</span></td>
        <td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${c.description}">${c.description}</td>
        <td>${getStatusBadge(c.status)}</td>
        <td>${formatDateTime(c.filled_at)}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="editComplaint(${c.complaint_id})">✏️</button>
          <button class="btn btn-ghost btn-sm text-danger" onclick="deleteComplaint(${c.complaint_id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openAddComplaint() {
  document.getElementById('complaint-form').reset();
  document.getElementById('complaint-edit-id').value = '';
  document.getElementById('complaint-modal-title').textContent = 'File New Complaint';
  openModal('complaint-modal');
}

function editComplaint(id) {
  API.get(`/api/complaints/${id}`).then(c => {
    document.getElementById('complaint-modal-title').textContent = 'Edit Complaint';
    document.getElementById('complaint-edit-id').value = c.complaint_id;
    document.getElementById('complaint-bin').value = c.bin_id;
    document.getElementById('complaint-category').value = c.category;
    document.getElementById('complaint-desc').value = c.description;
    document.getElementById('complaint-status').value = c.status;
    openModal('complaint-modal');
  }).catch(err => showToast(err.message, 'error'));
}

async function saveComplaint() {
  const id = document.getElementById('complaint-edit-id').value;
  const data = {
    bin_id: parseInt(document.getElementById('complaint-bin').value),
    category: document.getElementById('complaint-category').value,
    description: document.getElementById('complaint-desc').value,
    status: document.getElementById('complaint-status').value,
  };

  try {
    if (id) {
      await API.put(`/api/complaints/${id}`, data);
      showToast('Complaint updated');
    } else {
      await API.post('/api/complaints', data);
      showToast('Complaint filed');
    }
    closeModal('complaint-modal');
    loadComplaints();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteComplaint(id) {
  if (!confirm('Delete this complaint?')) return;
  try {
    await API.delete(`/api/complaints/${id}`);
    showToast('Complaint deleted');
    loadComplaints();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
