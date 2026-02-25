# Release & Versioning Workflow (SemVer)

Project uses **Semantic Versioning (SemVer)**:

MAJOR.MINOR.PATCH

Example: 0.1.0

------------------------------------------------------------------------

## Version Meaning

-   **MAJOR** → breaking changes
-   **MINOR** → new features, backward compatible
-   **PATCH** → bug fixes, small tweaks

------------------------------------------------------------------------

## Current Version

0.1.0 --- MVP Baseline

------------------------------------------------------------------------

## When to bump version

### Patch (0.1.X)

-   Small bug fixes
-   Balance tweaks
-   Minor UI polish

### Minor (0.X.0)

-   New features (tutorial, daily mode, missions)
-   New systems (analytics, ads integration)
-   Meta progression

### Major (X.0.0)

-   Large architecture changes
-   Core gameplay redesign
-   Migration from HTML MVP to full engine rewrite

------------------------------------------------------------------------

## How to Create a Release (GitHub)

### 1. Update CHANGELOG.md

Add a new section at the top:

## 0.2.0 --- Short description

### Added

-   ...

### Changed

-   ...

### Fixed

-   ...

------------------------------------------------------------------------

### 2. Commit changes

git add . git commit -m "Release 0.2.0" git push

------------------------------------------------------------------------

### 3. Create Git Tag

git tag v0.2.0 git push origin v0.2.0

------------------------------------------------------------------------

### 4. Create GitHub Release

1.  Go to repository → Releases → "Draft a new release"
2.  Select tag v0.2.0
3.  Title: v0.2.0
4.  Copy summary from CHANGELOG
5.  Publish

------------------------------------------------------------------------

## Suggested Milestone Versions

0.1.0 --- MVP Baseline\
0.2.0 --- Retention Hooks\
0.3.0 --- Android + Analytics\
0.4.0 --- Rewarded Ads\
0.5.0 --- Meta Progression

------------------------------------------------------------------------

## Production Note

Before paid traffic: - Ensure D1 retention \> 30% - Ensure no critical
runtime errors - Lock balance.json for that release
