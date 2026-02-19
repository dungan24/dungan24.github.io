# Architecture Research

**Domain:** Glassmorphism design system on Hugo static site (Blowfish theme)
**Researched:** 2026-02-19
**Confidence:** HIGH (existing codebase fully inspected, key patterns verified against official docs)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                     BUILD TIME (Hugo)                                 │
│                                                                        │
│  config/_default/params.toml                                           │
│  ├── [market_pulse.charts.palette]  ← color primitives                │
│  ├── [market_pulse.colors.regime]   ← semantic regime colors           │
│  └── [market_pulse.external]        ← CDN URLs                         │
│                      │                                                 │
│  assets/css/custom.css              ← :root token declarations         │
│  assets/css/custom/*.css            ← component stylesheets            │
│  assets/css/schemes/cyberpunk.css   ← Blowfish color scheme            │
│                      │                                                 │
│  Hugo Pipes: resources.Get → Minify → Fingerprint (sha512)             │
│                      │                                                 │
│  layouts/partials/extend-head-uncached.html                            │
│  └── loads each CSS file individually (ordered slice)                  │
└───────────────────────────────┬──────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     RUNTIME (Browser)                                 │
│                                                                        │
│  window.__MP_CONFIG (injected from params.toml via jsonify)            │
│  └── colors, palette, charts, behavior, labels                         │
│                                                                        │
│  window.__MP_PAGE (injected per-post from front matter)                │
│  └── regime, regimeIcon, summary, chartData                            │
│                                                                        │
│  CSS layer (tokens cascade):                                           │
│  :root { --mp-* tokens }       ← dark mode defaults                    │
│  :root:not(.dark) { ... }      ← light mode overrides                  │
│  .dark { ... }                 ← Blowfish dark class overrides         │
│                                                                        │
│  JS runtime (post-DOM-ready):                                          │
│  static/js/briefing/*.js       ← MPBriefing namespace (IIFE)           │
│  static/js/render-charts.js    ← MPCharts namespace                    │
│  market-pulse-enhancements.js  ← orchestrator, reads __MP_CONFIG       │
│  └── CSS vars overridden at runtime: --regime-color, --regime-color-rgb│
└──────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Communicates With |
|-----------|----------------|-------------------|
| `config/_default/params.toml` | Single source of truth for color primitives and semantic values | Feeds `window.__MP_CONFIG` via `extend-head-uncached.html` |
| `assets/css/custom.css` | Declares all `:root` CSS custom properties (token layer 1 + 2) | Read by all `custom/*.css` files |
| `assets/css/custom/*.css` | Component-scoped styles that consume tokens (token layer 3) | Loaded after `custom.css`, reads `--mp-*` vars |
| `assets/css/schemes/cyberpunk.css` | Blowfish RGB palette for its Tailwind-derived system | Read by Blowfish internals; separate from `--mp-*` |
| `layouts/partials/extend-head-uncached.html` | CSS loader + data bridge (`__MP_CONFIG`, `__MP_PAGE`) | Injects into every page `<head>` |
| `static/js/briefing/*.js` | DOM transforms: section wrapping, news grid, regime hero, TOC, etc. | Reads `window.__MP_CONFIG`, manipulates CSS classes |
| `static/js/render-charts.js` | ECharts instantiation with JS-resolved color values | Reads `__MP_CONFIG.charts.palette`, sets `--regime-color` at runtime |
| `static/js/market-pulse-enhancements.js` | Orchestrator: wires all briefing JS modules, sets regime CSS vars | Reads both `MPBriefing.*` and `window.__MP_CONFIG` |

---

## Recommended Project Structure

The existing structure is already well-organized. The glassmorphism design system adds one new concept layer without restructuring:

```
assets/
├── css/
│   ├── custom.css                   # Token Layer 1+2: :root primitives & semantic vars
│   │                                  (already exists — EXTEND, don't replace)
│   ├── schemes/
│   │   └── cyberpunk.css            # Blowfish RGB system (separate from mp-* tokens)
│   └── custom/
│       ├── _tokens.css              # NEW: glass-specific token declarations
│       │                              (imported indirectly via load order)
│       ├── briefing-sections.css    # Component: uses --mp-glass-* tokens
│       ├── chart-cards.css          # Component: uses --mp-glass-* tokens
│       ├── calendar.css             # Component: uses --mp-glass-* tokens
│       ├── home-market-overview.css # Component: uses --mp-glass-* tokens
│       ├── skeleton.css             # Component: uses --mp-glass-* tokens
│       └── [other existing files]   # All already consume --mp-glass-bg etc.
config/
└── _default/
    └── params.toml                  # Color primitives (TOML → __MP_CONFIG bridge)
static/
└── js/
    └── render-charts.js             # Must resolve CSS vars → actual values for ECharts
```

### Structure Rationale

**Why NOT add `_tokens.css` as a new separate file:** The `:root` token declarations already live in `assets/css/custom.css`. Adding a separate file that also declares `:root {}` blocks creates ordering ambiguity. The correct approach is to consolidate glassmorphism tokens directly in `custom.css` under a clearly labeled section.

**Why NOT use SCSS or PostCSS:** The existing pipeline is pure CSS processed by Hugo Pipes (minify + fingerprint). SCSS requires `dart-sass` embedded in Hugo, adding a build dependency. PostCSS requires `npm` in the build pipeline. The existing primitive token system via CSS custom properties is sufficient. Stay pure CSS.

**Why keep `params.toml` as color SSOT for ECharts colors:** ECharts does not support CSS custom properties natively (wontfix, confirmed GitHub issue #19743). The workaround in `render-charts.js` already uses `window.__MP_CONFIG.charts.palette` for JS-side color resolution, which is the correct bridge.

---

## Architectural Patterns

### Pattern 1: Three-Layer Token Cascade

**What:** CSS custom properties organized into three semantic layers, declared in `assets/css/custom.css`.

**When to use:** For any value that changes between dark/light mode, regime state, or component context.

**The layers in this codebase:**

```css
/* ── LAYER 1: Primitives (Option Tokens) ── */
/* Raw values. Never used directly in components. */
:root {
  --mp-primitive-purple: #7C3AED;
  --mp-primitive-cyan: #00F0FF;
  --mp-primitive-dark-surface: rgba(18, 18, 42, 0.72);
  --mp-glass-blur-value: blur(14px) saturate(1.4);
}

