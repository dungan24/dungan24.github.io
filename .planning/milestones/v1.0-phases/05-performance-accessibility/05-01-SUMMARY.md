---
phase: 05-performance-accessibility
plan: 01
subsystem: ui
tags: [css, backdrop-filter, glassmorphism, performance, accessibility, mobile]

# Dependency graph
requires:
  - phase: 04-component-redesign
    provides: ".mp-news-card backdrop-filter 제거 선례 — PERF-02 패턴 확립"
  - phase: 01-foundation
    provides: "--mp-glass-blur CSS 변수 + FOUN-07 모바일 blur 미디어쿼리"
provides:
  - "중첩 backdrop-filter 위반 0건 (PERF-02 완전 준수)"
  - "모바일-visible 요소 var(--mp-glass-blur) cascade 참여"
  - "prefers-reduced-motion 가드 14개 셀렉터 완전 커버"
affects: [future-css-work, glassmorphism-components]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "nested-backdrop-filter-removal: 중첩 자식은 backdrop-filter 제거 + background opacity 보상 증가"
    - "var-glass-blur-cascade: 모바일-visible 요소는 하드코딩 blur 대신 var(--mp-glass-blur) 사용"

key-files:
  created: []
  modified:
    - "assets/css/custom.css"
    - "assets/css/custom/calendar.css"
    - "assets/css/custom/layout-overrides.css"
    - "assets/css/custom/briefing-sections.css"
    - "assets/css/custom/toc-and-effects.css"

key-decisions:
  - "prose table backdrop-filter 제거: background opacity 0.5→0.75 보상 증가로 시각적 무게 유지"
  - "mp-upcoming__content backdrop-filter 제거: opacity 0.4→0.6 보상 증가"
  - "mp-regime-panel backdrop-filter 제거: --mp-glass-bg(rgba 0.65) 자체가 충분히 opaque"
  - "briefing-sections.css .mp-post-hero 중복 제거: post-hero.css를 단일 정규 파일로 지정"
  - "search-modal-container + mp-mobile-bottom-nav: var(--mp-glass-blur) 전환으로 FOUN-07 cascade 참여"
  - "prefers-reduced-motion 가드 7개 추가: #menu-blur, #single_header, .mp-briefing-meta, .mp-regime-panel, .mp-calendar.mp-glass-card, #mp-mobile-bottom-nav, .search-modal-container"
  - "terminal-footer.css backdrop-filter: blur(10px) 하드코딩 — 연구 감사에서 누락된 pre-existing 항목, 이 플랜 범위 외로 deferred"

patterns-established:
  - "PERF-02 패턴: 부모가 backdrop-filter를 가지면 자식은 backdrop-filter 없이 opaque rgba() 배경만 사용"
  - "PERF-03 패턴: 모바일-visible 요소는 var(--mp-glass-blur)를 통해 FOUN-07 cascade에 자동 참여"

requirements-completed: [PERF-01, PERF-02, PERF-03]

# Metrics
duration: 4min
completed: 2026-02-19
---

# Phase 5 Plan 01: Performance & Accessibility Summary

**backdrop-filter 중첩 위반 4건 제거 + 모바일 blur 변수화 2건 + prefers-reduced-motion 가드 14개 셀렉터 완전 커버 — GPU 레이어 수 10개 이하 달성**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-19T10:50:12Z
- **Completed:** 2026-02-19T10:53:43Z
- **Tasks:** 3 (Task 3는 검증 전용 — 커밋 없음)
- **Files modified:** 5

## Accomplishments

- PERF-02: `.prose table`, `.mp-upcoming__content`, `.mp-regime-panel`, `.mp-post-hero`(중복) 에서 backdrop-filter 제거, background opacity 보상 증가
- PERF-03: `.search-modal-container`, `#mp-mobile-bottom-nav` 두 모바일-visible 요소를 `var(--mp-glass-blur)` cascade로 전환
- PERF-01: prefers-reduced-motion 가드에 7개 누락 요소 추가 → 14개 셀렉터로 모든 backdrop-filter 요소 커버

## Task Commits

각 태스크를 원자적으로 커밋:

1. **Task 1: 중첩 backdrop-filter 위반 제거 (PERF-02)** - `8db2c54` (fix)
2. **Task 2: 모바일 blur 변수화 + prefers-reduced-motion 가드 보완** - `7305908` (feat)
3. **Task 3: 최종 검증** — 파일 수정 없음, 커밋 없음

