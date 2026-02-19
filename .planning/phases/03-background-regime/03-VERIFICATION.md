---
phase: 03-background-regime
verified: 2026-02-19T09:15:00Z
status: human_needed
score: 5/5 must-haves verified
re_verification: false
human_verification:
  - test: "페이지를 열고 DevTools Elements 패널에서 body.firstChild가 .mp-page-orb-layer div인지, 그 안에 .mp-page-orb--primary/secondary/accent 3개 div가 존재하는지 확인"
    expected: "body의 첫 번째 자식이 mp-page-orb-layer이고, 3개의 자식 div가 보인다"
    why_human: "DOM 삽입은 런타임 JS 실행 결과이므로 정적 파일 검사로는 확인 불가"
  - test: "다크 모드에서 페이지 배경에 soft gradient 컬러가 눈에 보이는지, 라이트 모드 전환 시 확연히 연해지는지 확인"
    expected: "다크: primary orb가 은은하게 인지 가능, 라이트: 거의 안 보이거나 매우 연함"
    why_human: "opacity 0.18 vs 0.07 차이는 디스플레이 특성(OLED vs LCD, 밝기 등)에 따라 다르게 보임"
  - test: "OS에서 Reduce Motion 설정 활성화 후 페이지 reload — orb가 여전히 보이되 움직임이 없는지 확인"
    expected: "orb 색상은 보이지만 animation이 완전히 멈춤"
    why_human: "CSS animation:none 적용 여부는 브라우저 렌더 결과로만 확인 가능"
  - test: "홈 페이지에서 chart-data가 로드된 후 DevTools Console에서 window.MP_REGIME_CURRENT 값 확인, .briefing-section::after computed style에서 background rgba 색상이 현재 regime과 일치하는지 확인"
    expected: "MP_REGIME_CURRENT가 'RISK_ON'/'RISK_OFF'/'CAUTIOUS'/'PANIC' 중 하나, ::after background가 해당 KR_TINT_RGB 값(e.g. RISK_ON → rgba(255, 51, 102, ...))"
    why_human: "regime 데이터는 fetch 이후 런타임에서만 확인 가능, 정적 분석 불가"
  - test: "다크/라이트 모드 전환 시 .briefing-section::after computed background의 alpha가 다크 0.06, 라이트 0.03인지 확인"
    expected: "다크: rgba(..., 0.06), 라이트: rgba(..., 0.03)"
    why_human: "CSS :root:not(.dark) 분기 적용 여부는 실제 브라우저 스타일 계산 결과로만 확인"
---

# Phase 03: Background & Regime Verification Report

**Phase Goal:** 글래스 카드 뒤에 블러할 대상(ambient orbs)이 생기고 regime 상태가 글래스 색감에 반영된다
**Verified:** 2026-02-19T09:15:00Z
**Status:** human_needed (automated checks all passed — 5 items need browser confirmation)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | 페이지 배경에 컬러 그라데이션 orbs가 표시되어 backdrop-filter에 블러할 레이어가 존재한다 | ? NEEDS HUMAN | CSS + JS 모두 구현됨 (ambient-orbs.css 191줄, ambient-orbs.js body.insertBefore wired). 실제 렌더 확인 필요 |
| 2 | Orbs가 다크 모드(어두운 배경)와 라이트 모드(밝은 배경) 모두에서 적절한 강도로 표시된다 | ? NEEDS HUMAN | CSS: :root:not(.dark) 분기 확인됨 (primary 0.07, secondary 0.05, accent display:none). 시각적 강도는 사람 판단 필요 |
| 3 | prefers-reduced-motion이 설정된 환경에서 orb 애니메이션이 정지된다 | ? NEEDS HUMAN | @media (prefers-reduced-motion: reduce) { .mp-page-orb { animation: none !important; } } 코드 확인됨. 브라우저 동작 확인 필요 |
| 4 | Bull/Bear/Neutral regime에 따라 글래스 카드 배경이 미묘하게 다른 색조로 표시된다 | ? NEEDS HUMAN | CSS .regime-loaded::after overlay 확인됨, JS applyRegime() + KR_TINT_RGB 테이블 확인됨. 런타임 색상 적용 확인 필요 |
| 5 | Regime 틴팅이 다크 모드와 라이트 모드 모두에서 적용된다 | ? NEEDS HUMAN | :root:not(.dark) 분기 (0.03) + 다크 기본 (0.06) CSS 확인됨. 실제 적용 확인 필요 |

