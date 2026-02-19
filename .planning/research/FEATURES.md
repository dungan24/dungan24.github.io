# Feature Research

**Domain:** Glassmorphism financial briefing blog / data dashboard
**Researched:** 2026-02-19
**Confidence:** HIGH (codebase audit HIGH, web research MEDIUM-HIGH)

---

## Current State Audit

The project already implements a substantial glassmorphism foundation. Research differentiates what's
already done, what's missing but table stakes, and what would be genuinely differentiating.

**Already implemented (well):**
- Glass card shell: `backdrop-filter: blur(14px) saturate(1.4)`, border, shadow tokens
- Dark/light mode dual-track via CSS variables
- Regime-driven dynamic `--regime-color` CSS variable
- News cards (`mp-news-card`) with source badge, headline, excerpt, KR/EN tags
- Ticker groups with sparklines and up/down coloring (Korean convention aware)
- Calendar with impact-color timeline dots and filter pills
- ECharts market chart cards with glass wrapping
- TOC scrollspy with sticky glass panel
- Section scroll-reveal with `prefers-reduced-motion` fallback
- Briefing meta footer glass panel
- HUD corner decorations, ECG pulse SVG, scanline overlay, neon grid (dark only)

**Gaps identified from codebase audit:**
- No frosted sticky navigation (Blowfish theme nav, no custom glass treatment)
- No ambient orb background behind glass cards (placeholder class exists, not rendered)
- News card grid collapses to single column on mobile (no horizontal scroll variant)
- No skeleton loading state for news cards (only chart cards have it)
- No category-color differentiation on news cards (source badge is always purple)
- No "time since published" relative timestamp (static KST string only)
- Light mode glass is near-opaque (0.9 alpha) -- not truly glass
- Cyberpunk CSS art (scanlines, glitch, grid) has no `prefers-reduced-motion` guard for `body::after`

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that define the minimum bar for a premium financial data blog in 2025-2026.
Missing any of these makes the product feel unfinished.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Glass card shell with hover lift | Every glassmorphism UI does this; users expect depth response | LOW | Already done: `briefing-section`, `mp-news-card`, `mp-ticker-group` all have hover effects. Needs audit for consistency. |
| Sticky frosted navigation bar | Standard for any dark-themed financial site; Bloomberg, Koyfin, etc. | LOW | Not done. Blowfish nav gets theme color but no custom glass treatment. |
| Dark / light mode toggle with clean glass states | Users toggle; both states must look intentional, not broken | MEDIUM | Done in principle; light mode glass is near-opaque (rgba 0.9) -- needs true translucency audit. |
| Regime color theming (bull/bear/neutral) | Core product identity; accent color should flow everywhere | LOW | Done. `--regime-color` CSS var injected by JS. Needs consistency audit across all new components. |
| News card grid with category differentiation | Source/category context is expected in financial news | MEDIUM | Partially done. Source badge always purple; no per-category color. |
| Up/down color semantics (Korean convention) | Korean users: red=up, blue=down. Wrong colors destroy trust | LOW | Done correctly. `--mp-color-up`/`--mp-color-down` CSS vars with light/dark variants. |
| Tabular numbers for financial data | Misaligned columns are visually broken for number-heavy content | LOW | Done in table cells. Needs audit in ticker rows and KPI displays. |
| Mobile-responsive card layout | Mobile is primary for Korean market; broken mobile = unusable | MEDIUM | Done for most components. News grid and chart grid both collapse to 1-col on mobile. |
| `prefers-reduced-motion` respect | Users with vestibular disorders; also required for WCAG 2.2 | LOW | Mostly done. Body scanline overlay (`body::after`) animation missing the guard. One gap. |
| Accessible contrast on glass surfaces | WCAG AA: 4.5:1 body text, 3:1 large text. Glass fails by default without compensation | HIGH | Partially addressed with text-shadow and explicit color values. Full WCAG audit not done. |
| Chart loading skeleton / spinner | Users need feedback that data is loading, not broken | LOW | Done for chart cards only (`chart-loading-state`, `chart-spinner`). Missing from news grid. |
| Section labels / data attribution | Financial data needs provenance. Section badges ("// FACTS") build trust | LOW | Done with `::before` pseudo-element labels. Consistent across briefing sections. |

### Differentiators (Competitive Advantage)

