const state = {
  showPaused: false,          // category drill-down view
  listShowPaused: false,      // list mode
  listActiveCats: new Set(CATEGORIES.map(c => c.id)),
  zoom: 1,
  starred: new Set(JSON.parse(localStorage.getItem('routineHub.starred') || '[]')),
  routines: ROUTINES.slice(), // overwritten by loadRoutines() once the Sheet responds
  observations: [],
  reviewAnswers: {}, // categoryId -> { serving, roadblocks, why, notes }
};

const ZOOM_MIN = 0.7, ZOOM_MAX = 1.6, ZOOM_STEP = 0.1, ZOOM_BASE = 380;
const NEW_BADGE_DAYS = 14;

const connected = () => !!APPS_SCRIPT_URL;

function toggleStar(id) {
  if (state.starred.has(id)) state.starred.delete(id); else state.starred.add(id);
  localStorage.setItem('routineHub.starred', JSON.stringify([...state.starred]));
}

function isNew(r) {
  if (!r.dateAdded) return false;
  const added = new Date(r.dateAdded + 'T00:00:00');
  const days = (Date.now() - added.getTime()) / 86400000;
  return days >= 0 && days <= NEW_BADGE_DAYS;
}

function prioritySort(a, b) {
  const starDiff = (state.starred.has(b.id) ? 1 : 0) - (state.starred.has(a.id) ? 1 : 0);
  return starDiff !== 0 ? starDiff : b.freq - a.freq;
}

function routineCardHTML(r) {
  const starred = state.starred.has(r.id);
  return `
    <div class="card${r.active ? '' : ' paused'}${starred ? ' starred' : ''}">
      <div class="card-top">
        <h3>${r.focus}${r.active ? '' : '<span class="paused-tag">paused</span>'}${isNew(r) ? '<span class="new-tag">new</span>' : ''}</h3>
        <div class="card-top-right">
          <button class="star-btn" data-id="${r.id}" aria-label="${starred ? 'Unstar' : 'Star as priority'}">${starred ? '★' : '☆'}</button>
          <span class="freq-badge">${r.frequency}</span>
        </div>
      </div>
      <p class="why">${r.why}</p>
      <div class="meta">
        <span><b>What —</b> ${r.what}</span>
        ${r.object ? `<span><b>Needs —</b> ${r.object}</span>` : ''}
      </div>
      <button class="icon-btn card-delete-btn" data-id="${r.id}" title="Delete routine">✕</button>
    </div>
  `;
}

function wireStarButtons(container, onToggle) {
  container.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleStar(btn.dataset.id);
      onToggle();
    });
  });
  container.querySelectorAll('.card-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteRoutine(btn.dataset.id, onToggle));
  });
}

// ---------------------------------------------------------------------
// Routines — fetched from the "Site Routines" sheet tab (seeded once
// from the built-in defaults below), or those defaults if not connected.
// ---------------------------------------------------------------------
async function loadRoutines() {
  if (!connected()) { state.routines = localGet('routineHub.routines.local', ROUTINES.slice()); return; }
  try {
    let fetched = await apiGet('routines') || [];
    if (!fetched.length) {
      await apiPost('seedRoutines', { rows: ROUTINES });
      fetched = await apiGet('routines') || [];
    }
    state.routines = fetched.length ? fetched : ROUTINES.slice();
  } catch {
    state.routines = ROUTINES.slice();
  }
}

function addRoutineBlockHTML(catId) {
  return `
    <button class="btn add-toggle-btn add-routine-toggle" data-cat="${catId}">+ Add a routine</button>
    <div class="panel add-routine-panel" data-cat="${catId}" style="display:none">
      <h3>Add a routine</h3>
      <div class="field">
        <label>Focus</label>
        <input type="text" class="ar-focus" placeholder="e.g. Evening Stretch">
      </div>
      <div class="field">
        <label>Why</label>
        <input type="text" class="ar-why" placeholder="Why does this matter?">
      </div>
      <div class="field">
        <label>What</label>
        <input type="text" class="ar-what" placeholder="What does doing it look like?">
      </div>
      <div class="field-row">
        <div class="field">
          <label>Frequency</label>
          <select class="ar-frequency">
            <option value="Daily|7">Daily</option>
            <option value="4x / week|4">4x / week</option>
            <option value="3x / week|3">3x / week</option>
            <option value="2x / week|2">2x / week</option>
            <option value="Weekly|1" selected>Weekly</option>
            <option value="Bi-weekly|0.5">Bi-weekly</option>
            <option value="Monthly|0.25">Monthly</option>
          </select>
        </div>
        <div class="field">
          <label>Duration <span class="optional">optional</span></label>
          <input type="text" class="ar-duration" placeholder="e.g. 20 mins">
        </div>
      </div>
      <div class="field">
        <label>Needs <span class="optional">optional</span></label>
        <input type="text" class="ar-object" placeholder="e.g. Yoga mat">
      </div>
      <button class="btn ar-submit" data-cat="${catId}">Add routine</button>
      <div class="status-msg ar-status"></div>
    </div>
  `;
}

