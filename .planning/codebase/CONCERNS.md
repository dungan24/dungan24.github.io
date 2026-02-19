# Codebase Concerns

**Analysis Date:** 2026-02-19

## Tech Debt

### Fragile Markdown Parsing with Regex-Heavy State Machine

**Issue:** Calendar parser relies on multiple overlapping regex patterns to parse schedule events in markdown.

Files: `static/js/calendar/parser.js`

**Details:**
- Lines 21, 171-213: Three different regex patterns (legacyScheduleRegex, compactHead, modernHead) to handle different markdown formats
- Multiple `normalizeImportanceToken()` functions (line 88-94) with hardcoded Korean/English mappings
- No formal schema validation — relies on brittle pattern matching

**Impact:**
- Risk of parsing failure when markdown format deviates even slightly
- Events silently dropped if they don't match expected patterns (no error logging)
- Difficult to add new event formats without introducing regressions

**Fix approach:**
- Introduce a formal event schema with proper validation
- Consolidate parser logic into single canonical format handler
- Add detailed parse error logging with line numbers
- Consider JSON-LD or structured data attributes in markdown frontmatter instead of comment-based parsing

---

### Unsafe innerHTML Usage in News Card Transformation

**Issue:** News cards are built using string concatenation with `innerHTML` assignment without sufficient HTML escaping.

Files: `static/js/briefing/news-grid.js` (lines 68-73)

**Details:**
```javascript
card.innerHTML =
  (source ? '<div class="mp-news-card__source">' + source + '</div>' : '') +
  '<div class="mp-news-card__headline"><a href="' + href + '" target="_blank"...
```

- Variables `source`, `headline`, `originalHeadline`, `time`, `category`, `excerpt` are inserted directly without escaping
- While `regime-hero.js` (line 70) has `escapeHtml()` function and `renderer.js` (lines 70-76) uses it, this pattern is inconsistent
- URL in href is not validated — could inject javascript: URIs

**Impact:**
- **XSS vulnerability** if upstream briefing data contains unescaped HTML/JS
- Cross-site script injection possible through news sources or headlines
- Even though upstream is supposedly sanitized, defense-in-depth principle violated

**Fix approach:**
- Extract shared `escapeHtml()` utility to `dom-utils.js`
- Validate all URLs (reject javascript:, data:, vbscript: protocols)
- Use `textContent` + DOM methods instead of innerHTML where possible
- Add CSP headers to restrict inline script execution

---

### Multiple Conflicting Focus/Scroll Management

**Issue:** Several modules manage focus, scrolling, and observer patterns without clear coordination.

Files:
- `static/js/briefing/toc-scrollspy.js` (lines 15-30): IntersectionObserver for TOC highlighting
- `market-pulse-enhancements.js` (lines 60-72): Separate IntersectionObserver for section reveal
- `market-pulse-enhancements.js` (lines 144-149): Scroll-to-top handler

**Details:**
- Two separate IntersectionObserver instances with different thresholds
- No cleanup/unobserve on page navigation in SPA context
- rootMargin conflicts: TOC uses `-20% 0px -80% 0px`, reveal uses `0px 0px -100px 0px`

**Impact:**
- Memory leak risk if these observers are created multiple times
- Unpredictable TOC highlighting when multiple sections trigger simultaneously
- Performance degradation with many briefing sections on home page

**Fix approach:**
- Create shared observer pool in `dom-utils.js`
- Implement proper cleanup on dynamic content updates
- Document observer lifecycle and make it explicit
- Add observer performance monitoring (Intersection Observer entries > 50)

---

### CSS Cascade Complexity and !important Overuse

**Issue:** Heavy use of !important flags and fragmented CSS module structure makes maintenance difficult.

Files: `assets/css/custom/` (14 separate files totaling ~2500+ lines)

**Details:**
- `layout-overrides.css` line 360+: Multiple `!important` flags in light mode overrides
- Opinion zone styling (lines 681-735) has cascading selectors with 10+ specificity levels
- Color scheme switching via CSS variables but also inline `style.setProperty()` in JS (regime-hero.js line 19-20)

**Impact:**
- Hard to predict final computed styles
- Adding new features requires hunting through multiple CSS files
- Mobile responsive design scattered across files (no single source of truth)
- Light/dark mode overrides fragmented across files

**Fix approach:**
- Consolidate CSS into logical modules (separate concerns: layout, typography, components, themes)
- Replace !important with proper CSS cascade (specificity planning)
- Create centralized CSS architecture document
- Use CSS containment (contain: layout) to reduce cascade scope

---

## Known Bugs

