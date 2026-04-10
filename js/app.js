// ── 1. Constants ──────────────────────────────────────────────────────────────
const KEYS = { tasks: 'pd_tasks', links: 'pd_links', name: 'pd_name', theme: 'pd_theme', timerDuration: 'pd_timer' };
const DEFAULT_DURATION = 25 * 60; // seconds
const SORT_MODES = ['default', 'incomplete-first', 'completed-first'];
const SORT_LABELS = { default: 'Sort: Default', 'incomplete-first': 'Sort: Incomplete First', 'completed-first': 'Sort: Completed First' };

// ── 2. State ──────────────────────────────────────────────────────────────────
const AppState = {
  name: '',
  theme: 'light',
  sortMode: 'default',
  tasks: [],
  links: [],
  timerDuration: DEFAULT_DURATION
};

// Timer internal state (not persisted between sessions)
const Timer = { remaining: DEFAULT_DURATION, intervalId: null };

// ── 3. Storage ────────────────────────────────────────────────────────────────
function loadState() {
  try {
    AppState.tasks = JSON.parse(localStorage.getItem(KEYS.tasks)) || [];
    AppState.links = JSON.parse(localStorage.getItem(KEYS.links)) || [];
    AppState.name  = JSON.parse(localStorage.getItem(KEYS.name))  || '';
    AppState.theme = localStorage.getItem(KEYS.theme) || null;
    const saved = parseInt(localStorage.getItem(KEYS.timerDuration), 10);
    AppState.timerDuration = (!isNaN(saved) && saved > 0) ? saved : DEFAULT_DURATION;
    Timer.remaining = AppState.timerDuration;
  } catch (_) {
    AppState.tasks = []; AppState.links = []; AppState.name = ''; AppState.theme = null;
    AppState.timerDuration = DEFAULT_DURATION; Timer.remaining = DEFAULT_DURATION;
  }
}

function saveState() {
  try {
    localStorage.setItem(KEYS.tasks, JSON.stringify(AppState.tasks));
    localStorage.setItem(KEYS.links, JSON.stringify(AppState.links));
    localStorage.setItem(KEYS.name,  JSON.stringify(AppState.name));
    localStorage.setItem(KEYS.theme, AppState.theme);
    localStorage.setItem(KEYS.timerDuration, AppState.timerDuration);
  } catch (_) { /* storage unavailable — continue with in-memory state */ }
}

// ── 4. Greeting ───────────────────────────────────────────────────────────────
function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function formatDate(date) {
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function getSalutation(hour) {
  if (hour >= 5  && hour <= 11) return 'Good morning';
  if (hour >= 12 && hour <= 17) return 'Good afternoon';
  if (hour >= 18 && hour <= 21) return 'Good evening';
  return 'Good night';
}

function greetingRender() {
  const now = new Date();
  document.getElementById('greeting-time').textContent = formatTime(now);
  document.getElementById('greeting-date').textContent = formatDate(now);
  const sal = getSalutation(now.getHours());
  document.getElementById('greeting-salutation').textContent =
    AppState.name ? `${sal}, ${AppState.name}` : sal;
  document.getElementById('greeting-name').textContent = AppState.name;
}

function initNameEditing() {
  const nameEl = document.getElementById('greeting-name');
  nameEl.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'name-input';
    input.value = AppState.name;
    input.placeholder = 'Your name';
    nameEl.replaceWith(input);
    input.focus();

    function commit() {
      const val = input.value.trim();
      AppState.name = val;
      saveState();
      const span = document.createElement('span');
      span.id = 'greeting-name';
      span.className = 'name';
      span.title = 'Click to edit your name';
      span.textContent = val;
      input.replaceWith(span);
      initNameEditing();
      greetingRender();
    }
    input.addEventListener('blur', commit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
  });
}

// ── 5. Timer ──────────────────────────────────────────────────────────────────
function timerRender() {
  const m = String(Math.floor(Timer.remaining / 60)).padStart(2, '0');
  const s = String(Timer.remaining % 60).padStart(2, '0');
  document.getElementById('timer-display').textContent = `${m}:${s}`;
}

