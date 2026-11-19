// Filtering, searching and the spoiler rule.
// A hidden trophy is only revealed when the spoiler setting is off or
// the reader has earned it; until then its name, description and guide
// stay masked, and search never matches its hidden text.

/** True when this trophy's name and description may be shown. */
export function isRevealed(trophy, state) {
  if (!trophy.hidden) return true;
  if (!state.spoiler) return true;
  return Boolean(state.earned[trophy.id]);
}

/** The kind chips offered, in display order. */
export const KIND_CHIPS = [
  'all', 'story', 'missable', 'collectibles', 'activities',
  'crime', 'exploration', 'money', 'completion', 'online',
];

/** Does a trophy belong to the selected kind chip? */
function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return Boolean(trophy.missable);
  if (kind === 'online') return false; // No online trophies: all 55 are single-player.
  if (kind === 'platinum') return trophy.grade === 'platinum';
  return trophy.kind === kind;
}

/** Does a trophy match the reader's search text? Hidden text never matches. */
function matchesSearch(trophy, state, query) {
  const text = query.trim().toLowerCase();
  if (!text) return true;
  const revealed = isRevealed(trophy, state);
  const haystack = revealed
    ? (trophy.name + ' ' + trophy.description + ' ' + trophy.guide).toLowerCase()
    : '';
  return haystack.includes(text);
}

/** Apply every active filter and return the visible trophies, in list order. */
export function applyFilters(trophies, state) {
  return trophies.filter((trophy) => {
    if (!matchesKind(trophy, state.kind)) return false;
    if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
    if (state.status === 'earned' && !state.earned[trophy.id]) return false;
    if (state.status === 'remaining' && state.earned[trophy.id]) return false;
    if (!matchesSearch(trophy, state, state.search)) return false;
    return true;
  });
}

/** Count trophies per kind chip (for the chip labels). */
export function countByKind(trophies) {
  const counts = { all: trophies.length, online: 0 };
  for (const trophy of trophies) {
    counts[trophy.kind] = (counts[trophy.kind] || 0) + 1;
    if (trophy.missable) counts.missable = (counts.missable || 0) + 1;
    if (trophy.grade === 'platinum') counts.platinum = (counts.platinum || 0) + 1;
  }
  return counts;
}
