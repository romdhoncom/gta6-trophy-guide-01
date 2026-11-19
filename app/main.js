// Entry point: load the trophy list, restore the reader's progress,
// and wire the controls. Everything runs offline from this app's own files.

import { loadTrophies, indexById } from './trophies.js';
import { loadState, saveState, setEarned, exportProgress, importProgress, freshState } from './store.js';
import { applyFilters } from './filters.js';
import { renderProgress, renderKindChips, renderList, renderRoadmap } from './views.js';

const els = {
  count: document.getElementById('progress-count'),
  pct: document.getElementById('progress-pct'),
  fill: document.getElementById('progress-fill'),
  bar: document.getElementById('progress-bar'),
  grades: document.getElementById('progress-grades'),
  search: document.getElementById('search'),
  gradeFilter: document.getElementById('grade-filter'),
  statusFilter: document.getElementById('status-filter'),
  kindChips: document.getElementById('kind-chips'),
  spoilerToggle: document.getElementById('spoiler-toggle'),
  exportBtn: document.getElementById('export-btn'),
  importBtn: document.getElementById('import-btn'),
  importFile: document.getElementById('import-file'),
  resetBtn: document.getElementById('reset-btn'),
  importNote: document.getElementById('import-note'),
  tabChecklist: document.getElementById('tab-checklist'),
  tabRoadmap: document.getElementById('tab-roadmap'),
  roadmap: document.getElementById('roadmap'),
  checklist: document.getElementById('checklist'),
  missableCallout: document.getElementById('missable-callout'),
  stages: document.getElementById('stages'),
  summary: document.getElementById('list-summary'),
  list: document.getElementById('trophy-list'),
  empty: document.getElementById('empty-state'),
};

const state = loadState();
let trophies = [];
let byId = new Map();
let expandedId = null;

function rerender() {
  saveState(state);
  const visible = applyFilters(trophies, state);
  renderProgress(trophies, state, els);
  renderKindChips(trophies, state, els.kindChips, (kind) => {
    state.kind = kind;
    rerender();
  });
  renderList(trophies, visible, state, els.list, els.summary, els.empty, expandedId);
  renderRoadmap(trophies, state, els.missableCallout, els.stages);
  showView(state.view);
}

function showView(view) {
  state.view = view;
  const roadmap = view === 'roadmap';
  els.roadmap.hidden = !roadmap;
  els.checklist.hidden = roadmap;
  els.tabRoadmap.classList.toggle('active', roadmap);
  els.tabChecklist.classList.toggle('active', !roadmap);
  els.tabRoadmap.setAttribute('aria-selected', String(roadmap));
  els.tabChecklist.setAttribute('aria-selected', String(!roadmap));
}

function setNote(text, isError) {
  els.importNote.textContent = text;
  els.importNote.classList.toggle('error', Boolean(isError));
}

async function init() {
  try {
    trophies = await loadTrophies();
  } catch (error) {
    els.summary.textContent = 'Could not load the trophy list. ' + error.message;
    return;
  }
  byId = indexById(trophies);

  els.search.value = state.search;
  els.gradeFilter.value = state.grade;
  els.statusFilter.value = state.status;
  els.spoilerToggle.checked = state.spoiler;

  els.search.addEventListener('input', () => { state.search = els.search.value; rerender(); });
  els.gradeFilter.addEventListener('change', () => { state.grade = els.gradeFilter.value; rerender(); });
  els.statusFilter.addEventListener('change', () => { state.status = els.statusFilter.value; rerender(); });
  els.spoilerToggle.addEventListener('change', () => { state.spoiler = els.spoilerToggle.checked; rerender(); });

  els.tabChecklist.addEventListener('click', () => { showView('checklist'); saveState(state); });
  els.tabRoadmap.addEventListener('click', () => { showView('roadmap'); saveState(state); });

  els.list.addEventListener('click', (event) => {
    const card = event.target.closest('.trophy-card');
    if (!card) return;
    const id = card.getAttribute('data-id');
    const trophy = byId.get(id);
    if (!trophy) return;
    if (event.target.matches('[data-earned-toggle]')) {
      setEarned(state, id, event.target.checked);
      rerender();
      return;
    }
    if (event.target.closest('[data-detail-toggle]') || event.target.closest('.trophy-head')) {
      expandedId = expandedId === id ? null : id;
      rerender();
    }
  });
  els.list.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const head = event.target.closest('.trophy-head');
    if (!head) return;
    event.preventDefault();
    const card = head.closest('.trophy-card');
    const id = card.getAttribute('data-id');
    expandedId = expandedId === id ? null : id;
    rerender();
  });

  els.exportBtn.addEventListener('click', () => {
    const count = exportProgress(state);
    setNote('Exported ' + count + ' earned trophies to gta6-trophy-progress.json.', false);
  });
  els.importBtn.addEventListener('click', () => els.importFile.click());
  els.importFile.addEventListener('change', async () => {
    const file = els.importFile.files[0];
    els.importFile.value = '';
    if (!file) return;
    try {
      const result = await importProgress(file, new Set(trophies.map((trophy) => trophy.id)));
      state.earned = result.earned;
      rerender();
      setNote('Imported ' + Object.keys(result.earned).length + ' earned trophies'
        + (result.skipped ? ' (' + result.skipped + ' unknown entries skipped)' : '') + '.', false);
    } catch (error) {
      setNote('Import failed: ' + error.message, true);
    }
  });
  els.resetBtn.addEventListener('click', () => {
    const fresh = freshState();
    state.earned = fresh.earned;
    expandedId = null;
    rerender();
    setNote('Progress reset.', false);
  });

  rerender();
}

init();
