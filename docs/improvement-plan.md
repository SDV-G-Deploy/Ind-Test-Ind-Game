# Improvement plan (research → priorities)

## Objectives for this 3-iteration pass
- Restore true hazard integrity (gaps must be real gameplay, not just visuals).
- Keep controls mobile-forgiving after hazard realism increases.
- Re-smooth pacing after systemic changes to avoid unfair spikes.
- Add retention-focused survivability so more runs continue instead of hard-ending.

## Iterative backlog (rolling)

### Iteration 1 — Hazard integrity + input forgiveness
- [x] Make ground segments authoritative for collision.
- [x] Turn pit gaps into real fall hazards (with configurable width/layout).
- [x] Add jump buffer + coyote time to absorb touch timing variance.
- [x] Add fall-death handling and smoke check.

### Iteration 2 — Post-change pacing rebalance
- [x] Re-evaluate run rhythm after real gaps are active.
- [x] Add hazard sequencing cadence via recovery segments (breather logic).
- [x] Add profile-based pacing (early/mid/late behavior multipliers).
- [x] Add guided crystal lines over/after gaps.
- [x] Smoke check start/run/lose/restart after rebalance.

### Iteration 3 — Retention/continuation priority
- [x] Add one-time second-chance revive economy (Second Wind).
- [x] Surface continuation status clearly in HUD.
- [x] Re-check gameplay loop remains readable without layout regressions.
- [x] Final smoke and deployment readiness check for Pages pull.

## Guardrails
- No heavy dependencies.
- Keep start/run/win-lose/restart intact.
- Keep mobile-first layout and avoid scroll/cut regressions.