function wireAddRoutine(container, catId, onDone) {
  const toggle = container.querySelector(`.add-routine-toggle[data-cat="${catId}"]`);
  const panel = container.querySelector(`.add-routine-panel[data-cat="${catId}"]`);
  if (!toggle || !panel) return;
  toggle.addEventListener('click', () => {
    const open = panel.style.display !== 'none';
    panel.style.display = open ? 'none' : '';
    toggle.textContent = open ? '+ Add a routine' : '− Close';
  });
  panel.querySelector('.ar-submit').addEventListener('click', () => addRoutine(catId, panel, onDone));
}

async function addRoutine(catId, panel, onDone) {
  const status = panel.querySelector('.ar-status');
  const focus = panel.querySelector('.ar-focus').value.trim();
  const why = panel.querySelector('.ar-why').value.trim();
  const what = panel.querySelector('.ar-what').value.trim();
  const [frequency, freq] = panel.querySelector('.ar-frequency').value.split('|');
  const duration = panel.querySelector('.ar-duration').value.trim();
  const object = panel.querySelector('.ar-object').value.trim();

  if (!focus || !why || !what) { status.textContent = 'Fill in focus, why, and what.'; return; }
  status.textContent = 'Saving...';

  const body = { category: catId, focus, why, what, frequency, freq: Number(freq), duration, object, active: true };
  const today = new Date().toISOString().slice(0, 10);
  const localEntry = { ...body, id: `${catId}-${Date.now()}`, dateAdded: today };

  if (connected()) {
    try {
      const saved = await apiPost('addRoutine', body);
      if (!saved || !saved.id) { status.textContent = 'Sheet did not confirm the save — is Code.gs redeployed?'; return; }
      state.routines.push({ ...body, id: saved.id, dateAdded: saved.dateAdded });
    } catch { status.textContent = 'Could not save to your Sheet.'; return; }
  } else {
    state.routines.push(localEntry);
    localSet('routineHub.routines.local', state.routines);
  }

  panel.querySelectorAll('input').forEach(i => i.value = '');
  status.textContent = 'Added.';
  setTimeout(() => status.textContent = '', 1500);
  onDone();
}

async function deleteRoutine(id, onDone) {
  if (!confirm('Delete this routine? This cannot be undone.')) return;
  state.routines = state.routines.filter(r => String(r.id) !== String(id));
  onDone();
  if (connected()) {
    try { await apiPost('deleteRoutine', { id }); }
    catch { /* already removed locally; Sheet will drift until next successful call */ }
  } else {
    localSet('routineHub.routines.local', state.routines);
  }
}

// ---------------------------------------------------------------------
// Tabs
// ---------------------------------------------------------------------
document.querySelectorAll('nav.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('nav.tabs button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(btn.dataset.view).classList.add('active');
  });
});

document.getElementById('todayLabel').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

// ---------------------------------------------------------------------
// Overview mode switch — wheel vs full list
// ---------------------------------------------------------------------
document.querySelectorAll('#modeSwitch button').forEach(btn => {
  btn.addEventListener('click', () => setMode(btn.dataset.mode, true));
});

function setMode(mode, resetHash) {
  document.querySelectorAll('#modeSwitch button').forEach(b => b.classList.toggle('active', b.dataset.mode === mode));
  document.getElementById('wheelMode').style.display = mode === 'wheel' ? '' : 'none';
  document.getElementById('listMode').style.display = mode === 'list' ? '' : 'none';
  localSet('routineHub.mode', mode);
  if (mode === 'wheel' && resetHash) location.hash = '';
}

// ---------------------------------------------------------------------
// Overview — wheel of categories, drilling into one at a time
// ---------------------------------------------------------------------

