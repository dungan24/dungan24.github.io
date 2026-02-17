# Agent Architecture Roadmap

This note captures the structural refactor baseline for agent-first maintenance.
Goal: improve maintainability and agent execution speed without changing briefing semantics.

## Current Structure (Implemented)

- CSS split by semantic domains:
  - `assets/css/custom.css`
  - `assets/css/custom/briefing-sections.css`
  - `assets/css/custom/calendar.css`
  - `assets/css/custom/toc-and-effects.css`
  - `assets/css/custom/layout-overrides.css`
  - `assets/css/custom/chart-cards.css`
  - `assets/css/custom/home-market-overview.css`
- Post enhancement JS split by feature modules:
  - `static/js/briefing/dom-utils.js`
  - `static/js/briefing/section-wrapping.js`
  - `static/js/briefing/regime-hero.js`
  - `static/js/briefing/collapsible.js`
  - `static/js/briefing/news-grid.js`
  - `static/js/briefing/ticker-cards.js`
  - `static/js/briefing/toc-scrollspy.js`
  - `static/js/briefing/calendar-loader.js`
  - `static/js/market-pulse-enhancements.js` (orchestrator)
  - `static/js/calendar/parser.js`
  - `static/js/calendar/model.js`
  - `static/js/calendar/renderer.js`
  - `static/js/market-pulse-calendar.js` (calendar converter entrypoint)
- Template hygiene:
  - `layouts/partials/home/custom.html` uses external JS/CSS assets
  - `layouts/shortcodes/market-calendar.html` removed inline demo script
  - `layouts/partials/extend-head-uncached.html` removed inline chart style block
  - `layouts/partials/extend-head-uncached.html` keeps only data-bridge inline scripts (`window.__MP_CONFIG`, conditional `window.__MP_PAGE`)
- Screenshot archive (`docs/screenshots/`): keep as non-runtime evidence only.

## Next Low-Risk Refactors

1. Add smoke snapshot checks for news/ticker/calendar transformations
2. Remove residual inline style attributes from chart/home templates where practical
3. Expand browser smoke coverage to news-card and ticker-card transformations

## Working Rules

- Run `pwsh -File tools/agent-audit.ps1` before and after structural changes.
- If parser behavior changes, sync render contract updates in `../market-pulse`.
- Prefer feature-level extraction over broad rewrites to minimize regression risk.
