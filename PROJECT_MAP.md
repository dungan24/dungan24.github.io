# PROJECT_MAP.md

**최종 업데이트**: 2026-02-18  
**목적**: 이 레포의 현재 운영 구조를 빠르게 파악하기 위한 실행 지도

## 1) 프로젝트 정의

- 저장소: `market-pulse-blog` (`dungan24.github.io`)
- 역할: `market-pulse`가 생성한 브리핑 콘텐츠를 렌더링/발행
- 범위: 렌더링/표현 계층 (사실 생성 파이프라인 아님)

## 2) 현재 핵심 구조

- 콘텐츠 입력:
  - `content/posts/{pre-market|mid-day|post-market}-{date}.md`
  - `static/data/chart-data-{date}.json`
- 렌더링 로더:
  - `layouts/partials/extend-head-uncached.html` (config/data bridge)
  - `layouts/partials/extend-footer.html` (script loader)
- 런타임 JS:
  - `static/js/briefing/*.js`
  - `static/js/market-pulse-enhancements.js`
  - `static/js/calendar/{parser,model,renderer}.js`
  - `static/js/market-pulse-calendar.js`
  - `static/js/render-charts.js`, `static/js/market-charts-loader.js`
- 스타일:
  - `assets/css/custom.css`
  - `assets/css/custom/*.css`

## 3) 운영 문서 우선순위

1. `AGENTS.md` (에이전트 작업 규칙)
2. `CLAUDE.md` (렌더 계약/구조 가이드)
3. `README.md` (개요/실행/품질 게이트)
4. `docs/agent-architecture-roadmap.md` (리팩터 상태)

## 4) 계약 민감 포인트

- Cross-repo contract:
  - `../market-pulse/specs/render-contract.md`
  - `../market-pulse/specs/narrative-contract.md`
- 특히 깨지기 쉬운 포인트:
  - 뉴스 카드 메타/excerpt 포맷
  - 캘린더 이벤트 마커(`MP_KEY_EVENTS_*`, `MP_KEY_EVENT_*`)
  - 블록 메타(`MP_BLOCK_START` / `mp-block-v2`)
  - 메타 푸터(`mp-briefing-meta`) 구조

## 5) 최근 UI/IA 상태

- 홈:
  - `Market Overview` + `Recent Briefings` 카드형 구조
  - Regime filter 칩(ALL/RISK_ON/CAUTIOUS/RISK_OFF/PANIC)
  - 모바일 하단 고정 내비게이션
- 정보 페이지:
  - 메뉴: `투자 전략`, `마켓 캘린더`, `About`
  - 푸터 링크: `Security Protocol`, `Data Consent`, `API Documentation`

## 6) 실행/검증 명령

```bash
hugo server --port 1314 --bind 0.0.0.0 --navigateToChanged
hugo --gc --minify
pwsh -File tools/architecture-lint.ps1 -FailOnFindings
pwsh -File tools/agent-preflight.ps1 -RunBuild -FailOnFindings
pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314
```

## 7) 작업 원칙

- 파이프라인 산출물(`content/posts/*`, `static/data/chart-data-*`) 직접 수정 지양
- 파서/표현 규칙 변경 시 계약 문서와 동기화
- `layouts/` 신규 인라인 `<script>/<style>` 금지 (데이터 브리지 예외만 허용)
- 변경 후 build + lint + smoke 결과를 남겨 재현 가능 상태로 종료