function renderWheel() {
  const nodesEl = document.getElementById('wheelNodes');
  const spokesEl = document.getElementById('wheelSpokes');
  nodesEl.innerHTML = '';
  spokesEl.innerHTML = '';

  const n = CATEGORIES.length;
  const R = 38; // radius, % of wheel-wrap
  const cx = 50, cy = 50;

  CATEGORIES.forEach((cat, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const x = cx + R * Math.cos(angle);
    const y = cy + R * Math.sin(angle);
    const count = state.routines.filter(r => r.category === cat.id && r.active).length;

    const spoke = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    spoke.setAttribute('x1', cx); spoke.setAttribute('y1', cy);
    spoke.setAttribute('x2', x); spoke.setAttribute('y2', y);
    spoke.setAttribute('class', 'spoke-line');
    spokesEl.appendChild(spoke);

    const node = document.createElement('button');
    node.className = 'wheel-node';
    node.style.left = x + '%';
    node.style.top = y + '%';
    node.style.setProperty('--dot', `var(--c-${cat.id})`);
    node.innerHTML = `
      <span class="bubble">${cat.icon}</span>
      <span class="label">${cat.label}</span>
      <span class="count">${count}</span>
    `;
    node.addEventListener('click', () => { location.hash = `#/category/${cat.id}`; });
    nodesEl.appendChild(node);
  });

  document.getElementById('wheelCount').textContent = state.routines.filter(r => r.active).length;
}

// ---------------------------------------------------------------------
// Wheel zoom
// ---------------------------------------------------------------------
function applyZoom() {
  const wrap = document.getElementById('wheelWrap');
  const scroll = document.getElementById('wheelScroll');
  const base = Math.min(scroll.clientWidth, ZOOM_BASE);
  const px = Math.round(base * state.zoom);
  wrap.style.width = px + 'px';
  document.getElementById('zoomPct').textContent = Math.round(state.zoom * 100) + '%';
  document.getElementById('zoomOut').disabled = state.zoom <= ZOOM_MIN;
  document.getElementById('zoomIn').disabled = state.zoom >= ZOOM_MAX;
  // keep it centered in the scroll area (reading offsetWidth first forces layout, so scrollWidth below is current)
  void wrap.offsetWidth;
  scroll.scrollLeft = (px - scroll.clientWidth) / 2;
}

document.getElementById('zoomIn').addEventListener('click', () => {
  state.zoom = Math.min(ZOOM_MAX, +(state.zoom + ZOOM_STEP).toFixed(2));
  applyZoom();
});
document.getElementById('zoomOut').addEventListener('click', () => {
  state.zoom = Math.max(ZOOM_MIN, +(state.zoom - ZOOM_STEP).toFixed(2));
  applyZoom();
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(applyZoom, 150);
});

function showWheel() {
  document.getElementById('wheelView').style.display = '';
  document.getElementById('categoryView').style.display = 'none';
}

function showCategory(catId) {
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) { showWheel(); return; }

  document.getElementById('wheelView').style.display = 'none';
  const view = document.getElementById('categoryView');
  view.style.display = '';
  view.style.setProperty('--cat', `var(--c-${cat.id})`);

  document.getElementById('catIcon').textContent = cat.icon;
  document.getElementById('catLabel').textContent = cat.label;
  document.getElementById('catBlurb').textContent = cat.blurb;

  renderCategoryCards(cat);
}

function renderCategoryCards(cat) {
  const grid = document.getElementById('categoryCards');
  let items = state.routines.filter(r => r.category === cat.id);
  if (!state.showPaused) items = items.filter(r => r.active);
  items = items.slice().sort(prioritySort);

  grid.innerHTML = items.map(routineCardHTML).join('');
  wireStarButtons(grid, () => renderCategoryCards(cat));

  const plantSection = document.getElementById('plantSection');
  plantSection.innerHTML = '';
  if (cat.id === 'organizing') {
    const toggle = document.createElement('span');
    toggle.className = 'plant-toggle';
    toggle.textContent = '🌿 View plant watering schedule';
    const box = document.createElement('div');
    box.className = 'plant-box';
    box.innerHTML = PLANTS.map(g => `
      <div class="plant-group">
        <h4>${g.group}</h4>
        ${g.items.map(p => `
          <div class="plant-item">
            <b>${p.name}</b>
            <span class="sub">${p.light} · ${p.water}</span>
            <span class="tips">${p.tips}</span>
          </div>
        `).join('')}
      </div>
    `).join('');
    toggle.addEventListener('click', () => {
      box.classList.toggle('open');
      toggle.textContent = box.classList.contains('open') ? '🌿 Hide plant watering schedule' : '🌿 View plant watering schedule';
    });
    plantSection.appendChild(toggle);
    plantSection.appendChild(box);
  }

  const addSection = document.getElementById('addRoutineSection');
  addSection.innerHTML = addRoutineBlockHTML(cat.id);
  wireAddRoutine(addSection, cat.id, () => renderCategoryCards(cat));
}

document.getElementById('backToWheel').addEventListener('click', () => { location.hash = ''; });