/* ── LAYER 2: Semantic (Decision Tokens) ── */
/* What things mean. Dark mode = default. */
:root {
  --mp-glass-bg: var(--mp-primitive-dark-surface);
  --mp-glass-border: rgba(124, 58, 237, 0.25);
  --mp-glass-blur: var(--mp-glass-blur-value);
  --mp-accent-primary: var(--mp-primitive-purple);
  --mp-accent-secondary: var(--mp-primitive-cyan);
  --mp-shadow-card: 0 8px 24px -8px rgba(124, 58, 237, 0.3);
}

/* ── LAYER 2 override: Light mode ── */
:root:not(.dark) {
  --mp-glass-bg: rgba(255, 255, 255, 0.9);
  --mp-glass-border: rgba(124, 58, 237, 0.15);
  --mp-glass-blur: blur(8px) saturate(1.2);  /* reduced for perf */
  --mp-shadow-card: 0 4px 16px -4px rgba(124, 58, 237, 0.1);
}

/* ── LAYER 3: Component Tokens ── */
/* Specific to a component. Declared in the component's CSS file. */
/* .briefing-section in briefing-sections.css: */
.briefing-section {
  background: var(--mp-glass-bg);         /* ← semantic token */
  backdrop-filter: var(--mp-glass-blur);  /* ← semantic token */
  border-color: var(--mp-glass-border);   /* ← semantic token */
}
```

**Trade-offs:** Current `custom.css` collapses layers 1 and 2 into a single `:root {}` block with hard-coded values. This works but makes it harder to swap primitives globally. The recommended refactor: add a comment-delimited "PRIMITIVES" section and a "SEMANTIC" section within the single `:root {}`. Do not split into separate files — the load order complexity is not worth it.

### Pattern 2: Dark Mode via Class Toggle (Blowfish convention)

**What:** Blowfish toggles `.dark` on `<html>`. The codebase already uses `:root:not(.dark)` for light overrides and `.dark` for explicit dark overrides.

**When to use:** Always. Do not use `@media (prefers-color-scheme: dark)` — Blowfish has a user-controlled toggle that overrides the OS setting.

**Implementation:**

```css
/* Dark (default — most tokens live here): */
:root {
  --mp-glass-bg: rgba(18, 18, 42, 0.72);
}