function timerTick() {
  Timer.remaining--;
  timerRender();
  if (Timer.remaining <= 0) {
    timerStop();
    alert('Focus session complete! Take a break.');
  }
}

function timerStart() {
  if (Timer.intervalId) return;
  Timer.intervalId = setInterval(timerTick, 1000);
  const btn = document.getElementById('timer-start');
  btn.setAttribute('aria-pressed', 'true');
  btn.textContent = 'Running…';
}

function timerStop() {
  clearInterval(Timer.intervalId);
  Timer.intervalId = null;
  const btn = document.getElementById('timer-start');
  btn.setAttribute('aria-pressed', 'false');
  btn.textContent = 'Start';
}

function timerReset() {
  timerStop();
  Timer.remaining = AppState.timerDuration;
  timerRender();
}

function timerSetDuration(seconds) {
  timerStop();
  AppState.timerDuration = seconds;
  Timer.remaining = seconds;
  saveState();
  timerRender();
}

function initTimerEdit() {
  const display = document.getElementById('timer-display');
  display.addEventListener('click', () => {
    if (Timer.intervalId) return; // don't edit while running
    const totalMins = Math.floor(AppState.timerDuration / 60);
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'timer-edit-input';
    input.value = totalMins;
    input.min = 1;
    input.max = 999;
    input.setAttribute('aria-label', 'Set timer minutes');
    display.replaceWith(input);
    input.focus();
    input.select();

    function commitTimer() {
      const mins = parseInt(input.value, 10);
      const secs = (!isNaN(mins) && mins > 0) ? mins * 60 : AppState.timerDuration;
      const newDisplay = document.createElement('div');
      newDisplay.id = 'timer-display';
      newDisplay.className = 'timer-display';
      newDisplay.title = 'Click to set custom time';
      input.replaceWith(newDisplay);
      timerSetDuration(secs);
      initTimerEdit();
    }
    input.addEventListener('blur', commitTimer);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') { input.value = Math.floor(AppState.timerDuration / 60); input.blur(); }
    });
  });
}

// ── 6. Tasks ──────────────────────────────────────────────────────────────────
function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function tasksRender() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';

  let sorted = [...AppState.tasks];
  if (AppState.sortMode === 'incomplete-first') {
    sorted.sort((a, b) => a.completed - b.completed);
  } else if (AppState.sortMode === 'completed-first') {
    sorted.sort((a, b) => b.completed - a.completed);
  }

  sorted.forEach(task => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.dataset.id = task.id;

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'task-check';
    check.checked = task.completed;
    check.setAttribute('aria-label', 'Mark complete');
    check.addEventListener('change', () => taskToggle(task.id));

    const label = document.createElement('span');
    label.className = 'task-label' + (task.completed ? ' done' : '');
    label.textContent = task.label;

    const editBtn = document.createElement('button');
    editBtn.className = 'task-btn';
    editBtn.textContent = '✏️';
    editBtn.setAttribute('aria-label', 'Edit task');
    editBtn.addEventListener('click', () => taskStartEdit(task.id, label, li));

    const delBtn = document.createElement('button');
    delBtn.className = 'task-btn del';
    delBtn.textContent = '🗑️';
    delBtn.setAttribute('aria-label', 'Delete task');
    delBtn.addEventListener('click', () => taskDelete(task.id));

    li.append(check, label, editBtn, delBtn);
    list.appendChild(li);
  });
}

function taskStartEdit(id, labelEl, li) {
  const task = AppState.tasks.find(t => t.id === id);
  if (!task) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'task-edit-input';
  input.value = task.label;
  labelEl.replaceWith(input);
  input.focus();

  function commitEdit() {
    const val = input.value.trim();
    if (val) { task.label = val; saveState(); }
    tasksRender();
  }
  input.addEventListener('blur', commitEdit);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); input.blur(); } });
}

function taskAdd(label) {
  const trimmed = label.trim();
  const errEl = document.getElementById('task-error');
  if (!trimmed) { errEl.textContent = 'Task cannot be empty.'; return; }
  errEl.textContent = '';
  AppState.tasks.push({ id: genId(), label: trimmed, completed: false });
  saveState();
  tasksRender();
}