Features that push this beyond generic glassmorphism templates and align with the financial briefing identity.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Ambient orb background system | Creates the "depth behind glass" that makes glass actually pop. Static glass without background depth looks like a flat card with opacity. | MEDIUM | Placeholder `.mp-ambient-orbs` class exists but is never populated. Need to implement regime-colored radial gradient orbs that pulse slowly behind cards. |
| Per-category news card accent colors | Differentiates news importance visually at a glance (macro vs earnings vs geo vs policy) | MEDIUM | Currently all cards use the same purple/cyan. Map category -> accent color using CSS vars. Low JS cost, high visual clarity payoff. |
| Regime-aware glass tinting | The glass cards themselves subtly tint toward the active regime color (bull=green tint, bear=red tint, cautious=amber) | MEDIUM | Not done. Would set `--mp-glass-bg` or inject a `rgba(--regime-color-rgb / 0.04)` layer. Extremely differentiated -- no financial blog does this. |
| ECG pulse / heartbeat animation on hero | Existing feature. Reinforces "live market data" identity far better than a static headline | LOW | Done. Should be preserved and potentially enhanced with regime-color sync. |
| Impact-level color dots on calendar timeline | High/medium/low event impact is color coded (red/yellow/gray) | LOW | Done. `.is-high` rose, `.is-medium` yellow. Should be extended to the calendar grid cells too. |
| Sparklines in ticker rows | Mini trend context without requiring a full chart | LOW | Done (`mp-sparkline`). Needs SVG/canvas implementation audit -- class exists, verify rendering. |
| Scroll-reveal stagger animation for sections | Sections animate in sequence as user scrolls, creates sense of data "loading in" progressively | LOW | Done for sections 1-5. Works well, respects reduced motion. |
| HUD corner decorations on hero | Sci-fi aesthetic that signals "professional data terminal" | LOW | Done. Light mode correctly hides them. |
| TOC scrollspy with regime-colored active state | Active section indicator uses regime color -- ties navigation to market state | LOW | Done. `var(--regime-color, var(--mp-neon-cyan))` for active TOC item. |
| Glass filter pills for calendar (Control Deck style) | Grouped, pill-shaped filter controls that feel like a trading terminal selector | LOW | Done. The "Control Deck" pattern is production-ready. |
| Neon glow hover states on cards | Glass cards glow with brand neon on hover -- feedback that matches the aesthetic | LOW | Done for briefing-section and ticker-group. Needs consistency check on news cards and chart cards. |
| @supports fallback for non-backdrop-filter browsers | Graceful degradation: raise opacity to 0.95+ when blur not available | LOW | Not done. Currently no `@supports` query. Add alongside existing CSS. |
| Semantic section zone coloring (FACT vs OPINION) | Fact sections get purple left border; opinion sections get cyan. Semantic distinction at a glance | LOW | Done. `briefing-section--fact` and `briefing-section--opinion` variants. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem valuable but introduce more problems than they solve for this specific project.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Animated backdrop-filter | "The glass should shimmer/animate" -- looks impressive in demos | `backdrop-filter` animation is the single most GPU-expensive CSS operation. On mobile causes jank and battery drain. Performance research (2025) explicitly warns against animating blur. | Animate border-color, box-shadow, and opacity instead. These are composited and cheap. The glass blur stays static; only its frame animates. |
| Many simultaneous glass layers | "Everything should be frosted" -- maximalist glass | Performance cap: limit 2-3 backdrop-filter elements per viewport. More than this causes compounding GPU cost especially on mid-range Android. | Use glass for primary containers only (briefing-section, TOC, nav). Inner elements like news cards can use `rgba` backgrounds without blur. |
| Real-time data updates with DOM thrashing | "Price tickers should update live" | Hugo is a static site. Polling or WebSocket would require a backend. DOM updates inside glass cards cause expensive repaints. | Static snapshot data is the contract. Timestamps clearly show "as of KST" data age. Don't fake real-time. |
| Heavy glow animations running constantly | "Neon pulses look great" -- e.g., `box-shadow` animation on every card | Constant `box-shadow` animation (like `pulse-glow` running on many elements) causes layout recalculation. Current implementation correctly applies to specific elements (`.mp-heartbeat`, `.mp-status-dot`). | Keep glow animations only on the hero heartbeat and status dots. Cards should only glow on hover (transition, not animation). |
| Full bleed background images behind glass | "Glassmorphism needs a photo background to work" | True for the original glassmorphism pattern, but this is a financial terminal, not a lifestyle app. Photo backgrounds hurt text readability behind glass and don't fit the cyberpunk identity. | Use CSS-rendered backgrounds: the neon grid (`::before`), ambient orbs, and linear gradients. These are controllable and don't load external assets. |
| Custom font loading (display fonts) | "A unique font makes it feel premium" | Korean content requires `Noto Sans KR` which is already a large font load. Adding a second display font (e.g., Orbitron for headers) doubles font load and adds ~100-200ms LCP cost. | Use `font-weight: 700-800`, `letter-spacing`, `text-transform: uppercase` on Noto Sans KR to achieve display character without additional font. Already done in the codebase. |
| Dark mode glassmorphism on light mode surfaces | "Glass looks the same in both modes" | Glass effect requires darkness contrast behind the blur. Light mode glass with `backdrop-filter: blur()` over a white background produces zero visual effect. The blur has nothing to reveal. | Light mode uses near-opaque white with colored border and shadow. This is correct. The visual language shifts: dark mode = glass, light mode = elevated card. Document this as intentional. |
| Skeleton screens for all components | "Every component should show skeletons while loading" | Most content comes from Hugo SSG at build time. The only truly async components are charts (ECharts, loads JSON) and the home market overview (fetches data). Skeletons elsewhere would flash and immediately be replaced. | Apply skeletons only to genuinely async: chart cards (done), home market overview ticker (not done). Static prose content doesn't need skeletons. |

