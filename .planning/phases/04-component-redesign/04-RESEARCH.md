# Phase 4: Component Redesign — Research

**Researched:** 2026-02-19
**Domain:** CSS glassmorphism component styling + ECharts palette synchronization
**Confidence:** HIGH

---

## Summary

Phase 4 is a CSS-dominant phase with one targeted JS touch (news category badge mapping). All three
component subsystems — news cards, calendar, and chart containers — already have substantial CSS
written. The real work is **gap-filling and polishing within the existing structure**, not a rewrite.

**News cards** (`briefing-sections.css`, `news-grid.js`) already render a glass card with
backdrop-filter, border, shadow, and hover effect. What is missing is: (1) a category badge
element in the JS-built card HTML, (2) CSS rules keying off that badge's class to apply category-
specific accent colors, and (3) a mobile 1-column fallback at 640px. The category values observed
in real content are: `시장 이벤트`, `미국 매크로`, `원자재`, `central-bank` (older posts), and
potentially others. A lookup table in `news-grid.js` maps each category string to a CSS class
(e.g. `is-cat-macro`, `is-cat-market`).

**Calendar** (`calendar.css`, `calendar-polish.css`, `renderer.js`) already uses `mp-glass-card`
class on the `.mp-calendar` container and has full light/dark mode overrides. What is missing is:
(1) event-status visual differentiation on the upcoming timeline items (`is-status-released`,
`is-status-closed`, `is-status-scheduled` classes exist in JS but lack distinct CSS styling),
and (2) confirming the CAL-01/CAL-02/CAL-03 success criteria are actually met at render time.

**Charts** (`chart-cards.css`, `render-charts.js`) already have a glass-style `.market-chart-card`
container with `backdrop-filter: blur(12px)`. The `params.toml` already mirrors colors for ECharts
via `[market_pulse.charts.palette]` and `[market_pulse.charts.metric_colors]`. What is missing is
verifying/tightening the sync: the palette values in `params.toml` must match the `custom.css` CSS
variable values, and the light-mode chart card should match the `--mp-glass-bg` token.

**Primary recommendation:** Write one compact plan per subsystem (NEWS, CAL, CHRT), each touching
only the files in its domain. No new files needed — all changes land in existing CSS files plus
minor JS additions (news category lookup). Estimated total: 30-50 CSS lines + ~30 JS lines.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| NEWS-01 | 뉴스 카드를 글래스 카드 스타일로 리디자인 | `.mp-news-card` in briefing-sections.css already has glass styling (backdrop-filter, border, shadow). Verify it matches Phase 3 glass token conventions. May only need token audit + light-mode polish. |
| NEWS-02 | 카테고리별 뱃지/색상 구분 적용 | Category string parsed into `metaParts[2]` in news-grid.js line 65, currently displayed as plain text in `.mp-news-card__meta`. Need: (a) lookup table mapping category strings to CSS class, (b) apply class to card, (c) CSS accent per category. |
| NEWS-03 | 뉴스 카드 호버 효과 (글래스 경계 강조, 그림자 변화) | `.mp-news-card:hover` already has `border-color: rgba(0,240,255,0.4)` and `box-shadow: 0 0 15px rgba(0,240,255,0.15)`. Verify this is sufficient or needs regime-color tinting. |
| NEWS-04 | 뉴스 카드 모바일 레이아웃 최적화 | `.mp-news-grid` is `grid-template-columns: repeat(2, 1fr)` with no mobile breakpoint. Need `@media (max-width: 640px)` override to `grid-template-columns: 1fr`. |
| CAL-01 | 캘린더 컴포넌트를 글래스 카드 스타일로 리디자인 | `renderer.js` already sets `calendar.className = 'mp-calendar mp-glass-card'` and `calendar-polish.css` applies glass styles to `.mp-calendar.mp-glass-card`. Criteria already met; verify CSS token alignment with Phase 1 token system. |
| CAL-02 | 이벤트 상태 시각화 개선 (지남/진행중/예정) | `renderer.js` adds `is-status-released`, `is-status-closed`, `is-status-scheduled` to `.mp-upcoming__item`. CSS for these status variants is missing — only `.mp-status-chip.is-released/.is-closed/.is-scheduled` are styled. Need `.mp-upcoming__item.is-status-*` CSS rules. |
| CAL-03 | 캘린더 다크/라이트 모드 최적화 | calendar-polish.css has extensive `:root:not(.dark)` overrides. Verify `.mp-calendar__cell` and `.mp-upcoming__item` light-mode computed styles are consistent with the Phase 1 glass token values. |
| CHRT-01 | 차트 영역에 글래스 컨테이너 스타일 적용 | `.market-chart-card` in chart-cards.css already has `backdrop-filter: blur(12px)` in dark mode and `backdrop-filter: none` in light mode (line 148). Verify `--mp-chart-card-bg` token value matches `custom.css` definition. Decision: internal `.chart-box` must NOT get backdrop-filter (per prior decision: inner cards use opaque rgba only). |
| CHRT-02 | ECharts 팔레트를 디자인 시스템 컬러와 동기화 (params.toml 업데이트) | `render-charts.js` reads `PALETTE` from `window.MP_CONFIG.charts.palette` which is mirrored from `params.toml [market_pulse.charts.palette]`. Values must match `custom.css` CSS variables. Current audit: `primary="#7C3AED"` matches `--mp-neon-purple`, `cyan="#00F0FF"` matches `--mp-neon-cyan`. Light-mode chart colors (`success_light="#DC2626"`, `danger_light="#2563EB"`) match `--mp-color-up` / `--mp-color-down` in `:root:not(.dark)`. No drift found, but need explicit documentation of the sync. |
| CHRT-03 | 차트 컨테이너 다크/라이트 모드 최적화 | Light-mode: `chart-cards.css :root:not(.dark) .market-chart-card` sets `background: #ffffff`, `backdrop-filter: none`, consistent. Dark-mode: `--mp-chart-card-bg: rgba(10,10,26,0.85)` is set as CSS variable in `custom.css`. Verify `render-charts.js` theme detection uses `.dark` class (not `prefers-color-scheme`). Code confirmed: `isDarkMode()` checks `document.documentElement.classList.contains("dark")` — correct. |
</phase_requirements>

