# Contributing

## Rules
- No build tools, no external libraries, no CDN dependencies.
- Keep the game playable after every change.
- Follow the existing folder structure (engine/game/ui separation).
- All tuning must go through `config/balance.json`.
- Avoid unrelated refactors.

## Before opening a PR
- [ ] Start local server and open `index.html`
- [ ] Verify touch input (or emulation): Jump and Slam
- [ ] Run 1 full run until game over
- [ ] Check console for errors

## PR description must include
- Summary
- Modified files list
- How to verify checklist

## Codex execution flow
- Use `EXECUTION_PLAN.md` as the operational source of truth for ticket sequencing (`T1...T12`).
- Keep PRs atomic: one ticket per PR.
- Explicitly list **Out of scope** in each PR to avoid hidden feature creep.
- Include exact verification commands in PR body.