document.getElementById('showPausedCategory').addEventListener('change', e => {
  state.showPaused = e.target.checked;
  const catId = (location.hash.match(/^#\/category\/(.+)$/) || [])[1];
  const cat = CATEGORIES.find(c => c.id === catId);
  if (cat) renderCategoryCards(cat);
});

function routeOverview() {
  const match = location.hash.match(/^#\/category\/(.+)$/);
  if (match) showCategory(match[1]); else showWheel();
}
window.addEventListener('hashchange', routeOverview);

// ---------------------------------------------------------------------
// Overview — List mode (every category, stacked, filterable)
// ---------------------------------------------------------------------
function renderListChips() {
  const row = document.getElementById('chipRow');
  const toggle = row.querySelector('.chip-toggle');
  CATEGORIES.forEach(cat => {
    const chip = document.createElement('div');
    chip.className = 'chip active';
    chip.style.setProperty('--dot', `var(--c-${cat.id})`);
    chip.innerHTML = `<span class="dot"></span>${cat.icon} ${cat.label}`;
    chip.addEventListener('click', () => {
      if (state.listActiveCats.has(cat.id)) { state.listActiveCats.delete(cat.id); chip.classList.remove('active'); }
      else { state.listActiveCats.add(cat.id); chip.classList.add('active'); }
      renderList();
    });
    row.insertBefore(chip, toggle);
  });
  document.getElementById('showPausedList').addEventListener('change', e => {
    state.listShowPaused = e.target.checked;
    renderList();
  });
}

function renderList() {
  const container = document.getElementById('catSections');
  container.innerHTML = '';

  CATEGORIES.filter(c => state.listActiveCats.has(c.id)).forEach(cat => {
    let items = state.routines.filter(r => r.category === cat.id);
    if (!state.listShowPaused) items = items.filter(r => r.active);
    items = items.slice().sort(prioritySort);

    const section = document.createElement('div');
    section.className = 'cat-section';
    section.style.setProperty('--cat', `var(--c-${cat.id})`);

    section.innerHTML = `
      <div class="cat-heading">
        <span class="icon">${cat.icon}</span>
        <h2>${cat.label}</h2>
        <span class="count">${items.length}</span>
      </div>
      <p class="cat-blurb">${cat.blurb}</p>
      ${items.length ? `<div class="card-grid">${items.map(routineCardHTML).join('')}</div>` : '<div class="empty-state">Nothing here yet.</div>'}
      <div class="add-routine-slot"></div>
    `;
    wireStarButtons(section, renderList);
    section.querySelector('.add-routine-slot').innerHTML = addRoutineBlockHTML(cat.id);
    wireAddRoutine(section, cat.id, renderList);

    container.appendChild(section);

    if (cat.id === 'organizing') {
      const toggle = document.createElement('span');
      toggle.className = 'plant-toggle';
      toggle.textContent = '🌿 View plant watering schedule';
      const box = document.createElement('div');
      box.className = 'plant-box';
      box.innerHTML = PLANTS.map(g => `
        <div class="plant-group">
          <h4>${g.group}</h4>
          ${g.items.map(p => `
            <div class="plant-item">
              <b>${p.name}</b>
              <span class="sub">${p.light} · ${p.water}</span>
              <span class="tips">${p.tips}</span>
            </div>
          `).join('')}
        </div>
      `).join('');
      toggle.addEventListener('click', () => {
        box.classList.toggle('open');
        toggle.textContent = box.classList.contains('open') ? '🌿 Hide plant watering schedule' : '🌿 View plant watering schedule';
      });
      container.appendChild(toggle);
      container.appendChild(box);
    }
  });
}

// ---------------------------------------------------------------------
// Backend helper (Apps Script Web App, or localStorage fallback)
// ---------------------------------------------------------------------
async function apiGet(action) {
  if (!connected()) return null;
  const res = await fetch(`${APPS_SCRIPT_URL}?action=${action}`);
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

async function apiPost(action, payload) {
  if (!connected()) return null;
  const res = await fetch(APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

function localGet(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
}
function localSet(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// ---------------------------------------------------------------------
// Inbox — quick capture for routine ideas, sorted into full routines
// later (reuses the same addRoutine() used by the per-category "+ Add
// a routine" panel — the sort form is just that panel with a Category
// select bolted on).
// ---------------------------------------------------------------------
state.inbox = [];

async function loadInbox() {
  document.getElementById('inboxSetupNote').style.display = connected() ? 'none' : 'block';
  if (connected()) {
    try { state.inbox = (await apiGet('inbox')) || []; }
    catch { state.inbox = []; document.getElementById('inboxStatus').textContent = 'Could not reach your Sheet.'; }
  } else {
    state.inbox = localGet('routineHub.inbox.local', []);
  }
  renderInbox();
}

function inboxSortPanelHTML(item) {
  return `
    <div class="field">
      <label>Category</label>
      <select class="ar-category">${CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}</select>
    </div>
    <div class="field">
      <label>Focus</label>
      <input type="text" class="ar-focus" value="${(item.text || '').replace(/"/g, '&quot;')}">
    </div>
    <div class="field">
      <label>Why</label>
      <input type="text" class="ar-why" placeholder="Why does this matter?">
    </div>
    <div class="field">
      <label>What</label>
      <input type="text" class="ar-what" placeholder="What does doing it look like?">
    </div>
    <div class="field-row">
      <div class="field">
        <label>Frequency</label>
        <select class="ar-frequency">
          <option value="Daily|7">Daily</option>
          <option value="4x / week|4">4x / week</option>
          <option value="3x / week|3">3x / week</option>
          <option value="2x / week|2">2x / week</option>
          <option value="Weekly|1" selected>Weekly</option>
          <option value="Bi-weekly|0.5">Bi-weekly</option>
          <option value="Monthly|0.25">Monthly</option>
        </select>
      </div>
      <div class="field">
        <label>Duration <span class="optional">optional</span></label>
        <input type="text" class="ar-duration" placeholder="e.g. 20 mins">
      </div>
    </div>
    <div class="field">
      <label>Needs <span class="optional">optional</span></label>
      <input type="text" class="ar-object" placeholder="e.g. Yoga mat">
    </div>
    <button class="btn ar-submit">Add as routine</button>
    <button class="btn secondary ar-cancel">Cancel</button>
    <div class="status-msg ar-status"></div>
  `;
}

function inboxItemHTML(item) {
  return `
    <div class="inbox-item" data-id="${item.id}">
      <div class="inbox-item-top">
        <span class="inbox-item-text">${item.text}</span>
        <span class="inbox-item-date">${item.dateAdded || ''}</span>
      </div>
      <div class="inbox-item-actions">
        <button class="btn secondary inbox-sort-toggle" data-id="${item.id}">Sort into a routine</button>
        <button class="icon-btn inbox-discard-btn" data-id="${item.id}" title="Discard">✕</button>
      </div>
      <div class="panel inbox-sort-panel" data-id="${item.id}" style="display:none"></div>
    </div>
  `;
}

function renderInbox() {
  const list = document.getElementById('inboxList');
  if (!state.inbox.length) { list.innerHTML = '<div class="empty-state">Nothing waiting to be sorted.</div>'; return; }

  const sorted = state.inbox.slice().sort((a, b) => (b.id > a.id ? 1 : -1));
  list.innerHTML = sorted.map(inboxItemHTML).join('');

  list.querySelectorAll('.inbox-discard-btn').forEach(btn => {
    btn.addEventListener('click', () => discardInboxItem(btn.dataset.id));
  });

  list.querySelectorAll('.inbox-sort-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = state.inbox.find(i => String(i.id) === btn.dataset.id);
      const panel = list.querySelector(`.inbox-sort-panel[data-id="${cssEscape(btn.dataset.id)}"]`);
      const open = panel.style.display !== 'none';
      if (open) { panel.style.display = 'none'; panel.innerHTML = ''; btn.textContent = 'Sort into a routine'; return; }

      panel.innerHTML = inboxSortPanelHTML(item);
      panel.style.display = '';
      btn.textContent = 'Cancel sorting';

      panel.querySelector('.ar-cancel').addEventListener('click', () => {
        panel.style.display = 'none';
        panel.innerHTML = '';
        btn.textContent = 'Sort into a routine';
      });
      panel.querySelector('.ar-submit').addEventListener('click', () => {
        const catId = panel.querySelector('.ar-category').value;
        addRoutine(catId, panel, () => {
          renderWheel();
          routeOverview();
          renderList();
          discardInboxItem(item.id, true);
        });
      });
    });
  });
}

async function addInboxItem() {
  const input = document.getElementById('inboxInput');
  const status = document.getElementById('inboxStatus');
  const text = input.value.trim();
  if (!text) return;
  status.textContent = 'Saving...';

  const today = new Date().toISOString().slice(0, 10);
  const localEntry = { id: Date.now(), text, dateAdded: today };

  if (connected()) {
    try {
      const saved = await apiPost('addInboxItem', { text });
      state.inbox.push(saved && saved.id ? saved : localEntry);
    } catch { status.textContent = 'Could not save to your Sheet.'; return; }
  } else {
    state.inbox.push(localEntry);
    localSet('routineHub.inbox.local', state.inbox);
  }

  input.value = '';
  status.textContent = '';
  renderInbox();
}

async function discardInboxItem(id, silent) {
  state.inbox = state.inbox.filter(i => String(i.id) !== String(id));
  renderInbox();
  if (connected()) {
    try { await apiPost('deleteInboxItem', { id }); }
    catch { if (!silent) document.getElementById('inboxStatus').textContent = 'Delete failed to sync to your Sheet.'; }
  } else {
    localSet('routineHub.inbox.local', state.inbox);
  }
}

document.getElementById('inboxAddBtn').addEventListener('click', addInboxItem);
document.getElementById('inboxInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addInboxItem();
});

// ---------------------------------------------------------------------
// Observations
// ---------------------------------------------------------------------
state.obsSearch = '';
state.obsCategoryFilter = 'all';

async function loadObservations() {
  document.getElementById('obsSetupNote').style.display = connected() ? 'none' : 'block';
  if (connected()) {
    try { state.observations = (await apiGet('observations')) || []; }
    catch { state.observations = []; document.getElementById('obsStatus').textContent = 'Could not reach your Sheet — check the Web App URL.'; }
  } else {
    state.observations = localGet('routineHub.observations.local', []);
  }
  renderObsFilterChips();
  renderObservations();
}

function categoryMeta(id) { return CATEGORIES.find(c => c.id === id); }

function renderObsFilterChips() {
  const row = document.getElementById('obsFilterChips');
  const counts = {};
  state.observations.forEach(o => { counts[o.category] = (counts[o.category] || 0) + 1; });

  const chips = [{ id: 'all', label: 'All', icon: '', count: state.observations.length }]
    .concat(CATEGORIES.map(c => ({ id: c.id, label: c.label, icon: c.icon, count: counts[c.id] || 0 })));

  row.innerHTML = chips.map(c => `
    <div class="chip${state.obsCategoryFilter === c.id ? ' active' : ''}" data-cat="${c.id}" style="--dot: ${c.id === 'all' ? 'var(--text-faint)' : `var(--c-${c.id})`}">
      <span class="dot"></span>${c.icon ? c.icon + ' ' : ''}${c.label}${c.count ? ` · ${c.count}` : ''}
    </div>
  `).join('');

  row.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      state.obsCategoryFilter = chip.dataset.cat;
      renderObsFilterChips();
      renderObservations();
    });
  });
}