**Score:** 5/5 automated checks passed (all truths have evidence; 5 items require browser confirmation for visual/runtime behavior)

---

## Required Artifacts

### Plan 01 Artifacts (BG-01, BG-02, BG-03)

| Artifact | Expected | Level 1: Exists | Level 2: Substantive | Level 3: Wired | Status |
|----------|----------|-----------------|---------------------|----------------|--------|
| `assets/css/custom/ambient-orbs.css` | Fixed orb layer CSS, dark/light/mobile/reduced-motion | EXISTS (243 lines) | SUBSTANTIVE: mp-page-orb-layer, 3 orbs, 3 keyframes, :root:not(.dark), @media 640px, prefers-reduced-motion | WIRED: registered in extend-head-uncached.html CSS slice | VERIFIED |
| `static/js/ambient-orbs.js` | Orb DOM insertion, reduced-motion detection | EXISTS (138 lines) | SUBSTANTIVE: creates mp-page-orb-layer div, insertBefore(body.firstChild), matchMedia listener | WIRED: script tag in extend-footer.html after mp-config.js | VERIFIED |
| `layouts/partials/extend-head-uncached.html` | ambient-orbs.css loader registration | EXISTS | SUBSTANTIVE: "css/custom/ambient-orbs.css" in $path slice (line 11) | WIRED: Hugo fingerprinted CSS loader | VERIFIED |
| `layouts/partials/extend-footer.html` | ambient-orbs.js script tag | EXISTS | SUBSTANTIVE: `<script src="{{ "js/ambient-orbs.js" | relURL }}"></script>` (line 3) | WIRED: loads after mp-config.js, before other briefing scripts | VERIFIED |

### Plan 02 Artifacts (RGME-01, RGME-02)

| Artifact | Expected | Level 1: Exists | Level 2: Substantive | Level 3: Wired | Status |
|----------|----------|-----------------|---------------------|----------------|--------|
| `assets/css/custom/ambient-orbs.css` | Regime tinting CSS (.regime-loaded conditional) | Contains "regime-loaded" section (lines 193-243) | SUBSTANTIVE: .regime-loaded .briefing-section::after, .mp-ticker-group::after, dark 0.06 / light 0.03, reduced-motion transition:none | WIRED: conditional on .regime-loaded class which JS sets | VERIFIED |
| `static/js/ambient-orbs.js` | KR_ORB_RGB mapping, regime detection, .regime-loaded toggle | Contains KR_ORB_RGB, KR_TINT_RGB, applyRegime(), detectAndApplyRegime() | SUBSTANTIVE: 3-tier detection (__MP_PAGE → MP_REGIME_CURRENT → mp:regime-ready), 8s safety timeout, classList.add('regime-loaded') | WIRED: calls detectAndApplyRegime() on DOMContentLoaded | VERIFIED |
| `static/js/home-market-overview.js` | window.MP_REGIME_CURRENT setter + mp:regime-ready CustomEvent | EXISTS (modified) | SUBSTANTIVE: line 314 `window.MP_REGIME_CURRENT = (regime && regime.current) || "";`, lines 315-319 dispatchEvent(new CustomEvent('mp:regime-ready', ...)) | WIRED: placed immediately after US-convention --mp-orb-color-* assignment, same synchronous render() call | VERIFIED |

---

## Key Link Verification

