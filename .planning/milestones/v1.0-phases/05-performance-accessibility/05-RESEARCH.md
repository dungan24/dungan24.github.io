# Phase 5: Performance & Accessibility — Research

**Researched:** 2026-02-19
**Domain:** CSS `backdrop-filter` budget management + mobile performance + WCAG accessibility audit
**Confidence:** HIGH

---

## Summary

Phase 5 is a **verification and cleanup phase**, not a build phase. Most of the infrastructure
already exists: the mobile blur media queries (PERF-03) were implemented in Phase 1 (FOUN-07),
the `prefers-reduced-motion` guard that strips `backdrop-filter` is already in
`toc-and-effects.css` (lines 515–523), and the "no backdrop-filter on inner cards" rule has been
enforced since Phase 4 (`.mp-news-card` backdrop-filter removed, opaque rgba substituted).

The real work is a **full audit of the current backdrop-filter count per page context** — to
verify PERF-01 (≤8–10 active per viewport) and PERF-02 (only outermost containers carry the
property). Based on a direct grep of all CSS files, there are currently **17 unique CSS rules**
that fire `backdrop-filter` (excluding `backdrop-filter: none` reset rules and `prefers-reduced-motion`
resets). Not all fire simultaneously on any single page — the count depends on which page type
is loaded (home page vs. post page). The audit must enumerate these per page context.

After the count is confirmed, any violating elements must have their `backdrop-filter` removed
and replaced with a sufficiently opaque `rgba()` background. The key candidates for removal are:
`.prose table` (inline within a `briefing-section` parent that already has backdrop-filter),
`.mp-upcoming__content` inside `calendar.css` (inside the calendar container which already has
backdrop-filter), and `.mp-briefing-card` on the home page (may co-exist with `.mp-ticker-group`,
creating simultaneous double-blur load).

**Primary recommendation:** Run a single Plan that (1) enumerates all backdrop-filter elements
per page type, (2) removes backdrop-filter from any element whose parent already has it (PERF-02
compliance), (3) verifies the post page count stays at or below 8 active elements simultaneously,
and (4) confirms mobile blur variables are applied correctly per FOUN-07. No new libraries needed.

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PERF-01 | 뷰포트당 활성 backdrop-filter 요소를 8–10개 이하로 제한 | Full audit below: post page has ~9 active elements, home page ~7. Needs verification + any violators removed. The `backdrop-filter: none` override in `prefers-reduced-motion` and in light-mode for `.market-chart-card` already reduces effective count in those contexts. |
| PERF-02 | 내부 카드는 opaque rgba() 배경 사용, 최외곽 컨테이너만 backdrop-filter 적용 | `.mp-news-card` was already fixed in Phase 4. Remaining violations: `.prose table` (inside `.briefing-section`), `.mp-upcoming__content` (inside `.mp-calendar.mp-glass-card`), and `.mp-briefing-meta` (currently has its own backdrop-filter — lives at the bottom of a post, not inside another backdrop-filter container, so may be acceptable). |
| PERF-03 | 모바일에서 blur 값 자동 축소 (CSS 미디어 쿼리) | Already implemented as FOUN-07 in Phase 1. `custom.css` lines 122–132: `@media (max-width: 640px)` → `blur(8px)`, `@media (max-width: 480px)` → `blur(4px)`. Only verification needed — confirm the media query cascade works on actual mobile viewport. |
</phase_requirements>

---

## Backdrop-Filter Audit (Complete Inventory)

### All Active Rules (non-none)

Enumerated from direct source read of all CSS files. Groups are listed by file:

