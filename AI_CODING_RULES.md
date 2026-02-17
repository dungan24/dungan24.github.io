# AI Coding Rules (Market Pulse Blog)

이 문서는 이 저장소에서 작업하는 모든 AI Agent의 공통 헌법입니다.
목표는 "빠른 분석, 예측 가능한 변경, 쉬운 유지보수"입니다.

## 0. 적용 범위

- 이 규칙은 `assets/`, `layouts/`, `static/js/`, `config/`, `tools/`, `docs/` 변경에 모두 적용합니다.
- 데이터 생성 파이프라인 산출물은 별도 규칙을 따릅니다(아래 2.3 참조).

## 1. 규칙 강도

- `MUST`: 반드시 지켜야 함
- `SHOULD`: 특별한 이유가 없으면 지켜야 함
- `MAY`: 선택적으로 적용 가능

## 2. 디렉토리 구조와 역할 정의

### 2.1 Hugo 표준 구조(이 저장소 기준)

| 경로 | 역할 | 변경 규칙 |
|---|---|---|
| `config/_default/` | 사이트 설정(분리된 TOML) | 키 소유 규칙(5장) 준수 |
| `content/` | 페이지 콘텐츠 | `content/posts/`는 파이프라인 산출물 취급 |
| `layouts/` | 템플릿/partial | 로더 partial은 로더 역할만 유지 |
| `assets/` | Hugo Pipe 대상 자산(CSS) | 디자인 토큰/레이어 구조 유지 |
| `static/` | 정적 파일(JS, data 등) | 런타임 스크립트 순서 의존성 준수 |
| `tools/` | 검증/점검 스크립트 | CI/로컬 검증 명령과 일치 유지 |
| `docs/` | 문서/스크린샷 아카이브 | 런타임 소스로 사용 금지 |

### 2.2 커스텀 구조 핵심

- `assets/css/custom.css`: 글로벌 토큰(`--mp-*`)과 공통 베이스 레이어
- `assets/css/custom/*.css`: 기능 단위 스타일 레이어
- `layouts/partials/extend-head-uncached.html`: 커스텀 CSS 수동 로딩 목록(명시적 순서)
- `layouts/partials/extend-footer.html`: JS 모듈 수동 로딩 목록(명시적 순서)
- `static/js/briefing/*.js`: 포스트 렌더링/변환 모듈
- `static/js/calendar/*.js`: 캘린더 parser/model/renderer 코어
- `static/js/market-pulse-calendar.js`: 캘린더 엔트리포인트(어댑터)

### 2.3 변경 금지/주의 영역

- `MUST NOT`: `content/posts/pre-market-*.md` 수동 수정
- `MUST NOT`: 파이프라인 산출 데이터 의미 변경
- `SHOULD`: QA용 샘플 페이지는 `content/qa/`에 두고 기본 `draft: true` 유지

## 3. 네이밍 컨벤션

### 3.1 파일/폴더

- `MUST`: 파일명은 `kebab-case`
  - 예: `briefing-sections.css`, `market-pulse-calendar.js`
- `SHOULD`: 기능 단위로 파일을 나누되, 지나친 파편화 금지

### 3.2 CSS 클래스

- `MUST`: 커스텀 클래스는 `mp-` 접두사 사용
  - 예: `.mp-ticker-row`, `.mp-news-card`
- `SHOULD`: BEM 유사 형태 사용
  - Element: `__` (예: `.mp-news-card__headline`)
  - Modifier: `--` (예: `.briefing-section--opinion`)
  - State: `is-*` (예: `.is-active`, `.is-empty`)

### 3.3 변수명

- CSS 변수: `MUST` `--mp-*`
- JS 변수/함수: `SHOULD` `camelCase`
- JS 상수: `SHOULD` `UPPER_SNAKE_CASE`
- 전역 객체: `MUST` 최소화, 필요 시 단일 네임스페이스 아래 선언

## 4. 주석 가이드라인 (Why-First)

- `MUST`: 주석은 "무엇"보다 "왜"를 설명
- `MUST`: 아래 3가지 경우만 주석 허용
  1. 로딩 순서/의존성
  2. 후방 호환을 위한 제약
  3. 의도적으로 선택한 트레이드오프