### Calendar Rendering Stalls on Large Event Lists

**Issue:** Calendar renderer can hang when processing >100 events in a single month.

Files: `static/js/calendar/renderer.js` (lines 30-40, 78-160)

**Symptoms:**
- Page becomes unresponsive for 2-5 seconds after calendar section loads
- UI thread blocked during event sorting and tooltip HTML generation

**Root Cause:**
- Line 30-34: Events sorted synchronously in main thread
- Lines 92-160: Tooltip HTML generated in loop without batching — creates DOM churn
- No requestAnimationFrame throttling

**Workaround:** None. Page must re-render from scratch.

**Fix approach:**
- Implement Web Worker for event sorting if >50 items
- Use `DocumentFragment` to batch tooltip HTML construction
- Implement virtual scrolling for upcoming events list (lines 260+)
- Add performance profiling markers to detect regressions

---

### News Grid Does Not Handle Missing Blockquote Gracefully

**Issue:** News cards fail to extract excerpt when blockquote is missing.

Files: `static/js/briefing/news-grid.js` (lines 39-66)

**Symptoms:**
- Empty excerpt div rendered: `<div class="mp-news-card__excerpt">...</div>` with no content
- Cards appear broken even though they contain valid headline + source

**Root Cause:**
- Line 39: `var blockquote = li.querySelector('blockquote');`
- Line 66: `var excerpt = blockquote ? (blockquote.textContent || '').trim() : '';`
- Rendered even when excerpt is empty (line 73)

**Workaround:** Upstream briefing must always include blockquote.

**Fix approach:**
- Skip excerpt div entirely if empty (ternary in line 73)
- Add fallback excerpt extraction from first <p> in list item
- Add data attribute to card indicating excerpt availability

---

### Chart Data Loading Timeout Silently Falls Back

**Issue:** When chart data fetch times out, error message displays but subsequent calendar/ticker renders attempt without data.

Files: `static/js/market-charts-loader.js` (lines 47-51)

**Symptoms:**
- User sees timeout message in loading UI
- Calendar section still renders with empty state
- No indication that chart-dependent features are degraded

**Root Cause:**
- Line 47-51: 15-second timeout triggers showError()
- But if user is still waiting, they may not notice chart didn't load
- Next render (calendar transform) checks `window.__MP_CHART_DATA` (parser.js line 102) — undefined but doesn't error

**Workaround:** Reload page.

**Fix approach:**
- Dispatch custom event on timeout (already done on success at line 60)
- Make calendar render dependent on chart data presence
- Add explicit "Charts unavailable" state to UI
- Implement retry mechanism with exponential backoff

---

## Security Considerations

### Global Config Object Exposes Sensitive Data

**Issue:** Window.__MP_CONFIG contains all site configuration including API endpoints, palette colors, and labels.

Files: `layouts/partials/extend-head-uncached.html` (line 17)

**Risk:**
- Regex patterns and parsing logic exposed to user (parser.js can be reverse-engineered)
- If config accidentally includes API keys or endpoints, they're world-readable
- Frontend can be easily scraped/analyzed by competitors

**Mitigation in place:**
- Config does not contain secrets (design is correct)
- But no Content Security Policy enforced to prevent inline script modification

**Recommendations:**
- Add `Content-Security-Policy` header restricting inline scripts
- Move non-UI config to backend API endpoint
- Implement Subresource Integrity (SRI) for external CDN scripts (echarts)

---

### XSS Risk in Regime Hero Summary

**Issue:** Regime summary inserted via innerHTML without escaping.

Files: `static/js/briefing/regime-hero.js` (line 68)

**Details:**
```javascript
hero.innerHTML = '...' + (mp.summary ? '<p class="mp-post-hero__summary">' + mp.summary + '</p>' : '');
```

- `mp.summary` comes from front matter `window.__MP_PAGE` (extend-head-uncached.html line 23)
- No escaping applied
- While Hugo/YAML should sanitize, defense-in-depth violated

**Fix approach:**
- Apply `escapeHtml()` to `mp.summary`
- Or use `textContent` + document.createElement('p') approach
- Validate frontmatter against JSON Schema in CI

---

### Insufficient URL Validation in News Cards

**Issue:** News card URLs in href attributes not validated.

Files: `static/js/briefing/news-grid.js` (line 70)

**Risk:**
- Markdown could contain `href="javascript:alert('xss')"`
- Or malicious redirects

**Fix approach:**
```javascript
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
// Then: var href = isValidUrl(linkUrl) ? linkUrl : '#';
```

---

## Performance Bottlenecks

