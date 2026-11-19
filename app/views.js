// Rendering: the progress header, the kind chips, the checklist cards
// with their guides, and the roadmap. All text from the data file is
// escaped before it is put into the page.

import { KIND_LABELS, ROADMAP_STAGES, GRADE_ORDER } from './trophies.js';
import { isRevealed, KIND_CHIPS, countByKind } from './filters.js';
import { earnedCount } from './store.js';

/** Escape text for safe insertion into HTML. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function gradeTag(trophy) {
  return '<span class="tag grade-' + esc(trophy.grade) + '">' + esc(trophy.grade) + '</span>';
}

function kindTag(trophy) {
  const label = KIND_LABELS[trophy.kind] || trophy.kind;
  return '<span class="tag">' + esc(label) + '</span>';
}

function flagTags(trophy) {
  let tags = '';
  if (trophy.missable) tags += '<span class="tag missable">Missable</span>';
  if (trophy.hidden) tags += '<span class="tag hidden-flag">Hidden</span>';
  return tags;
}

/** The header progress bar and grade counts. */
export function renderProgress(trophies, state, els) {
  const earned = earnedCount(state);
  const total = trophies.length;
  const pct = total === 0 ? 0 : Math.round((earned / total) * 100);
  els.count.textContent = earned + ' / ' + total;
  els.pct.textContent = pct + '%';
  els.fill.style.width = pct + '%';
  els.bar.setAttribute('aria-valuenow', String(earned));
  const byGrade = {};
  for (const trophy of trophies) {
    const key = trophy.grade;
    byGrade[key] = byGrade[key] || { total: 0, earned: 0 };
    byGrade[key].total += 1;
    if (state.earned[trophy.id]) byGrade[key].earned += 1;
  }
  els.grades.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((grade) => {
      const row = byGrade[grade] || { total: 0, earned: 0 };
      return row.earned + '/' + row.total + ' ' + grade;
    })
    .join(' · ');
}

/** The kind filter chips, with counts. */
export function renderKindChips(trophies, state, container, onPick) {
  const counts = countByKind(trophies);
  container.innerHTML = KIND_CHIPS.map((kind) => {
    const pressed = state.kind === kind ? 'true' : 'false';
    const count = counts[kind] || 0;
    return '<button type="button" class="chip" data-kind="' + esc(kind) + '" aria-pressed="' + pressed + '">'
      + esc(KIND_LABELS[kind] || kind) + ' <span class="count">' + count + '</span></button>';
  }).join('');
  container.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => onPick(chip.getAttribute('data-kind')));
  });
}

function detailHtml(trophy, state) {
  if (!isRevealed(trophy, state)) {
    return '<div class="trophy-detail"><h3>Guide</h3>'
      + '<p class="masked">Hidden on PlayStation until earned. Turn off “Hide story spoilers” or mark this trophy earned to reveal its guide.</p></div>';
  }
  const meta = [];
  if (trophy.hidden) meta.push('Hidden trophy');
  meta.push('Roadmap stage ' + trophy.stage);
  const sources = (trophy.sources || []).map((source) =>
    '<li><span class="src-label">Source: </span><a href="' + esc(source.url) + '" target="_blank" rel="noopener">' + esc(source.name) + '</a></li>'
  ).join('');
  return '<div class="trophy-detail"><h3>How to earn it</h3>'
    + '<p>' + esc(trophy.guide) + '</p>'
    + '<p class="trophy-meta">' + esc(meta.join(' · ')) + '</p>'
    + '<ul class="trophy-sources">' + sources + '</ul></div>';
}

function cardHtml(trophy, state, expanded) {
  const earned = Boolean(state.earned[trophy.id]);
  const revealed = isRevealed(trophy, state);
  const name = revealed ? trophy.name : 'Hidden trophy';
  const desc = revealed ? trophy.description : 'Hidden on PlayStation until earned.';
  const checked = earned ? ' checked' : '';
  const open = expanded ? 'true' : 'false';
  return '<li class="trophy-card' + (earned ? ' earned' : '') + '" data-id="' + esc(trophy.id) + '">'
    + '<div class="trophy-head" role="button" tabindex="0" aria-expanded="' + open + '">'
    + '<input type="checkbox" data-earned-toggle aria-label="Mark ' + esc(name) + ' earned"' + checked + '>'
    + '<div class="trophy-main">'
    + '<h2 class="trophy-name">' + esc(name) + '</h2>'
    + '<p class="trophy-desc' + (revealed ? '' : ' masked') + '">' + esc(desc) + '</p>'
    + '<div class="trophy-tags">' + gradeTag(trophy) + kindTag(trophy) + flagTags(trophy) + '</div>'
    + '</div>'
    + '<button type="button" class="trophy-toggle" data-detail-toggle aria-label="Show guide">'
    + (expanded ? '▾' : '▸') + '</button>'
    + '</div>'
    + (expanded ? detailHtml(trophy, state) : '')
    + '</li>';
}

/** The checklist, in the data file's order. */
export function renderList(trophies, visible, state, listEl, summaryEl, emptyEl, expandedId) {
  const shown = visible.length;
  const earned = visible.filter((trophy) => state.earned[trophy.id]).length;
  summaryEl.textContent = shown === trophies.length
    ? 'Showing all ' + shown + ' trophies (' + earned + ' earned).'
    : 'Showing ' + shown + ' of ' + trophies.length + ' trophies (' + earned + ' earned).';
  emptyEl.hidden = shown !== 0;
  listEl.innerHTML = visible.map((trophy) => cardHtml(trophy, state, expandedId === trophy.id)).join('');
}

/** The roadmap: the missable warning and the three stages. */
export function renderRoadmap(trophies, state, calloutEl, stagesEl) {
  const missable = trophies.find((trophy) => trophy.missable);
  calloutEl.innerHTML = '<h2>⚠ The one missable trophy</h2>'
    + '<p><strong>' + esc(missable ? missable.name : 'Positive Mental Attitude') + '</strong> — meditate at every spot across Leonida. '
    + 'In Chapter 1, after the mission “Down to Earth”, talk to Lucia in the kitchen in the morning and accept her invitation to meditate on the balcony. '
    + 'That session may be required and it is gone after Chapter 1. Everything else can be finished in free-roam after the story. '
    + 'Source: PowerPyx trophy guide &amp; roadmap.</p>';
  const sorted = [...trophies].sort((a, b) => (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || a.name.localeCompare(b.name));
  stagesEl.innerHTML = ROADMAP_STAGES.map((stage) => {
    const members = sorted.filter((trophy) => trophy.stage === stage.stage);
    const chips = members.map((trophy) => {
      const done = state.earned[trophy.id] ? ' done' : '';
      const flag = trophy.missable ? ' missable-flag' : '';
      const label = isRevealed(trophy, state) ? trophy.name : 'Hidden trophy';
      return '<li class="' + done.trim() + flag.trim() + '">' + esc(label) + '</li>';
    }).join('');
    return '<li class="stage"><h3>' + esc(stage.title) + ' <span class="stage-hours">' + esc(stage.hours) + '</span></h3>'
      + '<p>' + esc(stage.blurb) + '</p>'
      + '<ul class="stage-trophies">' + chips + '</ul></li>';
  }).join('');
}
