# Project Research Summary

**Project:** Glassmorphism UI/UX Redesign — Market Pulse Financial Blog
**Domain:** Glassmorphism design system on Hugo/Blowfish static site (financial briefing)
**Researched:** 2026-02-19
**Confidence:** MEDIUM-HIGH

## Executive Summary

This project is a glassmorphism visual redesign of an existing, working Hugo static site that renders financial briefing content. The codebase already has a substantial glassmorphism foundation: glass tokens exist (`--mp-glass-bg`, `--mp-glass-blur`, `--mp-glass-border`), `backdrop-filter` is used across 10+ files (33 total declarations), and the dark cyberpunk aesthetic is fully operational. The redesign is therefore incremental hardening and completion — not a greenfield implementation. The recommended approach is a 5-phase progression: foundation cleanup first (token consolidation + pitfall prevention), then component-level visual upgrades, followed by performance hardening, accessibility validation, and dark/light mode audit. No new build tools or npm packages are required; all additions are native CSS features and CDN links.

The primary technical recommendation is to introduce a strict three-tier CSS custom property system (primitives → semantic → component) in `assets/css/custom.css`, add JetBrains Mono for financial numerics, and use Phosphor Icons for UI iconography — all without touching Hugo's existing CSS pipeline. The most important architectural constraint is that ECharts cannot read CSS custom properties (confirmed wontfix), so any new glassmorphism colors that need to appear in charts must be mirrored in `config/_default/params.toml`. The Blowfish theme's `.dark` class toggle on `<html>` must remain the only dark mode mechanism; `@media (prefers-color-scheme)` conflicts with the user toggle.

The key risk cluster is GPU compositing cost on mobile. The current codebase already pushes the limits with 15–25 simultaneous `backdrop-filter` elements visible on a typical post page. The redesign must not increase this count — and should selectively remove `backdrop-filter` from lower-priority components (ticker groups, news cards) in favor of solid dark backgrounds. Two known pitfalls are already live in the codebase: a nested `backdrop-filter` on `.mp-briefing-meta::before` (double-blur artifact) and a duplicate `:root:not(.dark)` block in `custom.css` at lines 89 and 218. Both must be fixed in the foundation phase before any visual work begins.

---

## Key Findings

### Recommended Stack

The existing stack (Hugo v0.155.3 extended + Blowfish theme + vanilla JS IIFE modules + ECharts CDN) requires no changes to the build pipeline. Three incremental additions are recommended:

1. **JetBrains Mono** (Google Fonts, v2.304) replaces Noto Sans KR as `--mp-font-mono`. Financial numeric data (prices, returns, timestamps) requires true monospace with tabular-nums alignment. Noto Sans KR in mono role is a current gap.
2. **Phosphor Icons Web** (CDN, v2.1.2) for UI icons. Six weight variants (thin through duotone) provide the visual hierarchy that glassmorphism requires — thin decorative icons on glass surfaces, bold icons for interactive controls.
3. **Native CSS features**: `@layer` for cascade management across 14 CSS files, `color-mix()` with `rgba()` fallbacks for derived glass tints, `@media (prefers-reduced-motion)` comprehensive coverage.

**Core technologies:**
- Pure CSS custom properties: design token system — zero build overhead, extends existing partial system cleanly
- CSS `@layer`: cascade management — eliminates specificity wars across 14 component files; 95% browser support
- `color-mix(in oklch, ...)`: glass tint generation — perceptually uniform, no hue shift on dark tints; ~92% coverage needs `rgba()` fallbacks
- JetBrains Mono (Google Fonts): financial numerics — superior tabular-nums clarity for price/percentage/timestamp data
- Phosphor Icons Web v2.1.2 (CDN): UI icons — weight flexibility critical for glass aesthetic hierarchy
- `backdrop-filter: blur(14px) saturate(1.4)`: existing primary glass value — production safe with `-webkit-` prefix, 95.76% global support

