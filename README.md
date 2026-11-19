# Leonida Trophy Guide — Grand Theft Auto VI

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/romdhoncom/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/romdhoncom/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01).

- **Checklist** — every trophy with its official name, description and grade, saved in localStorage, with export and import.
- **Roadmap to the Platinum** — three stages built from the official descriptions, with the one missable trophy flagged (Positive Mental Attitude: do Lucia's Chapter 1 balcony meditation).
- **Cited guides** — every trophy has a guide written for this page, with its sources named beside it (mainly PowerPyx's trophy guide & roadmap, cross-checked against Exophase / PSNProfiles).
- **Filters** — by kind (story, missable, collectibles, activities, crime, exploration, money), by grade, by earned/remaining, plus search.
- **Spoiler setting** — hides the 28 hidden trophies' names and descriptions until they are earned.

## Run it

Serve `app/` with any static server and open `index.html` — it works with the network off:

```sh
cd app && python3 -m http.server 8080
```

## How it is built

`app/` is plain static files, no build step: `index.html`, `style.css`, and ES modules (`main.js`, `trophies.js`, `store.js`, `filters.js`, `views.js`) that fetch `app/data/trophies.json`. `main.ts` (Node 22) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with the vendored make.fun library.

Unofficial fan guide. Not affiliated with Rockstar Games, Sony or PlayStation. No Rockstar artwork, logos or game images are used.