- `MUST NOT`: 코드 읽으면 바로 알 수 있는 내용 주석
- `SHOULD`: 다음 포맷 권장

```text
// WHY: 이 순서가 필요한 이유
// CONSTRAINT: 깨지면 안 되는 계약
// COMPAT: 기존 포스트 렌더링 호환성 유지 목적
```

## 5. 설정 파일 분리 원칙 (hugo.toml 비대화 방지)

### 5.1 키 소유권 (Single Owner)

- `config/_default/hugo.toml`
  - 사이트 전역, 빌드/출력, taxonomies, pagination 같은 코어만
- `config/_default/params.toml`
  - 테마 파라미터, UI 토글, 홈/아티클 동작
- `config/_default/markup.toml`
  - Goldmark, Highlight, Table of Contents
- `config/_default/languages.ko.toml`
  - 언어/로케일
- `config/_default/menus.ko.toml`
  - 메뉴

### 5.2 분리 규칙

- `MUST`: 같은 의미의 키를 여러 파일에 중복 정의하지 않음
- `MUST`: 키 이동 시, 기존 위치의 키를 같은 PR에서 제거
- `SHOULD`: 환경별 설정이 필요하면 `config/<environment>/` 오버레이 사용
- `MAY`: 새로운 설정 도메인이 생기면 `_default`에 도메인 파일 추가(예: `privacy.toml`)

## 6. 로더/순서 규칙

### 6.1 CSS

- `MUST`: 새 CSS 파일 추가 시 `layouts/partials/extend-head-uncached.html` 로딩 목록에 명시
- `MUST`: 로딩 순서가 스타일 결과에 미치는 영향 설명(커밋/PR 본문)
- `SHOULD`: 기존 파일에 자연스럽게 포함 가능하면 파일 추가보다 통합 우선

### 6.2 JavaScript

- `MUST`: 새 JS 모듈 추가 시 `layouts/partials/extend-footer.html` 순서 의존성 확인
- `MUST`: 선행 모듈이 필요하면 주석/설명으로 의존성 명시
- `MUST NOT`: 엔트리포인트 파일에 parser/model/renderer 코어 로직 혼합

### 6.3 Layout Inline Policy

- `MUST NOT`: `layouts/`에 신규 인라인 `<script>/<style>` 블록 추가
- `MAY` (허용 예외): `layouts/partials/extend-head-uncached.html`의 데이터 브리지 인라인 스크립트(`window.__MP_CONFIG`, 조건부 `window.__MP_PAGE`) 유지
- `MUST`: 위 예외 범위를 벗어나는 인라인 블록이 필요하면 9장 예외 처리 절차를 먼저 적용

## 7. AI 변경 작업 프로토콜

1. `MUST`: 기존 패턴 탐색(동일/유사 기능 파일 먼저 확인)
2. `MUST`: 최소 변경 원칙 적용(관련 없는 파일/포맷 변경 금지)
3. `SHOULD`: 새 파일 생성 전 기존 모듈 확장 가능성 검토
4. `MUST`: 변경 후 검증 실행 및 결과 기록

## 8. 검증 체크리스트

기본:

- `hugo --gc --minify`

권장(변경 범위에 따라):

- `pwsh -File tools/agent-preflight.ps1 -RunBuild -FailOnFindings`
- `pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314`
- `pwsh -File tools/architecture-lint.ps1 -FailOnFindings`
- `npx playwright test tools/ui-viewport.smoke.spec.js --workers=1`

렌더 검증:

- 최근 pre-market 포스트 1건에서 카드/TOC/티커/테이블 렌더 확인
- 모바일(390), 태블릿(768), 데스크탑(1024+) 오버플로우 확인

## 9. 예외 처리 규칙

- 규칙 위반이 필요한 변경은 사전 승인 없이 수행하지 않습니다.
- 예외 요청 템플릿:

```text
[Exception Request]
- Target:
- Reason:
- Safer Alternative:
- Risk:
- Rollback Plan:
```

## 10. 한 줄 원칙

"기존 계약을 깨지 않고, 작은 변경으로, 검증 가능한 상태를 남긴다."
