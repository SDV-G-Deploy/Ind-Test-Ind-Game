# Assets

This folder contains non-code game resources.

## Structure
- `sprites/` — PNG sprites used by renderer (kept optional; fallback shapes still render).
- `meta/manifest.json` — declarative map of sprite IDs to file paths.

## Notes
- Runtime loading is handled in `src/engine/assets.js`.
- Missing images must not break gameplay; renderer falls back to procedural primitives.
