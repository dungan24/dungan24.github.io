---
phase: 04-component-redesign
plan: 01
subsystem: ui
tags: [css, glassmorphism, news-card, category-badge, mobile, light-mode]

# Dependency graph
requires:
  - phase: 04-component-redesign
    provides: "pre-existing news card glass structure (.mp-news-card, .mp-news-grid, .mp-news-card__source) from prior work"
provides:
  - "CATEGORY_CLASS_MAP lookup table in news-grid.js IIFE scope — maps Korean/English category strings to is-cat-* CSS classes"
  - "category class injection on .mp-news-card via classList.add(getCategoryClass(category))"
  - "9 category badge color variants (market/macro/commodity/central-bank/corporate/kr-macro/crypto/fx/geopolitical) for dark mode"
  - "7 light-mode category badge overrides using saturated darker hex values"
  - "backdrop-filter removed from .mp-news-card — opaque rgba via --mp-glass-bg token only"
  - "@media (max-width: 640px) .mp-news-grid 1-column layout (NEWS-04)"
  - ":root:not(.dark) .mp-news-card:hover — light mode hover override (border cyan-700, box-shadow 0.08)"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Category badge via IIFE-scoped lookup table + classList.add — no window globals, no runtime CSS manipulation"
    - "Light-mode category overrides use saturated Tailwind-equivalent hex (e.g. neon-cyan → #0891B2 cyan-600)"
    - "Compound selector .mp-news-card.is-cat-X .mp-news-card__source — targets badge inside categorized card"
    - "@media (max-width: 640px) grid override collapses 2-col to 1-col for mobile"

key-files:
  created: []
  modified:
    - assets/css/custom/briefing-sections.css
    - static/js/briefing/news-grid.js

key-decisions:
  - "backdrop-filter removed from .mp-news-card — parent .briefing-section already has backdrop-filter, nested filter violation (pre-Phase 1 rule)"
  - "CATEGORY_CLASS_MAP lives in IIFE scope only — no window.MP_* global pollution (project constraint)"
  - "is-cat-other fallback class for unknown/future categories — getCategoryClass never throws"
  - "macro and fx categories share default purple badge in dark mode, no light-mode override needed (readable)"
  - "Light mode hover: border #0891B2/0.4 + box-shadow rgba(0,0,0,0.08) — neutral shadow instead of neon glow"

patterns-established:
  - "Category visual variant: JS lookup table → classList.add → CSS compound selector (maintainable, cacheable)"
  - "No :root{} variable declarations in briefing-sections.css — custom.css remains sole SSOT"
  - "Mobile-first addition: 640px breakpoint collapses multi-column grids to 1fr"

requirements-completed: [NEWS-01, NEWS-02, NEWS-03, NEWS-04]

# Metrics
duration: 3min
completed: 2026-02-19
---

# Phase 04 Plan 01: News Card Glass Redesign Summary

**backdrop-filter 제거 + CATEGORY_CLASS_MAP 카테고리 뱃지(9종 dark/7종 light) + 640px 모바일 1열 레이아웃**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-02-19T09:36:20Z
- **Completed:** 2026-02-19T09:40:54Z
- **Tasks:** 1 (6 parts: A-F)
- **Files modified:** 2

## Accomplishments

- `news-grid.js` IIFE에 CATEGORY_CLASS_MAP(10개 매핑) + getCategoryClass() 추가, card에 classList 주입 — NEWS-02 완료
- `.mp-news-card`에서 `-webkit-backdrop-filter` + `backdrop-filter` 두 줄 제거 — 중첩 filter 위반 해소, NEWS-01 완료
- briefing-sections.css에 9종 카테고리 dark 뱃지 색상 + 7종 라이트 모드 오버라이드 추가 — NEWS-02 완료
- `@media (max-width: 640px)` .mp-news-grid 1열 그리드 추가 — NEWS-04 완료
- `:root:not(.dark) .mp-news-card:hover` 라이트 모드 호버 오버라이드 추가 — NEWS-03 완료

## Task Commits

1. **Task 1A-D: JS 카테고리 매핑 + CSS backdrop-filter 제거 + 카테고리 뱃지 CSS + 라이트 오버라이드** - `b70c173` (feat, 04-02 태그로 묶임)
2. **Task 1E-F: 라이트 모드 호버 오버라이드 + 모바일 1열 브레이크포인트** - `419baa7` (feat)

**Plan metadata:** (this commit)

## Files Created/Modified

- `static/js/briefing/news-grid.js` — CATEGORY_CLASS_MAP 10종 + getCategoryClass() + card.classList.add() 주입
- `assets/css/custom/briefing-sections.css` — backdrop-filter 제거, 9종 카테고리 뱃지 CSS, 7종 라이트 오버라이드, 640px 1열, 라이트 호버

## Decisions Made

- `.mp-news-card`의 `backdrop-filter` 제거: 부모인 `.briefing-section`이 이미 backdrop-filter를 가지고 있으므로 중첩 위반. opaque `var(--mp-glass-bg)` 배경(dark: rgba(18,18,42,0.72))으로 충분
- CATEGORY_CLASS_MAP은 IIFE 스코프에만 — `window.MP_*` 전역 변수 추가 금지 원칙 준수
- `getCategoryClass()`에 `is-cat-other` fallback — 미등록 카테고리에도 오류 없이 렌더링
- 라이트 모드 macro/fx는 기본 purple로 충분히 가독성 있음 — 별도 오버라이드 불필요

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

이전 세션(b70c173)에서 plan 04-01과 04-02가 단일 커밋으로 묶여 실행됨. 04-01-SUMMARY.md 누락 상태였고, 모바일 브레이크포인트(NEWS-04)와 라이트 모드 호버(NEWS-03) 2개 항목이 미완성 상태였음. 이번 실행에서 잔여 항목 완성 및 SUMMARY.md 생성.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- NEWS-01~04 모두 완료: 뉴스 카드 glassmorphism 리디자인 완성
- 04-02 (캘린더) 및 04-03 (차트) 이미 완료 — Phase 4 전체 완료 상태
- 물리 OLED 기기에서 dark glass 가시성 확인 권장 (DevTools로 확인 불가)

---
*Phase: 04-component-redesign*
*Completed: 2026-02-19*
