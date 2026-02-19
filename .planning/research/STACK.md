# Stack Research: Glassmorphism UI/UX Redesign

**Domain:** Glassmorphism design system on Hugo static site (financial blog)
**Researched:** 2026-02-19
**Confidence:** MEDIUM-HIGH

---

## Context

This is a **milestone-scoped** stack document. The base stack (Hugo v0.155.3 extended + Blowfish
theme + vanilla JS IIFE modules + ECharts CDN) is already documented in
`.planning/codebase/STACK.md`. This document covers only the **incremental additions** needed
for a glassmorphism redesign.

The project already has partial glassmorphism in place:
- `--mp-glass-bg`, `--mp-glass-border`, `--mp-glass-blur` custom properties exist
- `backdrop-filter: blur(14px) saturate(1.4)` already used on cards and TOC panel
- Modular CSS in `assets/css/custom/*.css` (14 files)
- Noto Sans KR as the single font for all roles (sans, display, mono, subtitle) — a gap to fix

---

## Recommended Stack

### CSS Methodology

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Pure CSS custom properties | (native) | Design token system | Zero build overhead, Hugo compiles as-is, existing partial system extends cleanly. No framework lock-in. |
| CSS `@layer` | (native) | Cascade management | Avoids specificity wars across 14 CSS files. Enables clean overrides of Blowfish base styles. Chrome 99+, Firefox 97+, Safari 15.4+. |
| CSS `color-mix()` | (native) | Derived color tokens | Generates glass tints/shades from base tokens without manual RGBA math. ~92% global coverage as of 2025 (Chrome 111+, Firefox 113+, Safari 16.2+). Needs `rgba()` fallbacks. |
| `@media (prefers-reduced-motion)` | (native) | Accessibility | Already partially used; must be comprehensive for glassmorphism animations. Required for WCAG 2.1 AA. |

**Verdict: Pure CSS custom properties + `@layer` + `color-mix()` with `rgba()` fallbacks.**
Do NOT introduce Tailwind CSS — it would require a PostCSS build step, conflict with Blowfish's
existing Tailwind v4 setup, and duplicate the existing utility class surface area. The project's
ES5 vanilla JS constraint also makes Tailwind's JIT scanning irrelevant.

### Typography

| Font | Purpose | Weights to Load | Why |
|------|---------|----------------|-----|
| Noto Sans KR | Body text, UI labels, Korean content | 300, 400, 500, 700 | Already loaded. Covers Hangul + Latin. Non-negotiable for Korean readability. |
| JetBrains Mono | Numeric data, code, monospace elements | 400, 700 | Currently the project uses Noto Sans KR as `--mp-font-mono` — a mistake. JetBrains Mono v2.304 (Jan 2025) on Google Fonts provides superior tabular-nums clarity for price/percentage data, chart labels, timestamps. Narrow spacing saves horizontal space in data-dense rows. |

**Font pairing rationale:**
- Noto Sans KR handles all Korean prose. Its geometric construction at 400–700 weight
  reads cleanly on glass surfaces.
- JetBrains Mono replaces Noto Sans KR for `--mp-font-mono`. Financial data (prices, returns,
  timestamps) demands true monospace with optical tabular alignment. JetBrains Mono is already
  on Google Fonts, zero additional CDN needed.
- A third display font is NOT recommended. The cyberpunk aesthetic is served by Noto Sans KR at
  heavy weights with letter-spacing. Adding Inter/Manrope would require loading an additional
  font family for Latin-only benefit, creating a mismatch with Korean glyphs.

**What NOT to use:**
- Geist (Vercel) — Not on Google Fonts, requires self-hosting or unpkg, adds CDN dependency
- Inter — Latin-only, creates visual inconsistency with Noto Sans KR Korean glyphs
- Nanum Gothic — Older, lower quality than Noto Sans KR, no variable font

### Icon Library

| Library | Version | Delivery | Purpose | Why |
|---------|---------|---------|---------|-----|
| Phosphor Icons Web | 2.1.2 | jsDelivr CDN `<link rel="stylesheet">` | UI icons (nav, cards, status indicators) | 6 weights (thin/light/regular/bold/fill/duotone) — the weight flexibility is critical for glass aesthetics where thin icons on glass need to be visible without looking heavy. No React/bundler required. Single CSS file per weight via CDN. |

