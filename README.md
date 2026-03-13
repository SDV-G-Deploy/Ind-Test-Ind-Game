# Sky Rat Runner (HTML5 Canvas MVP)

Mobile-first HTML5 Canvas runner prototype (no build tools, no external
libs).\
Core loop: autorun + jump / double-jump (fatigue) + armor meter + slam +
HP, crystals & hearts, results screen.

------------------------------------------------------------------------

## Quick start

### Option A: Live Server (recommended)

1.  Open the repo folder in VS Code\
2.  Install the **Live Server** extension\
3.  Right-click `index.html` → **Open with Live Server**

### Option B: Python static server

``` bash
python3 -m http.server 4173
```

Open in browser:

http://localhost:4173/

> Note: `file://` may work, but some browsers restrict ES module
> imports.\
> Use a local server for best results.

------------------------------------------------------------------------

## Controls

### Mobile (touch-first)

-   **JUMP**: tap right half of the canvas OR on-screen **JUMP** button
-   **SLAM**: tap left half of the canvas OR on-screen **SLAM** button
    (works in-air when available)

### Desktop (keyboard)

-   **Space**: jump / double-jump\
-   (Optional) additional debug keys may be added later

------------------------------------------------------------------------

## Gameplay (MVP rules)

-   **Start**: press **JUMP** / **Space** to start a run
-   **Autorun**: the world scrolls continuously
-   **Jump / Double Jump**: second jump in-air increases fatigue
-   **Fatigue**: limits repeated double-jumps; recovers over time
    (faster on ground)
-   **Armor**: fills up during the run; at full allows SLAM
-   **SLAM**: strong downward attack window to break obstacles / gain
    advantage
-   **HP**: start with 3 hearts. Hits reduce HP (armor may absorb
    first). 0 HP = game over
-   **Victory condition**: reach target distance (default 250m)

### Collectibles

-   **Crystals**: increase score/currency and may contribute to armor
-   **Hearts**: restore +1 HP up to max

------------------------------------------------------------------------

## Project structure

-   `index.html` --- canvas shell and minimal UI
-   `config/balance.json` --- single source of truth for tunable
    parameters
-   `src/main.js` --- bootstraps, loads balance, starts loop
-   `src/engine/`
    -   `loop.js` --- fixed timestep loop + pause/resume
    -   `input.js` --- touch + keyboard buffered input
    -   `renderer.js` --- DPR scaling + sprite/fallback drawing
-   `src/game/`
    -   `player.js` --- player physics & core abilities
    -   `world.js` --- world state, scrolling, distance
    -   `spawner.js` --- segment-based procedural spawning (v0)
    -   `collision.js` --- AABB collision helpers
-   `src/ui/hud.js` --- HUD rendering and run/game-over overlay
-   `assets/` --- sprites (optional, fallback supported)

------------------------------------------------------------------------

## Balancing

All gameplay tuning must go through `config/balance.json`.\
Do not hardcode values deep inside game logic.

### Recommended workflow:

1.  Change values in `config/balance.json`
2.  Reload the page
3.  Play 5--10 runs
4.  Observe average survival time and overall feel

------------------------------------------------------------------------

## Definition of Done (for new tasks)

Every PR / change must: - Keep the web build playable - Respect the
project structure (no "everything in one file") - Include a short **How
to verify** checklist in the PR description

------------------------------------------------------------------------


## Development execution
- Strategic roadmap: `PLAN.md`
- Step-by-step Codex delivery plan: `EXECUTION_PLAN.md`
- Contribution/PR process: `CONTRIBUTING.md`

------------------------------------------------------------------------

## Roadmap

-   **M0** --- Freeze baseline (docs + templates)
-   **M1** --- Tutorial prompts + Daily run seed + Missions
-   **M2** --- Android wrapper + analytics
-   **M3** --- Rewarded ads placements + caps
-   **M4** --- Upgrades / meta progression