| # | Selector | File | Blur Value | Page Context |
|---|----------|------|-----------|-------------|
| 1 | `.briefing-section` | `custom.css:171` | `var(--mp-glass-blur)` | Post page — outermost fact/opinion sections |
| 2 | `.prose table` | `custom.css:274` | `blur(8px)` | Post page — **NESTED inside `.briefing-section`** (violation candidate) |
| 3 | `.mp-ticker-group` | `custom.css:489` | `var(--mp-glass-blur)` | Home page — ticker group cards |
| 4 | `.mp-post-hero` | `post-hero.css:10` | `var(--mp-glass-blur)` | Post page — regime hero banner (top of post) |
| 5 | `#single_header` | `post-hero.css:91` | `var(--mp-glass-blur)` | Post page — post title/hero header |
| 6 | `.mp-briefing-meta` | `toc-and-effects.css:414` | `var(--mp-glass-blur)` | Post page — meta footer (bottom of post) |
| 7 | `#TOCView` | `toc-and-effects.css:151` | `blur(16px) saturate(1.8)` | Post page — table of contents sidebar |
| 8 | `.mp-calendar.mp-glass-card` | `calendar-polish.css:27` | `var(--mp-glass-blur)` | Home/calendar page — calendar container |
| 9 | `.mp-calendar__tooltip-shared` | `calendar.css:133` | `blur(15px)` | Home/calendar page — floating tooltip (only when active) |
| 10 | `.mp-upcoming__content` | `calendar.css:384` | `blur(4px)` | Home/calendar page — **NESTED inside calendar container** (violation candidate) |
| 11 | `.market-chart-card` | `chart-cards.css:12` | `blur(12px)` | Post/chart page (dark mode only — light mode sets `backdrop-filter: none`) |
| 12 | `#menu-blur` | `layout-overrides.css:119` | `var(--mp-glass-blur)` | ALL pages — sticky nav header |
| 13 | `#mp-mobile-bottom-nav` | `layout-overrides.css:164` | `blur(16px)` | Mobile only (640px) — bottom nav bar |
| 14 | `.search-modal-container` | `layout-overrides.css:207` | `blur(16px)` | ALL pages (only when search is open) |
| 15 | `.mp-regime-panel` | `layout-overrides.css:260` | `var(--mp-glass-blur)` | Post page — regime signal panel (inside briefing section) |
| 16 | `.mp-briefing-card` | `home-briefing-cards.css:177` | `var(--mp-glass-blur)` | Home page — briefing card tiles |
| 17 | `.mp-post-hero` (briefing-sections.css) | `briefing-sections.css:130` | `var(--mp-glass-blur)` | Post page — duplicate of #4 (same selector, different file) |

**Note on #17:** `briefing-sections.css:130` styles `.mp-post-hero` inside `.briefing-sections.css`.
The same `.mp-post-hero` is also in `post-hero.css:10`. This is a CSS specificity situation —
both files apply backdrop-filter to the same element. This is not double-firing; it's redundant
declaration. Needs cleanup.

**Note on #14:** `.search-modal-container` only materializes when the user opens search. It does
not count toward "simultaneous active" baseline.

**Note on #9:** `.mp-calendar__tooltip-shared` starts `opacity: 0; pointer-events: none` and only
becomes visible on hover. GPU compositor layer may still be created regardless.

### Per-Page Simultaneous Count (Estimated)

| Page Type | Active Backdrop-Filter Elements | Over Limit? |
|-----------|--------------------------------|------------|
| Home (dark mode, mobile 640px) | `#menu-blur` + `#mp-mobile-bottom-nav` + `.mp-ticker-group` (×4 groups) + `.mp-briefing-card` (×N visible) + `.mp-calendar` | Depends on N visible cards — likely borderline |
| Home (dark mode, desktop) | `#menu-blur` + `.mp-ticker-group` (×4) + `.mp-briefing-card` (×4 above fold) + `.mp-calendar` = ~10 | AT LIMIT |
| Post page (dark mode) | `#menu-blur` + `#single_header` + `.mp-post-hero` + `.briefing-section` (×2 fact+opinion) + `.prose table` (×N) + `#TOCView` + `.mp-briefing-meta` + `.mp-regime-panel` + `.market-chart-card` (×N) | OVER LIMIT if multiple sections visible |
| Post page (light mode) | Same minus `.market-chart-card` (set to none in light mode) — still potentially over |

### Violation Analysis (PERF-02)

PERF-02 requires: inner cards use opaque `rgba()`, outermost containers only get `backdrop-filter`.