function taskToggle(id) {
  const task = AppState.tasks.find(t => t.id === id);
  if (task) { task.completed = !task.completed; saveState(); tasksRender(); }
}

function taskDelete(id) {
  AppState.tasks = AppState.tasks.filter(t => t.id !== id);
  saveState();
  tasksRender();
}

function taskSort() {
  const idx = SORT_MODES.indexOf(AppState.sortMode);
  AppState.sortMode = SORT_MODES[(idx + 1) % SORT_MODES.length];
  document.getElementById('sort-btn').textContent = SORT_LABELS[AppState.sortMode];
  tasksRender();
}

// ── 7. Links ──────────────────────────────────────────────────────────────────
function linksRender() {
  const panel = document.getElementById('links-panel');
  panel.innerHTML = '';
  AppState.links.forEach(link => {
    const wrap = document.createElement('div');
    wrap.className = 'link-btn-wrap';

    const btn = document.createElement('a');
    btn.className = 'link-btn';
    btn.textContent = link.label;
    btn.href = link.url;
    btn.target = '_blank';
    btn.rel = 'noopener noreferrer';

    const del = document.createElement('button');
    del.className = 'link-del';
    del.textContent = '✕';
    del.setAttribute('aria-label', `Delete ${link.label}`);
    del.addEventListener('click', () => linkDelete(link.id));

    wrap.append(btn, del);
    panel.appendChild(wrap);
  });
}

function linkAdd(label, url) {
  const errEl = document.getElementById('link-error');
  if (!label.trim()) { errEl.textContent = 'Label cannot be empty.'; return; }
  // Auto-prefix protocol if missing
  let fullUrl = url.trim();
  if (fullUrl && !/^https?:\/\//i.test(fullUrl)) fullUrl = 'https://' + fullUrl;
  try { new URL(fullUrl); } catch (_) { errEl.textContent = 'Please enter a valid URL.'; return; }
  errEl.textContent = '';
  AppState.links.push({ id: genId(), label: label.trim(), url: fullUrl });
  saveState();
  linksRender();
}

function linkDelete(id) {
  AppState.links = AppState.links.filter(l => l.id !== id);
  saveState();
  linksRender();
}

// ── 8. Theme ──────────────────────────────────────────────────────────────────
function themeApply(theme) {
  AppState.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
}

function themeToggle() {
  themeApply(AppState.theme === 'dark' ? 'light' : 'dark');
  saveState();
}

// ── 9. Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Load persisted state
  loadState();

  // Apply theme (fallback to OS preference)
  if (AppState.theme) {
    themeApply(AppState.theme);
  } else {
    themeApply(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  // Initial renders
  greetingRender();
  timerRender();
  tasksRender();
  linksRender();
  initNameEditing();

  // Greeting interval (every 1s to show seconds)
  setInterval(greetingRender, 1000);

  // Timer controls
  document.getElementById('timer-start').addEventListener('click', timerStart);
  document.getElementById('timer-stop').addEventListener('click', timerStop);
  document.getElementById('timer-reset').addEventListener('click', timerReset);
  initTimerEdit();

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => timerSetDuration(parseInt(btn.dataset.minutes, 10) * 60));
  });

  // Task form
  const taskInput = document.getElementById('task-input');
  document.getElementById('task-add').addEventListener('click', () => {
    taskAdd(taskInput.value);
    taskInput.value = '';
  });
  taskInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') { taskAdd(taskInput.value); taskInput.value = ''; }
  });

  // Sort
  document.getElementById('sort-btn').addEventListener('click', taskSort);

  // Link form
  const linkLabel = document.getElementById('link-label');
  const linkUrl   = document.getElementById('link-url');
  document.getElementById('link-add').addEventListener('click', () => {
    linkAdd(linkLabel.value, linkUrl.value);
    linkLabel.value = ''; linkUrl.value = '';
  });
  linkUrl.addEventListener('keydown', e => {
    if (e.key === 'Enter') { linkAdd(linkLabel.value, linkUrl.value); linkLabel.value = ''; linkUrl.value = ''; }
  });

  // Theme toggle
  document.getElementById('theme-toggle').addEventListener('click', themeToggle);
});