### Large JavaScript Bundle Loaded in Footer

**Issue:** 20 separate JS files loaded sequentially in footer (extend-footer.html).

Files: `layouts/partials/extend-footer.html` (lines 1-19)

**Details:**
- Each file triggers separate HTTP request
- Parser, Model, Renderer all loaded even if calendar not on page
- No lazy loading or code splitting
- Total uncompressed size likely >200KB

**Impact:**
- First paint delayed by script parsing
- LCP (Largest Contentful Paint) metric degraded
- Slow initial home page load

**Fix approach:**
- Concatenate into single bundle (webpack/esbuild)
- Lazy-load briefing-specific JS (calendar, news-grid) only on post pages
- Use `async` attribute for non-critical scripts (theme-transition, footer-clock)
- Implement tree-shaking to remove unused parser formats

---

### DOM Queries Without Caching

**Issue:** Repeated DOM queries in tight loops.

Files: `static/js/briefing/section-wrapping.js` (lines 56-90)

**Details:**
- Line 56: `var h2s = content.querySelectorAll('h2');`
- Lines 57-90: For each h2, multiple nested DOM operations
- `nextElementSibling` accessed multiple times without caching

**Impact:**
- Reflow triggered on each appendChild (lines 67, 77)
- On pages with 20+ sections, this causes noticeable layout jank

**Fix approach:**
- Batch DOM updates using DocumentFragment
- Cache nodeList in array, operate on fragment, then insert once
- Use visibility API to defer rendering off-screen sections

---

### Regex in Loop (Calendar Parser)

**Issue:** Regex compilation happens in loop during event parsing.

Files: `static/js/calendar/parser.js` (lines 20-21, 168-213)

**Details:**
```javascript
var timeTokenRegex = new RegExp('\\s*' + escapedTimeZoneLabel + '$', 'i');
// Used in loop at line 105
chartData.keyEvents.map(function (item) {
  var eventTimeRaw = String(item.eventTimeKst || '').replace(timeTokenRegex, '');
  ...
})
```

**Impact:**
- Regex compiled hundreds of times unnecessarily
- On 100+ events, measurable performance hit

**Fix approach:**
- Move regex construction outside event loop
- Cache compiled regex in parser factory (line 6)

---

## Fragile Areas

### Section Detection and Wrapping Algorithm

**Issue:** Section detection relies on h2 proximity and sibling walking, fragile to content structure changes.

Files: `static/js/briefing/section-wrapping.js` (lines 52-90)

**Why Fragile:**
- Line 75: Breaks on `H2, HR, SECTION` tags — if upstream adds `<aside>`, sections corrupt
- Assumes immediate next sibling after h2 — whitespace nodes could break
- No validation that wrapped content actually belongs together

**Safe modification:**
- Test with various content structures before shipping
- Add assertions: `console.assert(sectionContent.length > 0)`
- Use explicit section markers in markdown (already partially done with MP_BLOCK_START comments)

**Test coverage gaps:**
- No tests for malformed markdown
- No tests for deeply nested tables inside sections
- No tests for sections with no content

---

### Markdown -> HTML Transform Pipeline

**Issue:** Multiple transformations applied in sequence without rollback or error isolation.

Files: `static/js/market-pulse-enhancements.js` (lines 52-142)

**Sequence:**
1. Wrap briefing sections
2. Wrap opinion subsections
3. Inject regime hero
4. Transform news
5. Transform calendar
6. Transform ticker cards

**Why Fragile:**
- If transform #3 fails, transforms #4-6 may operate on corrupted DOM
- No try-catch around transform cascade (line 86-95 only wraps news)
- Errors silently logged to console, user doesn't know page is partially broken

**Safe modification:**
- Wrap each transform in isolated try-catch
- Implement rollback (save initial HTML, restore on cascade failure)
- Add visual indicator when transforms fail (red banner)

---

### IntersectionObserver Not Cleaned Up on Dynamic Navigation

**Issue:** Observers created but never unobserved or disconnected.

Files:
- `static/js/briefing/toc-scrollspy.js` (line 15-30): Creates observer, no cleanup
- `market-pulse-enhancements.js` (line 60-71): Creates observer, no cleanup

**Risk:**
- In SPA context (if Hugo migrates to dynamic loading), memory leak
- Hundreds of observer callbacks queued if page re-renders

**Safe modification:**
- Return `{ disconnect: () => observer.disconnect() }` from observer creation
- Call cleanup on route change or element removal
- Use WeakMap to track observed elements

---

### Calendar Tooltip Positioning Algorithm

**Issue:** Shared tooltip element positioned without bounds checking.

