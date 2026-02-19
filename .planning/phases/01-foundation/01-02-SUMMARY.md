---
phase: 01-foundation
plan: 02
subsystem: css
tags: [css, design-tokens, glassmorphism, mobile, media-query, refactor]
dependency_graph:
  requires:
    - phase: 01-01
      provides: "single :root:not(.dark) block, no double-blur artifacts"
  provides:
    - "3티어 CSS 토큰 시스템: --mp-* 변수가 custom.css 단일 소스로 통합"
    - "모바일 blur 최적화: 640px/480px 브레이크포인트에서 blur 자동 축소"
    - "chart-cards.css와 home-market-overview.css에 :root 선언 블록 없음"
  affects:
    - "assets/css/custom.css"
    - "assets/css/custom/chart-cards.css"
    - "assets/css/custom/home-market-overview.css"
tech_stack:
  added: []
  patterns:
    - "CSS 토큰 중앙화: Tier 1(primitives) / Tier 2(semantic) / Tier 3(component) 모두 custom.css :root에서 선언"
    - "모바일 blur 오버라이드: @media 내 :root 재정의로 GPU 부하 절감"
key_files:
  created: []
  modified:
    - assets/css/custom.css
    - assets/css/custom/chart-cards.css
    - assets/css/custom/home-market-overview.css
decisions:
  - "컴포넌트 파일의 :root 블록 완전 제거 — 변수 소비(var()) 코드는 유지, 선언만 custom.css로 이전"
  - "모바일 blur 미디어쿼리는 :root:not(.dark) 블록 직후 배치 — cascade 순서 보장"
patterns_established:
  - "새 --mp-* 변수는 반드시 custom.css :root 블록에만 선언한다"
  - "light mode 오버라이드는 :root:not(.dark) 블록에 추가한다"
  - "blur 값은 전체 함수 문자열로 변수화한다: --mp-glass-blur: blur(8px) saturate(1.2)"
requirements_completed:
  - FOUN-04
  - FOUN-05
  - FOUN-06
  - FOUN-07
duration: "2 minutes"
completed: "2026-02-19"
tasks_completed: 2
files_modified: 3
---

# Phase 1 Plan 02: CSS 3티어 토큰 시스템 구축 Summary

**--mp-* 변수 선언을 custom.css 단일 소스로 통합하고 640px/480px 모바일 blur 자동 축소 미디어쿼리 추가**

## Performance

- **Duration:** 2 minutes
- **Started:** 2026-02-19T06:04:11Z
- **Completed:** 2026-02-19T06:06:31Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- chart-cards.css와 home-market-overview.css의 `:root {}` 변수 선언 블록 총 3개 제거 — 변수 소비(var()) 코드는 그대로 유지
- custom.css `:root {}` 블록에 Tier 3 컴포넌트 변수 7개 추가 (chart 5개: `--mp-chart-card-bg`, `--mp-chart-border`, `--mp-chart-accent`, `--mp-chart-cyan`, `--mp-chart-text-muted` + orb 2개: `--mp-orb-color-primary`, `--mp-orb-color-secondary`)
- custom.css `:root:not(.dark) {}` 블록에 chart light mode 오버라이드 3개 추가 (`--mp-chart-card-bg`, `--mp-chart-border`, `--mp-chart-text-muted`)
- 모바일 blur 최적화 미디어쿼리 2개 추가: 640px 이하 `blur(8px) saturate(1.2)`, 480px 이하 `blur(4px) saturate(1.1)`

## Task Commits

Each task was committed atomically:

1. **Task 1: 컴포넌트 CSS :root 변수 선언 제거 (FOUN-04)** - `8096a49` (refactor)
2. **Task 2: custom.css 3티어 토큰 통합 + 모바일 blur 미디어쿼리 (FOUN-04~07)** - `c82cdee` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `assets/css/custom.css` — `:root {}` 블록에 Tier 3 변수 7개 추가, `:root:not(.dark) {}` 블록에 chart light mode 변수 3개 추가, 모바일 blur 미디어쿼리 2개 신규 추가
- `assets/css/custom/chart-cards.css` — 파일 상단 `:root {}` 블록(5변수) 제거, 중간 `:root:not(.dark) {}` 선언 블록(3변수) 제거
- `assets/css/custom/home-market-overview.css` — `:root {}` 블록(2변수) 제거

## Decisions Made

1. **컴포넌트 파일 :root 블록 완전 제거:** 변수 소비 코드(var())는 건드리지 않고 선언 블록만 제거했다. CSS cascade 동작상 custom.css가 먼저 로드되어 변수가 선언된 후 컴포넌트 CSS가 로드되므로 기능 동작에 변화 없다.

2. **모바일 blur 미디어쿼리 위치:** cascade 순서를 보장하기 위해 `:root:not(.dark)` 블록 직후, 컴포넌트 스타일 이전에 배치했다. 이 위치에서 640px 이하 기기는 `:root { --mp-glass-blur }` 값을 오버라이드한다.

3. **blur 변수 전체 함수 문자열화:** `blur(var(--mp-blur-px))` 같은 중첩 함수는 CSS 스펙상 불가하므로 `--mp-glass-blur: blur(8px) saturate(1.2)` 처럼 함수 전체를 변수값으로 지정했다.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- CSS 토큰 시스템 기반 완성: Phase 1의 모든 foundation 작업(FOUN-01 ~ FOUN-07) 완료
- Phase 2 (glassmorphism 컴포넌트) 작업 시 모든 --mp-* 변수를 custom.css 단일 소스에서 참조 가능
- 모바일 기기에서 blur GPU 부하 자동 최적화됨

## Self-Check: PASSED

- [x] `assets/css/custom.css` exists and modified
- [x] `assets/css/custom/chart-cards.css` exists and modified
- [x] `assets/css/custom/home-market-overview.css` exists and modified
- [x] `.planning/phases/01-foundation/01-02-SUMMARY.md` exists
- [x] Commit 8096a49 exists (Task 1)
- [x] Commit c82cdee exists (Task 2)
- [x] Hugo build passes with no errors (0 error lines)

---
*Phase: 01-foundation*
*Completed: 2026-02-19*