---

## Standard Stack

### Core (no new installs needed)

| Component | Location | Version/Status | Notes |
|-----------|----------|----------------|-------|
| CSS custom properties | `assets/css/custom/custom.css` | Established in Phase 1 | 3-tier token system in place |
| ES5 IIFE JS modules | `static/js/briefing/news-grid.js` | Existing | No bundler, plain JS |
| ECharts | CDN `echarts@5.5.1` | Pinned in params.toml | Cannot read CSS vars directly |
| params.toml color mirror | `config/_default/params.toml` | Existing pattern | CHRT-02 sync lives here |

### No New Libraries

This phase requires zero new library additions. All work is:
- CSS rule additions/modifications in existing files
- Minor JS lookup table in existing `news-grid.js`
- Verification/documentation of existing palette sync

**Installation:** None required.

---

## Architecture Patterns

### Recommended File Structure

```
assets/css/custom/
├── briefing-sections.css    # NEWS-01, NEWS-02, NEWS-03, NEWS-04 changes land here
├── calendar.css             # CAL-02 status CSS rules land here
├── calendar-polish.css      # CAL-01, CAL-03 verification/polish land here
└── chart-cards.css          # CHRT-01, CHRT-03 verification/polish land here

static/js/briefing/
└── news-grid.js             # NEWS-02: category → CSS class lookup table

config/_default/
└── params.toml              # CHRT-02: palette sync documentation/audit
```

### Pattern 1: Category Badge CSS Class Injection (NEWS-02)

**What:** In `news-grid.js`, parse the `category` string from `metaParts[2]`, normalize it to a
CSS-safe class name, and add it to the `.mp-news-card` element. Then CSS rules for each class
provide distinct accent colors.

**When to use:** Whenever upstream data provides a classification string that maps to visual variants.

**JS pattern (in news-grid.js, IIFE scope):**

```javascript
// Category string → CSS class lookup (ES5-compatible)
var CATEGORY_CLASS_MAP = {
  '시장 이벤트': 'is-cat-market',
  '미국 매크로': 'is-cat-macro',
  '원자재': 'is-cat-commodity',
  'central-bank': 'is-cat-central-bank',
  '연준': 'is-cat-central-bank',
  '기업': 'is-cat-corporate',
  '한국 매크로': 'is-cat-kr-macro',
  '크립토': 'is-cat-crypto',
  '외환': 'is-cat-fx',
  '지정학': 'is-cat-geopolitical'
};

function getCategoryClass(category) {
  return CATEGORY_CLASS_MAP[category] || 'is-cat-other';
}
// Then: card.classList.add(getCategoryClass(category));
```

