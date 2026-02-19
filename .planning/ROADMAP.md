# Roadmap: Market Pulse Blog UI/UX Redesign

## Overview

기존 글래스모피즘 부분 구현 위에 완성된 디자인 시스템을 쌓는 점진적 강화 프로젝트.
두 개의 라이브 버그(중첩 backdrop-filter, 중복 CSS 블록)를 먼저 수정하고,
3티어 CSS 토큰 시스템을 구축한 뒤, 컴포넌트 계층적으로 글래스 스타일을 적용한다.
마지막에 퍼포먼스와 접근성을 검증함으로써 "이거 제대로 만든 거다" 인상을 완성한다.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - CSS 버그 수정 + 3티어 토큰 시스템 구축 (모든 컴포넌트 작업의 전제 조건) (completed 2026-02-19)
- [x] **Phase 2: Icons & Navigation** - Phosphor Icons 통합 + Frosted glass 스티키 헤더 (completed 2026-02-19)
- [ ] **Phase 3: Background & Regime** - Ambient orbs 배경 + Regime 글래스 틴팅
- [ ] **Phase 4: Component Redesign** - 뉴스 카드 / 캘린더 / 차트 글래스 리디자인
- [ ] **Phase 5: Performance & Accessibility** - GPU 최적화 + WCAG 검증 + ECharts 동기화

## Phase Details

### Phase 1: Foundation
**Goal**: CSS 시스템이 버그 없이 단일 소스로 동작하고 모든 컴포넌트가 안전하게 올라설 3티어 토큰 기반이 완성된다
**Depends on**: Nothing (first phase)
**Requirements**: FOUN-01, FOUN-02, FOUN-03, FOUN-04, FOUN-05, FOUN-06, FOUN-07
**Success Criteria** (what must be TRUE):
  1. custom.css에 `:root:not(.dark)` 블록이 정확히 하나만 존재하고, 두 번째 블록에 있던 라이트 모드 오버라이드가 누락 없이 통합되어 있다
  2. `.mp-briefing-meta::before`에 backdrop-filter가 없고 이중 블러 아티팩트가 화면에서 사라졌다
  3. `#TOCView`와 `.market-chart-card`가 prefers-reduced-motion 블록 안에 포함되어 있다
  4. `--mp-*` 변수 선언이 custom.css에만 존재하고, 14개 컴포넌트 파일은 정의 없이 소비만 한다
  5. 640px 이하에서 blur가 8px, 480px 이하에서 4px로 자동 축소된다
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — CSS 라이브 버그 3종 수정 (중복 :root:not(.dark) 통합, ::before blur 제거, reduced-motion 보완)
- [ ] 01-02-PLAN.md — 3티어 토큰 통합 + 모바일 blur 미디어쿼리 (컴포넌트 파일 변수 선언 custom.css로 이전)

### Phase 2: Icons & Navigation
**Goal**: 사용자가 사이트에 진입하는 첫 인상인 헤더가 글래스 처리되고 아이콘 시스템이 통일된다
**Depends on**: Phase 1
**Requirements**: ICON-01, ICON-02, NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. 헤더가 스크롤 시 frosted glass 효과(backdrop-filter + 반투명 배경)로 콘텐츠 위에 고정된다
  2. 다크 모드와 라이트 모드 모두에서 네비게이션 텍스트/링크가 충분한 대비비로 읽힌다
  3. 모바일(768px 이하)에서 네비게이션이 사용 가능한 형태로 표시된다
  4. 기존 인라인 SVG/텍스트 아이콘이 Phosphor Icons으로 교체되어 있다
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Phosphor Icons v2 CDN 통합 + 이모지 아이콘 교체
- [ ] 02-02-PLAN.md — Frosted glass 헤더 CSS 오버라이드 + 네비게이션 가독성

### Phase 3: Background & Regime
**Goal**: 글래스 카드 뒤에 블러할 대상(ambient orbs)이 생기고 regime 상태가 글래스 색감에 반영된다
**Depends on**: Phase 2
**Requirements**: BG-01, BG-02, BG-03, RGME-01, RGME-02
**Success Criteria** (what must be TRUE):
  1. 페이지 배경에 컬러 그라데이션 orbs가 표시되어 backdrop-filter에 블러할 레이어가 존재한다
  2. Orbs가 다크 모드(어두운 배경)와 라이트 모드(밝은 배경) 모두에서 적절한 강도로 표시된다
  3. prefers-reduced-motion이 설정된 환경에서 orb 애니메이션이 정지된다
  4. Bull/Bear/Neutral regime에 따라 글래스 카드 배경이 미묘하게 다른 색조로 표시된다
  5. Regime 틴팅이 다크 모드와 라이트 모드 모두에서 적용된다
**Plans**: 2 plans

Plans:
- [ ] 03-01-PLAN.md — Ambient orbs 전 페이지 배경 레이어 (CSS + JS + 로더 등록)
- [ ] 03-02-PLAN.md — Regime 기반 글래스 카드 틴팅 (한국 컨벤션 색상 매핑)

### Phase 4: Component Redesign
**Goal**: 뉴스 카드, 캘린더, 차트 컨테이너가 글래스 시스템으로 리디자인되어 통일된 프리미엄 인상을 준다
**Depends on**: Phase 3
**Requirements**: NEWS-01, NEWS-02, NEWS-03, NEWS-04, CAL-01, CAL-02, CAL-03, CHRT-01, CHRT-02, CHRT-03
**Success Criteria** (what must be TRUE):
  1. 뉴스 카드가 글래스 스타일(backdrop-filter 또는 opaque rgba 배경, 테두리, 그림자)로 표시된다
  2. 뉴스 카드에 카테고리별 서로 다른 색상 뱃지/액센트가 적용되어 있다
  3. 뉴스 카드에 마우스를 올리면 글래스 경계 강조 또는 그림자 변화가 발생한다
  4. 캘린더가 글래스 카드 스타일로 표시되고 이벤트 상태(지남/진행중/예정)가 시각적으로 구분된다
  5. 차트 컨테이너에 글래스 스타일의 테두리와 box-shadow가 적용되고 ECharts 팔레트가 디자인 시스템 색상과 동기화된다
**Plans**: TBD

### Phase 5: Performance & Accessibility
**Goal**: 글래스 효과가 모바일에서 부드럽게 작동하고 WCAG 2.1 AA 기준을 통과한다
**Depends on**: Phase 4
**Requirements**: PERF-01, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):
  1. 뷰포트에 동시 활성화된 backdrop-filter 요소가 10개 이하다 (DevTools 레이어 패널로 확인 가능)
  2. 내부 중첩 카드(뉴스 카드 등)는 backdrop-filter 없이 opaque rgba() 배경을 사용하고, 최외곽 컨테이너만 backdrop-filter를 갖는다
  3. 640px 이하 모바일에서 blur 값이 자동으로 줄어들어 적용된다 (CSS DevTools로 확인)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete   | 2026-02-19 |
| 2. Icons & Navigation | 2/2 | Complete   | 2026-02-19 |
| 3. Background & Regime | 0/2 | Planned | - |
| 4. Component Redesign | 0/TBD | Not started | - |
| 5. Performance & Accessibility | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-19*
*v1 requirements: 30 total, all mapped*
