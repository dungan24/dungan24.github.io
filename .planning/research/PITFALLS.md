# Pitfalls Research

**Domain:** Glassmorphism UI/UX redesign on Hugo/Blowfish static site (financial briefing blog)
**Researched:** 2026-02-19
**Confidence:** MEDIUM-HIGH (MDN + multiple community post-mortems + direct codebase analysis)

---

## Critical Pitfalls

### Pitfall 1: backdrop-filter Stacking — Nested Glass Eats Itself

**What goes wrong:**
When a parent element already has `backdrop-filter` applied, any child element with its own `backdrop-filter` blurs the already-blurred parent content — not the original page background. This produces a "double-blur" visual artifact: muddy, washed-out, and visually incoherent. More severely, each additional stacking context created by `backdrop-filter` triggers a GPU compositing layer, making rendering costs multiplicative rather than additive.

**Why it happens:**
The codebase currently has 33 backdrop-filter declarations across 10 CSS files. The `.mp-briefing-meta::before` pseudo-element applies `backdrop-filter: blur(8px)` on top of its parent `.mp-briefing-meta` which itself has `backdrop-filter: var(--mp-glass-blur)` (14px). This is a live example of the pattern to avoid. Designers see frosted glass on one component and replicate the pattern to sub-elements without understanding the compositing cost.

**How to avoid:**
- Audit every `backdrop-filter` site — the rule is: blur the *container*, not the *child*.
- For pseudo-elements (`::before`, `::after`) that sit on top of glass containers: use solid (non-transparent) backgrounds, not additional backdrop-filter.
- Run a `grep -n "backdrop-filter" assets/css/**/*.css` count before and after each phase. Target: no more than 8-10 unique blur sources visible in any single viewport.
- In this codebase specifically: `.mp-briefing-meta::before` should use `background: rgba(10,10,26,0.95)` (fully opaque chip) instead of `backdrop-filter: blur(8px)`.

**Warning signs:**
- Pseudo-elements (`.element::before`, `.element::after`) that carry `backdrop-filter`
- A `backdrop-filter` element whose computed parent also has `backdrop-filter`
- `will-change: transform` on a parent + `backdrop-filter` on a child — this creates stacking context interference in Safari
- Visual muddiness in dark mode where you expect a crisp label-chip

**Phase to address:** Foundation phase — establish the no-nested-blur rule before any visual redesign begins.

---

### Pitfall 2: WCAG Contrast Failure on Translucent Text Backgrounds

**What goes wrong:**
Text on semi-transparent glass panes fails WCAG 2.2 contrast minimums (4.5:1 for body text, 3:1 for large/bold). The failure is invisible during design because the developer controls the background at review time. In production, the page background behind the glass changes — different hero image, different theme, different browser rendering — and the text becomes unreadable.

**Why it happens:**
Glassmorphism's core property is that the background *bleeds through*. WCAG contrast is measured against the *immediate* background of text, but with `backdrop-filter: blur`, the "background" is a blended sample of everything behind the pane — it varies per pixel. The current codebase uses `color: #CBD5E1` (slate-300) on `background: rgba(18,18,42,0.72)` in dark mode. This pair passes at 72% opacity because the page background is `#0A0A1A`, but only when that assumption holds. If the pane slides over a bright background graphic or a lighter section, contrast collapses.

Specifically risky in this project: news card excerpts (`color: #CBD5E1`, font-size 0.8rem), TOC text (`color: #64748B` — slate-500, frequently below 3:1 in light mode), and section labels at 0.7rem.

**How to avoid:**
- Enforce a minimum opacity floor: `--mp-glass-bg` dark variant should stay at or above `rgba(18,18,42,0.80)` — not lower.
- Set body text (`color: #CBD5E1`) as the floor; never use `#94A3B8` or dimmer for body-weight text on glass in dark mode.
- In light mode: `rgba(255,255,255,0.90)` is the glass minimum. Do not go below 0.85.
- Test contrast with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) using the *worst-case* background color (not the average).
- Add a `prefers-reduced-transparency` media query fallback (Chrome 118+, not supported in Safari or Firefox without flag — ~72% coverage):
  ```css
  @media (prefers-reduced-transparency: reduce) {
    --mp-glass-bg: rgba(10, 10, 26, 0.98);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  ```