**CSS pattern (in briefing-sections.css):**

```css
/* Category accent colors — applied to source badge */
.mp-news-card.is-cat-market .mp-news-card__source {
  color: var(--mp-neon-cyan);
  background: rgba(0, 240, 255, 0.08);
  border-color: rgba(0, 240, 255, 0.2);
}
.mp-news-card.is-cat-macro .mp-news-card__source {
  color: var(--mp-neon-purple);
  background: rgba(124, 58, 237, 0.1);
  border-color: rgba(124, 58, 237, 0.2);
}
.mp-news-card.is-cat-commodity .mp-news-card__source {
  color: var(--mp-neon-yellow);
  background: rgba(255, 214, 0, 0.08);
  border-color: rgba(255, 214, 0, 0.2);
}
.mp-news-card.is-cat-central-bank .mp-news-card__source {
  color: var(--mp-neon-rose);
  background: rgba(244, 63, 94, 0.08);
  border-color: rgba(244, 63, 94, 0.2);
}
```

**Light-mode overrides must follow:**

```css
:root:not(.dark) .mp-news-card.is-cat-market .mp-news-card__source { ... }
```

### Pattern 2: Status-Keyed Upcoming Item Styling (CAL-02)

**What:** `renderer.js` already adds `is-status-released`, `is-status-closed`, `is-status-scheduled`
classes to `.mp-upcoming__item`. CSS rules are missing for these. Status maps to visual dimming:
past events (`is-status-closed`, `is-status-released`) should appear reduced-opacity or muted;
future events (`is-status-scheduled`) should appear normal.

**JS evidence (renderer.js line 311):**

```javascript
card.classList.add('is-status-' + model.getStatusBadgeClass(status));
// getStatusBadgeClass returns: 'released' | 'closed' | 'scheduled'
```

**CSS pattern (in calendar.css):**

```css
/* Event status visual differentiation */
.mp-upcoming__item.is-status-closed {
  opacity: 0.55;
}
.mp-upcoming__item.is-status-released {
  /* Published data — show normally but with green accent on dot */
}
.mp-upcoming__item.is-status-released .mp-upcoming__dot-line::before {
  background: var(--mp-neon-green);
  box-shadow: 0 0 6px var(--mp-neon-green);
}
.mp-upcoming__item.is-status-scheduled .mp-upcoming__dot-line::before {
  /* default — already cyan in calendar-polish.css */
}
```

### Pattern 3: ECharts Palette Sync via params.toml (CHRT-02)

**What:** ECharts cannot read CSS variables. Colors must be hardcoded in the chart option objects.
The established pattern is: colors live in `params.toml [market_pulse.charts.palette]`, Hugo
injects them into `window.__MP_CONFIG`, `render-charts.js` reads `PALETTE` from config. This means
`params.toml` is the single source of truth for chart colors. CSS variables in `custom.css` and
params.toml values must be manually kept in sync (no automation).

**Sync table (verified from source):**

| CSS Variable | custom.css value | params.toml key | params.toml value | Status |
|-------------|-----------------|-----------------|------------------|--------|
| `--mp-neon-purple` | `#7C3AED` | `palette.primary` | `#7C3AED` | IN SYNC |
| `--mp-neon-cyan` | `#00F0FF` | `palette.cyan` | `#00F0FF` | IN SYNC |
| `--mp-neon-rose` | `#F43F5E` | `palette.pink` | `#FF3366` | NEAR-MISS (F43F5E vs FF3366) |
| `--mp-neon-green` | `#00FF88` | `palette.green` | `#00FF88` | IN SYNC |
| `--mp-neon-yellow` | `#FFD600` | `palette.yellow` | `#FFD600` | IN SYNC |
| `--mp-neon-blue` | `#3388FF` | `palette.blue` | `#3388FF` | IN SYNC |
| `--mp-color-up` (light) | `#DC2626` | `palette.success_light` | `#DC2626` | IN SYNC |
| `--mp-color-down` (light) | `#2563EB` | `palette.danger_light` | `#2563EB` | IN SYNC |
| `--mp-chart-card-bg` | `rgba(10,10,26,0.85)` | `palette.bg` | `#0A0A1A` | PARTIAL (opacity missing in params) |

