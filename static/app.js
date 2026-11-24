// Determine API base URL (works whether served through FastAPI or opened directly)
const API_BASE = window.location.protocol === 'file:' 
  ? 'http://127.0.0.1:8000' 
  : window.location.origin;

// State management
let todos = [];
let activeFilter = 'all';
let searchQuery = '';

// DOM Elements
const todoList = document.getElementById('todo-list');
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const filterPills = document.querySelectorAll('.filter-pill');
const statTotal = document.getElementById('stat-total');
const statPending = document.getElementById('stat-pending');
const statCompleted = document.getElementById('stat-completed');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressText = document.getElementById('progress-text');
const emptyState = document.getElementById('empty-state');
const emptyTitle = document.getElementById('empty-title');
const emptyDesc = document.getElementById('empty-desc');
const loadingSpinner = document.getElementById('loading-spinner');
const connectionStatus = document.getElementById('connection-status');
const refreshBtn = document.getElementById('refresh-btn');

// Edit Modal Elements
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTodoId = document.getElementById('edit-todo-id');
const editTodoTitle = document.getElementById('edit-todo-title');
const editTodoCompleted = document.getElementById('edit-todo-completed');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalCancelBtn = document.getElementById('modal-cancel-btn');

// Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// Update API Connection Status Pill
function updateConnectionStatus(isOnline) {
  if (isOnline) {
    connectionStatus.className = 'status-pill connected';
    connectionStatus.querySelector('.status-text').textContent = 'API Online';
  } else {
    connectionStatus.className = 'status-pill disconnected';
    connectionStatus.querySelector('.status-text').textContent = 'API Offline';
  }
}

// Fetch all todos from FastAPI backend
async function fetchTodos() {
  loadingSpinner.style.display = 'flex';
  try {
    const res = await fetch(`${API_BASE}/todos`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    todos = Array.isArray(data) ? data : [];
    updateConnectionStatus(true);
    render();
  } catch (err) {
    console.error('Error fetching todos:', err);
    updateConnectionStatus(false);
    showToast('Failed to connect to FastAPI backend. Is server running?', 'error');
    render();
  } finally {
    loadingSpinner.style.display = 'none';
  }
}

// Create a new todo
async function createTodo(title) {
  try {
    const newTodoPayload = {
      title: title.trim(),
      completed: false
    };

    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTodoPayload)
    });

    if (!res.ok) throw new Error('Failed to create task');
    const result = await res.json();
    showToast('Task added successfully!', 'success');
    await fetchTodos();
  } catch (err) {
    console.error('Error creating todo:', err);
    showToast('Could not add task. Check server status.', 'error');
  }
}

// Toggle todo completion
async function toggleTodo(id) {
  const target = todos.find(t => t.ID === id);
  if (!target) return;

  const updatedPayload = {
    ID: target.ID,
    title: target.title,
    completed: !target.completed
  };

  try {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPayload)
    });

    if (!res.ok) throw new Error('Failed to update task');
    target.completed = !target.completed;
    render();
    showToast(target.completed ? 'Task marked as completed' : 'Task marked as pending', 'info');
  } catch (err) {
    console.error('Error updating todo:', err);
    showToast('Failed to update task status.', 'error');
  }
}

// Save edited todo
async function saveEditTodo(id, newTitle, isCompleted) {
  const updatedPayload = {
    ID: id,
    title: newTitle.trim(),
    completed: isCompleted
  };

  try {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPayload)
    });

    if (!res.ok) throw new Error('Failed to update task');
    showToast('Task updated successfully!', 'success');
    closeEditModal();
    await fetchTodos();
  } catch (err) {
    console.error('Error saving edited todo:', err);
    showToast('Failed to update task.', 'error');
  }
}

// Delete todo
async function deleteTodo(id) {
  try {
    const res = await fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('Failed to delete task');
    showToast('Task deleted successfully', 'info');
    await fetchTodos();
  } catch (err) {
    console.error('Error deleting todo:', err);
    showToast('Could not delete task.', 'error');
  }
}

