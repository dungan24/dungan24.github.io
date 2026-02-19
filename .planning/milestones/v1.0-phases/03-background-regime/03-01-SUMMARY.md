---
phase: 03-background-regime
plan: 01
subsystem: ui
tags: [css, animation, glassmorphism, backdrop-filter, orb, ambient, performance]

# Dependency graph
requires:
  - phase: 02-icons-navigation
    provides: extend-head-uncached.html CSS loader infrastructure, extend-footer.html JS loader infrastructure
  - phase: 01-foundation
    provides: --mp-orb-color-primary/secondary CSS vars in custom.css, .dark class toggle pattern

provides:
  - position:fixed ambient orb layer (mp-page-orb-layer) on all pages
  - backdrop-filter blur target for glass card system
  - dark/light/mobile/reduced-motion responsive orb behavior

affects:
  - 03-02 (regime tinting — will drive --mp-orb-color-* variable values)
  - phase 4 (any visual component relying on glass depth effect)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Orb layer = position:fixed z-index:0, content = z-index:1+ — stacking convention for page-level decorative layers"
    - "prefers-reduced-motion: CSS @media handles initial render, JS addEventListener handles runtime OS changes"
    - "IIFE pattern for standalone DOM-insertion scripts (no module system dependency)"

key-files:
  created:
    - assets/css/custom/ambient-orbs.css
    - static/js/ambient-orbs.js
  modified:
    - layouts/partials/extend-head-uncached.html
    - layouts/partials/extend-footer.html

key-decisions:
  - "Orb layer inserted as body.firstChild via JS — ensures z-index:0 is behind all content without touching body styles"
  - "Script registered after mp-config.js in extend-footer.html — future orb scripts may read MP_CONFIG for regime colors"
  - "ambient-orbs.js does NOT skip home page — home has existing .mp-ambient-orb (position:absolute inside shell), new orbs are position:fixed at viewport level — different roles, no conflict"
  - "motion-reduced class added via JS as future-proofing — current CSS @media covers the need, but class enables targeted JS control later"

patterns-established:
  - "Page-level decorative layer: position:fixed, z-index:0, pointer-events:none, overflow:hidden, aria-hidden=true"
  - "Light mode opacity reduction via :root:not(.dark) — NOT @media prefers-color-scheme"
  - "Mobile GPU budget: blur(100px) → blur(60px), 600px → 300px at ≤640px breakpoint"

requirements-completed: [BG-01, BG-02, BG-03]

# Metrics
duration: 2min
completed: 2026-02-19
---

# Phase 03 Plan 01: Ambient Orbs Summary

**position:fixed 3-orb gradient layer inserted as body.firstChild via IIFE, providing real backdrop-filter blur targets for glass card system across all pages**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-19T08:37:46Z
- **Completed:** 2026-02-19T08:39:52Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- `ambient-orbs.css` — 191-line stylesheet with 3 orb definitions, 3 keyframe animations, dark/light mode variants, mobile responsive breakpoint, and prefers-reduced-motion halt
- `ambient-orbs.js` — IIFE that inserts orb layer as `body.firstChild` on page load, with runtime prefers-reduced-motion listener
- CSS registered in Hugo's fingerprinted CSS loader slice (after `skeleton.css`)
- JS registered in `extend-footer.html` immediately after `mp-config.js`
- Hugo build verified clean: 0 errors, 748ms, 40 pages

## Task Commits

Each task was committed atomically:

1. **Task 1: Create ambient orb CSS** — `e7124bb` (feat)
2. **Task 2: Create ambient-orbs.js + register loaders** — `e14aa2c` (feat)

**Plan metadata:** (docs commit follows this summary)

## Files Created/Modified

- `assets/css/custom/ambient-orbs.css` — Fixed orb layer CSS: 3 orbs (primary/secondary/accent), dark/light/mobile/reduced-motion branches, 3 keyframe animations
- `static/js/ambient-orbs.js` — IIFE: creates orb layer div, inserts as body.firstChild, handles prefers-reduced-motion runtime changes
- `layouts/partials/extend-head-uncached.html` — Added `"css/custom/ambient-orbs.css"` to CSS slice (position: after skeleton.css)
- `layouts/partials/extend-footer.html` — Added `ambient-orbs.js` script tag after `mp-config.js`

## Decisions Made

- Orb layer inserted as `body.firstChild` via JS (not hardcoded in layouts) — keeps layout templates clean and makes the layer easily controllable from JS
- Script registered after `mp-config.js` — future orb behavior (Phase 3 Plan 02 regime tinting) will read `MP_CONFIG.colors.regime` to update `--mp-orb-color-*` vars
- Home page not skipped — existing `.mp-ambient-orb` elements are `position:absolute` inside `.mp-home-shell`, new orbs are `position:fixed` at viewport level, fundamentally different roles with no visual conflict
- `motion-reduced` JS class is future-proofing only; current CSS `@media (prefers-reduced-motion: reduce)` fully handles the requirement

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None. Hugo build clean on first attempt.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Orb layer is live on all pages; glass cards now have colored blur targets
- Phase 03 Plan 02 (regime tinting) can now drive `--mp-orb-color-primary/secondary` values from `window.__MP_PAGE.regime` to dynamically color the orbs per market regime
- Physical OLED device validation still pending (documented in STATE.md blockers — DevTools cannot replicate OLED dark visibility behavior)
- Pre-existing Hugo module compat warning (`blowfish` version check) is out-of-scope and pre-dates this phase

## Self-Check: PASSED

- FOUND: assets/css/custom/ambient-orbs.css
- FOUND: static/js/ambient-orbs.js
- FOUND: .planning/phases/03-background-regime/03-01-SUMMARY.md
- FOUND commit e7124bb: feat(03-01): create ambient-orbs.css
- FOUND commit e14aa2c: feat(03-01): add ambient-orbs.js and register CSS/JS in Hugo loaders

---
*Phase: 03-background-regime*
*Completed: 2026-02-19*