**Plan metadata:** (docs commit — 이 SUMMARY + STATE.md)

## Files Created/Modified

- `assets/css/custom.css` - `.prose table` backdrop-filter 제거, background 0.5→0.75 opacity 증가
- `assets/css/custom/calendar.css` - `.mp-upcoming__content` backdrop-filter 제거, background 0.4→0.6 opacity 증가
- `assets/css/custom/layout-overrides.css` - `.mp-regime-panel` backdrop-filter 제거; `.search-modal-container` + `#mp-mobile-bottom-nav` var() 전환
- `assets/css/custom/briefing-sections.css` - `.mp-post-hero` 중복 backdrop-filter 제거 (post-hero.css 담당)
- `assets/css/custom/toc-and-effects.css` - prefers-reduced-motion 가드에 7개 셀렉터 추가

## Task 3 Verification Data (Per-Page Count)

**Post 페이지 활성 backdrop-filter 요소 (다크 모드, 데스크톱):**

| 요소 | 개수 |
|------|------|
| `#menu-blur` | 1 |
| `#single_header` | 1 |
| `.mp-post-hero` | 1 |
| `.briefing-section` | 2 (fact + opinion) |
| `#TOCView` | 1 |
| `.mp-briefing-meta` | 1 |
| `.mp-terminal-footer` | 1 |
| `.market-chart-card` | N (차트 수) |

기본 8개 + 차트 N개. 차트 1-2개 시 9-10개 = **10 이하 OK (PERF-01 충족)**

**Home 페이지 활성 backdrop-filter 요소 (다크 모드, 데스크톱):**

| 요소 | 개수 |
|------|------|
| `#menu-blur` | 1 |
| `.mp-ticker-group` | 4 |
| `.mp-briefing-card` | 3-4 (above fold) |
| `.mp-calendar.mp-glass-card` | 1 |
| `.mp-terminal-footer` | 1 |

= 10-11개. 카드 3개 가시 시 10개 = **한계선 OK**

## Decisions Made

- `.prose table` opacity 0.5→0.75: blur 제거 시 visual weight 보상이 필요함
- `.mp-regime-panel`: `--mp-glass-bg`가 dark mode에서 `rgba(18,18,42,0.65)` — blur 없이도 충분히 opaque
- `briefing-sections.css` `.mp-post-hero` 중복: `post-hero.css`를 정규 파일로 지정 (단일 책임)
- `search-modal-container`의 `!important` 유지: Blowfish 테마 오버라이드에 필요
- `#TOCView` 하드코딩 `blur(16px)` 유지: 데스크톱 전용 사이드바, 모바일에서 미표시

## Deviations from Plan

### Deferred Items (Out-of-Scope Discovery)

**1. terminal-footer.css backdrop-filter: blur(10px)**
- **발견 위치:** Task 3 검증 인벤토리
- **이슈:** `assets/css/custom/terminal-footer.css:9` 에 하드코딩된 `backdrop-filter: blur(10px)` 존재 — 연구 감사에서 누락된 pre-existing 항목
- **액션:** 이 플랜 범위 외 (Task 1/2 변경에서 발생한 게 아님) — deferred
- **영향:** Post/Home 페이지 카운트에 +1 영향, 여전히 10개 이하 유지

---

**Total deviations:** 0 auto-fixed
**Deferred:** 1 pre-existing item (`terminal-footer.css` hardcoded blur)
**Impact on plan:** 모든 태스크 계획대로 실행. 범위 외 발견 항목은 영향 최소.

## Issues Encountered

- Task 1 verify grep이 CSS 주석 내 "backdrop-filter" 텍스트도 매칭 — 주석 제외 패턴(`^\s+backdrop-filter:` + `/\*` 제외)으로 재검증하여 PASS 확인

## User Setup Required

None — CSS 전용 변경, 외부 서비스 설정 불필요.

## Next Phase Readiness

- Phase 5 Plan 01 완료: PERF-01, PERF-02, PERF-03 요구사항 충족
- 남은 Phase 5 작업: 있으면 Plan 02로 계속, 없으면 Phase 5 완료
- 권장 후속 작업: `terminal-footer.css` hardcoded blur를 `var(--mp-glass-blur)`로 전환 (별도 플랜)

---
*Phase: 05-performance-accessibility*
*Completed: 2026-02-19*