// Modal controls
function openEditModal(todo) {
  editTodoId.value = todo.ID;
  editTodoTitle.value = todo.title;
  editTodoCompleted.checked = !!todo.completed;
  editModal.style.display = 'flex';
  editTodoTitle.focus();
}

function closeEditModal() {
  editModal.style.display = 'none';
  editForm.reset();
}

// Filter and search logic
function getFilteredTodos() {
  return todos.filter(todo => {
    // Filter by tab
    if (activeFilter === 'active' && todo.completed) return false;
    if (activeFilter === 'completed' && !todo.completed) return false;

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = (todo.title || '').toLowerCase().includes(q);
      const matchId = String(todo.ID || '').includes(q);
      if (!matchTitle && !matchId) return false;
    }

    return true;
  });
}

// Render DOM
function render() {
  // Update stats
  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const pending = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  statTotal.textContent = total;
  statPending.textContent = pending;
  statCompleted.textContent = completed;
  progressBarFill.style.width = `${percentage}%`;
  progressText.textContent = `${percentage}% completed`;

  const filtered = getFilteredTodos();
  todoList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'flex';
    if (searchQuery.trim() !== '') {
      emptyTitle.textContent = 'No matching tasks';
      emptyDesc.textContent = `No tasks matched your query "${searchQuery}".`;
    } else if (activeFilter === 'completed') {
      emptyTitle.textContent = 'No completed tasks';
      emptyDesc.textContent = 'Complete some tasks to see them here.';
    } else if (activeFilter === 'active') {
      emptyTitle.textContent = 'No pending tasks';
      emptyDesc.textContent = 'All tasks are completed! Enjoy your day.';
    } else {
      emptyTitle.textContent = 'No tasks yet';
      emptyDesc.textContent = 'Add your first task using the input field above.';
    }
  } else {
    emptyState.style.display = 'none';

    filtered.forEach(todo => {
      const li = document.createElement('li');
      li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
      li.dataset.id = todo.ID;

      li.innerHTML = `
        <div class="todo-content">
          <button type="button" class="checkbox-btn" aria-label="Toggle completed" title="${todo.completed ? 'Mark as incomplete' : 'Mark as complete'}">
            <span class="custom-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
          </button>
          <div class="todo-title-wrap">
            <span class="todo-id-badge">#${todo.ID}</span>
            <span class="todo-title">${escapeHtml(todo.title)}</span>
          </div>
        </div>
        <div class="todo-actions">
          <button type="button" class="action-btn edit-btn" title="Edit task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button type="button" class="action-btn delete-btn" title="Delete task">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </button>
        </div>
      `;

      // Event listeners for item buttons
      const checkBtn = li.querySelector('.checkbox-btn');
      checkBtn.addEventListener('click', () => toggleTodo(todo.ID));

      const editBtn = li.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => openEditModal(todo));

      const delBtn = li.querySelector('.delete-btn');
      delBtn.addEventListener('click', () => {
        if (confirm(`Delete "${todo.title}"?`)) {
          deleteTodo(todo.ID);
        }
      });

      todoList.appendChild(li);
    });
  }
}

// Simple HTML escaping helper
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Event Listeners
todoForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (text) {
    await createTodo(text);
    todoInput.value = '';
    todoInput.focus();
  }
});

// Search handling
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
  render();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  clearSearchBtn.style.display = 'none';
  render();
  searchInput.focus();
});

// Filter pill click
filterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    filterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    activeFilter = pill.dataset.filter;
    render();
  });
});

// Modal event listeners
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = parseInt(editTodoId.value, 10);
  const title = editTodoTitle.value;
  const completed = editTodoCompleted.checked;
  await saveEditTodo(id, title, completed);
});

modalCloseBtn.addEventListener('click', closeEditModal);
modalCancelBtn.addEventListener('click', closeEditModal);

editModal.addEventListener('click', (e) => {
  if (e.target === editModal) closeEditModal();
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && editModal.style.display === 'flex') {
    closeEditModal();
  }
});

// Manual refresh button
refreshBtn.addEventListener('click', () => {
  fetchTodos();
  showToast('Synced with server', 'info');
});

// Initial boot
fetchTodos();
