// Tracker state: what the reader has earned, plus their settings.
// Everything lives in localStorage under one key, so progress survives
// a reload and never leaves the browser. Export and import move the
// same JSON file in and out.

const STORAGE_KEY = 'leonida-trophy-guide-v1';

/** The fresh state for a first-time reader. */
export function freshState() {
  return {
    earned: {},
    spoiler: true,
    kind: 'all',
    grade: 'all',
    status: 'all',
    search: '',
    view: 'checklist',
  };
}

/** Read saved state, falling back to fresh state on bad or missing data. */
export function loadState() {
  const state = freshState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return state;
    const saved = JSON.parse(raw);
    if (saved && typeof saved === 'object') {
      if (saved.earned && typeof saved.earned === 'object') state.earned = saved.earned;
      if (typeof saved.spoiler === 'boolean') state.spoiler = saved.spoiler;
      if (typeof saved.kind === 'string') state.kind = saved.kind;
      if (typeof saved.grade === 'string') state.grade = saved.grade;
      if (typeof saved.status === 'string') state.status = saved.status;
      if (typeof saved.view === 'string') state.view = saved.view;
    }
  } catch (error) {
    // A corrupt save is ignored; the reader starts fresh.
  }
  return state;
}

/** Persist state. Silently ignored when storage is unavailable. */
export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      earned: state.earned,
      spoiler: state.spoiler,
      kind: state.kind,
      grade: state.grade,
      status: state.status,
      view: state.view,
    }));
  } catch (error) {
    // Private mode or a full store: the page still works for the session.
  }
}

/** How many trophies are marked earned. */
export function earnedCount(state) {
  return Object.values(state.earned).filter(Boolean).length;
}

/** Mark a trophy earned or not, and persist. */
export function setEarned(state, trophyId, earned) {
  if (earned) state.earned[trophyId] = true;
  else delete state.earned[trophyId];
  saveState(state);
}

/** Download the reader's progress as a JSON file. */
export function exportProgress(state) {
  const payload = {
    app: 'leonida-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: Object.keys(state.earned).filter((id) => state.earned[id]),
    spoiler: state.spoiler,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gta6-trophy-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return payload.earned.length;
}

/** Read an exported progress file and apply it. Returns {earned, skipped}. */
export async function importProgress(file, knownIds) {
  const text = await file.text();
  const data = JSON.parse(text);
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) throw new Error('That file does not hold a list of earned trophies.');
  const earned = {};
  let skipped = 0;
  for (const id of ids) {
    if (typeof id === 'string' && knownIds.has(id)) earned[id] = true;
    else skipped += 1;
  }
  return { earned, skipped };
}