### Plan 01 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `static/js/ambient-orbs.js` | DOM body | `insertBefore(layer, document.body.firstChild)` | WIRED | Line 33: `document.body.insertBefore(layer, document.body.firstChild);` |
| `assets/css/custom/ambient-orbs.css` | `--mp-orb-color-primary/secondary` CSS vars | `radial-gradient(circle, rgba(var(--mp-orb-color-primary) / N) ...)` | WIRED | Lines 51, 69, 88: all three orbs use `var(--mp-orb-color-*)`; vars defined in custom.css lines 91-92 |

### Plan 02 Key Links

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `static/js/home-market-overview.js` | `window.MP_REGIME_CURRENT` | sets global in render() after chart-data fetch | WIRED | Line 314: assignment confirmed in render() context (line 288 function definition) |
| `static/js/ambient-orbs.js` | `window.MP_REGIME_CURRENT` | reads regime string directly from global | WIRED | Line 111: `if (window.MP_REGIME_CURRENT) { applyRegime(window.MP_REGIME_CURRENT); }` |
| `static/js/ambient-orbs.js` | `document.documentElement.classList` | `classList.add('regime-loaded')` after KR color injection | WIRED | Line 99: `docRoot.classList.add("regime-loaded");` inside applyRegime() |
| `assets/css/custom/ambient-orbs.css` | `--regime-color-rgb` CSS variable | `rgba(var(--regime-color-rgb) / N)` in ::after pseudo-element | WIRED | Lines 224, 233: both dark and light rules use `var(--regime-color-rgb)`; JS sets this via setProperty() line 96 |

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| BG-01 | 03-01 | Ambient orbs 배경 구현 (글래스 효과를 살리는 그라데이션 오브) | SATISFIED | ambient-orbs.css: 3 orbs with radial-gradient, blur, animation; ambient-orbs.js: DOM insertion |
| BG-02 | 03-01 | Ambient orbs가 다크/라이트 모드에서 각각 적절히 표시 | SATISFIED | :root:not(.dark) reduces primary 0.18→0.07, secondary 0.12→0.05, hides accent; verified in CSS lines 138-157 |
| BG-03 | 03-01 | Ambient orbs 애니메이션에 prefers-reduced-motion 존중 | SATISFIED | @media (prefers-reduced-motion: reduce) { .mp-page-orb { animation: none !important; } } — CSS lines 187-191; runtime matchMedia listener in JS lines 42-53 |
| RGME-01 | 03-02 | Regime 상태(bull/bear/neutral)에 따라 글래스 배경에 미묘한 틴팅 적용 | SATISFIED | KR_TINT_RGB table in ambient-orbs.js lines 77-82; --regime-color-rgb injected via setProperty; .regime-loaded CSS enables ::after overlay |
| RGME-02 | 03-02 | Regime 틴팅이 다크/라이트 모드 모두에서 작동 | SATISFIED | Dark 0.06 (line 224) and :root:not(.dark) light 0.03 (line 233) both confirmed in ambient-orbs.css |

**Orphaned requirements:** None — all 5 IDs appear in plan frontmatter and are accounted for.

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| None found | — | — | — |

Scanned: ambient-orbs.css, ambient-orbs.js, home-market-overview.js (render() block)

No TODO/FIXME/placeholder comments found. No empty implementations. No console.log-only handlers. No return null stubs. All functions have substantive implementations.

---

## Additional Observations

### Potential Concern: render() US→KR color race

`home-market-overview.js` render() (lines 298-319) first sets US-convention `--regime-color-rgb` (line 299) and `--mp-orb-color-*` (lines 302-311), then immediately dispatches `mp:regime-ready`. The ambient-orbs.js handler for `mp:regime-ready` overwrites both with KR-convention values (applyRegime lines 91-96). This happens synchronously in the same JS call stack — no async gap, so no visual flash. Architecture is sound.

### Potential Concern: Post page regime tinting