---

## Feature Dependencies

```
Regime Color System (--regime-color CSS var)
    └──feeds──> Regime Hero Badge (mp-post-hero)
    └──feeds──> TOC Active State color
    └──feeds──> Briefing Section left border
    └──feeds──> Ambient Orbs (color of radial gradients) [MISSING]
    └──feeds──> Regime-aware glass tinting [MISSING]

Glass Token System (--mp-glass-bg, --mp-glass-blur, --mp-glass-border)
    └──requires──> CSS custom properties foundation [DONE]
    └──feeds──> All card containers
    └──feeds──> TOC panel
    └──feeds──> Frosted nav [MISSING]
    └──feeds──> Briefing meta footer

Ambient Orb Background [MISSING]
    └──requires──> Glass Token System (orbs must sit behind glass)
    └──enhances──> All glass cards (gives them something to blur)
    └──conflicts──> Light mode (must be hidden in light mode)

Category Color System [MISSING -- PARTIALLY DONE]
    └──requires──> News card source/category metadata (exists in DOM)
    └──feeds──> News card accent border color
    └──feeds──> News section label color

@supports backdrop-filter fallback [MISSING]
    └──requires──> Glass Token System
    └──enhances──> Accessibility for older browsers
    └──does not conflict with anything

prefers-reduced-motion complete guard
    └──blocks──> body::after animation (scanline) -- gap exists
    └──blocks──> All transitions (mostly done in toc-and-effects.css)
```

### Dependency Notes

- **Ambient Orbs require Glass Token System:** Orbs are behind the glass; they provide the background depth that makes the blur visible. Without a background, `backdrop-filter: blur()` has no effect.
- **Regime-aware glass tinting requires Regime Color System:** The tinting injects `rgba(var(--regime-color-rgb) / 0.04)` into the glass background gradient. JS must set `--regime-color-rgb` before paint.
- **Frosted nav requires Glass Token System:** The nav uses the same tokens. But it also requires careful z-index management since Blowfish's nav is a theme component, not custom.
- **@supports fallback does not conflict with anything:** It's purely additive. Add `@supports not (backdrop-filter: blur(1px))` blocks alongside existing rules.

---

## MVP Definition

This is a redesign of an existing, working product. "MVP" means the minimum scope to ship the
glassmorphism upgrade without regression, not the minimum to have any product.

### Ship With (Redesign v1)

- [ ] Frosted sticky navigation bar -- first thing users see, most visible gap
- [ ] Ambient orb background system -- without it, glass cards have nothing to blur over
- [ ] Regime-aware glass tinting -- signature differentiator, relatively low effort
- [ ] `@supports backdrop-filter` fallback -- correctness gap, 1 hour to fix
- [ ] `body::after` reduced-motion gap -- accessibility correctness, 5 minutes
- [ ] Light mode glass translucency audit -- currently near-opaque, defeats purpose
- [ ] Per-category news card accent color -- high visibility, low complexity

### Add After Validation (v1.x)

- [ ] News card skeleton loading -- only if async news loading is added
- [ ] Calendar grid cell impact coloring -- extends existing impact-dot system
- [ ] Sparkline implementation audit -- verify SVG rendering, not just CSS class
- [ ] Consistent hover glow audit across all card types

### Future Consideration (v2+)

