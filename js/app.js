const state = {
  showPaused: false,          // category drill-down view
  listShowPaused: false,      // list mode
  listActiveCats: new Set(CATEGORIES.map(c => c.id)),
  zoom: 1,
  observations: [],
  reviewAnswers: {}, // categoryId -> { serving, roadblocks, why, notes }
};

const ZOOM_MIN = 0.7, ZOOM_MAX = 1.6, ZOOM_STEP = 0.1, ZOOM_BASE = 380;

const connected = () => !!APPS_SCRIPT_URL;

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
function freqSort(a, b) { return b.freq - a.freq; }

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
    const count = ROUTINES.filter(r => r.category === cat.id && r.active).length;

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

  document.getElementById('wheelCount').textContent = ROUTINES.filter(r => r.active).length;
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
  let items = ROUTINES.filter(r => r.category === cat.id);
  if (!state.showPaused) items = items.filter(r => r.active);
  items = items.slice().sort(freqSort);

  grid.innerHTML = items.map(r => `
    <div class="card${r.active ? '' : ' paused'}">
      <div class="card-top">
        <h3>${r.focus}${r.active ? '' : '<span class="paused-tag">paused</span>'}</h3>
        <span class="freq-badge">${r.frequency}</span>
      </div>
      <p class="why">${r.why}</p>
      <div class="meta">
        <span><b>What —</b> ${r.what}</span>
        ${r.object ? `<span><b>Needs —</b> ${r.object}</span>` : ''}
      </div>
    </div>
  `).join('');

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
    let items = ROUTINES.filter(r => r.category === cat.id);
    if (!state.listShowPaused) items = items.filter(r => r.active);
    if (!items.length) return;
    items = items.slice().sort(freqSort);

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
      <div class="card-grid"></div>
    `;

    const grid = section.querySelector('.card-grid');
    items.forEach(r => {
      const card = document.createElement('div');
      card.className = 'card' + (r.active ? '' : ' paused');
      card.innerHTML = `
        <div class="card-top">
          <h3>${r.focus}${r.active ? '' : '<span class="paused-tag">paused</span>'}</h3>
          <span class="freq-badge">${r.frequency}</span>
        </div>
        <p class="why">${r.why}</p>
        <div class="meta">
          <span><b>What —</b> ${r.what}</span>
          ${r.object ? `<span><b>Needs —</b> ${r.object}</span>` : ''}
        </div>
      `;
      grid.appendChild(card);
    });

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
// Observations
// ---------------------------------------------------------------------
async function loadObservations() {
  document.getElementById('obsSetupNote').style.display = connected() ? 'none' : 'block';
  if (connected()) {
    try { state.observations = (await apiGet('observations')) || []; }
    catch { state.observations = []; document.getElementById('obsStatus').textContent = 'Could not reach your Sheet — check the Web App URL.'; }
  } else {
    state.observations = localGet('routineHub.observations.local', []);
  }
  renderObservations();
}

function renderObservations() {
  const list = document.getElementById('obsList');
  if (!state.observations.length) {
    list.innerHTML = '<div class="empty-state">No observations logged yet.</div>';
    return;
  }
  list.innerHTML = '';
  state.observations.slice().reverse().forEach(o => {
    const card = document.createElement('div');
    card.className = 'obs-card';
    card.innerHTML = `
      <div class="txt">
        <p><span class="label">Observation</span></p>
        <p class="obs">${o.observation}</p>
        <p><span class="label">Action / Practice</span></p>
        <p class="act">${o.action}</p>
      </div>
      <button class="icon-btn" title="Delete">✕</button>
    `;
    card.querySelector('.icon-btn').addEventListener('click', () => deleteObservation(o.id));
    list.appendChild(card);
  });
}

async function addObservation() {
  const obsInput = document.getElementById('obsInput');
  const actInput = document.getElementById('actInput');
  const status = document.getElementById('obsStatus');
  const observation = obsInput.value.trim();
  const practice = actInput.value.trim();
  if (!observation || !practice) { status.textContent = 'Fill in both fields.'; return; }

  status.textContent = 'Saving...';
  const entry = { id: Date.now(), observation, action: practice };

  if (connected()) {
    try {
      const saved = await apiPost('addObservation', { observation, practice });
      state.observations.push(saved && saved.id ? saved : entry);
    } catch { status.textContent = 'Could not save to your Sheet.'; return; }
  } else {
    state.observations.push(entry);
    localSet('routineHub.observations.local', state.observations);
  }

  obsInput.value = ''; actInput.value = ''; status.textContent = 'Saved.';
  renderObservations();
  setTimeout(() => status.textContent = '', 2000);
}

async function deleteObservation(id) {
  state.observations = state.observations.filter(o => o.id !== id);
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
// Bi-Weekly Review
// ---------------------------------------------------------------------
function representativeWhy(catId) {
  const active = ROUTINES.filter(r => r.category === catId && r.active);
  if (!active.length) return '';
  return active[Math.floor(active.length / 2)].why;
}

function renderReviewForm() {
  const form = document.getElementById('reviewForm');
  form.innerHTML = '';
  CATEGORIES.forEach(cat => {
    state.reviewAnswers[cat.id] = state.reviewAnswers[cat.id] || { serving: '', roadblocks: '', why: representativeWhy(cat.id), notes: '' };
    const box = document.createElement('div');
    box.className = 'review-cat';
    box.style.setProperty('--cat', `var(--c-${cat.id})`);
    box.innerHTML = `
      <div class="review-cat-head"><span class="icon">${cat.icon}</span><h4>${cat.label}</h4></div>
      <p class="why-remind">Reminder — ${state.reviewAnswers[cat.id].why || 'why did this category matter to you?'}</p>
      <div class="serving-row">
        ${['Yes', 'Mixed', 'No'].map(v => `<button data-val="${v}">${v}</button>`).join('')}
      </div>
      <div class="field"><label>Roadblocks</label><textarea placeholder="What's getting in the way?">${state.reviewAnswers[cat.id].roadblocks}</textarea></div>
      <div class="field" style="margin-bottom:0"><label>Notes / adjustments</label><textarea placeholder="Anything to change going forward?">${state.reviewAnswers[cat.id].notes}</textarea></div>
    `;

    const buttons = box.querySelectorAll('.serving-row button');
    buttons.forEach(b => {
      if (b.dataset.val === state.reviewAnswers[cat.id].serving) b.classList.add('sel');
      b.addEventListener('click', () => {
        buttons.forEach(x => x.classList.remove('sel'));
        b.classList.add('sel');
        state.reviewAnswers[cat.id].serving = b.dataset.val;
      });
    });
    const textareas = box.querySelectorAll('textarea');
    textareas[0].addEventListener('input', e => state.reviewAnswers[cat.id].roadblocks = e.target.value);
    textareas[1].addEventListener('input', e => state.reviewAnswers[cat.id].notes = e.target.value);

    form.appendChild(box);
  });
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
  el.innerHTML = Object.keys(byDate).sort().reverse().map(date => `
    <div style="margin-bottom:14px">
      <div class="rdate">${date}</div>
      ${byDate[date].map(r => `
        <div class="review-entry" style="--cat:var(--c-${slugFor(r.category)})">
          <span class="rcat">${r.category} — serving me: ${r.serving || '—'}</span>
          ${r.roadblocks ? `<p><b>Roadblocks:</b> ${r.roadblocks}</p>` : ''}
          ${r.notes ? `<p><b>Notes:</b> ${r.notes}</p>` : ''}
        </div>
      `).join('')}
    </div>
  `).join('');
}

function slugFor(label) {
  const found = CATEGORIES.find(c => c.label === label);
  return found ? found.id : 'organizing';
}

async function saveReview() {
  const status = document.getElementById('reviewStatus');
  const date = new Date().toISOString().slice(0, 10);
  const rows = CATEGORIES.map(cat => ({
    date,
    category: cat.label,
    serving: state.reviewAnswers[cat.id].serving,
    roadblocks: state.reviewAnswers[cat.id].roadblocks,
    why: state.reviewAnswers[cat.id].why,
    notes: state.reviewAnswers[cat.id].notes,
  })).filter(r => r.serving || r.roadblocks || r.notes);

  if (!rows.length) { status.textContent = 'Nothing to save yet — mark at least one category.'; return; }
  status.textContent = 'Saving...';

  if (connected()) {
    try {
      for (const row of rows) await apiPost('addReview', row);
    } catch { status.textContent = 'Could not save to your Sheet.'; return; }
  } else {
    const existing = localGet('routineHub.reviews.local', []);
    localSet('routineHub.reviews.local', existing.concat(rows));
  }

  status.textContent = 'Review saved.';
  state.reviewAnswers = {};
  renderReviewForm();
  loadReviews();
  setTimeout(() => status.textContent = '', 2500);
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
loadObservations();
loadReviews();
