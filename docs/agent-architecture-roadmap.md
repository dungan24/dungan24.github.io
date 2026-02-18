# Agent Architecture Roadmap

This document tracks structural refactors for agent-first maintenance.
Goal: reduce regression risk and improve change velocity without changing briefing semantics.

## 1) Current Baseline (Implemented)

- CSS is split by semantic domains:
  - `assets/css/custom.css`
  - `assets/css/custom/briefing-sections.css`
  - `assets/css/custom/calendar.css`
  - `assets/css/custom/calendar-polish.css`
  - `assets/css/custom/toc-and-effects.css`
  - `assets/css/custom/layout-overrides.css`
  - `assets/css/custom/chart-cards.css`
  - `assets/css/custom/home-market-overview.css`
  - `assets/css/custom/home-briefing-cards.css`
  - `assets/css/custom/terminal-footer.css`
  - `assets/css/custom/theme-fixes.css`
- Post enhancement JS is split into feature modules:
  - `static/js/briefing/dom-utils.js`
  - `static/js/briefing/section-wrapping.js`
  - `static/js/briefing/regime-hero.js`
  - `static/js/briefing/collapsible.js`
  - `static/js/briefing/news-grid.js`
  - `static/js/briefing/ticker-cards.js`
  - `static/js/briefing/toc-scrollspy.js`
  - `static/js/briefing/calendar-loader.js`
  - `static/js/market-pulse-enhancements.js` (orchestrator)
- Calendar architecture is modular:
  - `static/js/calendar/parser.js`
  - `static/js/calendar/model.js`
  - `static/js/calendar/renderer.js`
  - `static/js/market-pulse-calendar.js` (adapter/entrypoint)
- Template hygiene:
  - `extend-footer.html` remains loader-only
  - `extend-head-uncached.html` keeps only config/data bridge inline scripts
  - no runtime implementation logic inside layout partials

## 2) Contract Compatibility Status

- Implemented:
  - `MP_BLOCK_START` metadata parsing and section dataset mapping
  - calendar range filters (importance/period/country)
  - `MP_KEY_EVENTS_*` and `MP_KEY_EVENT_*` markers are parseable via list fallback
- Pending cross-repo alignment:
  - upstream publisher full front matter fields (`slot`, `generatedAt`, `asOfTime`, `summary`, `regime`)
  - optional SO WHAT dedicated parser rules (icon prefixes/semantic styling)
  - chart key naming consistency checks for correlation payloads

## 3) Next Low-Risk Refactors

1. Add smoke checks for SO WHAT section rendering contract.
2. Add contract assertion for front matter completeness in preflight.
3. Add parser fallback tests for missing/partial news excerpts.
4. Add schema guard for chart payload key compatibility (`correlation` vs `correlations`).

## 4) Working Rules

- Run `pwsh -File tools/agent-audit.ps1` before and after structural changes.
- If parser behavior changes, sync contract updates in `../market-pulse/specs/render-contract.md`.
- Prefer feature-level extraction over broad rewrites.
- Keep runtime modules small enough for targeted fixes, but avoid over-fragmentation.