**Warning signs:**
- Any text below `font-weight: 500` on glass at `font-size < 0.85rem`
- Muted text colors (`#64748B`, `#94A3B8`) used for anything beyond timestamps/captions
- Glass opacity being lowered for "aesthetic reasons" without a contrast re-check
- Small percentage-based opacity values on nested glass (opacity: 0.04 tints that layer)

**Phase to address:** Foundation phase — establish minimum contrast rules before components are built. Re-validate in each component phase with actual browser testing.

---

### Pitfall 3: Dark Mode Glass Invisibility (Black Background Annihilation)

**What goes wrong:**
Dark mode glassmorphism requires something behind the glass to distort. When the page background is very dark (this project's `#0A0A1A` — effectively near-black), a semi-transparent glass pane with `background: rgba(18,18,42,0.72)` and `backdrop-filter: blur(14px)` produces a pane that is visually indistinguishable from a solid dark surface. There is no "frosted" effect — just a slightly lighter dark rectangle. The glass aesthetic is lost. More dangerously, when the pane's border is subtle (`rgba(124,58,237,0.25)`) and the background is uniform dark, the entire card boundary disappears on low-brightness OLED displays.

**Why it happens:**
Glass effects require perceptual contrast between the element and what's behind it. A dark pane on a dark page has zero visual gradient to exploit. The effect only works when there's chromatic or luminance variation behind the glass surface — colored gradients, imagery, lighter backgrounds.

The cyberpunk grid background (`mp-home-shell::before` — `linear-gradient` lines on dark) provides partial relief on the homepage but not on article post pages which have a plain `#0A0A1A` body.

**How to avoid:**
- Never define glass opacity below 0.65 in dark mode when the page background is near-black — instead, raise the RGB values of the glass color to create luminance separation: `rgba(28, 28, 52, 0.75)` is better than `rgba(18,18,42,0.72)` for this.
- Add a colored tint to the glass in dark mode: `background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(0,240,255,0.03)) + var(--mp-glass-bg)` instead of flat opacity.
- Ensure post-article pages have a subtle background texture or gradient that gives the glass something to diffract.
- The colored border (`rgba(124,58,237,0.25)`) should increase to at least `0.40` in dark mode for visibility on OLED screens.

**Warning signs:**
- Card is visible in the browser on a normal laptop, but looks flat/solid on OLED phone
- Shadow on the card (`box-shadow`) is the primary (or only) visible depth cue
- A screenshot of the dark UI in grayscale shows zero distinction between card and background
- The blur value can be changed from 14px to 0px with no visible difference to the eye

**Phase to address:** Foundation phase (color system definition) and validated again in each component phase on an actual mobile OLED device.

---

### Pitfall 4: ECharts Canvas Does Not Participate in backdrop-filter

**What goes wrong:**
ECharts renders to a `<canvas>` element. Canvas content is composited by the browser as a bitmap layer — it does not get blurred by `backdrop-filter` applied to a parent or sibling container. If the glassmorphic `.market-chart-card` container applies `backdrop-filter: blur(12px)`, the chart canvas inside renders crisply on top of the blurred background, breaking the visual coherence. Worse: if ECharts is set to `backgroundColor: 'transparent'` (which is the current setup: `bg: "transparent"` in `render-charts.js` line 64) and the card has a dark semi-transparent glass background, the canvas sees the *composited* version of the parent's background, not the raw page — this can produce unexpected color shifts in chart colors when the card floats over different backgrounds.

Additionally, ECharts dark mode support is partial: `darkMode: true` in ECharts options only changes data label colors, not axis labels, legend text, or title text. Theme switching must be handled manually via the `getTheme()` function (already present in `render-charts.js`) — but if glass card backgrounds change during a redesign, chart text colors may no longer contrast properly against the new glass tint.

**Why it happens:**
Canvas elements are rasterized before compositing. `backdrop-filter` operates at the compositing stage, so it only affects elements rendered *in the normal document flow behind* the filtered element — not the canvas content itself. This is a known browser rendering order issue, not a bug.

**How to avoid:**
- Never apply `backdrop-filter` to a container that *also* directly wraps a canvas/ECharts element expecting the blur to "diffuse" into the chart background.
- Keep `.market-chart-card` glass treatment in the `border` and `box-shadow` only, or confine `backdrop-filter` to a `::before` layer behind the canvas.
- When changing glass card background colors, always re-check ECharts `getTheme()` fallback colors — specifically `axis`, `grid`, and tooltip `backgroundColor` values.
- Test chart cards specifically in light/dark mode transitions with actual data loaded, not just the skeleton/loading state.

**Warning signs:**
- Chart appears to "float" over a blurred pane while chart text looks wrong-contrast against the pane
- Theme toggle (dark ↔ light) makes chart text suddenly invisible
- ECharts tooltip background matches or blends into chart card background

**Phase to address:** Chart integration phase, and validated every time `--mp-glass-bg` or `--mp-chart-card-bg` values change.

---

### Pitfall 5: CSS Variable Redefinition — The Duplicate Light Mode Block

**What goes wrong:**
`custom.css` currently defines the light mode overrides for `--mp-glass-bg`, `--mp-glass-border`, `--mp-shadow-sm`, `--mp-neon-cyan`, `--mp-neon-purple`, and 6 color tokens **twice** — once in `:root:not(.dark) {}` at line ~89 and again at line ~218. These are identical blocks. The second block is either dead weight or a masked bug waiting for someone to change one but not the other. When a glassmorphism redesign adds new light-mode glass variables, this pattern will produce bugs where the first override is immediately cancelled by the second.

**Why it happens:**
CSS files accumulate over time in a no-build-tool static Hugo setup (no PostCSS, no bundler with deduplication). Duplicate `:root:not(.dark)` blocks are added when a developer forgets the block already exists and adds a new one at the bottom of the file. There is no linter or bundler to catch this.

**How to avoid:**
- Consolidate all light-mode variable overrides into a single `:root:not(.dark) {}` block in `custom.css` before adding any new glass tokens. Eliminate the duplicate block at line 218.
- Enforce a rule: all `--mp-*` variable definitions live *only* in `custom.css:root {}` and `custom.css:root:not(.dark) {}`. Sub-files use the variables, never redefine them.
- Add a comment header above the light-mode block: `/* SINGLE SOURCE OF TRUTH — do not duplicate */`.

**Warning signs:**
- Running `grep -n ":root:not(.dark)" assets/css/custom.css` returns more than 2 results (`:root:not(.dark)` and `.dark :root:not(.dark)` pattern)
- A light-mode color change has no visual effect
- A new dark-mode variable works correctly but the light-mode version is ignored

**Phase to address:** Foundation phase — clean up before adding any new variables.

---

## Moderate Pitfalls

### Pitfall 6: Performance Degradation — Too Many Simultaneous Blur Layers

**What goes wrong:**
The current codebase has backdrop-filter on: `.briefing-section` (multiple instances per page), `.mp-ticker-group` (up to 4 per page), `.mp-news-card` (up to 8 per page), `.mp-post-hero`, `.mp-briefing-meta`, `#TOCView`, `.market-chart-card`, and calendar elements. On a typical post page, 15-25 elements with active `backdrop-filter` can be in the viewport simultaneously. Each unique blurred element becomes a GPU compositing layer. On mid-range Android phones (2021-2023 era, the majority of mobile users), this causes visible jank during scroll and layout shifts during initial render.

**How to avoid:**
- Limit active `backdrop-filter` elements in any single viewport to 8-10 maximum.
- The article body (`.briefing-section`) is the highest priority — these must blur. Deprioritize: `.mp-ticker-group` (can use solid dark background instead of glass), `.mp-news-card` (use a slightly lighter solid dark instead of glass), `.mp-briefing-meta` (non-critical).
- Add `content-visibility: auto` to `.briefing-section` elements below the fold — this prevents off-screen sections from triggering compositing layers.
- Use `@media (prefers-reduced-motion: reduce)` to disable `backdrop-filter` entirely for users who have opted out (already partially done in the codebase, but the TOC glass is missing from the reduced-motion block).
- Reduce blur radius on mobile: `--mp-glass-blur: blur(8px) saturate(1.2)` at `@media (max-width: 768px)` instead of the full `blur(14px) saturate(1.4)`.

**Warning signs:**
- Scroll FPS drops below 30 on a mid-range Android (test with Chrome DevTools device emulation + frame rate meter)
- Chrome Performance trace shows "Compositing" as the dominant paint cost
- Battery drain complaints from mobile users

**Phase to address:** Foundation phase (establish limits) and performance validation phase after component implementation.

---

### Pitfall 7: Blowfish Theme RGB Variable Format Collision

**What goes wrong:**
Blowfish's color scheme system requires CSS color variables in a non-standard format: `--color-primary-500: 99, 102, 241;` (bare RGB triplet, no `rgb()` wrapper). This is consumed as `rgb(var(--color-primary-500))`. If a glassmorphism redesign introduces new Blowfish-style scheme overrides while also adding standard hex or rgba tokens, the formats will collide if someone tries to use one format where the other is expected. Specifically: Blowfish Tailwind utilities that consume these values will break if the format is wrong.

**How to avoid:**
- Keep a strict separation: Blowfish scheme variables (`--color-*`) use the bare RGB triplet format. Market Pulse custom variables (`--mp-*`) use standard CSS color formats.
- Never mix the two namespaces. If a new glassmorphism color needs to integrate with Blowfish Tailwind utilities, define it in the scheme file in triplet format AND as a standard CSS custom property in `custom.css`.

**Warning signs:**
- `background: rgb(var(--mp-some-color))` fails silently (no rendering)
- Blowfish-generated Tailwind classes (like `bg-primary`) stop working after a scheme file edit

**Phase to address:** Foundation phase (color system definition).

---

### Pitfall 8: Light Mode Glass is Just "White Box" — No Actual Glass Effect

**What goes wrong:**
The light-mode implementation sets `--mp-glass-bg: rgba(255, 255, 255, 0.9)` — this is 90% opaque white, which on a white/near-white page background produces zero glass effect. The `backdrop-filter: blur()` runs but has nothing to blur. The result is aesthetically identical to a solid white card with a subtle border. This is not necessarily wrong, but if the redesign goal is to achieve glassmorphism in light mode, 90% opaque white on a white background will not achieve it.

**How to avoid:**
- Accept that true glassmorphism in light mode requires either: (a) a non-white page background (subtle warm cream, pale blue, etc.), OR (b) a lower opacity on the glass pane (0.6-0.7) — but this must clear contrast requirements.
- The current approach is actually *correct for readability* — the "light mode glass" is intentionally near-opaque for financial content legibility. The redesign should explicitly decide: is light mode glass aesthetic or utility?
- If aesthetic light mode glass is desired, the page background needs sufficient color texture behind glass panes, not a flat white/grey.

**Warning signs:**
- Light mode screenshot looks identical with and without `backdrop-filter`
- A/B test shows zero difference in light mode between `blur(14px)` and `blur(0px)`

**Phase to address:** Color system definition phase.

---

### Pitfall 9: Typography Thin Weights on Glass — Financial Numerics Especially

**What goes wrong:**
Glassmorphism guidelines consistently recommend medium-to-bold font weights (500+) for text on glass surfaces. This project has several instances of `font-weight: 400` text at small sizes on glass — specifically `.mp-ticker-price` (0.8rem, presumably 400 weight), `.mp-news-card__excerpt` (0.8rem), and `.mp-briefing-meta span` (0.75rem). Financial numbers at small sizes on blurred backgrounds with thin weight become unreadable on mobile in bright ambient light. Korean characters (Noto Sans KR) are particularly affected because the strokes are thinner at small sizes.

**How to avoid:**
- Floor font-weight at 500 for all text on glass surfaces. Use 600 for any numerical data.
- Floor font-size at 0.75rem for body content on glass. 0.7rem or below should only appear for decorative labels (source tags, category chips).
- Apply `font-smooth: auto` and `-webkit-font-smoothing: subpixel-antialiased` for numerical data on glass.

**Warning signs:**
- Financial numbers look "thin" or "fuzzy" on iOS Safari (different subpixel rendering)
- Korean text at 0.72rem becomes indistinct on Android with default `antialiased`

**Phase to address:** Typography validation pass in each component phase.

---

### Pitfall 10: Animation Conflicts — will-change + backdrop-filter + transform

**What goes wrong:**
The current `toc-and-effects.css` applies `will-change: opacity, transform` to `.briefing-section` for scroll-reveal, while `custom.css` also applies `backdrop-filter` to the same elements. Safari specifically has a known conflict where `will-change: transform` on a parent creates a stacking context that prevents `backdrop-filter` from working correctly on children. Additionally, the `fade-in-up` animation on `.mp-ticker-group` and `.briefing-section` runs on page load with `opacity: 0` start — if there are multiple `backdrop-filter` elements animating simultaneously on load, this compounds the GPU layer cost.

**How to avoid:**
- Never combine `will-change: transform` and `backdrop-filter` on the same element. Move `will-change` to a wrapper `div` if needed.
- The scroll-reveal pattern in `toc-and-effects.css` (opacity + transform animation) should be on a plain wrapper, not the glass element itself. Glass effect should be on the inner styled element.
- Stagger animations already exist (`.nth-child` delays) — ensure the max visible animations at any one time does not exceed 3-4 for glass elements.

**Warning signs:**
- `backdrop-filter` stops working after a CSS animation completes in Safari
- Elements appear "correct" in Chrome but "flat" (no blur) in iOS Safari
- DevTools Layers panel shows unexpectedly large number of promoted layers

**Phase to address:** Animation integration phase.

---

## Minor Pitfalls

### Pitfall 11: Hugo Static File vs. Asset Pipeline — Custom CSS Load Order

**What goes wrong:**
Blowfish loads `custom.css` *after* all theme styles — correct for cascade override. However, custom CSS split across `assets/css/custom/*.css` sub-files relies on Hugo's asset pipeline to bundle them. If a new glass token is added in a sub-file (e.g., `calendar-polish.css`) but the variable is defined in `custom.css`, the variable is available. But if a new sub-file tries to *define* a variable that `custom.css` also defines, and the load order between sub-files is alphabetical, a later-alphabetically-named file can silently win, overriding the canonical definition.

**How to avoid:**
- Rule: only `custom.css` defines `--mp-*` variables. Sub-files are consumers only.
- If Hugo's CSS bundling order is unclear, add `/* load order: N */` comments to sub-files and verify in browser DevTools > Sources.

**Warning signs:**
- A variable change in `custom.css` has no effect but changing it in a sub-file does

**Phase to address:** Foundation phase.

---

### Pitfall 12: prefers-reduced-motion Block Misses Some Glass Elements

**What goes wrong:**
The existing `prefers-reduced-motion` block in `toc-and-effects.css` correctly disables animations and removes `backdrop-filter` from `.briefing-section`, `.mp-ticker-group`, `.mp-briefing-card`, `.mp-news-card`, and `.mp-post-hero`. However, `#TOCView` (which has `backdrop-filter: blur(16px) saturate(1.8)`) and `.market-chart-card` (which has `backdrop-filter: blur(12px)`) are not in the reduced-motion block. When a glassmorphism redesign adds new glass elements, they will also be missing from this block.

**How to avoid:**
- Maintain a master list of all elements with `backdrop-filter`. Every element on this list must appear in the `prefers-reduced-motion: reduce` block with `backdrop-filter: none`.
- Add `#TOCView` and `.market-chart-card` to the current block immediately.

**Warning signs:**
- New glass element added during implementation but not added to `prefers-reduced-motion` override
- `grep -n "backdrop-filter:"` count in CSS > count in `@media (prefers-reduced-motion: reduce)` block

**Phase to address:** Each implementation phase — make reduced-motion coverage a phase completion criterion.

---

### Pitfall 13: Mobile Glass Blur Radius Too Expensive — 14px Is Too High

**What goes wrong:**
The current `--mp-glass-blur: blur(14px) saturate(1.4)` is applied at all viewport sizes. On low-end mobile devices, a `blur(14px)` `backdrop-filter` on a full-width card is significantly more expensive than `blur(6px)`. Community post-mortems (shadcn/ui issue #327, Nextcloud spreed issue #7896) confirm that blur values above 8-10px cause measurable frame rate drops on devices below mid-range. The additional `saturate(1.4)` compounds this: combined filter chains are more expensive than single filters.

**How to avoid:**
- Reduce `--mp-glass-blur` to `blur(8px)` at `@media (max-width: 768px)`. Drop `saturate()` entirely on mobile — the effect is subtle and not worth the cost.
- At `@media (max-width: 480px)` consider `blur(4px)` or removing `backdrop-filter` entirely and using a slightly more opaque solid background.

**Warning signs:**
- Chrome "Heavy CPU" warning in DevTools when scrolling on mobile emulation
- LCP (Largest Contentful Paint) degraded in Lighthouse mobile audit

**Phase to address:** Performance optimization phase.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Duplicate `:root:not(.dark)` blocks | Quick override, no existing block search needed | Silent override wins, unpredictable cascade | Never — always find and extend the canonical block |
| Inline `backdrop-filter` in component CSS instead of using `--mp-glass-blur` variable | Component is self-contained | Glass blur value now differs per component; global tuning requires editing 10+ files | Never in this project — the variable exists for exactly this reason |
| Setting glass opacity to `rgba(..., 0.5)` or lower for aesthetics | More "glassy" appearance | Contrast failure, invisible on OLED dark, fails WCAG | Only with explicit contrast verification showing 4.5:1 maintained |
| Adding `will-change: transform` to glass elements for "smooth hover" | Smoother hover lift animation | Creates stacking context, breaks `backdrop-filter` in Safari, multiplies GPU layers | Never on glass elements — apply to a non-glass wrapper |
| Setting `backdrop-filter` on pseudo-elements (`::before`/`::after`) of glass containers | Decorative label chip looks "glassy" | Double-blur artifact, stacking context nesting, extra compositing cost | Never — use opaque backgrounds on pseudo-elements inside glass containers |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| ECharts + glass card | Applying `backdrop-filter` to `.market-chart-card` expecting the chart to look "frosted" | Keep glass on `border` and `box-shadow` only; ECharts canvas does not participate in backdrop blur |
| ECharts dark mode | Using `darkMode: true` in ECharts options and expecting all text to flip | Must manually manage all text colors via `getTheme()` — `darkMode` only affects data labels |
| Blowfish Tailwind + custom CSS | Defining `--mp-*` colors in scheme file using hex instead of bare RGB triplet | Scheme file must use `R, G, B` format; `--mp-*` in `custom.css` use normal hex/rgba |
| Hugo asset pipeline + CSS sub-files | Defining `--mp-*` variables in sub-files thinking they'll win cascade | Variables defined in sub-files may have unpredictable precedence; keep all `--mp-*` definitions in `custom.css` |
| Korean typography (Noto Sans KR) + glass | Using thin weights at small sizes expecting same legibility as Latin | Noto Sans KR strokes are thinner; use weight 500+ at any size below 0.9rem on glass |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| 15+ simultaneous `backdrop-filter` elements in viewport | Scroll jank, FPS below 30, battery drain | Limit to 8-10; use `content-visibility: auto` for below-fold sections | Low-to-mid-range Android phones (Snapdragon 6xx era), all iPhones below iPhone 12 |
| `backdrop-filter` + `transition` on hover | "Shimmer" artifact during transition in Safari, expensive GPU re-composite | Transition `box-shadow` and `border-color` only; avoid transitioning `backdrop-filter` itself | Any device during rapid hover/scroll events |
| Animated `background-position` (grid-scroll in `toc-and-effects.css`) + multiple glass elements | Full-page repaint on each animation frame | The grid animation is already behind `pointer-events: none` and masked — acceptable, but don't add more full-page animations | Low-end mobile where this already costs 5-10% CPU |
| `backdrop-filter: blur(14px)` on mobile full-width elements | LCP degraded, Time to Interactive increased | Reduce to `blur(6-8px)` on mobile, or use solid background with slightly lower opacity | Any mobile viewport, especially on 5-year-old devices |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Glass aesthetic obscures financial data hierarchy | Users cannot distinguish which card is "most important" — everything looks equally frosted | Use glass for containers, not content. Strong typography contrast and clear typographic hierarchy matter more than glass uniformity |
| Glass card with no visible border on dark OLED | Card boundaries disappear; UI feels like undifferentiated dark soup | Minimum `rgba(124,58,237,0.40)` border opacity in dark mode; supplement with `box-shadow` |
| Hover `transform: translateY(-1px)` on 15+ glass elements | Mobile users with fat fingers trigger multiple accidental hovers while scrolling; transform triggers re-composite | Remove hover transforms on glass elements entirely for `@media (hover: none)` (touch devices) |
| Glassmorphism applied uniformly to all UI surfaces | "Everything is glass" = nothing is glass. Visual noise with no hierarchy. Specific to this codebase: news cards, ticker groups, TOC, post hero, briefing sections, calendar are all glass simultaneously | Reserve glass for hero/structural elements (briefing sections, post hero). Ticker groups and news cards can use subtle solid dark with colored borders |
| Font size reduction on glass to "fit more data" | Financial data at <0.7rem on blurred background is unreadable on mobile | Floor: 0.75rem for timestamps/captions, 0.85rem for data values, 1rem for headlines. Non-negotiable on glass |

---

## "Looks Done But Isn't" Checklist

- [ ] **Dark mode glass:** Card is visible in Chrome DevTools — verify on an actual OLED mobile device. The effect often "works" in emulation but disappears on OLED.
- [ ] **Contrast ratios:** Glass looks right with the current page content — re-check if the background behind the glass *changes* (e.g., hero section vs. body section).
- [ ] **Safari/iOS backdrop-filter:** Works in Chrome — test specifically in iOS Safari where stacking context + `backdrop-filter` + `position: sticky` combinations have known bugs.
- [ ] **ECharts after theme toggle:** Charts look correct on initial load — verify chart text colors remain legible after toggling dark/light mode (the `THEME_RERENDER_DELAY_MS = 150` suggests this is already a known issue).
- [ ] **prefers-reduced-motion coverage:** Motion disabled globally — verify that all glass elements (not just the ones currently in the reduced-motion block) have `backdrop-filter: none` in the media query.
- [ ] **Mobile scroll performance:** UI looks smooth in desktop DevTools throttling — test on a real mid-range Android phone. DevTools CPU throttling does not accurately model GPU compositing cost.
- [ ] **Korean text legibility:** Typography looks fine at desk — check Noto Sans KR at 0.7-0.8rem on a mobile screen in ambient light.

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Nested backdrop-filter producing mud | LOW | Find and remove inner `backdrop-filter`; use opaque background on inner pseudo-element |
| WCAG contrast failure discovered post-launch | MEDIUM | Increase glass opacity (raise rgba alpha) or darken text; verify no cascading visual regressions |
| Dark mode glass invisible on OLED | LOW | Increase glass RGB base values + increase border opacity; no layout changes needed |
| ECharts text invisible after glass card color change | LOW | Update `getTheme()` in `render-charts.js` with corrected contrast values |
| Mobile scroll jank from too many blur layers | MEDIUM | Selectively remove `backdrop-filter` from lower-priority elements (ticker groups, news card micro-glass); add `@media (max-width: 768px)` overrides |
| Duplicate variable block causing silent override | LOW | Merge duplicate blocks; test all themes |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Nested backdrop-filter stacking | Foundation (CSS audit + variable consolidation) | `grep` count of backdrop-filter on pseudo-elements = 0 |
| WCAG contrast failure | Foundation (color system definition) | WebAIM checker on all text/background pairs |
| Dark mode glass invisibility | Foundation (color system) + mobile testing | Physical OLED device test |
| ECharts canvas/glass conflict | Chart integration phase | Theme toggle test with actual chart data |
| Duplicate CSS variable block | Foundation (CSS audit) | Single `:root:not(.dark)` block in `custom.css` |
| Too many simultaneous blur layers | Performance optimization phase | Lighthouse mobile score + FPS meter |
| Blowfish RGB format collision | Foundation (color system) | Build passes, Blowfish Tailwind classes render |
| Light mode glass = solid white | Color system phase (explicit decision) | Side-by-side blur(14px) vs blur(0) screenshot test |
| Thin typography on glass | Each component phase | Mobile legibility check at 0.75rem |
| will-change + backdrop-filter conflict | Animation integration phase | Safari iOS visual comparison |
| Hugo CSS sub-file load order | Foundation | Variable defined in sub-file has no effect when defined in custom.css |
| prefers-reduced-motion coverage gaps | Each component phase | Complete `backdrop-filter: none` in reduced-motion block |
| Mobile blur radius too high | Mobile optimization phase | Lighthouse mobile audit, physical device FPS check |

---

## Sources

- [Axess Lab: Glassmorphism Meets Accessibility](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/) — WCAG contrast ratios, prefers-reduced-transparency, screen reader issues
- [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter) — Stacking context creation, browser baseline (2024)
- [Alpha Efficiency: Dark Mode Glassmorphism](https://alphaefficiency.com/dark-mode-glassmorphism) — Opacity 30-50% calibration, dark mode failure modes
- [NN/Group: Glassmorphism Definition and Best Practices](https://www.nngroup.com/articles/glassmorphism/) — UX hierarchy issues, over-application
- [shadcn/ui GitHub Issue #327](https://github.com/shadcn-ui/ui/issues/327) — backdrop-blur-sm performance issue, real-world jank report
- [Josh W. Comeau: Next-level frosted glass with backdrop-filter](https://www.joshwcomeau.com/css/backdrop-filter/) — Nested backdrop-filter double-blur behavior
- [Apache ECharts Issue #20229](https://github.com/apache/echarts/issues/20229) — ECharts transparency/opacity, `backgroundColor: 'transparent'` usage
- [Can I Use: prefers-reduced-transparency](https://caniuse.com/mdn-css_at-rules_media_prefers-reduced-transparency) — ~72% coverage (Chrome 118+, not Safari)
- [Blowfish Advanced Customisation](https://blowfish.page/docs/advanced-customisation/) — RGB triplet variable format requirement
- Direct codebase analysis: 387 `--mp-*` usages across 15 CSS files, 33 `backdrop-filter` declarations across 10 files, duplicate `:root:not(.dark)` blocks at lines 89 and 218 in `custom.css`

---

*Pitfalls research for: Glassmorphism UI redesign — Market Pulse / dungan24.github.io*
*Researched: 2026-02-19*