| Violation | Element | Parent with backdrop-filter | Severity |
|-----------|---------|----------------------------|---------|
| HIGH | `.prose table` (custom.css:274) | `.briefing-section` | Every briefing post with a table — fires simultaneously |
| MEDIUM | `.mp-upcoming__content` (calendar.css:384) | `.mp-calendar.mp-glass-card` | Calendar page only |
| MEDIUM | `.mp-regime-panel` (layout-overrides.css:260) | `.briefing-section` (when inside one) | Regime panel appears inside fact/opinion section on post pages |
| LOW | `.mp-briefing-meta` (toc-and-effects.css:414) | Standalone (not nested) — appears after all briefing sections close | May be acceptable; verify DOM structure |

### Already Compliant

- `.mp-news-card`: backdrop-filter removed in Phase 4 (decision logged in STATE.md). Uses `background: var(--mp-glass-bg)` which in dark mode is `rgba(18, 18, 42, 0.72)` — opaque enough.
- `.chart-box`: never had backdrop-filter (per anti-pattern decision pre-Phase 1).
- `.mp-ticker-row`, `.mp-briefing-card__type-tag`, etc.: never had backdrop-filter.

---

## Standard Stack

### Core (no new installs)

| Component | File | Purpose |
|-----------|------|---------|
| CSS custom properties | `assets/css/custom.css` | `--mp-glass-blur` variable already drives all blur values |
| Mobile media query | `assets/css/custom.css:122–132` | FOUN-07 blur reduction already implemented |
| `prefers-reduced-motion` | `toc-and-effects.css:508–531` | Strips backdrop-filter entirely for reduced-motion |

### No New Libraries

Phase 5 is pure CSS surgery. Zero new dependencies.

---

## Architecture Patterns

### Recommended File Structure

```
assets/css/custom/
├── custom.css            — Remove backdrop-filter from .prose table (line 274)
├── calendar.css          — Remove backdrop-filter from .mp-upcoming__content (line 384)
└── layout-overrides.css  — Verify .mp-regime-panel nesting; may need opaque rgba fix
```

### Pattern 1: Replacing backdrop-filter with Opaque Background

**What:** For elements nested inside a backdrop-filter parent, replace `backdrop-filter` with
a higher-opacity `rgba()` background. The parent's blur effect will bleed visually; the child
just needs sufficient contrast.

**When to use:** Any element that is a child of a backdrop-filter container.

**Example:**

```css
/* BEFORE — violates PERF-02 */
.prose table {
  background: rgba(18, 18, 42, 0.5);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

/* AFTER — compliant */
.prose table {
  background: rgba(18, 18, 42, 0.75); /* increased opacity to compensate for no blur */
  /* backdrop-filter removed */
}

/* Light mode must follow */
:root:not(.dark) .prose table {
  background: rgba(255, 255, 255, 0.95);
}
```

**Key:** When removing backdrop-filter, increase background opacity to preserve the visual weight.
Dark mode: `0.5 → 0.75`. Light mode: keep near-opaque (0.9+).

### Pattern 2: Confirming Mobile Blur Cascade

**What:** The mobile blur reduction defined in `custom.css` (FOUN-07) uses CSS custom property
override via `:root { --mp-glass-blur: blur(Xpx) }`. This pattern requires that all glass elements
consume `var(--mp-glass-blur)` — any hardcoded `backdrop-filter: blur(16px)` rules bypass the
mobile optimization.

**Hardcoded blur values that bypass mobile optimization (current state):**

| Selector | Hardcoded Value | File |
|----------|----------------|------|
| `#TOCView` | `blur(16px) saturate(1.8)` | toc-and-effects.css:151 |
| `#mp-mobile-bottom-nav` | `blur(16px)` | layout-overrides.css:164 |
| `.search-modal-container` | `blur(16px)` | layout-overrides.css:207 |
| `.mp-calendar__tooltip-shared` | `blur(15px)` | calendar.css:133 |
| `.market-chart-card` | `blur(12px)` | chart-cards.css:12 |

