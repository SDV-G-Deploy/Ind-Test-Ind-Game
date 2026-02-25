# Changelog

All notable changes to this project will be documented in this file.

------------------------------------------------------------------------

## 0.1.0 --- MVP Baseline

### Added

-   Mobile-first HTML5 Canvas runner prototype
-   Fixed timestep game loop with pause/resume
-   Touch-first input system with keyboard fallback
-   Core mechanics:
    -   Autorun
    -   Jump / double jump with fatigue system
    -   Armor meter + slam ability
    -   HP system (3 hearts start)
-   Collectibles:
    -   Crystals (score/currency, armor contribution)
    -   Hearts (+1 HP up to max)
-   Procedural segment-based spawner (v0)
-   Basic collision system (AABB)
-   HUD with HP, armor, fatigue, crystals, distance
-   Game over screen with restart
-   Best distance saved in localStorage
-   Centralized gameplay tuning via `config/balance.json`

------------------------------------------------------------------------

## Future versions (planned)

### 0.2.0 --- Retention Hooks

-   Tutorial prompts
-   Daily Run seed mode
-   Daily missions

### 0.3.0 --- Android + Analytics

-   Capacitor wrapper
-   Analytics events integration

### 0.4.0 --- Rewarded Ads

-   Rewarded placements (continue, double reward, daily chest)
-   Frequency caps

### 0.5.0 --- Meta Progression

-   Upgrade system
-   Save persistence improvements