/* Light override: */
:root:not(.dark) {
  --mp-glass-bg: rgba(255, 255, 255, 0.90);
}
```

**Do NOT use:** `@media (prefers-color-scheme)` — conflicts with Blowfish's JS toggle.
**Do NOT use:** `:root.dark` — Blowfish puts `.dark` on `<html>`, not `:root`.
**Correct selector for Blowfish dark override:** `.dark .your-component { }` or checking that `html.dark` is what Blowfish actually sets (verified: yes, it adds `.dark` to `<html>`).

### Pattern 3: ECharts Color Bridge (JS resolves CSS vars)

**What:** ECharts cannot read CSS custom properties. The existing `render-charts.js` already bridges this via `window.__MP_CONFIG.charts.palette`. For the glassmorphism system, any new colors introduced as CSS tokens must also be mirrored in `params.toml`.

**When to use:** Any color that appears in both CSS components and ECharts chart options.

**Implementation:**

```javascript
// In render-charts.js — existing pattern, already correct:
var COLORS = {
  primary: PALETTE.primary || "#7C3AED",   // fallback if config missing
  cyan:    PALETTE.cyan    || "#00F0FF",
};

// NEW pattern for reading a CSS token as fallback ONLY:
function resolveCssToken(token) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(token).trim();
}
// Use only when the value cannot be put in params.toml (dynamic regime colors):
var regimeColor = resolveCssToken('--regime-color') || '#7C3AED';
```

**The rule:** Static colors → `params.toml` → `__MP_CONFIG` → JS directly.
Dynamic/runtime colors (like `--regime-color` which JS sets itself) → `getComputedStyle` resolution.

### Pattern 4: Backdrop-Filter Performance Containment

**What:** `backdrop-filter` triggers GPU compositing. The cost is proportional to the blurred area. Use CSS containment to limit repaint scope.

**When to use:** On every glassmorphic container.

```css
.mp-glass-panel {
  /* The glass effect */
  background: var(--mp-glass-bg);
  -webkit-backdrop-filter: var(--mp-glass-blur);
  backdrop-filter: var(--mp-glass-blur);

  /* Performance containment */
  contain: layout style;          /* limits repaint scope */
  will-change: transform;         /* promotes to compositor layer */
                                  /* only add when actually animating */
  transform: translateZ(0);       /* GPU layer promotion (fallback) */
  isolation: isolate;             /* creates new stacking context */
}

/* Mobile: reduce blur cost */
@media (max-width: 640px) {
  :root {
    --mp-glass-blur: blur(8px);   /* from 14px → 8px on mobile */
  }
}

/* Reduced motion: disable entirely */
@media (prefers-reduced-motion: reduce) {
  .mp-glass-panel {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    background: var(--mp-glass-bg-solid);  /* opaque fallback */
  }
}
```

**Do NOT add `will-change` globally** — it forces GPU memory allocation for every element. Only add it to elements that animate (e.g., `.briefing-section` during scroll reveal).

### Pattern 5: Blowfish Override (Additive, Not Replacement)

**What:** Do not fork or modify files in `themes/blowfish/`. Use Hugo's file lookup order — any file in the project root takes precedence over the theme.

**When to use:** When you need to override a Blowfish layout or partial.

**Implementation:**

```
themes/blowfish/layouts/partials/extend-head.html  ← DO NOT TOUCH
layouts/partials/extend-head-uncached.html          ← already overriding
```

For CSS, Blowfish loads `assets/css/custom.css` automatically. For color schemes, place a file at `assets/css/schemes/cyberpunk.css` (already done). The `cyberpunk.css` scheme uses Blowfish's RGB format for Tailwind; keep it separate from `--mp-*` tokens which are our design system.

---

## Data Flow

### Token Cascade Flow

```
params.toml (TOML)
    │
    ├── jsonify → window.__MP_CONFIG → JS reads colors for ECharts
    │
    └── (theme values reflected in) assets/css/custom.css (:root tokens)
              │
              ▼
    :root { --mp-glass-*, --mp-neon-*, --mp-shadow-*, --regime-color }
              │
    ┌─────────┴──────────────────────────────────────────────────┐
    │         │               │               │                  │
    ▼         ▼               ▼               ▼                  ▼
