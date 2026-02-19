# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-19)

**Core value:** 브리핑을 여는 순간 "이거 제대로 만든 거다"라는 프리미엄 인상을 주는 것
**Current focus:** Phase 4 — Chart Theming

## Current Position

Phase: 4 of 5 (Component Redesign) — Plan 02 complete
Plan: 2 of 2 in current phase — COMPLETE
Status: Phase 4 Plan 02 complete. Calendar event status CSS + light mode overrides.
Last activity: 2026-02-19 — Phase 4 Plan 02 complete (calendar status CSS)

Progress: [████████░░] 80%

## Performance Metrics

**Velocity:**
- Total plans completed: 6
- Average duration: 2 minutes
- Total execution time: 0.17 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 - Foundation | 2 | 4 min | 2 min |
| 2 - Icons & Navigation | 2 | 4 min | 2 min |
| 3 - Background & Regime | 2 | 5 min | 2.5 min |
| 4 - Component Redesign | 2 | ~2 min | ~1 min |

**Recent Trend:**
- Last 5 plans: Plan 02-01 (2 min), Plan 02-02 (2 min), Plan 03-01 (2 min), Plan 03-02 (3 min), Plan 04-02 (1 min)
- Trend: stable

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Pre-Phase 1]: ECharts는 CSS 변수를 읽지 못함 — 차트 색상은 params.toml에 미러링 필요
- [Pre-Phase 1]: 다크 모드는 `.dark` 클래스 토글만 사용 — `@media prefers-color-scheme` 사용 금지
- [Pre-Phase 1]: 내부 카드에 backdrop-filter 금지 — 최외곽 컨테이너만 적용
- [Pre-Phase 1]: custom.css 라인 89/218의 중복 `:root:not(.dark)` 블록이 라이브 버그로 확인됨
- [Phase 1 Plan 01]: 두 번째 :root:not(.dark) 블록은 첫 번째 블록의 subset — 단순 삭제로 해결
- [Phase 1 Plan 01]: ::before pseudo-element backdrop-filter 완전 제거 — 부모의 glassmorphism으로 충분
- [Phase 1 Plan 02]: 컴포넌트 파일 :root 블록 완전 제거 — 선언만 custom.css로 이전, 변수 소비(var()) 코드는 유지
- [Phase 1 Plan 02]: 모바일 blur 미디어쿼리는 :root:not(.dark) 직후 배치 — cascade 순서 보장
- [Phase 1 Plan 02]: blur 변수는 전체 함수 문자열화 — blur(var(--px)) 중첩은 CSS 스펙상 불가
- [Phase 2 Plan 01]: Phosphor Icons: bold/regular CSS CDN만 로드 (~120KB) — 전체 스크립트 번들(~3MB) 금지
- [Phase 2 Plan 01]: Phosphor regular weight 클래스는 ph(접두사만) — ph-regular 클래스 존재하지 않음
- [Phase 2 Plan 01]: 아이콘 <i> 태그에 aria-hidden=true — 인접 <span> 텍스트가 의미 전달 담당
- [Phase 2 Plan 02]: opacity 속성은 #menu-blur 규칙에서 제외 — background-blur.js가 scroll 위치 기반 인라인 스타일로 제어
- [Phase 2 Plan 02]: backdrop-filter !important 단축 속성으로 완전 교체 — Tailwind --tw-backdrop-blur 변수 무효화로 이중 blur 방지
- [Phase 3 Plan 01]: page-level orb = position:fixed z-index:0, 홈 shell orb = position:absolute inside shell — 다른 역할, 충돌 없음
- [Phase 3 Plan 01]: ambient-orbs.js는 mp-config.js 다음 로드 — 03-02 regime tinting이 MP_CONFIG.colors.regime 읽을 예정
- [Phase 3 Plan 01]: body.firstChild 삽입 방식 — layout 템플릿 오염 없이 모든 페이지에 orb 레이어 삽입
- [Phase 03-background-regime]: KR-convention color tables in ambient-orbs.js only — mp-config.js US colors untouched for badge/TOC theming
- [Phase 03-background-regime]: mp:regime-ready CustomEvent replaces polling — same render() frame dispatch eliminates US→KR color flash
- [Phase 03-background-regime]: .regime-loaded CSS class gate prevents violet flash on pages without regime data
- [Phase 04-02]: is-status-closed opacity 0.6 in light mode (vs 0.5 dark) — white backgrounds need more visual presence
- [Phase 04-02]: Light mode dot colors use saturated Tailwind values (#059669, #0891B2) — neon colors unreadable on white
- [Phase 04-02]: renderer.js untouched — class injection was already correct, only CSS targeting rules were missing

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 3 완료 후 물리적 OLED 기기 검증 필요 (다크 글래스 불가시성 버그는 DevTools로 확인 불가)
- Phase 4 완료 후 ECharts 테마 토큰 매핑 테이블 작성 필요 (현재 4개 매핑만 문서화됨)

## Session Continuity

Last session: 2026-02-19
Stopped at: Completed 04-component-redesign 04-02-PLAN.md. Phase 4 Plan 02 complete. CAL-01/02/03 done.