function filteredObservations() {
  const q = state.obsSearch.trim().toLowerCase();
  return state.observations.filter(o => {
    if (state.obsCategoryFilter !== 'all' && o.category !== state.obsCategoryFilter) return false;
    if (!q) return true;
    return `${o.observation} ${o.action} ${o.routine || ''}`.toLowerCase().includes(q);
  });
}

function renderObservations() {
  const list = document.getElementById('obsList');
  const items = filteredObservations();
  if (!items.length) {
    list.innerHTML = `<div class="empty-state">${state.observations.length ? 'Nothing matches that search/filter.' : 'No observations logged yet.'}</div>`;
    return;
  }
  const sorted = items.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.id > a.id ? 1 : -1));
  list.innerHTML = sorted.map(o => {
    const cat = categoryMeta(o.category);
    return `
    <div class="obs-card" style="--cat: ${cat ? `var(--c-${cat.id})` : 'var(--text-faint)'}">
      <div class="obs-card-head">
        ${cat ? `<span class="obs-cat-badge">${cat.icon} ${cat.label}</span>` : ''}
        ${o.routine ? `<span class="obs-routine-badge">${o.routine}</span>` : ''}
        <span class="obs-date">${o.date || ''}</span>
      </div>
      <div class="txt">
        <p><span class="label">Observation</span></p>
        <p class="obs">${o.observation}</p>
        <p><span class="label">Action / Practice</span></p>
        <p class="act">${o.action}</p>
      </div>
      <button class="icon-btn" title="Delete" data-id="${o.id}">✕</button>
    </div>
  `;
  }).join('');
  list.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteObservation(btn.dataset.id));
  });
}

