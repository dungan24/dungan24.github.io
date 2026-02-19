---
phase: 01-foundation
plan: 01
subsystem: css
tags: [bugfix, css, glassmorphism, accessibility, light-mode]
dependency_graph:
  requires: []
  provides: [clean-light-mode-variables, single-blur-layer, reduced-motion-coverage]
  affects: [assets/css/custom.css, assets/css/custom/toc-and-effects.css]
tech_stack:
  added: []
  patterns: [CSS custom properties, prefers-reduced-motion, backdrop-filter composition]
key_files:
  created: []
  modified:
    - assets/css/custom.css
    - assets/css/custom/toc-and-effects.css
decisions:
  - "두 번째 :root:not(.dark) 블록(218-230행)은 첫 번째 블록(89-104행)의 subset이었으므로 단순 삭제로 해결"
  - "::before pseudo-element backdrop-filter 제거 — 부모 요소에 이미 var(--mp-glass-blur) 적용 중"
metrics:
  duration: "2 minutes"
  completed: "2026-02-19"
  tasks_completed: 2
  files_modified: 2
---

# Phase 1 Plan 01: CSS 라이브 버그 3개 수정 Summary

**One-liner:** custom.css 중복 :root:not(.dark) 블록 제거 및 toc-and-effects.css 이중 블러 아티팩트 + 접근성 누락 수정

## What Was Built

3개의 CSS 라이브 버그를 수정해 Plan 02 토큰 시스템 작업을 위한 안전한 기반을 마련했다.

**FOUN-01:** `assets/css/custom.css` 218-230행의 두 번째 `:root:not(.dark)` 블록을 삭제했다. 남은 89-104행의 첫 번째 블록은 `--mp-brand-color`, `--mp-brand-color-rgb`를 포함한 13개 변수로 superset이다.

**FOUN-02:** `assets/css/custom/toc-and-effects.css`의 `.mp-briefing-meta::before` 규칙에서 `-webkit-backdrop-filter: blur(8px)`와 `backdrop-filter: blur(8px)` 두 줄을 제거했다. 부모 `.mp-briefing-meta`가 이미 `backdrop-filter: var(--mp-glass-blur)`를 가지므로 pseudo-element의 중복 필터가 이중 블러 아티팩트를 유발하고 있었다.

**FOUN-03:** `@media (prefers-reduced-motion: reduce)` 블록의 `backdrop-filter: none` 선택자 목록에 `#TOCView`와 `.market-chart-card`를 추가했다. 두 요소 모두 backdrop-filter를 사용하지만 접근성 미디어 쿼리에서 누락되어 있었다.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | custom.css 중복 :root:not(.dark) 블록 통합 (FOUN-01) | 19e7e5b | assets/css/custom.css |
| 2 | toc-and-effects.css 버그 2종 수정 (FOUN-02, FOUN-03) | 4d7ade6 | assets/css/custom/toc-and-effects.css |

## Verification Results

| Check | Expected | Result |
|-------|----------|--------|
| `grep -c "^:root:not(.dark) {"` custom.css | 1 | 1 |
| `grep "backdrop-filter: blur(8px)"` toc-and-effects.css | empty | empty |
| `#TOCView` in prefers-reduced-motion block | present | line 520 |
| `.market-chart-card` in prefers-reduced-motion block | present | line 521 |
| Hugo build errors | none | none |

## Decisions Made

1. **두 번째 블록 단순 삭제:** 두 번째 `:root:not(.dark)` 블록의 11개 변수는 모두 첫 번째 블록에도 동일한 값으로 존재한다. `--mp-brand-color`와 `--mp-brand-color-rgb` 두 개만 첫 번째 블록에 추가로 있다. 두 번째 블록을 그대로 삭제해도 변수 손실 없음을 확인 후 삭제했다.

2. **::before backdrop-filter 완전 제거:** 값을 변경하거나 조건부로 적용하는 대신 두 줄 모두 삭제했다. `::before`는 텍스트 레이블(`// META`)을 표시하는 요소로 블러 효과가 불필요하며, 부모의 glassmorphism 효과로 충분하다.

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- [x] `assets/css/custom.css` exists and modified
- [x] `assets/css/custom/toc-and-effects.css` exists and modified
- [x] Commit 19e7e5b exists (Task 1)
- [x] Commit 4d7ade6 exists (Task 2)
- [x] Hugo build passes with no errors
