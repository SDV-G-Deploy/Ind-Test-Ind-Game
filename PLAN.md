# Project Plan (Optimized)

## 1) Product goals (what we optimize for)
- **D1 retention proxy (local):** at least 35% of players start a second run in the same session.
- **Session quality:** median run length 60–120 seconds on a fresh install.
- **Game feel stability:** no "unfair death" spikes (same obstacle pattern >2 times in a row).
- **Delivery speed:** small vertical slices, each playable and reviewable independently.

## 2) Delivery principles
- One feature per PR, with clear acceptance criteria (AC).
- Keep web build playable after every merge.
- All gameplay tuning in `config/balance.json` (no hidden constants in logic).
- New systems should be introduced behind simple interfaces first (provider pattern).
- Instrument before monetization: collect events first, then add ads/meta based on real behavior.

## 3) Current baseline (already in repo)
- Core runner loop (autorun, jump/double jump, slam, HP/armor/fatigue).
- Procedural segment spawning and basic collectibles.
- Local persistence for best distance.
- HUD and restart flow.

## 4) Optimized roadmap

### M0.5 — Stabilize baseline for scaling (1–2 days)
**Why now:** future milestones (missions, ads, meta) need deterministic hooks and clean data boundaries.

1) Run state/event layer v1
- Add a minimal event emitter around key moments:
  - `run_start`, `run_end`, `player_hit`, `pickup_crystal`, `pickup_heart`, `slam_used`.
- AC:
  - Events fire exactly once per occurrence.
  - No gameplay behavior changes.

2) Deterministic RNG seam
- Replace direct `Math.random()` calls in spawning with injectable RNG function.
- AC:
  - Same seed → same segment sequence.
  - Existing non-seeded mode preserved as default.

3) Save schema v1
- Introduce one save object namespace (versioned) in localStorage.
- AC:
  - Existing best distance migrates automatically.
  - Corrupted save falls back safely without crash.

---

### M1 — Retention hooks (no ads) (3–5 days)
**Goal:** improve onboarding and replayability without monetization dependency.

1) Tutorial prompts (contextual)
- Prompts for jump, double jump, slam (shown once per profile, skippable).
- AC:
  - Triggered on relevant situations, not all at start.
  - `tutorial_complete` event emitted when all prompts are seen or skipped.

2) Daily Run mode (seeded)
- One daily seed, consistent for all players by date.
- AC:
  - Daily route is deterministic for a given date.
  - UI toggle: `Normal / Daily`.

3) Daily missions v0
- 3 generated missions/day (e.g., distance, crystals, no-slam run).
- AC:
  - Progress persists and resets daily.
  - Reward claim is idempotent (cannot claim twice).

---

### M2 — Analytics + Android packaging (4–6 days)
**Goal:** establish feedback loop from real play sessions.

1) AnalyticsProvider interface + web console adapter
- Events:
  - `first_open`, `session_start`, `session_end`,
  - `run_start`, `run_end(reason, distance, crystals)`,
  - `tutorial_complete`, `mission_claimed`.
- AC:
  - Provider can be swapped without touching gameplay logic.

2) Session metrics computation
- Track session length and runs/session locally before external SDK wiring.
- AC:
  - Session summary generated once per app close/background.

3) Capacitor Android wrapper
- Portrait, fullscreen, touch verified.
- AC:
  - APK installs and runs core gameplay loop without regressions.

---

### M3 — Rewarded ads (guardrails first) (3–4 days)
**Goal:** monetize without hurting early retention.

1) AdsProvider + web stub
- Rewarded placements:
  - Continue after death
  - Double mission reward
  - Daily chest
- AC:
  - Clear callback contract: `onCompleted`, `onClosed`, `onFailed`.

2) Frequency caps + cooldowns
- Rules:
  - No ads in first 2 minutes of session.
  - Daily max cap and per-placement cooldown.
- AC:
  - Caps stored in save and respected across app restarts.

3) Economy safety checks
- AC:
  - Reward payout is serverless-safe/idempotent in local flow (no duplicate rewards on callback race).

---

### M4 — Meta progression v1 (4–6 days)
**Goal:** create long-term progression loop.

1) Upgrade system
- Initial upgrades:
  - Armor charge speed
  - Fatigue recovery
  - Start shield
- AC:
  - Upgrade effects visible in gameplay and read from `config/balance.json`.

2) Spend/earn loop
- Crystal spend with escalating costs and clear UI feedback.
- AC:
  - Purchase transaction atomic in save data.

3) Balance pass v1
- AC:
  - Early upgrades feel impactful within first 3 sessions.

## 5) Cross-cutting backlog (parallel, small PRs)
- Collision/gameplay fairness polish (hitbox audits, invulnerability feedback).
- Performance budget: maintain stable frame pacing on mid-range mobile.
- UX polish: pause/resume affordance, better game-over CTA, lightweight haptics hooks.
- Content variation: obstacle patterns library to reduce repetition.

## 6) Suggested PR sequence (next 6 PRs)
1. `feat/save-schema-v1-and-migration`
2. `feat/event-bus-run-events`
3. `feat/seeded-rng-and-daily-mode-core`
4. `feat/tutorial-prompts-contextual`
5. `feat/daily-missions-v0`
6. `feat/analytics-provider-web-adapter`

## 7) Definition of Done (tightened)
Each PR must include:
- Playability check (start run, die, restart, no crash).
- Save/load check (reload page, progress preserved correctly).
- Short "How to verify" checklist in PR body.
- If balance changed: list edited keys in `config/balance.json`.

## 8) Risks and mitigations
- **Risk:** random generation can produce unfair spikes.
  - **Mitigation:** seeded pattern constraints and obstacle cooldown rules.
- **Risk:** retention features become messy without data contracts.
  - **Mitigation:** event layer and save schema before missions/ads.
- **Risk:** monetization harms early experience.
  - **Mitigation:** hard caps, delayed first ad, event-based monitoring.
