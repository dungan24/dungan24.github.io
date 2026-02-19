# Coding Conventions

**Analysis Date:** 2026-02-19

## Naming Patterns

**Files:**
- Snake case with hyphens for multi-word files: `market-pulse-enhancements.js`, `extend-footer.html`
- Functional/semantic naming: describe behavior/module purpose
- Files grouped by domain: `briefing/`, `calendar/`, `custom/`

**Functions:**
- camelCase: `createParser()`, `transformNewsSection()`, `getEventStatus()`
- Functional descriptors: create/get/set/transform/enable prefixes
- Private functions inside IIFE, public functions attached to namespace

**Variables:**
- camelCase: `chartDataUrl`, `timeZone`, `eventMap`
- CONSTANT_CASE: `OPINION_TITLES`, `DEFAULT_COLLAPSIBLE_TITLES`
- DOM references: `var root = document.getElementById()`, `var bar = document.createElement()`

**Types/Classes:**
- No TypeScript; vanilla JavaScript
- Factory pattern: `ns.createModel = function(parser) { ... return { ... }; }`
- Namespace organization: `window.MPBriefing`, `window.MPCalendar`

**CSS Classes:**
- BEM pattern: `mp-news-card__headline`, `mp-collapse-toggle__icon`
- Prefix: `mp-` for Market Pulse components
- State classes: `is-open`, `is-revealed`, `is-fresh`, `is-stale`

## Code Style

**Formatting:**
- No linter/formatter configured (no ESLint, Prettier, Biome)
- Manual formatting following vanilla JavaScript conventions
- Indentation: 2 spaces
- Semicolons: always present

**Linting:**
- No linting enforcement - relies on manual review

**Strict Mode:**
- `'use strict';` at top of every IIFE/file

## Import Organization

**Order:**
1. Namespace initialization: `var ns = window.MPBriefing = window.MPBriefing || {};`
2. Configuration retrieval: `var config = window.MP_CONFIG || {};`
3. Helper functions
4. Public API methods
5. Event listeners

**Global Dependencies:**
- Configuration via `window.MP_CONFIG` (injected by Hugo in `extend-head-uncached.html`)
- Page data via `window.__MP_PAGE` (regime, summary, chartData)
- Module namespaces: `window.MPBriefing`, `window.MPCalendar`, `window.MPCharts`

## Error Handling

**Patterns:**
- Defensive null/undefined checks: `if (!content) return;`
- Guard clauses at function entry
- Type coercion: `String(text || '')`, `Number(value || 0)`
- No try/catch in most modules (only in fetch chains)
- Graceful degradation via silent returns

**Example:**
```javascript
function transformNewsSection(newsSection) {
  if (!newsSection) return;
  // ... rest
}
```

**Error Messages:**
- User-facing via config.labels in `mp-config.js`
- Examples: `chart_data_unavailable`, `chart_request_timeout`, `chart_load_failed`

## Logging

**Framework:** `console` only

**Patterns:**
- Minimal logging
- Development logs with `console.warn()`, `console.error()`
- No debug logs in production paths
- Smoke tests use `console.log()` for informational output

## Comments

**When to Comment:**
- Task IDs: `// T-603: Scroll Reveal`
- Non-obvious algorithms
- Why over what
- Constraints: `// CONSTRAINT: echarts must load before render-charts.js`
- State transitions: `// Initial color set`

**Style:**
- Single-line: `// comment`
- Block comments for section markers: `/* --- Section Title --- */`

## Function Design

**Size:**
- Typical: 20-50 lines
- Complex logic: 100+ lines (DOM transformation, calendar)
- Example: `transformNewsSection()` ~90 lines for card parsing

**Parameters:**
- Maximum 2-3 typical
- Configuration passed by reference from `window.MP_CONFIG`
- Callbacks in event handlers

**Return Values:**
- Explicit in utility functions
- Void (side effects) in DOM manipulation
- Consistent per function

**Naming Convention:**
```javascript
createModel()      // Returns object/factory
getEventStatus()   // Returns value
findSection()      // Returns element or null
transformNews()    // Returns void (mutates)
enable...()        // Void, sets up behavior
```

## Module Design

**Exports:**
- Namespace pattern: attach to `window.MPBriefing`, `window.MPCalendar`
- Factory functions return public API object
- IIFE wrapping for encapsulation: `(function() { ... })();`

**Module Coupling:**
- Global namespace by design (browser environment)
- Dependencies injected via configuration
- Parser functions accept dependencies: `ns.createModel = function(parser) { ... }`

## Template Conventions (Hugo)

**File Structure:**
- Partials: `layouts/partials/`
- Shortcodes: `layouts/shortcodes/`
- CSS: `assets/css/custom/{feature}.css`

**Syntax:**
- Variables: `{{ .Params.regime }}`
- Filters: `{{ "js/mp-config.js" | relURL }}`
- Conditionals: `{{ if .Params.regime }} ... {{ end }}`
- Data injection: `<script>window.__MP_CONFIG = {{ . | jsonify | safeJS }};</script>`

## CSS Conventions

**Naming:**
- BEM: `mp-news-card__headline`, `is-open` for states
- Custom properties: `--mp-font-sans`, `--mp-accent-fact`
- Class selectors preferred over IDs

**Organization:**
- Modular files: `briefing-sections.css`, `calendar.css`
- Global variables in `custom.css` root
- Feature-specific overrides in dedicated files

**Patterns:**
- CSS variables for theming: `var(--mp-glass-bg)`
- Responsive: `@media (prefers-reduced-motion: reduce)`
- Glass morphism: `backdrop-filter: blur(14px) saturate(1.4)`

---

*Convention analysis: 2026-02-19*
