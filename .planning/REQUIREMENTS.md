# Requirements: Market Pulse Blog UI/UX Redesign

**Defined:** 2026-02-19
**Core Value:** 브리핑을 여는 순간 "이거 제대로 만든 거다"라는 프리미엄 인상을 주는 것

## v1 Requirements

Requirements for glassmorphism redesign. Each maps to roadmap phases.

### Foundation

- [x] **FOUN-01**: 중복된 `:root:not(.dark)` CSS 블록을 단일 블록으로 통합
- [x] **FOUN-02**: `.mp-briefing-meta::before`의 nested backdrop-filter 버그 수정
- [x] **FOUN-03**: `#TOCView`와 `.market-chart-card`를 prefers-reduced-motion 블록에 추가
- [x] **FOUN-04**: 3티어 CSS 변수 시스템 구축 (primitive → semantic → component 계층)
- [x] **FOUN-05**: 다크 모드 최적화된 컬러 팔레트 정의 (primitive 토큰)
- [x] **FOUN-06**: 라이트 모드 최적화된 컬러 팔레트 정의 (primitive 토큰)
- [x] **FOUN-07**: 모바일 blur 최적화 변수 정의 (640px 이하: 8px, 480px 이하: 4px)

### Icons

- [x] **ICON-01**: Phosphor Icons v2 CDN 통합 (jsDelivr, extend-head-uncached.html에 추가)
- [x] **ICON-02**: 기존 인라인 SVG/텍스트 아이콘을 Phosphor 아이콘으로 교체

### Navigation

- [x] **NAV-01**: Frosted glass 스타일의 스티키 헤더 구현 (backdrop-filter + 반투명 배경)
- [x] **NAV-02**: 다크/라이트 모드 모두에서 네비게이션 가독성 보장
- [x] **NAV-03**: 모바일 반응형 네비게이션 개선

### Background

- [x] **BG-01**: Ambient orbs 배경 구현 (글래스 효과를 살리는 그라데이션 오브)
- [x] **BG-02**: Ambient orbs가 다크/라이트 모드에서 각각 적절히 표시
- [x] **BG-03**: Ambient orbs 애니메이션에 prefers-reduced-motion 존중

### Regime Tinting

- [x] **RGME-01**: Regime 상태(bull/bear/neutral)에 따라 글래스 배경에 미묘한 틴팅 적용
- [x] **RGME-02**: Regime 틴팅이 다크/라이트 모드 모두에서 작동

### News Cards

- [x] **NEWS-01**: 뉴스 카드를 글래스 카드 스타일로 리디자인
- [x] **NEWS-02**: 카테고리별 뱃지/색상 구분 적용
- [x] **NEWS-03**: 뉴스 카드 호버 효과 (글래스 경계 강조, 그림자 변화)
- [x] **NEWS-04**: 뉴스 카드 모바일 레이아웃 최적화

### Calendar

- [x] **CAL-01**: 캘린더 컴포넌트를 글래스 카드 스타일로 리디자인
- [x] **CAL-02**: 이벤트 상태 시각화 개선 (지남/진행중/예정)
- [x] **CAL-03**: 캘린더 다크/라이트 모드 최적화

### Charts

- [x] **CHRT-01**: 차트 영역에 글래스 컨테이너 스타일 적용
- [x] **CHRT-02**: ECharts 팔레트를 디자인 시스템 컬러와 동기화 (params.toml 업데이트)
- [x] **CHRT-03**: 차트 컨테이너 다크/라이트 모드 최적화

### Performance

- [x] **PERF-01**: 뷰포트당 활성 backdrop-filter 요소를 8-10개 이하로 제한
- [x] **PERF-02**: 내부 카드는 opaque rgba() 배경 사용, 최외곽 컨테이너만 backdrop-filter 적용
- [x] **PERF-03**: 모바일에서 blur 값 자동 축소 (CSS 미디어 쿼리)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Typography

- **TYPO-01**: JetBrains Mono 추가 및 `--mp-font-mono` 교체
- **TYPO-02**: 폰트 스케일 시스템 통일 (heading/body/caption 비율)

### Polish

- **PLSH-01**: 트랜지션/애니메이션 시스템 (페이드, 스크롤 리빌, 호버)
- **PLSH-02**: 푸터 리디자인
- **PLSH-03**: 브리핑 메타 푸터 스타일링
- **PLSH-04**: Hugo 테마 교체 평가 (Blowfish 대안 검토)

## Out of Scope

| Feature | Reason |
|---------|--------|
| JS 모듈 로직 변경 | 비주얼 레이어만 변경, 파싱/변환 로직은 유지 |
| 콘텐츠 구조 변경 | 마크다운 계약(render-contract) 변경 없음 |
| 백엔드/파이프라인 수정 | market-pulse 레포 범위 |
| SEO 최적화 | 별도 프로젝트로 분리 |
| SCSS/PostCSS 도입 | 순수 CSS로 충분, 빌드 의존성 추가 불필요 |
| Tailwind CSS 도입 | 기존 ES5 IIFE 아키텍처와 호환 불가 |
| 애니메이션 라이브러리 (JS) | CSS-only 접근 유지 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Complete |
| FOUN-02 | Phase 1 | Complete |
| FOUN-03 | Phase 1 | Complete |
| FOUN-04 | Phase 1 | Complete |
| FOUN-05 | Phase 1 | Complete |
| FOUN-06 | Phase 1 | Complete |
| FOUN-07 | Phase 1 | Complete |
| ICON-01 | Phase 2 | Complete |
| ICON-02 | Phase 2 | Complete |
| NAV-01 | Phase 2 | Complete |
| NAV-02 | Phase 2 | Complete |
| NAV-03 | Phase 2 | Complete |
| BG-01 | Phase 3 | Complete |
| BG-02 | Phase 3 | Complete |
| BG-03 | Phase 3 | Complete |
| RGME-01 | Phase 3 | Complete |
| RGME-02 | Phase 3 | Complete |
| NEWS-01 | Phase 4 | Complete |
| NEWS-02 | Phase 4 | Complete |
| NEWS-03 | Phase 4 | Complete |
| NEWS-04 | Phase 4 | Complete |
| CAL-01 | Phase 4 | Complete |
| CAL-02 | Phase 4 | Complete |
| CAL-03 | Phase 4 | Complete |
| CHRT-01 | Phase 4 | Complete |
| CHRT-02 | Phase 4 | Complete |
| CHRT-03 | Phase 4 | Complete |
| PERF-01 | Phase 5 | Complete |
| PERF-02 | Phase 5 | Complete |
| PERF-03 | Phase 5 | Complete |

**Coverage:**
- v1 requirements: 30 total
- Mapped to phases: 30
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-19*
*Last updated: 2026-02-19 after 04-02 execution — CAL-01/02/03 complete*