**CDN inclusion (bold weight only — covers 95% of use cases):**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/bold/style.css">
```

**Usage (no JS required):**
```html
<i class="ph-bold ph-chart-line"></i>
<i class="ph-bold ph-arrow-up-right"></i>
<i class="ph-bold ph-clock"></i>
```

**Why not Lucide:** Lucide's single-weight stroke approach looks identical across all
"modern" interfaces. Phosphor's weight system lets you use thin icons as decorative elements on
glass surfaces and bold icons for interactive controls — essential visual hierarchy for
glassmorphism.

**Why not Heroicons:** Tailwind-coupled; only 2 weights (outline/solid); fewer financial
domain icons (charts, tickers, market indicators).

**Why not FontAwesome:** Heavy (requires font file + CSS), license restrictions on Pro icons,
overkill for this use case.

### Animation

| Approach | Purpose | Why |
|----------|---------|-----|
| Pure CSS keyframes + transitions | All visual animations | Already established in the project. GPU-composited `transform` and `opacity` animations are free of main-thread cost. No JS animation library is warranted. |
| CSS `transition` on `backdrop-filter` | Card hover states | **Avoid animating blur values** — changing `blur()` values forces GPU repaints. Instead, animate `opacity` or `transform` on the glass element. |
| `will-change: transform` | Elements with frequent hover animations | Apply only during animation (add/remove via JS class), not persistently. Persistent `will-change` creates extra compositor layers, consuming GPU memory. |

**What NOT to use:**
- GSAP / Anime.js / Motion One — All require a bundler or module system incompatible with ES5 IIFE constraint. The existing animations (grid-scroll, scanline, glitch, fade-in-up) are pure CSS and performant.
- Framer Motion — React-only.
- CSS Houdini `@property` for animatable custom properties — Browser support is ~88% (missing Firefox < 128 full support). Too risky for production without a clear benefit over existing approach.

### Color System Tooling

| Approach | Tool/Method | Purpose | Why |
|----------|------------|---------|-----|
| CSS custom properties token hierarchy | Native CSS | Base token layer | Extend existing `--mp-*` variables. Establish 3-tier system: primitive → semantic → component. |
| `color-mix(in oklch, ...)` | Native CSS | Glass tint generation | OKLCH provides perceptually uniform mixing — dark glass tints don't shift in hue when mixed. Fallback: manual `rgba()` literals. |
| Dark/light mode via `:root.dark` + `:root:not(.dark)` | Native CSS | Mode switching | Already established in the project. Blowfish uses `.dark` class on `<html>`. Maintain this pattern — do NOT switch to `@media (prefers-color-scheme)` which conflicts with user's manual toggle preference. |

**No color tooling libraries needed.** The existing custom property system is sound. The redesign
is token consolidation + extension, not a replacement.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Hugo extended v0.155.3 | CSS pipeline (SCSS transpilation, minification, fingerprinting) | Already in use. `resources.Get | toCSS | minify | fingerprint` handles all CSS. |
| Playwright v1.58.2 | Visual regression smoke tests | Already configured. Use for before/after viewport smoke tests during redesign. |
| glass.css / hype4.academy generator | CSS value prototyping only | Use for generating baseline `backdrop-filter` + `rgba` values offline. Do NOT import as a library. |

---

## Glassmorphism CSS Property Reference

These are the verified optimal values for this project's dark cyberpunk + light mode setup:

### Dark Mode Glass (primary context)
```css
/* Card-level glass */
background: rgba(18, 18, 42, 0.72);           /* existing --mp-glass-bg */
backdrop-filter: blur(14px) saturate(1.4);    /* existing --mp-glass-blur */
-webkit-backdrop-filter: blur(14px) saturate(1.4);
border: 1px solid rgba(124, 58, 237, 0.25);  /* existing --mp-glass-border */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 0 20px rgba(124, 58, 237, 0.05);