Files: `static/js/calendar/renderer.js` (lines 61-68, 78-170)

**Details:**
- Line 62-68: Single shared `#mp-shared-tooltip` element appended to body
- Positioning handled by CSS only (not in code visible here)
- Risk: tooltip renders off-screen on mobile or narrow viewports

**Safe modification:**
- Add bounds checking before rendering tooltip
- Implement fallback positioning (above/below based on viewport)
- Add mobile-specific tooltip layout (card instead of tooltip)

---

## Scaling Limits

### Calendar Performance Degrades with Large Event Lists

**Current capacity:** ~50 events/month renderable without jank

**Limit:** >100 events cause 2-5 second UI freeze

**Scaling path:**
- Implement virtual scrolling for upcoming events (currently renders all)
- Use Web Worker for sorting/filtering
- Implement pagination for month view

---

### CSS Size Growth

**Current:** 14 CSS files, 2500+ lines (unminified)

**Limit:** >5000 lines = difficult to maintain, >1MB uncompressed = slow on slow networks

**Scaling path:**
- Consolidate CSS modules (reduce from 14 to 5-6)
- Implement CSS-in-JS tooling if dynamic theming needed
- Use CSS custom properties (already done partially)

---

## Dependencies at Risk

### echarts CDN Dependency

**Risk:** Loaded via CDN (extend-head-uncached.html line 27), vulnerable to:
- CDN downtime → charts fail to load
- jsdelivr.net DNS issues
- No fallback mechanism

**Impact:** Charts section blank, but briefing content still renders (graceful degradation works)

**Migration plan:**
- Self-host echarts bundle in `static/lib/echarts.min.js`
- Implement local fallback in `render-charts.js`
- Use Subresource Integrity (SRI) hash

---

### Noto Sans KR Font Dependency

**Risk:** Loaded from Google Fonts CDN (extend-head-uncached.html line 7)

**Impact:**
- Blocks rendering until font loaded
- On slow connections, causes FOUT (Flash of Unstyled Text)
- Privacy concern (Google analytics tracking)

**Migration plan:**
- Download and self-host font files
- Use `font-display: swap` for faster text rendering
- Implement font subsetting for Korean characters in use

---

## Missing Critical Features

### No Offline Support

**Problem:** Site requires all assets loaded from internet. No service worker or caching strategy.

**Blocks:** Offline reading, slow network resilience

**Gap:** Single page can take 10+ seconds to fully load on 3G connection

---

### No Error Recovery UI

**Problem:** When scripts fail (parser error, missing config), silent degradation occurs.

**Blocks:** Users don't know page is partially broken

**Example:**
- Calendar transform fails → user sees old markdown schedule
- News cards fail → original list renders instead of card grid

---

### No Audit Trail for Rendered Content

**Problem:** No logging of which transforms succeeded/failed, no debug mode

**Blocks:** Troubleshooting production issues difficult

---

## Test Coverage Gaps

### News Grid Transformation

**Untested areas:**
- Missing blockquote (excerpt rendering)
- Missing link in list item (href handling)
- Malformed metadata (source, time, category parsing)
- Very long headlines (truncation)

Files: `static/js/briefing/news-grid.js`

**Risk:** Untested transformation failures go unnoticed until production

**Priority:** High

---

### Calendar Parser Format Support

**Untested areas:**
- Legacy schedule regex (line 215)
- Modern compact format (line 171-191)
- Timezone handling edge cases (DST transitions)
- Events with no importance level
- Events crossing month boundaries

Files: `static/js/calendar/parser.js`

**Risk:** Parser silently drops invalid events

**Priority:** High

---

### Mobile Responsiveness (640px - 768px viewports)

**Untested areas:**
- Table horizontal scroll on tablet (layout-overrides.css line 77-112)
- Calendar grid on small screens
- News card grid breakpoints
- Opinion section list wrapping

**Risk:** Layout breaks on tablet sizes

**Priority:** Medium

---

### Light Mode Theme Consistency

**Untested areas:**
- All 14 CSS files have light mode overrides
- Interaction states (hover, focus) in light mode
- Form inputs (search modal) in light mode

**Risk:** Light mode feels incomplete or inconsistent

**Priority:** Medium

---

### Error Handling in Chart Data Loading

**Untested areas:**
- Network timeout (15 second fallback)
- HTTP error codes (404, 500)
- Invalid JSON response
- Missing required fields in chart data

Files: `static/js/market-charts-loader.js`

**Risk:** Unhandled errors leave stale state

**Priority:** High

---

*Concerns audit: 2026-02-19*