**Key finding:** The pink/rose color has a slight drift: `--mp-neon-rose: #F43F5E` (CSS) vs
`palette.pink = "#FF3366"` (params.toml). This is the only value where drift exists. CHRT-02
must decide: align params.toml to `#F43F5E`, or align CSS to `#FF3366`, or keep intentional
divergence with documentation.

### Anti-Patterns to Avoid

- **Do not add `backdrop-filter` to `.chart-box` or inner card children.** Prior decision (pre-Phase 1): inner cards use opaque `rgba()` background only; outermost container only gets `backdrop-filter`. The `.market-chart-card` is the outermost — it already has `backdrop-filter: blur(12px)`. Do not propagate inward.
- **Do not use `@media (prefers-color-scheme: dark)`.** All dark/light switching is via `.dark` class on `<html>`. Use `:root:not(.dark)` for light-mode overrides.
- **Do not add `:root {}` or `:root:not(.dark) {}` blocks in component CSS files.** Per Phase 1 plan 02 decision: CSS variable declarations live only in `custom.css`. Component files consume variables, never declare them.
- **Do not add new `window.MP_*` globals** for category state. Category class logic stays in `news-grid.js` IIFE scope.
- **Do not modify news-grid.js parsing logic.** The `metaParts[2]` category extraction already works. Only the class injection and lookup table are new.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Category color differentiation | Custom per-card inline styles | CSS class + lookup table pattern | Per-class CSS is cacheable, overridable by light-mode rules, and maintainable |
| ECharts theme sync | Runtime CSS var reader for ECharts | params.toml mirror (established pattern) | ECharts cannot read CSS variables; this is a known project constraint with established solution |
| Status opacity | JS-driven opacity changes | CSS `is-status-*` classes (already on DOM) | JS already sets the classes; CSS rules are the missing piece |

**Key insight:** Most "missing" features are actually missing CSS rules on DOM classes that JS already emits. The code is more complete than it appears — the gap is CSS, not JS.

---

## Common Pitfalls

### Pitfall 1: backdrop-filter Nesting on News Cards

**What goes wrong:** Adding `backdrop-filter` to `.mp-news-card` when it is already a child of
`.briefing-section` which has `backdrop-filter`. Double-blurring causes GPU composite layer
explosion (8-10 active limit from Phase 5 requirements).

**Why it happens:** The glass card pattern looks like it needs backdrop-filter at every glass
surface, but nesting is prohibited.

**How to avoid:** News cards MUST use opaque `rgba()` backgrounds, not `backdrop-filter`. Current
`briefing-sections.css` already follows this: `.mp-news-card` has `background: var(--mp-glass-bg)`
but `var(--mp-glass-bg)` in dark mode is `rgba(18, 18, 42, 0.72)` — opaque enough. The
`backdrop-filter: var(--mp-glass-blur)` on `.mp-news-card` in the current code (line 244 of
briefing-sections.css) IS a violation of this principle if `briefing-section` also has
backdrop-filter.

**Warning signs:** DevTools Layers panel shows more than 10 compositor layers on briefing post page.

**ACTION REQUIRED:** During implementation, audit whether `.mp-news-card`'s backdrop-filter is
actually firing (parent `.briefing-section` also has backdrop-filter). If nesting is confirmed,
remove `backdrop-filter` from `.mp-news-card` and use higher-opacity `rgba()` background instead.

### Pitfall 2: Category String Normalization

**What goes wrong:** Pipeline outputs category in Korean (`시장 이벤트`), English (`central-bank`),
or neither (empty). Lookup table must handle all cases including empty/null.

**Why it happens:** Older posts use English category strings (`central-bank`), newer posts use
Korean. Both must map to the same visual bucket.

**How to avoid:** Lookup table must include both Korean and English variants for the same category.
Always provide a default class (`is-cat-other`) for unknown categories. Never throw on missing key.

**Warning signs:** Cards with unknown categories show default dark border instead of any accent.

### Pitfall 3: Light-Mode Category Badge Readability

**What goes wrong:** Category badge colors designed for dark mode (neon colors on dark glass) are
unreadable in light mode (neon yellow on white = near-invisible).

