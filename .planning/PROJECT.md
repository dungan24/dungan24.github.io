# Market Pulse Blog — UI/UX Redesign

## What This Is

Market Pulse 브리핑 블로그(dungan24.github.io)의 UI/UX 리디자인 프로젝트.
Glassmorphism 디자인 시스템을 중심으로 3티어 CSS 토큰, 다크/라이트 모드 최적화,
모바일 blur cascade, ambient orbs 배경, regime 틴팅까지 구축 완료.
v1.0에서 핵심 비주얼 레이어를 완성했고, JS 모듈(브리핑, 캘린더, 차트)은 그대로 유지.

## Core Value

브리핑을 여는 순간 "이거 제대로 만든 거다"라는 프리미엄 인상을 주는 것.
글래스 효과와 통일된 시스템으로 금융 데이터의 신뢰감과 현대적 감각을 동시에 전달한다.

## Requirements

### Validated

- ✓ Hugo + Blowfish 기반 정적 사이트 빌드 — existing
- ✓ Market Pulse 브리핑 마크다운 → HTML 변환 (뉴스 카드, 존 분리) — existing
- ✓ 캘린더 이벤트 파싱 및 렌더링 — existing
- ✓ ECharts 기반 시장 차트 로딩/렌더링 — existing
- ✓ Regime 기반 히어로 섹션 색상 변경 — existing
- ✓ 다크/라이트 모드 기본 지원 (Blowfish 테마) — existing
- ✓ GitHub Pages 배포 파이프라인 — existing
- ✓ window.MP_CONFIG 기반 설정 주입 시스템 — existing
- ✓ Glassmorphism 디자인 시스템 (CSS 3티어 토큰, 글래스 카드, 블러 효과) — v1.0
- ✓ 통일된 컬러 팔레트 (다크/라이트 모드 각각 최적화) — v1.0
- ✓ 뉴스 카드 리디자인 (글래스 효과, 카테고리 뱃지 10종, 호버 효과) — v1.0
- ✓ 캘린더 UI 리디자인 (글래스 카드, 이벤트 상태 시각화) — v1.0
- ✓ 차트 영역 리디자인 (ECharts 팔레트 동기화, 글래스 컨테이너) — v1.0
- ✓ 네비게이션/헤더 리디자인 (frosted glass 스티키 헤더, Phosphor Icons) — v1.0
- ✓ 모바일 반응형 레이아웃 (640/768 브레이크포인트, 바텀 네비게이션) — v1.0
- ✓ 다크 모드 완전 최적화 (글래스 효과 다크 변형) — v1.0
- ✓ 라이트 모드 완전 최적화 (글래스 효과 라이트 변형) — v1.0
- ✓ Ambient orbs 배경 레이어 (dark/light/reduced-motion) — v1.0
- ✓ Regime 글래스 틴팅 (한국 컨벤션 Bull/Bear/Neutral 색상) — v1.0
- ✓ GPU 성능 최적화 (중첩 backdrop-filter 제거, 모바일 blur cascade) — v1.0
- ✓ prefers-reduced-motion 접근성 가드 (14 셀렉터) — v1.0

### Active

- [ ] 통일된 타이포그래피 시스템 (폰트 스케일, 행간, 웨이트)
- [ ] 푸터 리디자인
- [ ] 트랜지션/애니메이션 (페이드, 스크롤 리빌, 호버 효과)
- [ ] 브리핑 메타 푸터 스타일링
- [ ] chart-cards.css / terminal-footer.css 하드코딩 blur var() 전환 (v1.0 tech debt)

### Out of Scope

- JS 모듈 로직 변경 — 비주얼 레이어만 변경, 파싱/변환 로직은 유지
- 콘텐츠 구조 변경 — 마크다운 계약(render-contract) 변경 없음
- 백엔드/파이프라인 수정 — market-pulse 레포 범위
- SEO 최적화 — 별도 프로젝트로 분리
- 다국어 지원 — 현재 한국어 단일 언어 유지
- Hugo 테마 교체 — v1.0에서 Blowfish 위에 충분히 커스터마이징 달성, 교체 불필요
- SCSS/PostCSS 도입 — 순수 CSS로 충분, 빌드 의존성 추가 불필요

## Context

- Hugo v0.155.3 + Blowfish 테마 기반의 정적 사이트
- v1.0 shipped: 5,441 CSS LOC across custom.css + 15 component files
- 스타일링: `assets/css/custom.css` (3티어 토큰 SSOT) + `assets/css/custom/*.css` (15 컴포넌트)
- JS: `static/js/` 하위의 순수 JS 모듈 (ES5 호환, IIFE 패턴)
- 추가 JS: `static/js/ambient-orbs.js` (orb + regime 틴팅)
- 데이터 흐름: market-pulse(private) → dungan24.github.io(public) 단방향
- Phosphor Icons v2 CDN (bold + regular, ~120KB)
- ECharts 팔레트는 params.toml에 미러링 (CSS 변수 직접 소비 불가)
- Known tech debt: chart-cards.css/terminal-footer.css hardcoded blur, calendar tooltip unguarded

## Constraints

- **Tech stack**: Hugo 정적 사이트 유지 — SSR/SPA 전환 불가
- **JS 호환성**: 기존 `window.MPBriefing`, `window.MPCalendar`, `window.MPCharts` 네임스페이스 유지
- **배포**: GitHub Pages 자동 배포 파이프라인 유지
- **계약**: market-pulse 레포의 render-contract, narrative-contract 준수
- **성능**: 추가 JS 번들 최소화, CSS-first 접근
- **CSS 변수 SSOT**: `--mp-*` 변수 선언은 custom.css에만 — 컴포넌트 파일은 소비만
- **다크 모드**: `.dark` 클래스 토글만 사용 — `@media prefers-color-scheme` 금지
- **backdrop-filter**: 내부 카드 금지, 최외곽 컨테이너만 적용

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Glassmorphism 디자인 방향 | 금융 데이터의 신뢰감 + 현대적 감각 동시 전달 | ✓ v1.0 shipped |
| Blowfish 테마 유지 | 커스터마이징으로 충분히 달성, 교체 리스크 불필요 | ✓ Good |
| CSS 변수 3티어 토큰 시스템 | 다크/라이트 모드 + 일관성 + 모바일 cascade | ✓ Good |
| 내부 카드 backdrop-filter 금지 | GPU 레이어 수 제한, 중첩 블러 아티팩트 방지 | ✓ Good |
| ECharts 팔레트 params.toml 미러링 | ECharts는 CSS 변수 직접 소비 불가 | ✓ Good |
| Phosphor Icons CSS-only CDN | 전체 스크립트 번들 ~3MB 금지, CSS만 ~120KB | ✓ Good |
| 한국 컨벤션 색상 매핑 (KR_TINT_RGB) | 상승=빨강, 하락=파랑 — 한국 금융 관례 | ✓ Good |
| mp:regime-ready CustomEvent | 폴링 대신 동기 이벤트로 US→KR 색상 flash 제거 | ✓ Good |
| blur 변수 전체 함수 문자열화 | blur(var(--px)) 중첩은 CSS 스펙상 불가 | ✓ Good |

---
*Last updated: 2026-02-19 after v1.0 milestone*
