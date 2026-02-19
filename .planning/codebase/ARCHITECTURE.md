# Architecture

**Analysis Date:** 2026-02-19

## Pattern Overview

**Overall:** Multi-Layer Static Site Transformation Architecture

**Key Characteristics:**
- Hugo static site rendering layer (build-time)
- Client-side post-processing layer (DOM transformation)
- Modular namespace pattern for JS isolation (window.MPBriefing, window.MPCalendar, window.MP_CONFIG)
- Configuration-driven behavior (centralized config in `mp-config.js`)
- Progressive enhancement: graceful fallback for disabled JS

## Layers

**Render Layer (Hugo Templates):**
- Purpose: Generate HTML from markdown briefing content
- Location: `layouts/`, `config/_default/`
- Contains: Hugo templates, partials, shortcodes, TOML configuration
- Depends on: Markdown content (`content/posts/`), Blowfish theme
- Used by: Browser receives rendered HTML

**Data Bridge Layer:**
- Purpose: Inject config and page-specific metadata into browser context
- Location: `layouts/partials/extend-head-uncached.html`
- Contains: Global config injection (`window.__MP_CONFIG`), page regime data (`window.__MP_PAGE`), dynamic CSS loading
- Depends on: `config/_default/params.toml` (market_pulse section), page front matter
- Used by: Client-side JS modules read this data

**Content Processing Layer (JavaScript Modules):**
- Purpose: Transform static HTML into interactive, formatted components
- Location: `static/js/briefing/`, `static/js/calendar/`
- Contains: Modular transformers for news grid, calendar, ticker cards, regime hero, DOM utilities
- Depends on: `window.MP_CONFIG`, `window.__MP_PAGE`, rendered HTML DOM
- Used by: Browser runtime, triggered by extend-footer.html script loads

**Styling Layer:**
- Purpose: Provide visual polish, layout overrides, and theme-specific styling
- Location: `assets/css/custom/`
- Contains: Modular CSS files (one concern per file), injected at runtime via `extend-head-uncached.html`
- Depends on: Blowfish base theme, Hugo asset pipeline
- Used by: Browser renders styled HTML

**Chart Data Integration Layer:**
- Purpose: Load external market chart data (JSON) and render via echarts
- Location: `static/js/market-charts-loader.js`, `static/js/render-charts.js`
- Contains: Chart loading, timeout handling, echarts rendering
- Depends on: `window.MP_CONFIG.charts`, page `chartData` front matter, echarts CDN
- Used by: Briefing posts with `chartData: /data/chart-data-*.json` parameter

## Data Flow

**Markdown → HTML Render:**

1. Content author writes `content/posts/YYYY-MM-DD.md` with front matter
   - `title`, `tags`, `chartData`, `regime`, `summary`, `regimeIcon` in front matter
   - Markdown body with sections marked by HTML comments (FACT_ZONE, OPINION_ZONE, MP_BLOCK_START)
2. Hugo reads `config/_default/` and theme (`blowfish`)
3. Hugo renders post using `layouts/` templates
4. Hugo outputs HTML to `public/posts/YYYY-MM-DD/index.html`

**HTML → DOM Transformation:**

1. Browser loads HTML from static file
2. `extend-head-uncached.html` executes:
   - Injects `window.__MP_CONFIG` from `params.toml.market_pulse`
   - Injects `window.__MP_PAGE` if post has regime/chartData (post-specific data)
   - Loads custom CSS files with fingerprinting
   - Conditionally loads echarts CDN if `chartData` exists
3. `extend-footer.html` loads JS modules in sequence:
   ```
   mp-config.js (merge config)
     ↓
   [Utility modules] dom-utils, section-wrapping
     ↓
   [Briefing transformers] regime-hero, collapsible, news-grid, ticker-cards, toc-scrollspy
     ↓
   [Calendar stack] parser, model, renderer, market-pulse-calendar, calendar-loader
     ↓
   [Orchestrator] market-pulse-enhancements
     ↓
   [Effects] reading-progress, branding-patch, footer-clock
   ```

**State Management:**

- **Global Config:** `window.MP_CONFIG` (frozen after `mp-config.js` merges)
  - Contains: paths, colors, labels, calendar settings, chart thresholds
  - Scope: Shared across all modules via namespace
  - Initialization: Defaults from `mp-config.js` + override from `__MP_CONFIG` (from Hugo)

- **Page-Specific Data:** `window.__MP_PAGE` (set by Hugo if post has regime/chartData)
  - Contains: `regime`, `regimeIcon`, `summary`, `chartData`
  - Scope: Used by regime-hero, chart-loader only
  - Lifecycle: Set once at boot, consumed during transformation

- **DOM State:** CSS classes, data attributes on elements
  - `briefing-section` (wrapping sections by zone)
  - `mp-news-grid` (news grid marker)
  - `is-revealed` (scroll reveal state)
  - `data-mp-calendar-shortcode` (calendar section marker)
  - `data-mp-calendar-enhanced` (prevent re-processing)

## Key Abstractions

**Module Namespace Pattern:**

All JS modules use IIFE + namespace:
```javascript
(function() {
  'use strict';
  var ns = window.MPBriefing = window.MPBriefing || {};
  ns.functionName = function(...) { ... };
})();
```

- Purpose: Avoid global pollution, enable hot-reload in dev
- Examples: `window.MPBriefing` (briefing transforms), `window.MPCalendar` (calendar), `window.MP_CONFIG` (config)
- Pattern: Read-only singleton (config) vs mutable namespace (functions)

**HTML Comment Markers (Content Contract):**