briefing-  chart-cards.css  calendar.css  home-market-     skeleton.css
sections.css                              overview.css
(backdrop-  (backdrop-       (no glass)   (backdrop-       (shimmer uses
filter)      filter)                      filter)           --mp-neon-purple)
    │
    ▼
.briefing-section, .market-chart-card, .mp-ticker-group, .mp-news-card
(all consume --mp-glass-bg, --mp-glass-border, --mp-glass-blur)
```

### Runtime Token Override Flow (JS → CSS)

```
market-pulse-enhancements.js (DOMContentLoaded)
    │
    ├── reads window.__MP_PAGE.regime  ("RISK_ON" | "CAUTIOUS" | etc.)
    │
    ├── looks up REGIME_COLOR_MAP[regime] → "#4ade80"
    │
    └── document.documentElement.style.setProperty('--regime-color', '#4ade80')
        document.documentElement.style.setProperty('--regime-color-rgb', '74 222 128')
              │
              ▼
    All components consuming var(--regime-color) update automatically:
    - .mp-regime-badge { border-color: var(--regime-color) }
    - .mp-cyber-divider::after { background: var(--regime-color) }
    - .toc a.is-active { color: var(--regime-color) }
    - .mp-post-hero { border-left-color: var(--regime-color) }
```

### CSS Load Order (Hugo Pipes)

```
extend-head-uncached.html processes this slice in order:

1. briefing-sections.css    ← base .briefing-section glass + layout
2. calendar.css             ← calendar component
3. calendar-polish.css      ← calendar overrides (must follow calendar.css)
4. toc-and-effects.css      ← TOC + animations + CSS art
5. layout-overrides.css     ← Blowfish layout fixes
6. chart-cards.css          ← .market-chart-card glass
7. home-market-overview.css ← homepage ticker/regime components
8. terminal-footer.css      ← footer
9. home-briefing-cards.css  ← post list cards
10. post-content.css        ← post page specific
11. theme-fixes.css         ← Blowfish bug fixes
12. reading-progress.css    ← progress bar
13. post-hero.css           ← post hero banner
14. skeleton.css            ← loading shimmer

