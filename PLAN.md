# AI-Friendly Refactoring Plan

Last Updated: 2026-02-16
Branch: `ui/enhanced`
Owner: AI Agent

## Status Legend

- `[x]` Done
- `[~]` In Progress
- `[ ]` Todo
- `[-]` Blocked/Skipped

## Goal

`AI_CODING_RULES.md`를 기준으로, AI가 설정과 구조만 보고 빠르게 유지보수할 수 있는 코드베이스로 점진 전환한다.

## Stage 0 - Baseline and Guardrails

- [x] `AI_CODING_RULES.md` 작성 완료
- [x] 현재 구조/설정/로더 체인 분석 완료
- [x] 파이프라인 산출물(`content/posts/pre-market-*.md`) 직접 수정 금지 원칙 확정
- [x] 검증 명령 목록 확보 (`tools/` 스크립트 + `hugo --gc --minify`)

Exit Criteria

- [x] 헌법 문서(규칙 문서) 존재
- [x] 변경 경계(수정 가능/불가 영역) 문서화

## Stage 1 - Config Externalization (Single Source of Truth)

### 1.1 설정 스키마 도입

- [x] `config/_default/params.market-pulse.toml` 추가
- [x] 섹션 타이틀 alias, 라벨, 컬러맵, 시간대 상수 이관

### 1.2 런타임 주입

- [x] `layouts/partials/extend-head-uncached.html`에 `window.__MP_CONFIG` 주입
- [x] `static/js/mp-config.js` 생성(기본값 + 주입값 merge)
- [x] `layouts/partials/extend-footer.html` 로더 순서에 `mp-config.js` 등록

Exit Criteria

- [x] 설정 변경 시 JS 코드 수정 없이 동작 변경 가능
- [x] 기존 페이지 렌더/동작 회귀 없음

## Stage 2 - DRY Refactor (Logic)

### 2.1 하드코딩 문자열/맵 제거

- [x] `static/js/market-pulse-enhancements.js`
  - [x] 섹션 제목 하드코딩 제거 (`주요 뉴스`, `주요 일정`, `핵심 수치`, `섹터 상대강도`)
  - [x] Regime color map 하드코딩 제거
- [x] `static/js/briefing/news-grid.js`
  - [x] `원문:` 토큰 설정화
- [x] `static/js/calendar/renderer.js`
  - [x] 캘린더 제목/빈 상태 문구 설정화
- [x] `static/js/briefing/calendar-loader.js`
  - [x] 캘린더 shortcode 기본 제목 문구 설정화

### 2.2 데이터 외부화(선택 단계)

- [ ] KRX 휴장일을 `static/data/`로 분리 검토
- [ ] 분리 시 fallback 상수 + fetch 실패 처리 추가

Exit Criteria

- [ ] 섹션/라벨/색상 변경이 설정 파일 중심으로 가능
- [ ] 기능 동작 동일성 유지

## Stage 3 - DRY Refactor (Styles and Templates)

### 3.1 Inline Style 제거

- [x] `layouts/shortcodes/ticker-group.html` inline style 제거 완료
- [x] `layouts/partials/footer.html` inline style 클래스화
- [x] `layouts/shortcodes/news-grid.html` inline style 클래스화
- [x] `layouts/shortcodes/market-charts.html` 고정 높이 하드코딩 파라미터화/클래스화

### 3.2 라이트 모드 오버라이드 정리

- [x] `:root:not(.dark)` 규칙 분산도 점검 및 핵심 변수화 (`custom.css`)
- [x] `theme-fixes.css`와 `layout-overrides.css` 간의 중복 정의 일부 정리
- [ ] 필요 시 light-mode 전용 레이어 문서화 (진행 예정)

Exit Criteria

- [x] 템플릿 inline style 최소화(예외 0 목표)
- [x] 라이트/다크 충돌 없이 동일 브레이크포인트에서 안정 동작

## Stage 4 - Readability and Formatting

- [x] 루트 `.editorconfig` 추가
- [ ] 들여쓰기/줄바꿈/후행 공백 규칙 통일 (진행 중)
- [ ] 포맷터(선택) 도입 여부 결정 (`prettier` script)
- [ ] JS `var` -> `const/let` 현대화 범위 확정

## Stage 5 - Verification Gates

기본 게이트

- [x] `hugo --gc --minify` (PASS)
- [x] `pwsh -File tools/agent-preflight.ps1 -RunBuild -FailOnFindings` (PASS)
- [x] `pwsh -File tools/architecture-lint.ps1 -FailOnFindings` (PASS)

## Current Snapshot (Now)

- [x] 규칙 문서 기반 운영 시작 (`AI_CODING_RULES.md`)
- [x] 설정 주입 레이어(`__MP_CONFIG`, `mp-config.js`) 완료
- [x] 하드코딩 라벨/타이틀/상수 외부화 완료
- [x] footer/news-grid/ticker-group inline style 제거 완료
- [x] 라이트 모드 변수화 및 기초 정리 완료
- [x] 아키텍처 린트 및 빌드 검증 통과

## Next Action Queue (Recommended Order)

1. [ ] Stage 2.2: KRX 휴장일 데이터 외부화 (`static/data/krx-holidays.json`)
2. [ ] Stage 4: JS 코드 현대화 (`var` -> `const/let`) 및 세부 포맷팅 정리
3. [ ] Stage 5: Playwright E2E 테스트 환경 구성 및 전체 실행

