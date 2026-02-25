# Sky Rat Runner (HTML5 Canvas MVP)

Mobile-first HTML5 Canvas runner prototype (no build tools, no external libs).  
Core loop: autorun + jump / double-jump (fatigue) + armor meter + slam + HP, crystals & hearts, results screen.

## Quick start

### Option A: Live Server (recommended)
1) Open the repo folder in VS Code  
2) Install “Live Server” extension  
3) Right-click `index.html` → **Open with Live Server**

### Option B: Python static server
```bash
python3 -m http.server 4173

Open http://localhost:4173/

Note: file:// may work, but some browsers restrict module imports. Use a local server for best results.

Controls
Mobile (touch-first)

JUMP: tap right half of the canvas OR on-screen JUMP button

SLAM: tap left half of the canvas OR on-screen SLAM button (works in-air when available)

Desktop (keyboard)

Space: jump / double-jump

(Optional) additional debug keys may be added later

Gameplay (MVP rules)

Autorun: the world scrolls continuously

Jump / Double Jump: second jump in-air increases fatigue

Fatigue: limits repeated double-jumps; recovers over time (faster on ground)

Armor: fills up during the run; at full allows SLAM

SLAM: strong downward attack window to break obstacles / gain advantage (implementation may evolve)

HP: start with 3 hearts. Hits reduce HP (armor may absorb first). 0 HP = game over

Collectibles:

Crystals: increase currency/score and may contribute to armor

Hearts: restore +1 HP up to max

Project structure

index.html — canvas shell and minimal UI

config/balance.json — single source of truth for tunable parameters

src/main.js — bootstraps, loads balance, starts loop

src/engine/

loop.js — fixed timestep loop + pause/resume

input.js — touch + keyboard buffered input

renderer.js — DPR scaling + sprite/fallback drawing

src/game/

player.js — player physics & core abilities (jump, fatigue, armor, slam, HP)

world.js — world state, scrolling, distance, entity updates

spawner.js — segment-based procedural spawning (v0)

collision.js — AABB collision helpers/rules

src/ui/hud.js — HUD rendering and run/game-over overlay

assets/ — sprites (optional, can fallback to primitives)

Balancing

All gameplay tuning must go through config/balance.json.
Do not hardcode values deep inside game logic.

Recommended workflow:

Change values in balance.json

Reload the page

Play 5–10 runs and observe average survival time and “fun factor”

Definition of Done (for new tasks)

Every PR / change must:

keep the web build playable

keep the repo structure (no “everything in one file”)

include a short “How to verify” checklist in the PR description

Roadmap

M0: Freeze baseline (docs + templates)

M1: Tutorial prompts + Daily run seed + Missions

M2: Android wrapper + analytics

M3: Rewarded ads placements + caps

M4: Upgrades/meta progression


---

## 4) Готовый CHANGELOG.md

```md
# Changelog

## 0.1.0 — MVP baseline
- Mobile-first HTML5 Canvas runner prototype
- Fixed timestep loop with pause/resume
- Touch + keyboard buffered input
- Core mechanics: autorun, jump/double-jump (fatigue), armor meter, slam, HP, crystals/hearts
- Procedural segment spawner v0
- HUD + results screen, best distance saved in localStorage
- Balance centralized in config/balance.json
