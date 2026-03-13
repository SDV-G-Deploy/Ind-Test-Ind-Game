# Gameplay research — mobile-first arcade runner (quick applied)

## Context
Goal of this pass: improve **game feel**, **fairness**, **pacing**, **short-term reward loop**, and **onboarding clarity** with minimal code changes and no heavy dependencies.

## Practical best practices from runner/hypercasual patterns

1. **Readable hazard telegraphing**
   - Players on mobile need quick pre-attentive cues (shape/color/position) before danger.
   - Good runners show a short warning window (roughly sub-second to ~1.2s) before collision-critical objects.
   - Expected impact: fewer “unfair deaths”, better perceived control, stronger trust in run fairness.

2. **Reaction fairness over raw difficulty**
   - Difficulty should come from combinations/timing, not impossible spacing.
   - Avoid back-to-back lethal hazards without recovery window.
   - Expected impact: reduced early frustration and better first-session continuation.

3. **Smooth progression curve (not spikes)**
   - Better retention when speed/pressure rises smoothly with run progress.
   - Gentle early ramp + stronger late-game pressure works better than abrupt jumps.
   - Expected impact: stronger flow state, more consistent run lengths.

4. **Short reward loop during a single run**
   - Add mini-goals that can trigger in 5–20 seconds (micro-successes).
   - Reward should be immediately useful (survivability/resource), not only end-of-run score.
   - Expected impact: better replay intent and moment-to-moment engagement.

5. **Onboarding clarity in first 5 seconds**
   - Explicitly explain: how to start, core action priorities, win condition.
   - Keep instruction text minimal and in-context (pre-run overlay + HUD hints).
   - Expected impact: lower confusion, faster “first meaningful run”.

## Applicability to this project

Current project already has strong base loop (start/run/win-lose/restart, jump/double-jump/slam, armor/fatigue). Most leverage comes from low-cost tuning + presentation:

- Add obstacle telegraph in renderer (no asset pipeline changes required).
- Enforce minimum hazard spacing in spawner for fairness.
- Move to progress-based speed curve for pacing smoothness.
- Add crystal streak mini-goal with immediate bonus (armor + crystals).
- Clarify start overlay text with concise controls/goal/reward guidance.

## Risks and mitigation

- Risk: game becomes too easy.
  - Mitigation: keep current max speed and keep obstacle/gap spawn probabilities; only smooth ramp and fairness spacing.
- Risk: HUD overload.
  - Mitigation: keep one concise streak indicator and short reward event text.
- Risk: regression in restart flow.
  - Mitigation: preserve existing state reset model and add explicit reset for new fields.

---

## Iteration 1 findings (deep re-check)

1. **Core fairness bug found:** visual “gaps” were not real hazards.
   - Ground collision used a single flat `groundY` plane, independent of spawned ground segments.
   - Result: player never actually fell into pits; tutorial messaging and challenge model were inconsistent with real gameplay.

2. **Immediate retention risk:** challenge curve depended mostly on obstacle collisions.
   - Without real pits, early/mid run tension flattened.
   - Player learned less transferable timing skill because one hazard family was effectively disabled.

3. **If real gaps are re-enabled, mobile input forgiveness is mandatory.**
   - Without buffering/coyote support, edge jumps feel “ignored” on touch due to human tap timing + frame boundaries.
   - Conclusion: re-enable real gaps **together with** jump leniency to avoid frustration spike.