LOADED BEFORE ALL OF THESE (by Blowfish itself):
- assets/css/custom.css     ← :root token declarations (FIRST)
- assets/css/schemes/cyberpunk.css ← Blowfish RGB scheme
```

**Critical:** `assets/css/custom.css` is loaded by Blowfish before `extend-head-uncached.html` runs. This means `--mp-*` tokens are always available when component files load. The current ordering is correct.

---

## Component Boundaries

| Boundary | What crosses it | Direction | Notes |
|----------|----------------|-----------|-------|
| `custom.css` → `custom/*.css` | CSS custom properties (`--mp-*`) | One-way (declarations → consumption) | Components MUST NOT declare new `:root` tokens |
| `params.toml` → JS | `window.__MP_CONFIG` JSON | One-way (build time → runtime) | Only bridge for ECharts colors |
| JS → CSS | `style.setProperty('--regime-color', ...)` | One-way (runtime override) | Only dynamic/per-page tokens cross this |
| `extend-head-uncached.html` → JS | `window.__MP_PAGE` JSON | One-way (build time → runtime) | Per-post regime, chartData |
| `static/js/briefing/*.js` → DOM | Class manipulation (`.is-revealed`, `.is-open`) | One-way (JS writes, CSS reads via selectors) | State classes are the interface |
| CSS `--regime-color` → ECharts | NOT allowed (ECharts wontfix) | Blocked | Use `getComputedStyle` workaround |

---

## Suggested Build Order

This is the dependency graph for implementing the glassmorphism design system. Each phase depends on the previous.

```
Phase 1: Token Foundation
  └── Refactor assets/css/custom.css
      ├── Add explicit PRIMITIVE section with --mp-primitive-* vars
      ├── Add explicit SEMANTIC section for --mp-glass-* consolidation
      ├── Reduce/eliminate inline rgba() magic numbers in component files
      └── Mobile glass token override (@media max-width: 640px reduces blur)

Phase 2: Component Refactoring
  └── Each custom/*.css file refactored to consume only semantic tokens
      ├── Replace inline rgba(124, 58, 237, 0.25) → var(--mp-glass-border)
      ├── Replace inline blur(14px) → var(--mp-glass-blur)
      └── Add contain: layout style to glass panels (no behavior change, perf win)

Phase 3: Performance Hardening
  └── backdrop-filter optimizations
      ├── Add isolation: isolate to all glass panels
      ├── Add reduced-motion fallbacks (opaque bg fallback)
      └── Mobile blur reduction via :root token override

Phase 4: Dark/Light Mode Audit
  └── Ensure every component has explicit :root:not(.dark) override
      (currently some components use hardcoded colors in light mode context)

Phase 5: ECharts Theme Sync
  └── Ensure params.toml palette section matches new glass tokens
      (chart backgrounds should match --mp-chart-card-bg semantic token)
```

---

## Anti-Patterns

### Anti-Pattern 1: Inline Magic Numbers in Component Files

**What people do:** Writing `rgba(124, 58, 237, 0.25)` directly in component CSS files.

**Why it's wrong:** The codebase currently has this throughout `briefing-sections.css`, `chart-cards.css`, etc. When the glass opacity or primary color needs to change, it requires grep-and-replace across 13 files. One missed value breaks visual consistency.

**Do this instead:** Declare `--mp-glass-border: rgba(124, 58, 237, 0.25)` once in `custom.css`. All component files reference `var(--mp-glass-border)`. Color change = one line edit.

### Anti-Pattern 2: CSS Vars in ECharts Options

**What people do:** `color: ['var(--mp-neon-purple)']` in ECharts `setOption()` calls.

**Why it's wrong:** ECharts cannot parse CSS variables (confirmed wontfix, GitHub issue #19743). Canvas renderer ignores them. Hover states break even if they appear to render correctly initially.

**Do this instead:** Read from `window.__MP_CONFIG.charts.palette` for static colors. For dynamic regime colors, use `getComputedStyle(document.documentElement).getPropertyValue('--regime-color').trim()` to resolve the actual value before passing to ECharts.

### Anti-Pattern 3: Stacking Multiple backdrop-filter Layers

**What people do:** Nesting glass panels inside glass panels (e.g., a `.mp-news-card` inside a `.briefing-section`, both with `backdrop-filter`).

**Why it's wrong:** The GPU must re-composite each layer independently. Three stacked glass panels = 3x the compositing cost. On mobile, this causes jank at 30fps.

**Do this instead:** Only the outermost container uses `backdrop-filter`. Inner components use `background: rgba(...)` without blur. The existing `chart-cards.css` removes `backdrop-filter` in light mode — extend this pattern to mobile.

### Anti-Pattern 4: `will-change: transform` on All Glass Elements

**What people do:** Adding `will-change: transform` globally for "performance."

**Why it's wrong:** `will-change` promotes every element to its own GPU compositor layer. Too many layers exhaust GPU memory, especially on mobile. It can make performance worse, not better.

**Do this instead:** Only add `will-change: opacity, transform` to elements that are actively animating (e.g., `.briefing-section` during scroll reveal via IntersectionObserver). Remove it after animation completes.

### Anti-Pattern 5: Duplicating Light Mode Overrides in Component Files

**What people do:** Adding `:root:not(.dark) .component { }` rules in every component CSS file, duplicating the pattern.

**Why it's wrong:** The current codebase already does this in every file. It works, but when adding a new glassmorphism component, the developer must remember to add the light override in the same file. It's easy to forget.

**Do this instead:** Because the token values change at the `:root` level (`--mp-glass-bg` switches value automatically), a component that only uses semantic tokens gets light mode for free without component-level overrides. The component overrides are only needed when a component uses hard-coded values (the Anti-Pattern 1 situation).

---

## Scaling Considerations

This is a 1-person blog rendering ~daily content. Scaling is not the primary concern. The relevant performance dimensions are:

| Concern | Current state | After glassmorphism refactor |
|---------|--------------|------------------------------|
| CSS payload | 13 fingerprinted files loaded individually | Same structure; token refactor doesn't add files |
| Render-blocking CSS | Each file blocks render independently | No change; could bundle but fingerprinting works per-file |
| backdrop-filter on mobile | Already used; blur at 14px | Reduce to 8px via token override in `:root` at `@media (max-width: 640px)` |
| ECharts + glass theme sync | Colors duplicated in params.toml + custom.css | Keep them in sync; single source of truth is params.toml |
| Hugo build time | Minify + sha512 for 13 files | No significant change with token refactor |

---

## Integration Points

### Blowfish Theme Boundary

| Blowfish File | Our Interaction | Method |
|---------------|----------------|--------|
| `assets/css/compiled/main.css` | We override via `custom.css` and `custom/*.css` | Hugo file lookup order |
| `assets/css/schemes/cyberpunk.css` | We maintain this file | Custom scheme (RGB format for Tailwind) |
| `layouts/partials/extend-head.html` | We use `extend-head-uncached.html` instead | Separate partial with no cache |
| `layouts/partials/extend-footer.html` | We use our version for JS loaders | Hugo file lookup override |
| Blowfish `.dark` class on `<html>` | Our tokens react via `:root:not(.dark)` | CSS cascade |

### ECharts Boundary

| What | How we bridge | Confidence |
|------|--------------|------------|
| Static palette colors | `params.toml` → `__MP_CONFIG.charts.palette` → `render-charts.js` | HIGH (existing, verified) |
| Regime-dynamic colors | `market-pulse-enhancements.js` sets `--regime-color` CSS var → `getComputedStyle` resolution in chart callbacks | MEDIUM (workaround documented, not ideal) |
| Dark/light mode switch | `render-charts.js` uses `isDarkMode()` helper, re-renders charts on theme toggle | HIGH (existing pattern, verified) |
| New glassmorphism colors | Must be mirrored in `params.toml` palette section | REQUIRED — ECharts cannot read CSS vars |

### params.toml ↔ custom.css Sync Contract

These values must remain in sync. When changing one, change the other:

| params.toml key | custom.css token | Notes |
|-----------------|-----------------|-------|
| `charts.palette.primary` | `--mp-neon-purple`, `--mp-accent-fact` | `#7C3AED` |
| `charts.palette.cyan` | `--mp-neon-cyan`, `--mp-accent-opinion` | `#00F0FF` |
| `charts.palette.bg` | `--mp-glass-bg` (dark base) | `#0A0A1A` base |
| `colors.regime.RISK_ON` | `--regime-color` (set at runtime by JS) | `#4ade80` |

There is currently no automation enforcing this sync. It is a manual contract. Document it clearly in the code with comments.

---

## Sources

- Blowfish Advanced Customisation docs: https://blowfish.page/docs/advanced-customisation/ (MEDIUM — official docs, current)
- ECharts CSS Variables wontfix: https://github.com/apache/echarts/issues/19743 (HIGH — official issue tracker)
- Design Token Architecture (Martin Fowler): https://martinfowler.com/articles/design-token-based-ui-architecture.html (HIGH — authoritative)
- backdrop-filter performance 2025: https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide (MEDIUM — WebSearch verified by multiple sources)
- CSS dark mode token switching: https://css-tricks.com/a-complete-guide-to-dark-mode-on-the-web/ (HIGH — canonical reference)
- Existing codebase: Full inspection of `assets/css/custom.css`, all `custom/*.css` files, `config/_default/params.toml`, `extend-head-uncached.html`, `render-charts.js`, `market-pulse-enhancements.js` (HIGH — primary source)

---

*Architecture research for: Glassmorphism design system on Hugo/Blowfish*
*Researched: 2026-02-19*