document.getElementById('obsSearch').addEventListener('input', e => {
  state.obsSearch = e.target.value;
  renderObservations();
});

function populateObsCategorySelect() {
  const sel = document.getElementById('obsCategorySelect');
  sel.innerHTML = CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('');
  sel.addEventListener('change', populateObsRoutineSelect);
  populateObsRoutineSelect();
}

function populateObsRoutineSelect() {
  const catId = document.getElementById('obsCategorySelect').value;
  const sel = document.getElementById('obsRoutineSelect');
  const routines = state.routines.filter(r => r.category === catId && r.active).sort((a, b) => a.focus.localeCompare(b.focus));
  sel.innerHTML = '<option value="">General</option>' + routines.map(r => `<option value="${r.focus}">${r.focus}</option>`).join('');
}

document.getElementById('obsAddToggle').addEventListener('click', () => {
  const panel = document.getElementById('obsAddPanel');
  const open = panel.style.display !== 'none';
  panel.style.display = open ? 'none' : '';
  document.getElementById('obsAddToggle').textContent = open ? '+ Add an observation' : '− Close';
});

async function addObservation() {
  const obsInput = document.getElementById('obsInput');
  const actInput = document.getElementById('actInput');
  const category = document.getElementById('obsCategorySelect').value;
  const routine = document.getElementById('obsRoutineSelect').value;
  const status = document.getElementById('obsStatus');
  const observation = obsInput.value.trim();
  const practice = actInput.value.trim();
  if (!observation || !practice) { status.textContent = 'Fill in both fields.'; return; }

  status.textContent = 'Saving...';
  const today = new Date().toISOString().slice(0, 10);
  const entry = { id: Date.now(), observation, action: practice, category, routine, date: today };

  if (connected()) {
    try {
      const saved = await apiPost('addObservation', { observation, practice, category, routine });
      state.observations.push(saved && saved.id ? saved : entry);
    } catch { status.textContent = 'Could not save to your Sheet.'; return; }
  } else {
    state.observations.push(entry);
    localSet('routineHub.observations.local', state.observations);
  }

  obsInput.value = ''; actInput.value = ''; status.textContent = 'Saved.';
  renderObsFilterChips();
  renderObservations();
  setTimeout(() => status.textContent = '', 2000);
}