**Why it happens:** Neon colors like `#FFD600` (yellow) and `#00FF88` (green) have insufficient
contrast on `rgba(255,255,255,0.9)` backgrounds.

**How to avoid:** Every category CSS class MUST have a `:root:not(.dark)` counterpart with
adjusted colors. Reference: `--mp-neon-cyan` becomes `#0891B2` in light mode (already in
custom.css). Apply same desaturation strategy: neon → darker saturated equivalent.

**Warning signs:** Category badges look "washed out" or invisible when site is in light mode.

### Pitfall 4: Calendar Event Status Opacity in Light Mode

**What goes wrong:** `opacity: 0.55` on past events (`is-status-closed`) looks fine in dark mode
but creates readability issues on the already-light background of the calendar in light mode.

**How to avoid:** Test `is-status-closed` opacity in light mode before finalizing. If too low,
use `opacity: 0.7` in light mode via `:root:not(.dark)` override.

### Pitfall 5: params.toml Color Drift Goes Unnoticed

**What goes wrong:** Developer updates `--mp-neon-rose` in `custom.css` but forgets to update
`palette.pink` in `params.toml`. Charts then use a different pink than the rest of the UI.

**Why it happens:** There is no automated sync between CSS variables and params.toml. Manual
discipline required.

**How to avoid:** When CHRT-02 plan runs, add a code comment above the palette section in
`params.toml` documenting which CSS variable each color corresponds to. This makes future drift
visible.

---

## Code Examples

Verified patterns from existing codebase:

### Existing Glass Card Pattern (for reference)

```css
/* Source: assets/css/custom/briefing-sections.css lines 238-257 */
.mp-news-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--mp-glass-bg);
  -webkit-backdrop-filter: var(--mp-glass-blur);
  backdrop-filter: var(--mp-glass-blur);
  border: 1px solid var(--mp-glass-border);
  border-radius: var(--mp-radius-md);
  padding: 1rem 1.25rem;
  box-shadow: var(--mp-shadow-sm);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.mp-news-card:hover {
  transform: translateY(-1px);
  border-color: rgba(0, 240, 255, 0.4);
  box-shadow: 0 0 15px rgba(0, 240, 255, 0.15);
}
```

### Existing Calendar Glass Card (for reference)

```css
/* Source: assets/css/custom/calendar-polish.css lines 25-39 */
.mp-calendar.mp-glass-card {
  background: var(--mp-glass-bg);
  -webkit-backdrop-filter: var(--mp-glass-blur);
  backdrop-filter: var(--mp-glass-blur);
  border: 1px solid var(--mp-glass-border);
  box-shadow: var(--mp-shadow-sm);
  border-radius: var(--mp-radius-lg);
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
}
```

### ECharts Dark Mode Detection (for reference)

```javascript
/* Source: static/js/render-charts.js lines 50-55 */
function isDarkMode() {
  return (
    document.documentElement.classList.contains("dark") ||
    document.body.classList.contains("dark")
  );
}
```

### Regime Color Injection Pattern (Phase 3, for reference)

```javascript
/* Source: static/js/ambient-orbs.js — applyRegime() pattern */
docRoot.style.setProperty('--regime-color-rgb', KR_TINT_RGB[regime]);
docRoot.classList.add('regime-loaded');
```

### Mobile Grid Breakpoint Pattern (for reference, from custom.css)

