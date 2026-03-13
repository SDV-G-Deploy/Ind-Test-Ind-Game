# Iteration log (3-cycle improvement pass)

## Iteration 1
- **Hypothesis:** Core fairness is broken because pits are not physically real; restoring them plus touch-leniency will make challenge meaningful without feeling unfair.
- **Change:**
  - Ground collision switched from flat plane to spawned ground segments.
  - Gap segments now create real pits with tunable width/entry pads.
  - Added jump buffer + coyote time for mobile-friendly jump timing.
  - Added fall-death condition when player drops below visible area.
- **Expected effect:** More authentic hazard loop, better perceived control, stronger engagement from real risk/reward routing.

## Iteration 2
- **Hypothesis:** After activating real pits, runs need a clearer danger→recovery cadence; controlled breathers will reduce frustration without flattening difficulty.
- **Change:**
  - Added spawn phase profiles (early/mid/late) that modulate hazard rates and gap width pressure.
  - Added recovery segment cooldown after hazards to prevent harsh back-to-back chains.
  - Added guided crystal lines over/after gaps to teach safer movement trajectories.
- **Expected effect:** More readable rhythm, fewer spike deaths, and stronger skill-learning loop per run.

## Iteration 3
- **Hypothesis:** A one-time in-run continuation (paid by crystals) will reduce premature churn after unlucky deaths while preserving stakes.
- **Change:**
  - Added `Second Wind` revive system for lethal obstacle/fall outcomes.
  - Revive spends crystals once per run, restores survivability, grants short invulnerability, and recovers from fall position.
  - Exposed live `Second Wind` state in HUD (`ready / used / progress`).
- **Expected effect:** Higher run continuation and better short-session retention without removing challenge identity.
