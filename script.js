/* ==========================================================================
   TaskBoard Application - JavaScript Logic
   Clean, Beginner-Friendly Vanilla JS with LocalStorage Persistence
   ========================================================================== */

// --- 1. State Management ---
// Array to hold all task objects. Each task has: { id, text, completed }
let tasks = [];

// Current filter view: 'all' | 'active' | 'completed'
let currentFilter = 'all';

// LocalStorage key name
const STORAGE_KEY = 'taskboard_tasks';

// --- 2. DOM Elements Selection ---
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');

const totalCountEl = document.getElementById('totalCount');
const completedCountEl = document.getElementById('completedCount');
const progressFillEl = document.getElementById('progressFill');

const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');

// --- 3. Initialization ---
// Called when the application loads
function init() {
  loadTasksFromLocalStorage();
  setupEventListeners();
  render();
}

// --- 4. LocalStorage Helpers ---
// Retrieve saved tasks from browser's local storage
function loadTasksFromLocalStorage() {
  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      tasks = JSON.parse(savedData);
    } catch (e) {
      console.error('Failed to parse tasks from localStorage:', e);
      tasks = [];
    }
  }
}

// Save current tasks array to local storage
function saveTasksToLocalStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --- 5. Task Operations ---
// Add a new task item
function addTask(text) {
  const trimmedText = text.trim();
  if (!trimmedText) return;

  const newTask = {
    id: Date.now().toString(), // Unique ID based on current timestamp
    text: trimmedText,
    completed: false
  };

  tasks.unshift(newTask); // Add new task to top of list
  saveTasksToLocalStorage();
  render();
}

// Toggle completion status of a task
function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasksToLocalStorage();
  render();
}

// Delete a task by ID
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasksToLocalStorage();
  render();
}

// Remove all completed tasks
function clearCompletedTasks() {
  tasks = tasks.filter(task => !task.completed);
  saveTasksToLocalStorage();
  render();
}

// Filter tasks based on current tab selection
function getFilteredTasks() {
  if (currentFilter === 'active') {
    return tasks.filter(task => !task.completed);
  }
  if (currentFilter === 'completed') {
    return tasks.filter(task => task.completed);
  }
  return tasks; // 'all'
}

// --- 6. DOM Rendering ---
// Main render function that updates UI state and HTML elements
function render() {
  renderTaskList();
  updateCounters();
}

// Render task elements to the DOM
function renderTaskList() {
  const filteredTasks = getFilteredTasks();

  // Clear existing list items
  taskList.innerHTML = '';

  // Show or hide empty state graphic
  if (filteredTasks.length === 0) {
    emptyState.classList.add('visible');
  } else {
    emptyState.classList.remove('visible');
  }

  // Generate HTML element for each task item
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    li.setAttribute('data-id', task.id);

    li.innerHTML = `
      <div class="task-content">
        <button class="checkbox-btn" aria-label="${task.completed ? 'Mark as incomplete' : 'Mark as complete'}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
        <span class="task-text">${escapeHTML(task.text)}</span>
      </div>
      <button class="delete-btn" aria-label="Delete task" title="Delete task">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    `;

    taskList.appendChild(li);
  });
}

// Update total and completed task count badges & progress bar
function updateCounters() {
  const totalCount = tasks.length;
  const completedCount = tasks.filter(task => task.completed).length;

  totalCountEl.textContent = totalCount;
  completedCountEl.textContent = completedCount;

  // Calculate completion percentage for progress bar
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  progressFillEl.style.width = `${progressPercent}%`;
}

// Escape user text to prevent XSS vulnerability
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- 7. Event Listeners ---
function setupEventListeners() {
  // Handle form submission to add new task
  taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    addTask(taskInput.value);
    taskInput.value = ''; // Clear input field
  });

  // Handle click events on task items using Event Delegation
  taskList.addEventListener('click', (e) => {
    const taskItem = e.target.closest('.task-item');
    if (!taskItem) return;

    const id = taskItem.getAttribute('data-id');

    // Check if delete button was clicked
    if (e.target.closest('.delete-btn')) {
      deleteTask(id);
      return;
    }

    // Check if checkbox or task content was clicked to toggle status
    if (e.target.closest('.checkbox-btn') || e.target.closest('.task-content')) {
      toggleTask(id);
    }
  });

  // Handle filter tab selection
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      currentFilter = button.getAttribute('data-filter');
      render();
    });
  });

  // Handle clear completed tasks action
  clearCompletedBtn.addEventListener('click', () => {
    clearCompletedTasks();
  });
}

// Run app startup
document.addEventListener('DOMContentLoaded', init);