Markdown content uses HTML comments as structural markers:
- `<!-- FACT_ZONE_START/END -->` - Separates factual from opinion
- `<!-- OPINION_ZONE_START/END -->` - Opinion content block
- `<!-- MP_BLOCK_START {"schema_version":"mp-block-v2",...} -->` - Block metadata
- `<!-- MP_KEY_EVENTS_START/END -->`, `<!-- MP_KEY_EVENT_START/END -->` - Calendar events
- Purpose: Enable parser to understand content intent without modifying markdown structure

**Shortcodes (Hugo Template Extension):**

Hugo shortcodes in `layouts/shortcodes/` provide semantic markup:
- `{{< market-charts >}}` - Inserts chart container + loaders
- `{{< news-grid >}}` - Renders news as grid
- `{{< market-calendar >}}` - Renders calendar section
- `{{< regime-panel >}}` - Regime status display
- `{{< ticker-group >}}` - Market ticker group
- Purpose: Allow markdown to reference complex rendered layouts without HTML pollution

**Calendar Parser State Machine:**

`static/js/calendar/parser.js` exports `createParser()` function:
- Reads HTML comment markers and text patterns
- Parses schedule format: `[CC] Event | 2026-02-19 HH:MM KST | importance: high`
- Returns normalized event objects with parsed datetime (KST)
- Handles KRX holidays from hardcoded list (2024-2030)

**Chart Data Loading:**

`market-charts-loader.js`:
- Reads `window.__MP_PAGE.chartData` URL path
- Fetches JSON from static `/data/chart-data-*.json`
- Validates data schema
- Dispatches `mp:chart-data-ready` event when loaded
- Triggers calendar re-render after chart ready (coordination point)

## Entry Points

**Page Load - Blog Post (`/posts/YYYY-MM-DD/`):**
- Location: `content/posts/YYYY-MM-DD.md` → rendered as `public/posts/YYYY-MM-DD/index.html`
- Triggers: HTML loaded in browser
- Responsibilities:
  1. Hugo renders post with all partials (extend-head-uncached, extend-footer)
  2. `extend-head-uncached.html` injects config + loads CSS
  3. `extend-footer.html` loads all JS modules in sequence
  4. `market-pulse-enhancements.js` (DOMContentLoaded) orchestrates transforms

**Homepage (`/`):**
- Location: `content/_index.md` → rendered with `layouts/partials/home/`
- Triggers: HTML loaded
- Responsibilities:
  1. Renders recent briefing cards (home-briefing-cards.html)
  2. Renders market overview ticker (via JS: home-market-overview.js)
  3. Calendar shortcodes parsed if present
  4. Skips most post-level transforms (only calendar, no news-grid)

**Chart Data Integration:**
- Location: `market-charts-loader.js` (triggered from shortcode)
- Triggers: Page has `chartData: /data/chart-data-*.json` in front matter
- Responsibilities:
  1. Fetch JSON from static path
  2. Validate schema
  3. Pass to `render-charts.js` (echarts rendering)
  4. Emit event for calendar re-render

## Error Handling

**Strategy:** Defensive programming with console warnings, never crash

**Patterns:**

1. **Module Existence Check:**
   ```javascript
   if (typeof ns.functionName === 'function') {
     ns.functionName(...);
   }
   ```
   - Used when calling optional transforms
   - Ensures graceful fallback if module failed to load

2. **Try-Catch with Fallback:**
   ```javascript
   try {
     ns.transformNewsSection(newsSection);
   } catch (err) {
     console.warn('News card transformation failed, keeping original:', err);
   }
   ```
   - Prevents one broken transform from breaking entire page
   - Keeps original HTML if transform fails

3. **Null Checks:**
   - All DOM queries use existence check before manipulation
   - Config fallbacks: `|| default` pattern throughout

4. **Data Validation:**
   - Calendar parser validates date format before parsing
   - Chart loader validates JSON schema, times out after 15s
   - Ticker cards check for valid numeric patterns in cells

5. **Observable Events:**
   - `mp:chart-data-ready` dispatched after chart fetch completes
   - Calendar re-renders on this event (coordination without coupling)

## Cross-Cutting Concerns

**Logging:**

No structured logging. Console methods used:
- `console.warn()` - Error fallback messages
- `console.log()` - Occasional debug (rare)
- Approach: Keep browser console clean, log only on failure

**Validation:**

1. **Content Validation:** HTML comment markers in markdown validated by parser regex
2. **Config Validation:** Hugo TOML validated by Hugo build, type-checked at runtime
3. **Chart Data Validation:** JSON schema checked against expected keys in `render-charts.js`
4. **DOM Validation:** Element queries check existence before manipulation

**Authentication:**

Not applicable. Static site with no backend.

**Internationalization:**

- Hugo config: `defaultContentLanguage = "ko"`
- Labels in `MP_CONFIG`: All strings are Korean by default
- Date formatting: Uses `Intl.DateTimeFormat` with `timeZone: 'Asia/Seoul'`, `locale: 'ko-KR'`
- Calendar weekday labels: `['일', '월', '화', '수', '목', '금', '토']` (Korean)
- No translation layer: Single language (Korean) by design

**Performance:**

- Chart loading: 15s timeout, abort if slow
- CSS: Minified + fingerprinted at build time
- JS: Load in `extend-footer.html` to not block rendering
- DOM transforms: Run after DOMContentLoaded, use debouncing for scroll events
- IntersectionObserver for lazy scroll-reveal (T-603)

---

*Architecture analysis: 2026-02-19*