`window.__MP_PAGE.regime` is injected by `extend-head-uncached.html` only when `{{ if .Params.regime }}` is true (line 22-27). This means post pages without a `regime` front matter field will NOT show tinting — which is the intended safe behavior per Plan 02 design. The 8-second timeout path applies for pages where chart data fetch fails.

### CSS Variable Dependency Verified

`--mp-orb-color-primary`, `--mp-orb-color-secondary`, `--regime-color-rgb` are all defined in `custom.css` (lines 81, 91-92) as fallback values. The orb CSS uses these as defaults; JS overwrites them at runtime per regime.

---

## Human Verification Required

Five items require browser testing. These cannot be verified by static file analysis:

### 1. Orb Layer DOM Insertion

**Test:** Open any page. DevTools > Elements > inspect `<body>`. Verify the first child is `<div class="mp-page-orb-layer" aria-hidden="true">` containing 3 child divs with classes `mp-page-orb--primary`, `mp-page-orb--secondary`, `mp-page-orb--accent`.
**Expected:** mp-page-orb-layer is body.firstChild, 3 orb divs present
**Why human:** Runtime JS DOM mutation — not verifiable from static source

### 2. Orb Visual Presence (Dark vs Light Mode)

**Test:** In dark mode, observe page background for soft colored glow in top-left and bottom-right areas. Toggle to light mode via site theme switch. Verify the glow visibly diminishes.
**Expected:** Dark mode: noticeable but not harsh color blobs; Light mode: very faint or near-invisible
**Why human:** Perceived visual intensity depends on display (OLED vs LCD), brightness setting, and surroundings. CSS math (0.18 vs 0.07) cannot substitute for human perception check.

### 3. prefers-reduced-motion Animation Halt

**Test:** System Settings > Accessibility > Reduce Motion (ON). Reload page. Observe orb layer — color should still be visible but no floating/drifting animation.
**Expected:** Orbs present as static colored blobs, zero movement
**Why human:** CSS `animation: none !important` effect requires browser rendering verification

### 4. Regime Tinting Color Correctness

**Test:** Load home page. Wait for chart data (Market Overview section populates). DevTools Console: type `window.MP_REGIME_CURRENT` and note value. DevTools > Elements > select any `.briefing-section` > computed styles > `::after` pseudo-element > check `background` color value. Confirm color matches: RISK_ON=red (255 51 102), CAUTIOUS=violet (124 58 237), RISK_OFF=blue (51 136 255), PANIC=blue (51 136 255).
**Expected:** MP_REGIME_CURRENT is a non-empty regime string; ::after background rgba matches KR_TINT_RGB for that regime
**Why human:** Requires live fetch of chart-data JSON and runtime JS execution

### 5. Regime Tinting Dark/Light Opacity

**Test:** With regime loaded (confirmed via step 4), toggle dark/light mode. In dark mode, ::after background alpha should be approximately 0.06. In light mode, approximately 0.03.
**Expected:** Dark ~0.06, light ~0.03 — visible difference in intensity
**Why human:** Computed style alpha value requires browser rendering in each mode

---

## Gaps Summary

No automated gaps found. All artifacts exist, are substantive (not stubs), and are wired correctly:

- ambient-orbs.css (243 lines): full implementation with all 5 required CSS branches
- ambient-orbs.js (138 lines): IIFE with orb insertion + complete 3-tier regime detection
- Hugo loaders: CSS in extend-head-uncached.html fingerprinted slice, JS in extend-footer.html after mp-config.js
- home-market-overview.js: MP_REGIME_CURRENT + CustomEvent added inside render(), immediately after US-convention color setting
- All 5 commits (e7124bb, e14aa2c, 16eb076, 6718bf9, 1cdf37c) confirmed in git history

Status is `human_needed` because the phase goal is inherently visual — "글래스 카드 뒤에 블러할 대상이 생기고 regime 상태가 글래스 색감에 반영된다" — and visual confirmation of ambient effects cannot be automated.

---

_Verified: 2026-02-19T09:15:00Z_
_Verifier: Claude (gsd-verifier)_
