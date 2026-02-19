# Market Pulse Blog — UI/UX Redesign

## What This Is

Market Pulse 브리핑 블로그(dungan24.github.io)의 전면 UI/UX 리디자인 프로젝트.
Glassmorphism 스타일을 중심으로, 일관된 디자인 시스템 구축, 다크/라이트 모드 최적화,
모바일 퍼스트 반응형 레이아웃을 구현한다. 기존 JS 모듈(브리핑, 캘린더, 차트)은 유지하되
비주얼 레이어를 완전히 새로 만든다.

## Core Value

브리핑을 여는 순간 "이거 제대로 만든 거다"라는 프리미엄 인상을 주는 것.
글래스 효과와 통일된 시스템으로 금융 데이터의 신뢰감과 현대적 감각을 동시에 전달한다.

## Requirements

### Validated

<!-- 기존 코드베이스에서 확인된 동작하는 기능 -->

- ✓ Hugo + Blowfish 기반 정적 사이트 빌드 — existing
- ✓ Market Pulse 브리핑 마크다운 → HTML 변환 (뉴스 카드, 존 분리) — existing
- ✓ 캘린더 이벤트 파싱 및 렌더링 — existing
- ✓ ECharts 기반 시장 차트 로딩/렌더링 — existing
- ✓ Regime 기반 히어로 섹션 색상 변경 — existing
- ✓ 다크/라이트 모드 기본 지원 (Blowfish 테마) — existing
- ✓ GitHub Pages 배포 파이프라인 — existing
- ✓ window.MP_CONFIG 기반 설정 주입 시스템 — existing

### Active

<!-- 이번 프로젝트에서 구현할 범위 -->

- [ ] Glassmorphism 디자인 시스템 (CSS 변수/토큰, 글래스 카드, 블러 효과)
- [ ] 통일된 타이포그래피 시스템 (폰트 스케일, 행간, 웨이트)
- [ ] 통일된 컬러 팔레트 (다크/라이트 모드 각각 최적화)
- [ ] 뉴스 카드 리디자인 (글래스 효과, 카테고리 뱃지, 시각적 계층)
- [ ] 캘린더 UI 리디자인 (글래스 카드, 이벤트 상태 시각화)
- [ ] 차트 영역 리디자인 (ECharts 테마 통합, 글래스 컨테이너)
- [ ] 네비게이션/헤더 리디자인
- [ ] 푸터 리디자인
- [ ] 모바일 퍼스트 반응형 레이아웃 (640/768/1024 브레이크포인트)
- [ ] 다크 모드 완전 최적화 (글래스 효과 다크 변형)
- [ ] 라이트 모드 완전 최적화 (글래스 효과 라이트 변형)
- [ ] Hugo 테마 평가 및 교체 (Blowfish 대안 검토)
- [ ] 트랜지션/애니메이션 (페이드, 스크롤 리빌, 호버 효과)
- [ ] 브리핑 메타 푸터 스타일링

### Out of Scope

<!-- 이번 프로젝트에서 하지 않는 것 -->

- JS 모듈 로직 변경 — 비주얼 레이어만 변경, 파싱/변환 로직은 유지
- 콘텐츠 구조 변경 — 마크다운 계약(render-contract) 변경 없음
- 백엔드/파이프라인 수정 — market-pulse 레포 범위
- SEO 최적화 — 별도 프로젝트로 분리
- 다국어 지원 — 현재 한국어 단일 언어 유지

## Context

- Hugo v0.155.3 + Blowfish 테마 기반의 정적 사이트
- 스타일링: `assets/css/custom/` 모듈형 CSS + Blowfish 테마 기본 스타일
- JS: `static/js/` 하위의 순수 JS 모듈 (ES5 호환, IIFE 패턴, 네임스페이스 방식)
- 데이터 흐름: market-pulse(private) → dungan24.github.io(public) 단방향
- 기존 글래스모피즘 부분 적용: `--mp-glass-bg`, `backdrop-filter` 등이 일부 CSS에 존재
- 현재 뉴스 카드에 BEM 네이밍 (`mp-news-card__headline` 등) 사용 중
- Blowfish 테마 교체 시 `layouts/` 오버라이드와 `config/` 설정 마이그레이션 필요

## Constraints

- **Tech stack**: Hugo 정적 사이트 유지 — SSR/SPA 전환 불가
- **JS 호환성**: 기존 `window.MPBriefing`, `window.MPCalendar`, `window.MPCharts` 네임스페이스 유지
- **배포**: GitHub Pages 자동 배포 파이프라인 유지
- **계약**: market-pulse 레포의 render-contract, narrative-contract 준수
- **성능**: 추가 JS 번들 최소화, CSS-first 접근

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Glassmorphism 디자인 방향 | 금융 데이터의 신뢰감 + 현대적 감각 동시 전달 | — Pending |
| Blowfish 테마 교체 검토 | 현재 테마의 커스터마이징 한계, 더 나은 대안 탐색 | — Pending |
| 모바일 퍼스트 접근 | 모바일 경험이 현재 가장 큰 불만 포인트 | — Pending |
| CSS 변수 기반 디자인 시스템 | 다크/라이트 모드 + 일관성을 위한 토큰 시스템 필수 | — Pending |

---
*Last updated: 2026-02-19 after initialization*