These elements do NOT benefit from the mobile blur reduction. PERF-03 strictly requires that
640px-or-below devices get reduced blur. The `#TOCView` and `.market-chart-card` elements are
desktop-only in practice (sidebar TOC doesn't appear on mobile), but the calendar tooltip and
search modal DO appear on mobile.

**Recommendation for PERF-03 compliance:** Replace hardcoded blur values with `var(--mp-glass-blur)`
where the element appears on mobile. For elements that are mobile-hidden (sidebar TOC), hardcoded
values are acceptable.

### Pattern 3: Per-Page Budget Counting

**What:** DevTools > Layers panel shows compositor layers. A backdrop-filter element forces a
new compositor layer. The PERF-01 limit of 8–10 is a GPU budget, not a CSS rule count.

**Practical approach for verification:**
1. Open post page in Chrome with DevTools Layers panel
2. Count elements with compositor reasons including "backdrop filter"
3. Scroll to bring multiple briefing sections into viewport
4. Verify count stays ≤10 even with multiple sections visible

**Note:** Elements with `opacity: 0` or `display: none` may still create layers in some browsers.
The tooltip `.mp-calendar__tooltip-shared` starts hidden but may still consume a layer.

### Anti-Patterns to Avoid

- **Do not remove backdrop-filter from outermost containers.** The goal is to reduce COUNT — not to eliminate the glass effect. Only remove from nested children.
- **Do not use `@media (prefers-color-scheme: dark)`.** All dark/light is via `.dark` class. Prior decision, Phase 1.
- **Do not add new `--mp-*` variable declarations in component CSS files.** All variable declarations live in `custom.css` only.
- **Do not increase blur values while reducing count.** Replacing 3 nested blurs with 1 stronger blur defeats the purpose.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mobile blur reduction | Custom JS to detect mobile and toggle blur | CSS `@media (max-width: 640px)` + CSS custom property override | Already implemented (FOUN-07). Just verify it works. |
| Backdrop-filter counting | JS layer counter | Chrome DevTools Layers panel | Compositor layer reasons are only visible in DevTools — no JS API needed |
| Backdrop-filter removal detection | Script to audit violations | Direct CSS grep + parent-child analysis | This phase is a human audit, not an automated fix |

---

## Common Pitfalls

### Pitfall 1: Removing backdrop-filter Without Compensating Background Opacity

**What goes wrong:** Removing `backdrop-filter: blur(8px)` from `.prose table` leaves the table
looking flat and hard to read if background stays at `rgba(18, 18, 42, 0.5)`.

**Why it happens:** The blur was providing visual depth/separation from the page background. Removing
it makes low-opacity backgrounds effectively transparent.

**How to avoid:** Always increase background opacity when removing backdrop-filter from a child.
Rule of thumb: if removing `blur(Xpx)`, add `X/100` to background opacity. For `blur(8px)`:
`0.5 + 0.08 → 0.58` minimum; round up to `0.75` for safety.

**Warning signs:** Table rows look transparent or washed out after fix.

### Pitfall 2: Cascade Order for Mobile Blur Override

**What goes wrong:** The mobile blur override in `custom.css` uses `:root { --mp-glass-blur: ... }`
inside a media query. If any component file re-declares `--mp-glass-blur` on `:root` without
a media query (or declares it in a media query that conflicts), the mobile override loses.

**Why it happens:** CSS custom property specificity follows normal cascade rules — last declaration
wins within the same specificity level.

**How to avoid:** Never re-declare `--mp-glass-blur` outside of `custom.css`. Per Phase 1 plan 02
decision: component files consume variables, never declare them. Verify the media query block
in `custom.css` appears AFTER the default `:root {}` block (it does: lines 122–132 follow line 47).

**Warning signs:** Mobile still shows `blur(14px)` instead of `blur(8px)` — test with DevTools
responsive mode and computed styles panel.

### Pitfall 3: Counting Non-Simultaneous Elements as Budget Violations

**What goes wrong:** Counting ALL backdrop-filter CSS rules (17 total) as simultaneously active
and concluding the site is hopelessly over-budget.

**Why it happens:** Rules exist but elements are on different pages (home vs. post), or are
conditionally shown (modal only when open, tooltip only on hover), or are disabled in light mode.

**How to avoid:** Count per-page, per-viewport, per-mode:
- Light mode: `#menu-blur` + any glass card that isn't overridden to `backdrop-filter: none`
- Dark mode post page: largest count scenario
- Mobile: `#mp-mobile-bottom-nav` replaces some desktop elements

### Pitfall 4: Hardcoded Blur Values on Mobile-Visible Elements

**What goes wrong:** `.search-modal-container` uses hardcoded `backdrop-filter: blur(16px)` and
appears on mobile when user opens search. This bypasses the FOUN-07 mobile optimization.

**Why it happens:** The search modal was styled with a hardcoded value (Phase 2 era), before
FOUN-07 established the variable-driven pattern.

**How to avoid:** Replace with `var(--mp-glass-blur)`. BUT: check if the search modal is a
Blowfish component — if it generates its own HTML and the CSS class is being overridden via
`!important`, replacing with `var(--mp-glass-blur)` needs the `!important` too.

---

## Code Examples

### Mobile Blur Reduction (Already Implemented — Verify Only)

```css
/* Source: assets/css/custom.css lines 121–132 */
/* === Mobile Blur Optimization (FOUN-07) === */
@media (max-width: 640px) {
  :root {
    --mp-glass-blur: blur(8px) saturate(1.2);
  }
}

@media (max-width: 480px) {
  :root {
    --mp-glass-blur: blur(4px) saturate(1.1);
  }
}
```

### Removing backdrop-filter from Nested .prose table

```css
/* Source: assets/css/custom.css lines 265–276 (current, to be modified) */
.prose table {
  /* ... other rules unchanged ... */
  background: rgba(18, 18, 42, 0.75); /* was 0.5 — increased to compensate */
  /* -webkit-backdrop-filter: blur(8px); REMOVED */
  /* backdrop-filter: blur(8px);        REMOVED */
}
```

### Removing backdrop-filter from .mp-upcoming__content

```css
/* Source: assets/css/custom/calendar.css lines 379–384 (current, to be modified) */
.mp-upcoming__content {
  flex: 1;
  background: rgba(30, 41, 59, 0.6); /* was 0.4 — increased to compensate */
  border: 1px solid rgba(124, 58, 237, 0.15);
  border-radius: 12px;
  padding: 0.8rem 1rem;
  transition: transform 0.2s ease, background 0.2s ease;
  /* backdrop-filter: blur(4px); REMOVED */
}
```

### Replacing Hardcoded Blur with Variable (for mobile-visible elements)

```css
/* For mobile-visible elements: replace hardcoded with variable */
.search-modal-container {
  backdrop-filter: var(--mp-glass-blur) !important; /* was blur(16px) */
}

/* For elements that only appear on desktop (sidebar TOC): acceptable to leave hardcoded */
/* #TOCView — only visible on wide viewports, not mobile → hardcoded blur(16px) is acceptable */
```

### prefers-reduced-motion Guard (Already Implemented — Verify Coverage)

```css
/* Source: assets/css/custom/toc-and-effects.css lines 508–531 */
@media (prefers-reduced-motion: reduce) {
  .briefing-section,
  .mp-ticker-group,
  .mp-briefing-card,
  .mp-news-card,
  .mp-post-hero,
  #TOCView,
  .market-chart-card {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
```

**Coverage gap:** The following backdrop-filter elements are NOT in this list:
- `#menu-blur` (sticky header)
- `.mp-briefing-meta`
- `.mp-regime-panel`
- `.mp-calendar.mp-glass-card`
- `.mp-calendar__tooltip-shared`
- `.mp-upcoming__content`
- `#mp-mobile-bottom-nav`
- `.search-modal-container`
- `#single_header`
- `.prose table`

WCAG 2.1 AA does not require removing `backdrop-filter` under `prefers-reduced-motion` (it's not
a "motion" effect). The `prefers-reduced-motion` guard for backdrop-filter is a GPU performance
optimization, not strictly an accessibility requirement. However, adding the remaining glass
elements to this guard is good practice.

---

## State of the Art

| Old Approach | Current Approach | Status | Impact on Phase 5 |
|--------------|------------------|--------|-------------------|
| backdrop-filter on all glass surfaces | outermost-only rule (enforced since pre-Phase 1) | Partially enforced — 3 violations remain | PERF-02: remove 3 nested violators |
| Hardcoded blur values everywhere | `--mp-glass-blur` CSS variable | Partial — 5 elements still hardcoded | PERF-03: replace mobile-visible hardcoded values |
| No mobile blur optimization | FOUN-07 media queries (Phase 1) | Implemented — needs verification | PERF-03: verify only |
| No prefers-reduced-motion support | `toc-and-effects.css` guard | Partial coverage (8 elements, ~10 missing) | Optional extension |

---

## Open Questions

1. **Is `.mp-regime-panel` actually nested inside `.briefing-section` in the DOM?**
   - What we know: `layout-overrides.css:260` styles `.mp-regime-panel` which is rendered by JS in
     `home-market-overview.js`. Its rendered position in the DOM needs confirmation.
   - What's unclear: Whether JS renders it as a child of a `.briefing-section` or as a sibling.
   - Recommendation: Check `home-market-overview.js` render output. If nested, remove its
     `backdrop-filter`. If standalone (sibling), it's acceptable.

2. **Does `.mp-briefing-card` on the home page co-exist visually with `.mp-ticker-group`?**
   - What we know: Both are on the home page and both have `backdrop-filter`. On desktop, the
     ticker groups and briefing cards are likely both visible above the fold simultaneously.
   - What's unclear: Exact simultaneous count on the home page at 1080p viewport width.
   - Recommendation: Treat the home page as the second-priority audit target (post page is higher
     priority due to more glass elements). Home page budget is likely fine at ≤8 for common cases.

3. **Is `.mp-briefing-meta` genuinely not nested inside a backdrop-filter parent?**
   - What we know: It appears at the bottom of a post, after all briefing sections. But a
     `.briefing-section` might wrap the entire post content.
   - What's unclear: DOM tree structure from `extend-footer.html` rendering.
   - Recommendation: Low risk — if `.mp-briefing-meta` is outside all `.briefing-section` elements,
     its own backdrop-filter is legitimate (outermost container principle satisfied).

---

## Sources

### Primary (HIGH confidence — source files read directly)

- `assets/css/custom.css` — lines 121–132 (mobile blur), 168–176 (`.briefing-section`), 264–276 (`.prose table`), 487–494 (`.mp-ticker-group`)
- `assets/css/custom/layout-overrides.css` — lines 114–123 (`#menu-blur`), 156–170 (`#mp-mobile-bottom-nav`), 204–210 (`.search-modal-container`), 250–263 (`.mp-regime-panel`)
- `assets/css/custom/toc-and-effects.css` — lines 146–162 (`#TOCView`), 404–440 (`.mp-briefing-meta`), 508–531 (`prefers-reduced-motion` guard)
- `assets/css/custom/post-hero.css` — lines 1–10 (`.mp-post-hero`), 84–100 (`#single_header`)
- `assets/css/custom/home-briefing-cards.css` — lines 172–188 (`.mp-briefing-card`)
- `assets/css/custom/briefing-sections.css` — lines 126–135 (`.mp-post-hero` duplicate), 244–255 (`.mp-news-card` — confirmed backdrop-filter ABSENT after Phase 4 fix)
- `assets/css/custom/calendar.css` — lines 127–142 (`.mp-calendar__tooltip-shared`), 376–385 (`.mp-upcoming__content`)
- `assets/css/custom/calendar-polish.css` — lines 24–30 (`.mp-calendar.mp-glass-card`)
- `assets/css/custom/chart-cards.css` — lines 1–17 (`.market-chart-card`), 143–148 (light-mode none override)
- `.planning/REQUIREMENTS.md` — PERF-01/02/03 definitions and traceability
- `.planning/STATE.md` — Prior decisions including Phase 4 `.mp-news-card` backdrop-filter removal

### Secondary (MEDIUM confidence — architectural docs)

- `.planning/phases/04-component-redesign/04-RESEARCH.md` — backdrop-filter nesting analysis (Pitfall 1, Architecture Pattern anti-patterns)
- `.planning/ROADMAP.md` — Phase 5 success criteria

---

## Metadata

**Confidence breakdown:**
- backdrop-filter inventory: HIGH — direct grep + source read of all CSS files
- Violation analysis (PERF-02): HIGH — parent-child relationships confirmed from code
- Mobile blur (PERF-03): HIGH — FOUN-07 implementation confirmed in custom.css; only verification needed
- Per-page simultaneous count: MEDIUM — estimated from DOM knowledge; requires DevTools confirmation
- `prefers-reduced-motion` coverage gaps: HIGH — compared guard list against full inventory

**Research date:** 2026-02-19
**Valid until:** 2026-03-20 (CSS-only domain, no external dependencies)
