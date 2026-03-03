# Execution Plan v1 (Codex-ready)

This document converts roadmap goals into a strict ticket pipeline that can be copied directly into Codex tasks.

## 0) Operating mode
- **One ticket = one PR**.
- **No hidden scope expansion**: every PR must explicitly list what is NOT included.
- **Playable build after each merge**.
- **Fallback-first approach** for all new systems (if feature fails, game still runs).

## 1) Ticket template (copy/paste)
Use this exact structure for each Codex task:

1. **Goal**
2. **In scope**
3. **Out of scope**
4. **Files to touch**
5. **Implementation steps**
6. **Acceptance criteria**
7. **Verification commands**
8. **Rollback plan**

---

## 2) Ticket backlog (T1–T12)

### T1 — Save schema v1 + migration
- Goal: replace ad-hoc localStorage keys with versioned save object.
- In scope:
  - add `src/engine/save.js`
  - save schema `{ version, stats, daily, tutorial, ads }`
  - migrate `runner.bestDistance` into `stats.bestDistance`
- Out of scope: missions/tutorial UI.
- Acceptance criteria:
  - old best distance survives migration
  - corrupted save falls back to defaults

### T2 — Save integration in world lifecycle
- Goal: remove direct storage calls from gameplay modules.
- In scope:
  - replace direct `localStorage.getItem/setItem` in world logic with save API
  - keep current game-over behavior unchanged
- Out of scope: analytics and remote sync.
- Acceptance criteria:
  - best distance reads/writes only through save layer

### T3 — Event bus foundation
- Goal: add internal event contract for gameplay hooks.
- In scope:
  - add `src/engine/events.js`
  - event types: `run_start`, `run_end`, `player_hit`, `pickup_crystal`, `pickup_heart`, `slam_used`
- Out of scope: third-party analytics.
- Acceptance criteria:
  - each event fires exactly once per occurrence

### T4 — Event emission integration
- Goal: wire event bus into gameplay runtime.
- In scope:
  - integrate bus into `main.js`, `player.js`, `world.js`
  - no gameplay tuning changes
- Out of scope: dashboards/export.
- Acceptance criteria:
  - no runtime errors when bus is present/absent

### T5 — Seeded RNG core
- Goal: deterministic generation path for daily mode.
- In scope:
  - add `src/engine/rng.js`
  - inject RNG into spawner
  - remove direct `Math.random()` usage from `spawner.js`
- Out of scope: daily UI toggle.
- Acceptance criteria:
  - same seed => same first N segments

### T6 — Daily seed derivation (core only)
- Goal: compute daily seed from date and runtime mode.
- In scope:
  - add mode state (`normal`, `daily`)
  - compute seed from UTC date for `daily`
- Out of scope: missions and tutorial prompts.
- Acceptance criteria:
  - deterministic runs in daily mode

### T7 — Asset pipeline observability
- Goal: make asset loading debuggable.
- In scope:
  - expand `assets.js` return payload with `errors[]`, counters
  - optional console summary for failed/missing resources
- Out of scope: sprite atlas system.
- Acceptance criteria:
  - missing sprite is visible in logs, game remains playable

### T8 — Renderer asset parity pass
- Goal: align manifest resources and renderer usage.
- In scope:
  - either render `groundTile` from manifest or remove key until used
  - preserve procedural fallback drawing
- Out of scope: animation system.
- Acceptance criteria:
  - no dead manifest keys without explanation

### T9 — HUD layout slots for future systems
- Goal: prepare UI structure without implementing features.
- In scope:
  - split HUD zones (core stats, mode badge, future mission slot)
- Out of scope: active missions/tutorial logic.
- Acceptance criteria:
  - current stats remain visible and readable

### T10 — Test harness (lightweight)
- Goal: add basic deterministic checks.
- In scope:
  - add minimal script(s) for RNG reproducibility and save migration checks
- Out of scope: full e2e framework.
- Acceptance criteria:
  - scripts run locally via simple commands

### T11 — Docs hardening for contributor flow
- Goal: align docs with actual architecture and PR process.
- In scope:
  - update README/CONTRIBUTING with PR checklist and verification steps
- Out of scope: product roadmap rewrite.
- Acceptance criteria:
  - contributors can follow one canonical process

### T12 — M1 readiness gate (no M1 features yet)
- Goal: formal go/no-go checklist before tutorial/missions implementation.
- In scope:
  - checklist doc confirming T1–T11 status
- Out of scope: implementing tutorial/missions.
- Acceptance criteria:
  - clear readiness decision recorded in repository

---

## 3) PR checklist (mandatory)
Every PR must include:
1. How to verify (exact commands)
2. Scope guard (what is intentionally not implemented)
3. Risk note and rollback strategy
4. Updated docs if architecture changed

## 4) Merge gate
Reject PR if any of the following is true:
- Ticket scope exceeded without explicit approval.
- Playability check not provided.
- New config constants hardcoded outside `config/balance.json` (when gameplay tuning is changed).
- No migration path for storage schema changes.