**Do not add:** Tailwind CSS (conflicts with Blowfish's Tailwind v4 setup), GSAP/Anime.js (incompatible with ES5 IIFE constraint), Glass UI frameworks (4 CSS properties do not warrant a framework).

### Expected Features

The product already implements most glassmorphism table stakes. Research differentiates what is complete, what is missing but required, and what is optional.

**Must have — missing and required for redesign to close (P1):**
- Frosted sticky navigation bar — first element users see, currently Blowfish default with no glass treatment
- Ambient orb background system — without colored radial gradients behind glass, `backdrop-filter` has nothing to blur on near-black backgrounds
- Regime-aware glass tinting — signature differentiator: glass panes subtly tint toward bull/bear/neutral color
- `@supports backdrop-filter` fallback — correctness gap; `@supports not (backdrop-filter: blur(1px))` block raises opacity to 0.95+
- `body::after` scanline animation missing `prefers-reduced-motion` guard — WCAG 2.1 AA gap, 5-minute fix
- Light mode glass translucency audit — currently `rgba(255,255,255,0.9)` on white = zero glass effect
- Per-category news card accent colors — source badge always purple; category mapping provides high visual clarity at low JS cost

**Should have — same milestone if time allows (P2):**
- Calendar grid cell impact coloring (extends existing impact-dot system)
- Sparkline SVG rendering audit (class exists, implementation unverified)
- Consistent hover glow audit across all card types

**Defer to v2+:**
- Regime-aware ambient orb animation (orbs shift color on regime change)
- Print stylesheet removing all glass effects
- Windows forced-colors / high-contrast mode override

### Architecture Approach

The architecture is a two-layer system: build-time token declaration in Hugo (CSS custom properties declared in `assets/css/custom.css`, color primitives in `params.toml`) and runtime token override by JS (`market-pulse-enhancements.js` sets `--regime-color` and `--regime-color-rgb` via `style.setProperty`). The recommended pattern is a strict three-tier token cascade: primitives in `custom.css` → semantic glass tokens in `custom.css` → component consumption in `custom/*.css`. No `--mp-*` variable definitions should exist anywhere except `custom.css`.

**Major components:**
1. `assets/css/custom.css` — single source of truth for all `--mp-*` token declarations (primitives + semantic); all other files consume only
2. `assets/css/custom/*.css` (14 files) — component-scoped styles; consume semantic tokens, never redefine `:root` blocks
3. `config/_default/params.toml` — color SSOT for ECharts; any glass color appearing in charts must be mirrored here
4. `layouts/partials/extend-head-uncached.html` — CSS loader + `window.__MP_CONFIG` / `window.__MP_PAGE` data bridge
5. `static/js/market-pulse-enhancements.js` — runtime regime color override; sets CSS vars from `__MP_PAGE.regime`
6. `static/js/render-charts.js` — ECharts color bridge; reads `__MP_CONFIG.charts.palette` for static colors, `getComputedStyle` for dynamic regime colors

**CSS load order is fixed and correct:** `custom.css` loads first (via Blowfish), then `custom/*.css` files in the ordered slice defined in `extend-head-uncached.html`. This ordering must be preserved.

### Critical Pitfalls

1. **Nested backdrop-filter produces double-blur artifacts** — The rule is blur the container, never the child. Live example: `.mp-briefing-meta::before` applies `backdrop-filter: blur(8px)` inside a parent that also has glass blur. Fix: use opaque `background: rgba(10,10,26,0.95)` on pseudo-elements inside glass containers. Address in foundation phase before any visual work.

2. **WCAG contrast failure on glass surfaces** — `backdrop-filter` makes the "background" dynamic (it blurs whatever is behind the pane). Text color must be designed for worst-case backgrounds, not average. Current gaps: `#64748B` (slate-500) used for TOC text in light mode is frequently below 3:1. Floor: `#CBD5E1` for body text on dark glass, no text below `font-weight: 500` at sizes under 0.85rem. Validate with WebAIM using worst-case background colors.

3. **Dark mode glass invisibility on OLED** — Near-black page background (`#0A0A1A`) + dark semi-transparent glass = zero perceptual contrast. Fix: raise glass RGB base values (`rgba(28,28,52,0.75)` over `rgba(18,18,42,0.72)`), add colored gradient tint layer, increase border opacity from 0.25 to 0.40 minimum in dark mode. Must validate on a physical OLED device, not DevTools emulation.

4. **ECharts canvas does not participate in backdrop-filter** — Canvas is a rasterized bitmap layer; it is composited after `backdrop-filter` is applied. Applying glass blur to `.market-chart-card` does not blur the chart content. Keep glass treatment on `border` and `box-shadow` of chart containers only. Any glass color change must trigger a review of ECharts `getTheme()` contrast values.

5. **Duplicate `:root:not(.dark)` block in custom.css** — `custom.css` currently defines light mode overrides twice (lines 89 and 218). When redesign adds new glass tokens, the second block silently wins, causing unpredictable cascade. Fix: merge into a single block in foundation phase. Add `/* SINGLE SOURCE OF TRUTH — do not duplicate */` comment.

6. **Too many simultaneous blur layers on mobile** — Current post pages have 15–25 elements with active `backdrop-filter` in viewport. Mid-range Android phones (Snapdragon 6xx) cannot maintain 30fps with more than 8–10 blur layers. Mitigation: `content-visibility: auto` on below-fold sections, `blur(8px)` cap at `max-width: 768px`, remove `backdrop-filter` from ticker groups and news cards in favor of solid dark backgrounds.

---

## Implications for Roadmap

Based on combined research, dependencies dictate a strict phase ordering. The token foundation must exist before any component work; performance constraints must be understood before adding new glass surfaces; accessibility validation must happen continuously, not as a final pass.

### Phase 1: Foundation Cleanup
**Rationale:** Two known bugs (nested backdrop-filter, duplicate CSS variable blocks) exist in the current codebase. Adding new features on top of these bugs will amplify them. The three-tier token system must be established before component files can be meaningfully refactored. This phase has zero visible UX changes — it is entirely internal correctness.
**Delivers:** Clean token system, no nested blur bugs, single `:root:not(.dark)` block, mobile blur token override, `prefers-reduced-motion` and `@supports` baseline
**Addresses:** Frosted nav gap (requires token system to be clean), ambient orb (requires no competing blur stacks)
**Avoids:** Pitfalls 1 (nested blur), 5 (duplicate CSS block), 7 (Blowfish RGB format collision), 11 (Hugo sub-file load order)
**Requires research-phase:** No — patterns are well-documented, codebase is fully inspected

### Phase 2: New Visual Components
**Rationale:** With tokens clean, new surface-level features can be added safely. The frosted nav and ambient orbs are the highest-visibility missing pieces. Regime-aware glass tinting is low-effort but high-differentiation. Per-category news card accents complete the existing card system.
**Delivers:** Frosted sticky navigation, ambient orb background system, regime-aware glass tinting, per-category news card accent colors
**Uses:** `color-mix()` for orb tint generation, Phosphor Icons for nav icons, JetBrains Mono font update
**Implements:** Three-tier token cascade feeding new components, `--regime-color-rgb` flowing into orb gradient colors
**Avoids:** Pitfall 3 (dark glass invisibility — orbs provide the background depth that makes glass visible)
**Requires research-phase:** No for frosted nav and accent colors (standard CSS). Yes for ambient orbs if animated (GPU cost modeling needed).

### Phase 3: Component Audit and Consistency
**Rationale:** Existing components were built incrementally and have inconsistent token consumption (inline `rgba()` magic numbers instead of `--mp-*` variables). This phase refactors component files to be fully token-driven and performs the light-mode glass translucency audit.
**Delivers:** All 14 component CSS files refactored to consume only semantic tokens, light mode glass decision (aesthetic vs. utility), consistent hover glow across all card types, `contain: layout style` on glass panels
**Implements:** Architecture Pattern 1 (three-tier token cascade) fully applied to existing components
**Avoids:** Pitfall 2 (WCAG contrast — light mode translucency decision forces explicit contrast validation), Anti-Pattern 1 (inline magic numbers)
**Requires research-phase:** No — refactoring to existing token system is mechanical

### Phase 4: Performance Hardening
**Rationale:** After new glass surfaces and component refactoring add to the existing 33 `backdrop-filter` declarations, a dedicated performance pass is needed. Mobile GPU cost cannot be assessed accurately until the full component set is implemented.
**Delivers:** `content-visibility: auto` on below-fold sections, `backdrop-filter` removal from lower-priority elements on mobile, Lighthouse mobile score baseline, FPS validation on physical device
**Addresses:** Pitfall 6 (too many simultaneous blur layers), Pitfall 13 (mobile blur radius too high), Performance traps from PITFALLS.md
**Requires research-phase:** No for CSS `content-visibility` (well-documented). Yes if adding `IntersectionObserver`-based lazy glass activation (JS pattern needs validation).

### Phase 5: Accessibility and ECharts Validation
**Rationale:** WCAG contrast on glass surfaces depends on the final opacity and color values from phases 1–3. ECharts theme sync must be validated after glass card colors change. This phase is the sign-off gate.
**Delivers:** Full WCAG 2.1 AA contrast audit on all glass text/background pairs, ECharts `getTheme()` updated to match new glass token values, `prefers-reduced-motion` coverage complete for all new glass elements, `prefers-reduced-transparency` media query added
**Addresses:** Pitfall 2 (WCAG contrast), Pitfall 4 (ECharts canvas conflict), Pitfall 12 (reduced-motion coverage gaps)
**Requires research-phase:** No — verification phase using existing tools (WebAIM, DevTools, Playwright visual regression)

### Phase Ordering Rationale

- **Foundation first** is non-negotiable: the duplicate CSS block and nested blur bug will corrupt every subsequent phase if not fixed.
- **New components before audit** makes sense because the audit (Phase 3) needs the complete component set to be meaningful. Auditing 14 files and then adding 2 more would require a second audit pass.
- **Performance after visual completion** (not during) because `content-visibility` and backdrop-filter removal decisions depend on knowing the final number and placement of glass elements.
- **Accessibility last** (but continuous) because contrast ratios depend on final color values. Continuous checks during phases 2–3 catch regressions early; the Phase 5 audit is the formal sign-off.
- **Research flags** are minimal: this is a CSS redesign of a well-understood codebase with established patterns. The main uncertainty is mobile GPU behavior at scale, which requires physical device testing rather than additional research.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (Ambient Orbs — animated variant):** If orbs are to animate (pulse, shift color on regime change), the GPU cost needs to be modeled. Static orbs (CSS radial gradients, no animation) are safe. Animated orbs are a P3 feature and should remain deferred.
- **Phase 4 (IntersectionObserver lazy glass activation):** If the performance strategy includes dynamically activating/deactivating `backdrop-filter` via JS as elements scroll into/out of viewport, this pattern needs a prototype validation. It may create visual pop-in that is worse than the performance cost it saves.

Phases with standard patterns (skip research-phase):
- **Phase 1:** Pure CSS refactoring with fully inspected codebase. No research needed.
- **Phase 3:** Token consolidation is mechanical. No research needed.
- **Phase 5:** Accessibility tooling (WebAIM, Playwright, axe) is well-documented.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | CSS property values and browser support verified via caniuse.com. Font and icon recommendations verified via official repos. Glassmorphism trend claims are MEDIUM (WebSearch, marketing sources). |
| Features | HIGH | Current state audit performed via direct codebase inspection (`assets/css/custom/*.css`, `static/js/briefing/*.js`). Feature gaps are factual, not inferred. External web research is MEDIUM confidence. |
| Architecture | HIGH | Full codebase inspection: `custom.css`, all 14 component files, `params.toml`, `extend-head-uncached.html`, `render-charts.js`, `market-pulse-enhancements.js`. ECharts CSS variable wontfix confirmed via official GitHub issue #19743. |
| Pitfalls | MEDIUM-HIGH | Critical pitfalls verified via direct codebase analysis (nested backdrop-filter on `.mp-briefing-meta::before` is a live bug, duplicate CSS block at lines 89/218 is confirmed). Performance numbers sourced from community post-mortems (MEDIUM). |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Light mode glass aesthetic decision:** Research confirms that `rgba(255,255,255,0.9)` on a white background produces zero glass effect. The project must decide: is light mode "glass aesthetic" (requires non-white page background) or "elevated card utility" (current near-opaque behavior is correct for financial readability). This is a product decision, not a research gap. Resolve at the start of Phase 3.

- **Physical OLED device validation:** Dark glass invisibility (Pitfall 3) cannot be verified in DevTools. Requires testing on an actual OLED mobile device (Samsung Galaxy mid-range or similar). This should be a gate criterion for Phase 2 completion.

- **ECharts theme sync inventory:** The current `params.toml ↔ custom.css` sync contract is undocumented and manual. Before Phase 5, create an explicit mapping table of which CSS tokens have ECharts counterparts. The existing start (4 mappings documented in ARCHITECTURE.md) needs to be expanded to cover any new glass tokens introduced in Phases 2–3.

- **prefers-reduced-transparency coverage:** `@media (prefers-reduced-transparency: reduce)` has only ~72% browser support (Chrome 118+, not Safari or Firefox without flag). Implementing it is low-cost and correct but should not be the primary accessibility strategy — opacity floors and WCAG contrast are more broadly enforced.

---

## Sources

### Primary (HIGH confidence)
- Direct codebase inspection: `assets/css/custom.css`, all 14 `custom/*.css` files, `config/_default/params.toml`, `layouts/partials/extend-head-uncached.html`, `static/js/render-charts.js`, `static/js/market-pulse-enhancements.js`
- [caniuse.com: backdrop-filter](https://caniuse.com/css-backdrop-filter) — 95.76% global support confirmed
- [caniuse.com: color-mix()](https://caniuse.com/mdn-css_types_color_color-mix) — ~92% global, browser version breakdown verified
- [Apache ECharts Issue #19743](https://github.com/apache/echarts/issues/19743) — CSS variables wontfix confirmed
- [Phosphor Icons Web v2.1.2](https://github.com/phosphor-icons/web) — CDN usage and version verified
- [JetBrains Mono v2.304](https://github.com/JetBrains/JetBrainsMono/releases) — January 2025 release, Google Fonts availability confirmed
- [Design Token Architecture (Martin Fowler)](https://martinfowler.com/articles/design-token-based-ui-architecture.html) — three-tier token system authoritative reference
- [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) — stacking context behavior, browser baseline

### Secondary (MEDIUM confidence)
- [Axess Lab: Glassmorphism Meets Accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/) — WCAG contrast on glass, prefers-reduced-transparency
- [shadcn/ui GitHub Issue #327](https://github.com/shadcn-ui/ui/issues/327) — real-world backdrop-blur-sm performance jank report
- [Josh W. Comeau: Next-level frosted glass with backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/) — nested backdrop-filter double-blur behavior
- [Glassmorphism Implementation Guide 2025](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide) — CSS property values, blur range recommendations
- [Blowfish Advanced Customisation](https://blowfish.page/docs/advanced-customisation/) — RGB triplet variable format requirement confirmed
- [CSS Cascade Layers for Design Systems](https://css-tricks.com/organizing-design-system-component-patterns-with-css-cascade-layers/) — `@layer` organization pattern
- [NN/Group: Glassmorphism Definition and Best Practices](https://www.nngroup.com/articles/glassmorphism/) — UX hierarchy issues, over-application anti-patterns

### Tertiary (LOW confidence)
- [Glassmorphism 2026 Trends](https://invernessdesignstudio.com/glassmorphism-what-it-is-and-how-to-use-it-in-2026) — trend claims; marketing source, needs validation
- [Dark Glassmorphism 2025](https://editorialge.com/web-design-trends-dark-mode-glassmorphism/) — trend claims; WebSearch only

---

*Research completed: 2026-02-19*
*Ready for roadmap: yes*
