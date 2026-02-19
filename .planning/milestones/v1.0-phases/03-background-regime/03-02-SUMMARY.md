---
phase: 03-background-regime
plan: 02
subsystem: ui
tags: [css, javascript, regime, tinting, glassmorphism, korean-convention, custom-event, ambient-orbs]

# Dependency graph
requires:
  - phase: 03-01
    provides: ambient-orbs.css base file, ambient-orbs.js IIFE, mp-page-orb-layer DOM layer
  - phase: 01-foundation
    provides: --regime-color-rgb CSS variable definition in custom.css

provides:
  - KR-convention (bull=red, bear=blue) orb and card tinting via window.MP_REGIME_CURRENT
  - mp:regime-ready CustomEvent for decoupled regime signal propagation
  - .regime-loaded conditional CSS tinting on .briefing-section and .mp-ticker-group

affects:
  - phase 4 (any component relying on --regime-color-rgb for visual theming)
  - post pages using window.__MP_PAGE.regime for tinting

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Regime signal via CustomEvent — decoupled broadcast avoids hex reverse-lookup polling and US→KR color flash"
    - "3-tier regime detection: __MP_PAGE (post) → MP_REGIME_CURRENT (home, sync) → mp:regime-ready (home, async)"
    - "KR_ORB_RGB / KR_TINT_RGB parallel tables — US-convention colors in mp-config.js untouched, KR convention in ambient-orbs.js only"
    - ".regime-loaded guard on CSS tinting — prevents violet flash before data loads"

key-files:
  created: []
  modified:
    - assets/css/custom/ambient-orbs.css
    - static/js/ambient-orbs.js
    - static/js/home-market-overview.js

key-decisions:
  - "KR-convention color table lives in ambient-orbs.js (not mp-config.js) — US colors stay for badge/TOC, KR colors only for orb/tinting"
  - "mp:regime-ready CustomEvent replaces polling — same render() call dispatches event, ambient-orbs.js applies KR colors atomically, no flash"
  - ".regime-loaded CSS class gate — tinting CSS only activates after JS confirms regime data is available"
  - "8-second safety timeout: if mp:regime-ready never fires (no chart data), tinting stays off — safe and silent failure"

patterns-established:
  - "Regime signal chain: home-market-overview.js render() → window.MP_REGIME_CURRENT + CustomEvent → ambient-orbs.js applyRegime()"
  - "CSS tinting guard: .regime-loaded on <html> enables ::after overlays — regime-independent pages never show tinting"
  - "Dual opacity: dark mode 0.06, light mode 0.03 via :root:not(.dark) — consistent with existing .dark class toggle pattern"

requirements-completed: [RGME-01, RGME-02]

# Metrics
duration: 3min
completed: 2026-02-19
---

# Phase 03 Plan 02: Regime Tinting Summary

**KR-convention regime tinting (bull=red, bear=blue, neutral=violet) on glass cards via CustomEvent-driven CSS class gate, with no US-convention flash**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-19T08:44:00Z
- **Completed:** 2026-02-19T08:46:40Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- `ambient-orbs.css` — Regime tinting CSS block: `.regime-loaded` conditional `::after` overlay on `.briefing-section` and `.mp-ticker-group`, dark(0.06)/light(0.03) opacity split, reduced-motion transition removal
- `home-market-overview.js` — `render()` now sets `window.MP_REGIME_CURRENT` and dispatches `mp:regime-ready` CustomEvent immediately after existing US-convention orb color injection
- `ambient-orbs.js` — `KR_ORB_RGB` + `KR_TINT_RGB` tables, `applyRegime()` setter, `detectAndApplyRegime()` with 3-tier detection strategy and 8-second safety timeout
- Hugo build verified clean: 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Add regime tinting CSS rules** — `16eb076` (feat)
2. **Task 2: Add regime signal to home-market-overview.js** — `6718bf9` (feat)
3. **Task 3: Add regime detection and KR color mapping to ambient-orbs.js** — `1cdf37c` (feat)

**Plan metadata:** (docs commit follows this summary)

## Files Created/Modified

- `assets/css/custom/ambient-orbs.css` — Added Regime Tinting section: `.regime-loaded .briefing-section::after` and `.mp-ticker-group::after` overlays with dark/light/reduced-motion branches
- `static/js/home-market-overview.js` — Added `window.MP_REGIME_CURRENT` assignment + `document.dispatchEvent(new CustomEvent('mp:regime-ready', ...))` at end of regime color block in `render()`
- `static/js/ambient-orbs.js` — Added `KR_ORB_RGB`, `KR_TINT_RGB` tables, `applyRegime()`, `detectAndApplyRegime()` functions; DOMContentLoaded-safe execution

## Decisions Made

- KR-convention color tables live exclusively in `ambient-orbs.js` — `mp-config.js` retains US-convention regime_rgb unchanged so badge/TOC theming is unaffected
- `mp:regime-ready` CustomEvent pattern replaces the original research idea of polling `--mp-orb-color-*` hex values. The polling approach was fundamentally broken because `fallbackColor.hex` is the literal string `'var(--regime-color)'`, making hex comparison impossible
- `.regime-loaded` CSS guard ensures tinting is invisible on pages without regime data (non-home, non-post pages, or fetch failures) — no violet bleed from the CSS default `--regime-color-rgb` value
- 8-second safety timeout: `applied = true` suppresses late-arriving events but does NOT remove the listener (no removeEventListener needed in the timeout path since the event already removed itself on first fire)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Hugo build clean on first attempt. The linter (Biome) reformatted both JS files to double quotes and added trailing commas — this is expected project behavior and does not affect runtime logic.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Phase 03 is now complete: ambient orb layer (Plan 01) + regime tinting (Plan 02)
- Physical OLED device validation still pending (documented in STATE.md blockers)
- Phase 04 (chart theming / ECharts) can proceed — `--regime-color-rgb` is now dynamically set per regime, available for chart color overrides if needed
- Post pages: `window.__MP_PAGE.regime` path in `detectAndApplyRegime()` is wired; requires `extend-head-uncached.html` to inject `window.__MP_PAGE = { regime: "..." }` for per-post tinting (existing infrastructure from Phase 2)

## Self-Check: PASSED

- FOUND: assets/css/custom/ambient-orbs.css (contains "regime-loaded")
- FOUND: static/js/ambient-orbs.js (contains "KR_ORB_RGB")
- FOUND: static/js/home-market-overview.js (contains "MP_REGIME_CURRENT")
- FOUND: .planning/phases/03-background-regime/03-02-SUMMARY.md
- FOUND commit 16eb076: feat(03-02): add regime tinting CSS rules
- FOUND commit 6718bf9: feat(03-02): expose regime signal in home-market-overview.js
- FOUND commit 1cdf37c: feat(03-02): add KR-convention regime detection to ambient-orbs.js

---
*Phase: 03-background-regime*
*Completed: 2026-02-19*
