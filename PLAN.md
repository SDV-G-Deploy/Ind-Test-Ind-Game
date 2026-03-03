# Project Plan

## Principles
- Small PRs only (1 feature per PR).
- Keep web build playable at all times.
- All tuning via config/balance.json.

## Milestones

### M0 — Freeze baseline
Done:
- Docs, templates

### M1 — Retention hooks (no ads)
1) Tutorial prompts
   - AC: 3 prompts (jump, double jump, slam), shown once, stored in localStorage
2) Daily run seed mode
   - AC: daily route is consistent for same date, UI shows mode switch
3) Daily missions v0
   - AC: 3 missions/day, progress + rewards saved, resets daily

### M2 — Android wrapper + analytics
1) Capacitor wrapper (Android)
   - AC: APK runs, touch works, portrait, fullscreen
2) AnalyticsProvider
   - AC: events: first_open, tutorial_complete, run_start, run_end(reason), session_length

### M3 — Rewarded ads + caps
1) AdsProvider interface + web stub
   - AC: stub returns onComplete/cancel
2) Rewarded placements: continue, double_reward, daily_chest
3) Frequency caps: no ads first 2 min, daily cap

### M4 — Meta progression
1) Upgrade system v1: armor charge, fatigue recovery, start shield
   - AC: upgrade effects visible, saved, configured in balance.json