async function deleteObservation(id) {
  state.observations = state.observations.filter(o => String(o.id) !== String(id));
  renderObsFilterChips();
  renderObservations();
  if (connected()) {
    try { await apiPost('deleteObservation', { id }); }
    catch { document.getElementById('obsStatus').textContent = 'Delete failed to sync to your Sheet.'; }
  } else {
    localSet('routineHub.observations.local', state.observations);
  }
}

document.getElementById('addObsBtn').addEventListener('click', addObservation);

// ---------------------------------------------------------------------
// Bi-Weekly Review — one card per active routine, grouped into a
// collapsible accordion by category.
// ---------------------------------------------------------------------
state.reviewOpenCats = new Set();

function reviewableRoutines() { return state.routines.filter(r => r.active); }

function reviewSchedule() {
  const anchor = new Date(REVIEW_ANCHOR_DATE + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(anchor);
  while (due < today) due.setDate(due.getDate() + REVIEW_INTERVAL_DAYS);
  const daysUntil = Math.round((due - today) / 86400000);
  return { due, daysUntil };
}

function renderReviewScheduleBanner() {
  const { due, daysUntil } = reviewSchedule();
  const dateLabel = due.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  let text;
  if (daysUntil === 0) text = `📅 Today's a review day — ${dateLabel}`;
  else if (daysUntil === 1) text = `📅 Next review: tomorrow, ${dateLabel}`;
  else text = `📅 Next review: ${dateLabel} — in ${daysUntil} days`;

  const el = document.getElementById('reviewScheduleBanner');
  el.textContent = text;
  el.classList.toggle('due-today', daysUntil === 0);
}

function ensureReviewAnswer(id) {
  state.reviewAnswers[id] = state.reviewAnswers[id] || { serving: '', notes: '' };
  return state.reviewAnswers[id];
}

function updateReviewProgress() {
  const all = reviewableRoutines();
  const done = all.filter(r => state.reviewAnswers[r.id] && state.reviewAnswers[r.id].serving).length;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;
  document.getElementById('reviewProgressFill').style.width = pct + '%';
  document.getElementById('reviewProgressLabel').textContent = `${done} of ${all.length} reviewed`;
}

function renderReviewForm() {
  const form = document.getElementById('reviewForm');
  form.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const items = reviewableRoutines().filter(r => r.category === cat.id);
    if (!items.length) return;
    const doneCount = items.filter(r => state.reviewAnswers[r.id] && state.reviewAnswers[r.id].serving).length;
    const open = state.reviewOpenCats.has(cat.id);

    const section = document.createElement('div');
    section.className = 'review-accordion' + (open ? ' open' : '');
    section.style.setProperty('--cat', `var(--c-${cat.id})`);
    section.innerHTML = `
      <button class="review-accordion-head">
        <span class="icon">${cat.icon}</span>
        <h4>${cat.label}</h4>
        <span class="review-accordion-count">${doneCount}/${items.length}</span>
        <span class="review-accordion-chevron">⌄</span>
      </button>
      <div class="review-accordion-body">
        ${items.map(r => reviewRoutineHTML(r)).join('')}
      </div>
    `;

    section.querySelector('.review-accordion-head').addEventListener('click', () => {
      if (state.reviewOpenCats.has(cat.id)) state.reviewOpenCats.delete(cat.id);
      else state.reviewOpenCats.add(cat.id);
      renderReviewForm();
    });

    items.forEach(r => {
      const row = section.querySelector(`[data-routine-id="${cssEscape(r.id)}"]`);
      const ans = ensureReviewAnswer(r.id);
      const buttons = row.querySelectorAll('.serving-row button');
      buttons.forEach(b => {
        if (b.dataset.val === ans.serving) b.classList.add('sel');
        b.addEventListener('click', () => {
          buttons.forEach(x => x.classList.remove('sel'));
          b.classList.add('sel');
          ans.serving = b.dataset.val;
          updateReviewProgress();
        });
      });
      row.querySelector('.review-notes-input').addEventListener('input', e => { ans.notes = e.target.value; });
    });

    form.appendChild(section);
  });

  updateReviewProgress();
}