/* Mobile: reduce blur (GPU constraint) */
@media (max-width: 640px) {
  backdrop-filter: blur(8px) saturate(1.2);
}
```

### Light Mode Glass
```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(12px) saturate(1.6);   /* higher saturation for light glass pop */
-webkit-backdrop-filter: blur(12px) saturate(1.6);
border: 1px solid rgba(255, 255, 255, 0.4);
box-shadow: 0 4px 16px rgba(124, 58, 237, 0.08);
```

### Browser support reality (HIGH confidence, verified via caniuse.com 2025-02):
- `backdrop-filter`: 95.76% global — production safe with `-webkit-` prefix
- `color-mix()`: ~92% global (Chrome 111+, Firefox 113+, Safari 16.2+) — use `rgba()` fallbacks
- `@layer`: ~95% global (Chrome 99+, Firefox 97+, Safari 15.4+) — production safe

---

## Recommended Token Architecture

Extend existing custom properties into a 3-tier system:

```css
/* Tier 1: Primitives (don't reference, use semantics) */
:root {
  --color-violet-600: #7C3AED;
  --color-cyan-500: #00F0FF;
  --color-dark-base: #0A0A1A;

  /* Glass values per surface level */
  --glass-bg-subtle: rgba(18, 18, 42, 0.5);   /* e.g., table rows */
  --glass-bg-base: rgba(18, 18, 42, 0.72);    /* existing: cards */
  --glass-bg-elevated: rgba(18, 18, 42, 0.88); /* e.g., modals, overlays */

  --glass-blur-sm: blur(8px);                  /* mobile, nested */
  --glass-blur-md: blur(14px) saturate(1.4);  /* existing default */
  --glass-blur-lg: blur(20px) saturate(1.6);  /* hero, featured */

  --glass-border-subtle: rgba(124, 58, 237, 0.12);
  --glass-border-base: rgba(124, 58, 237, 0.25);  /* existing */
  --glass-border-strong: rgba(124, 58, 237, 0.5); /* hover state */
}

/* Tier 2: Semantic tokens (use these in components) */
:root {
  --mp-surface-card: var(--glass-bg-base);
  --mp-surface-toc: var(--glass-bg-elevated);
  --mp-surface-table: var(--glass-bg-subtle);
  --mp-blur-card: var(--glass-blur-md);
  --mp-blur-toc: var(--glass-blur-lg);
}

/* Tier 3: Component tokens (within component CSS files) */
/* Defined inline within each .css file as needed */
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Pure CSS custom properties | Tailwind CSS | Only if the project migrates to a Tailwind-first build pipeline. Currently incompatible with ES5 IIFE constraint. |
| Phosphor Icons (CDN) | Lucide Static | If bundle size becomes critical and only 20-30 icons are needed. Lucide has smaller CDN footprint per icon. |
| JetBrains Mono (Google Fonts) | IBM Plex Mono | Both are financial-grade monospace. IBM Plex Mono is slightly wider, better for long numeric strings. If column alignment matters more than density, consider it. |
| CSS keyframes | Motion One (WAAPI) | If/when the project migrates from ES5 to ES modules. Motion One is WAAPI-based (native browser) and has zero bundle cost, unlike GSAP. |
| Noto Sans KR (existing) | Noto Serif KR | Only if long-form editorial Korean content is added. Serif reduces scanability for data-dense briefing content. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Tailwind CSS | PostCSS build step incompatible with Hugo's current CSS pipeline. Conflicts with Blowfish's Tailwind v4 layer. Adds class-name sprawl to vanilla JS templates. | Pure CSS custom properties |
| GSAP / Anime.js | Requires ES module import or bundler. 100kb+ overhead. The animations needed (fade-in, slide-up, glow pulse) are trivially achievable in pure CSS. | CSS `@keyframes` + `transition` |
| Glass UI framework (ui.glass) | No version lock, unclear maintenance, adds opinionated class names that conflict with existing `mp-*` namespace. Glassmorphism is 4 CSS properties — a framework is not warranted. | Handcrafted CSS custom properties |
| Simple Morph | Beta v0.0.1-beta as of Jan 2025. Not production ready. | Custom CSS |
| CSS Houdini `@property` for animation | ~88% browser support, no clear benefit over existing CSS transition approach for this project's animation patterns. | `transition` + `@keyframes` |
| Animating `backdrop-filter` blur values | GPU-intensive repaint. Changing blur amounts forces a full composite layer recalculation on every frame. | Animate `opacity` or `transform` instead |
| Self-hosted variable fonts | Large initial load (Noto Sans KR variable font is 3-5MB). Google Fonts CDN with `display=swap` + `unicode-range` subsetting is faster for this Korean + Latin mix. | Google Fonts CDN with specific weights |
| FontAwesome | 200kb+ CSS + font file. No financial-specific icons in free tier. | Phosphor Icons (select weights) |

