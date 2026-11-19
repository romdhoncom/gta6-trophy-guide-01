// Trophy data: loading the official list and looking trophies up by id.
// The list itself (names, descriptions, grades) is the official PlayStation
// list as Exophase and PSNProfiles published it; the guides beside each
// trophy are this guide's own words.

const DATA_URL = 'data/trophies.json';

/** Load the 55 trophies. Throws when the file cannot be read or parsed. */
export async function loadTrophies() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error('Could not load ' + DATA_URL + ' (' + response.status + ')');
  const data = await response.json();
  const list = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(list) || list.length === 0) throw new Error('No trophies in ' + DATA_URL);
  return list;
}

/** Index trophies by id for fast lookups. */
export function indexById(trophies) {
  const byId = new Map();
  for (const trophy of trophies) byId.set(trophy.id, trophy);
  return byId;
}

/** Grade order for sorting: platinum first, then gold, silver, bronze. */
export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

/** Human labels for the kind filter chips. */
export const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  crime: 'Crime',
  exploration: 'Exploration',
  money: 'Money',
  completion: '100% completion',
  platinum: 'Platinum',
  online: 'Online',
};

/** The three roadmap stages, built from the official descriptions. */
export const ROADMAP_STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story',
    hours: 'about 60–80 hours',
    blurb: 'Finish the 5 chapters and the side-character questlines as they open. Scan vehicles and animals as you go, and do the one missable meditation in Chapter 1.',
  },
  {
    stage: 2,
    title: 'Stage 2 — 100% completion checklist',
    hours: 'about 100 hours',
    blurb: 'After the story, the checklist opens under Progress > Stats > 100% Completion. It is roughly 60% of true completion: most side quests are not needed and you need 70 of the 80 challenges.',
  },
  {
    stage: 3,
    title: 'Stage 3 — Strangers & Freaks and cleanup',
    hours: 'about 10 hours',
    blurb: 'Finish the 8 Strangers & Freaks strands and mop up the one-off trophies: partner robberies, Combat Focus, the easter eggs and the money trophies. The platinum pops when the last one does.',
  },
];