function cssEscape(s) { return String(s).replace(/"/g, '\\"'); }

function reviewRoutineHTML(r) {
  const ans = ensureReviewAnswer(r.id);
  return `
    <div class="review-routine" data-routine-id="${r.id}">
      <div class="review-routine-top">
        <span class="review-routine-title">${r.focus}</span>
        <div class="serving-row">
          ${['Yes', 'Mixed', 'No'].map(v => `<button data-val="${v}">${v}</button>`).join('')}
        </div>
      </div>
      <p class="why-remind">Reminder — ${r.why}</p>
      <input class="review-notes-input" type="text" placeholder="Roadblocks or notes (optional)" value="${(ans.notes || '').replace(/"/g, '&quot;')}">
    </div>
  `;
}

async function loadReviews() {
  document.getElementById('reviewSetupNote').style.display = connected() ? 'none' : 'block';
  let reviews = [];
  if (connected()) {
    try { reviews = (await apiGet('reviews')) || []; }
    catch { document.getElementById('reviewStatus').textContent = 'Could not reach your Sheet.'; }
  } else {
    reviews = localGet('routineHub.reviews.local', []);
  }
  renderReviewHistory(reviews);
}

function renderReviewHistory(reviews) {
  const el = document.getElementById('reviewHistory');
  if (!reviews.length) { el.innerHTML = '<div class="empty-state">No reviews saved yet.</div>'; return; }
  const byDate = {};
  reviews.forEach(r => { (byDate[r.date] = byDate[r.date] || []).push(r); });
  el.innerHTML = Object.keys(byDate).sort().reverse().map(date => {
    const entries = byDate[date];
    const counts = { Yes: 0, Mixed: 0, No: 0 };
    entries.forEach(r => { if (counts[r.serving] !== undefined) counts[r.serving]++; });
    return `
    <div class="review-session">
      <div class="review-session-head">
        <span class="rdate">${date}</span>
        <span class="review-session-summary">${counts.Yes} yes · ${counts.Mixed} mixed · ${counts.No} no</span>
      </div>
      ${entries.map(r => `
        <div class="review-entry" style="--cat:var(--c-${slugFor(r.category)})">
          <span class="rcat">${r.routine || r.category} <span class="review-serving-tag review-serving-${(r.serving || '').toLowerCase()}">${r.serving || '—'}</span></span>
          ${r.notes ? `<p>${r.notes}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `;
  }).join('');
}

function slugFor(label) {
  const found = CATEGORIES.find(c => c.label === label);
  return found ? found.id : 'organizing';
}

async function saveReview() {
  const status = document.getElementById('reviewStatus');
  const date = new Date().toISOString().slice(0, 10);
  const rows = reviewableRoutines().map(r => {
    const ans = state.reviewAnswers[r.id] || {};
    const cat = categoryMeta(r.category);
    return { date, category: cat.label, routine: r.focus, serving: ans.serving || '', notes: ans.notes || '', why: r.why };
  }).filter(r => r.serving || r.notes);

  if (!rows.length) { status.textContent = 'Nothing to save yet — mark at least one routine.'; return; }
  status.textContent = 'Saving...';

  if (connected()) {
    try { await apiPost('addReviewBatch', { rows }); }
    catch { status.textContent = 'Could not save to your Sheet.'; return; }
  } else {
    const existing = localGet('routineHub.reviews.local', []);
    localSet('routineHub.reviews.local', existing.concat(rows));
  }

  status.textContent = `Saved ${rows.length} routine review${rows.length === 1 ? '' : 's'}.`;
  state.reviewAnswers = {};
  state.reviewOpenCats = new Set();
  renderReviewForm();
  loadReviews();
  setTimeout(() => status.textContent = '', 3000);
}

document.getElementById('saveReviewBtn').addEventListener('click', saveReview);

// ---------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------
renderWheel();
applyZoom();
routeOverview();
renderListChips();
renderList();
setMode(localGet('routineHub.mode', 'wheel'));
renderReviewForm();
renderReviewScheduleBanner();
populateObsCategorySelect();
loadObservations();
loadReviews();
loadInbox();

loadRoutines().then(() => {
  renderWheel();
  routeOverview();
  renderList();
  renderReviewForm();
  populateObsRoutineSelect();
});