```css
/* Pattern: news grid needs this added for NEWS-04 */
@media (max-width: 640px) {
  .mp-news-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | Status | Impact on Phase 4 |
|--------------|------------------|--------|-------------------|
| All category colors hardcoded inline | CSS class-based category accent (to be added) | Adding in Phase 4 | NEWS-02 |
| Calendar status classes without CSS rules | Status classes + CSS rules | Adding in Phase 4 | CAL-02 |
| Manual color copy between CSS and ECharts | params.toml as mirror (established) | Verify + document | CHRT-02 |
| `backdrop-filter` on inner cards | Opaque rgba() only on inner cards | Active constraint — audit needed | CHRT-01, NEWS-01 |

---

## Open Questions

1. **NEWS-01: Is `.mp-news-card`'s `backdrop-filter` a nested violation?**
   - What we know: `.mp-news-card` currently has `backdrop-filter: var(--mp-glass-blur)` in
     briefing-sections.css (line 244). Its parent `.briefing-section` also has `backdrop-filter`.
   - What's unclear: Whether both fire simultaneously or if browser optimizes away inner one.
   - Recommendation: During implementation, use DevTools > Layers panel to count compositor
     layers on a briefing post page. If >8, remove backdrop-filter from `.mp-news-card` and
     use `background: rgba(18, 18, 42, 0.85)` (opaque) instead. This decision also has Phase 5
     performance implications (PERF-02).

2. **CHRT-02: pink/rose color drift — align to which value?**
   - What we know: `--mp-neon-rose: #F43F5E` (CSS) vs `palette.pink = "#FF3366"` (params).
     `#FF3366` is `--mp-neon-pink` in CSS (different variable).
   - What's unclear: Which is "correct" — is the chart meant to use neon-rose or neon-pink?
     `render-charts.js` uses `COLORS.pink` for the "down/danger" line color on charts.
   - Recommendation: Align `palette.pink` in params.toml to `#F43F5E` (neon-rose) since it
     is used as the Korean bull/danger color. If `#FF3366` is intentionally different (hotter
     pink for charts), document that explicitly.

3. **NEWS-02: Category vocabulary completeness**
   - What we know: Observed categories: `시장 이벤트`, `미국 매크로`, `원자재`, `central-bank`.
     Likely also present: `기업`, `연준`, `크립토`, `외환`, `지정학`.
   - What's unclear: The full upstream publisher vocabulary. New categories appear as pipeline
     evolves.
   - Recommendation: Lookup table should have a `default` fallback class (`is-cat-other`) so
     unmapped categories still render gracefully. Do not fail or throw on unknown categories.

---

## Sources

### Primary (HIGH confidence — read from source files)

- `assets/css/custom/briefing-sections.css` — News card CSS: `.mp-news-card`, `.mp-news-grid`, hover, source badge (lines 231-378)
- `assets/css/custom/calendar.css` — Calendar grid, status chips, upcoming list (full file)
- `assets/css/custom/calendar-polish.css` — Glass card override for `.mp-calendar.mp-glass-card`, filter pills, light-mode overrides (full file)
- `assets/css/custom/chart-cards.css` — `.market-chart-card` glass container (full file)
- `assets/css/custom/custom.css` — CSS variable definitions for all tokens (lines 39-133)
- `static/js/briefing/news-grid.js` — Category parsing: `metaParts[2]` extraction (line 65), card HTML build (lines 68-73)
- `static/js/calendar/renderer.js` — Status class injection `is-status-*` (lines 310-312), glass card class assignment (line 42)
- `static/js/render-charts.js` — `COLORS` and `METRIC_COLORS` objects (lines 17-48), `isDarkMode()` (lines 50-55), ECharts theme (lines 61-101)
- `config/_default/params.toml` — `[market_pulse.charts.palette]` and `[market_pulse.charts.metric_colors]` (lines 121-145)
- `content/posts/*.md` — Actual category strings used in production: `시장 이벤트`, `미국 매크로`, `원자재`, `central-bank`
- `.planning/phases/03-background-regime/03-02-SUMMARY.md` — Regime color chain, `.regime-loaded` guard pattern
- `.planning/REQUIREMENTS.md` — Phase 4 requirement status (all pending)
- `.planning/ROADMAP.md` — Phase 4 goal and success criteria

### Secondary (MEDIUM confidence — architectural docs)

- `.planning/codebase/ARCHITECTURE.md` — JS module namespace pattern, data flow, ES5 IIFE convention
- `.planning/codebase/CONCERNS.md` — News card XSS concern (innerHTML), backdrop-filter nesting risk

---

## Metadata

**Confidence breakdown:**
- News card gap analysis: HIGH — source files read directly; gaps confirmed by code inspection
- Calendar status CSS gap: HIGH — renderer.js class assignment and CSS absence both confirmed
- ECharts palette sync: HIGH — params.toml and custom.css values cross-referenced manually
- Category vocabulary: MEDIUM — observed from existing posts; full upstream vocabulary unknown
- backdrop-filter nesting risk: MEDIUM — code confirmed, browser behavior requires DevTools validation

**Research date:** 2026-02-19
**Valid until:** 2026-03-20 (stable domain — CSS/JS; no external library changes)
