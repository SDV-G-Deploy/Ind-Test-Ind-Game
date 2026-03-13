# Improvement plan (research → priorities)

## Objectives for this iteration
- Improve readability/fairness of hazards on mobile.
- Make difficulty ramp smoother and less spiky.
- Add a short in-run reward loop to encourage replay.
- Clarify onboarding without breaking existing game loop.

## Priority matrix

## P1 (implemented now)

1. **Obstacle telegraphing (game feel + fairness)**
   - Add pre-impact visual warning for obstacles based on time-to-impact window.
   - Expected effect: fewer “cheap hits”, better response confidence.

2. **Fair reaction windows via hazard spacing (game feel + fairness)**
   - Prevent too-dense back-to-back hazard segments with minimum spacing.
   - Expected effect: lower frustration in first runs, better controllability.

3. **Smooth progression curve (pacing)**
   - Replace mostly linear speed pressure with progress-based curve + controlled acceleration.
   - Expected effect: better flow: easier onboarding phase, meaningful late-run tension.

4. **Short reward loop: crystal streak bonus (replay)**
   - 3 crystals within time window => instant bonus crystals + armor boost.
   - Expected effect: mid-run micro-goal, increased replay motivation, positive spikes.

5. **Onboarding clarity (first session UX)**
   - Improve start overlay text: start action, core controls, objective, streak hint.
   - Expected effect: faster understanding of “how to play” and “how to do better”.

## P2 (next iteration)
- Better obstacle taxonomy (low/high variants with different optimal responses).
- Distance-based spawn profiles (early/simple, mid/mixed, late/pressure).
- End-of-run summary card with “why lost + what improved”.
- Safer touch affordance feedback (button press effects + optional haptics bridge).

## P3 (later)
- Meta progression hook (unlockable passive perks, lightweight economy).
- Daily challenge modifiers tied to retention mode.
- Session-based adaptive difficulty tuning from recent deaths.

## Scope control for this pass
- No external heavy dependencies.
- Preserve existing start/run/win-lose/restart cycle.
- Keep mobile-first layout and no scroll regressions.