- [ ] Regime-aware ambient background animation (orbs shift color on regime change)
- [ ] Print stylesheet that removes all glass effects for clean printing
- [ ] High-contrast mode override (`forced-colors: active`) for Windows HC mode

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Frosted sticky nav | HIGH | LOW | P1 |
| Ambient orb background | HIGH | LOW | P1 |
| @supports fallback | MEDIUM | LOW | P1 |
| prefers-reduced-motion gap fix | MEDIUM | LOW | P1 |
| Regime-aware glass tinting | HIGH | LOW | P1 |
| Per-category news card accent | HIGH | MEDIUM | P1 |
| Light mode translucency audit | MEDIUM | MEDIUM | P2 |
| Sparkline rendering audit | MEDIUM | LOW | P2 |
| Calendar grid impact coloring | MEDIUM | LOW | P2 |
| Consistent hover glow audit | LOW | LOW | P2 |
| News card skeletons | LOW | MEDIUM | P3 |
| Regime orb animation | MEDIUM | HIGH | P3 |

**Priority key:**
- P1: Required for redesign milestone to close
- P2: Should add in same milestone if time allows
- P3: Defer to follow-up milestone

---

## Mobile-Specific Patterns

### What Works on Mobile

- Single-column card stacks (already implemented for most components)
- Reduced blur radius: 6-8px instead of 14px (current 14px may be excessive on mid-range Android)
- Static glass (no hover states on touch devices -- touch has no hover)
- Compact padding: already handled via mobile media queries
- Removing decorative CSS art (scanlines, HUD corners, neon grid) -- already done
- Disable ambient orb animations: already patterns in codebase with `display: none` in light mode

### What Doesn't Work on Mobile

- Multiple simultaneous `backdrop-filter` elements in the same scroll viewport
- Animated `backdrop-filter` (confirmed GPU cost on mobile)
- Hover glow states (no pointer on touch -- currently these trigger on `:hover`, not `:active`, so they never fire on mobile -- this is correct)
- The 2-column news grid (current: collapses to 1-col at 768px -- correct)

### Mobile Recommendation

Add `@media (max-width: 768px)` rule that reduces `--mp-glass-blur` from `blur(14px)` to `blur(8px)`. This alone cuts GPU cost significantly on mobile without visual regression since mobile viewports are smaller and the blur is proportionally similar.

---

## Accessibility Checklist for Glass UI

| Concern | Current Status | Required Action |
|---------|---------------|-----------------|
| Text contrast on dark glass | MEDIUM -- relies on `#CBD5E1` on dark bg | Verify 4.5:1 ratio with actual rendered glass; add text-shadow compensation where needed |
| Text contrast on light glass | MEDIUM -- light glass is near-opaque (good) | Verify with contrast checker once translucency is adjusted |
| Focus indicators | UNKNOWN -- Blowfish handles base focus | Audit `focus-visible` styles on glass surfaces; ensure visible ring against glass bg |
| Keyboard nav through glass modals | N/A -- no modals | Not applicable |
| Reduced motion | MOSTLY DONE | Fix `body::after` scanline gap |
| Screen reader semantics | MEDIUM -- JS-built DOM lacks ARIA | Regime badge needs `aria-label`, news cards need `article` landmark |
| `@supports` fallback | MISSING | Add opacity fallback for backdrop-filter unsupported |
| Forced colors / high contrast | UNKNOWN | Low priority but should be checked |

---

## Sources

- Codebase audit: `/assets/css/custom/*.css`, `/static/js/briefing/*.js` (HIGH confidence -- direct inspection)
- [12 Glassmorphism UI Features, Best Practices, and Examples](https://uxpilot.ai/blogs/glassmorphism-ui) (MEDIUM)
- [Glassmorphism Design Trend: Complete Implementation Guide 2025](https://playground.halfaccessible.com/blog/glassmorphism-design-trend-implementation-guide) (MEDIUM)
- [Glassmorphism Meets Accessibility: Can Glass Be Inclusive? | Axess Lab](https://axesslab.com/glassmorphism-meets-accessibility-can-frosted-glass-be-inclusive/) (MEDIUM)
- [Dark Mode UI: Best Practices for 2025](https://www.graphiceagle.com/dark-mode-ui/) (MEDIUM)
- [Fintech Dashboard UI: KPIs, Card Patterns, Tables](https://uisea.net/fintech-dashboard-ui-kpis-card-patterns-tables-figma-guide/) (MEDIUM)
- [Dark Glassmorphism: The Aesthetic That Will Define UI in 2026](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026-93aa4153088f) (LOW)
- [prefers-reduced-motion | CSS-Tricks](https://css-tricks.com/almanac/rules/m/media/prefers-reduced-motion/) (HIGH)
- [What is Glassmorphism? The Transparent Trend Defining 2025 UI Design](https://www.atvoid.com/blog/what-is-glassmorphism-the-transparent-trend-defining-2025-ui-design) (MEDIUM)

---

*Feature research for: glassmorphism financial briefing blog UI/UX redesign*
*Researched: 2026-02-19*