---

## Version Compatibility

| Package | Version | Compatible With | Notes |
|---------|---------|-----------------|-------|
| Hugo extended | 0.155.3 | `@layer`, custom properties, `color-mix()` with fallbacks | Hugo passes CSS through without transformation — all modern CSS features work directly |
| Phosphor Icons Web | 2.1.2 | Hugo static asset pipeline | CDN link in `extend-head-uncached.html`, same pattern as ECharts |
| JetBrains Mono | 2.304 (Google Fonts) | Noto Sans KR | Both are variable fonts; loaded via same Google Fonts request for efficiency |
| Noto Sans KR | Latest (Google Fonts) | JetBrains Mono | Existing load; add JetBrains Mono to same `<link>` call |
| Blowfish theme | Current (git submodule) | All above | CSS custom properties override Blowfish variables cleanly via `:root` scope |

---

## Installation

No npm packages are required. All additions are CDN links and native CSS.

**In `layouts/partials/extend-head-uncached.html` — replace existing font link:**
```html
<!-- Replace: -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap" rel="stylesheet">

<!-- With: -->
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">

<!-- Add Phosphor Icons (bold weight is sufficient for most UI): -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/bold/style.css">
<!-- If thin/light weight needed for decorative glass icons: -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/src/light/style.css">
```

**In `assets/css/custom.css` — update `--mp-font-mono`:**
```css
:root {
  --mp-font-mono: 'JetBrains Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
}
```

**No build tool changes required.** Hugo's existing asset pipeline handles the CSS files.

---

## Sources

- [caniuse.com: backdrop-filter](https://caniuse.com/css-backdrop-filter) — 95.76% global support confirmed
- [caniuse.com: color-mix()](https://caniuse.com/mdn-css_types_color_color-mix) — ~92% global, verified browser versions
- [Glassmorphism Implementation Guide 2025](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide) — CSS property values, blur range 8-15px recommendation
- [Phosphor Icons Web v2.1.2](https://github.com/phosphor-icons/web) — CDN usage verified, March 2025 release
- [JetBrains Mono v2.304](https://github.com/JetBrains/JetBrainsMono/releases) — January 2025 release, Google Fonts available
- [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR) — Variable font, full Hangul support
- [CSS Cascade Layers for Design Systems](https://css-tricks.com/organizing-design-system-component-patterns-with-css-cascade-layers/) — Layer organization pattern
- [Glassmorphism 2026 Trends](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026) — MEDIUM confidence (WebSearch only)
- [Dark Glassmorphism 2025](https://editorialge.com/web-design-trends-dark-mode-glassmorphism/) — MEDIUM confidence (WebSearch)

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| CSS property values (backdrop-filter, browser support) | HIGH | Verified via caniuse.com direct data |
| Phosphor Icons CDN usage | HIGH | Verified via official GitHub repo README |
| JetBrains Mono version/availability | HIGH | Verified via official GitHub releases |
| color-mix() production readiness | MEDIUM | ~92% coverage confirmed by multiple sources; exact % requires caniuse live data |
| Font pairing recommendations | MEDIUM | Based on typography best practices + evidence; no formal Korean financial blog study exists |
| CSS @layer for Hugo | MEDIUM | Hugo passes CSS verbatim — @layer works, but no Hugo-specific @layer guide found; conclusion drawn from Hugo architecture documentation |
| Glassmorphism design trends 2026 | LOW | WebSearch only; marketing/blog sources, no peer-reviewed UX research |

---

*Stack research for: Glassmorphism UI/UX Redesign — Market Pulse Financial Blog*
*Researched: 2026-02-19*
