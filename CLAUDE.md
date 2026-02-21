# CLAUDE.md — dungan24.github.io

## 프로젝트 개요

Market Pulse 브리핑의 프론트엔드 블로그 저장소입니다.
Hugo + Blowfish 테마 위에서 마크다운/JSON 산출물을 UI로 렌더링합니다.

- 런타임: Hugo static site
- 렌더 핵심: `layouts/partials/extend-footer.html` + `static/js/briefing/*.js`
- 캘린더 핵심: `static/js/calendar/{parser,model,renderer}.js`
- 스타일: `assets/css/custom.css` + `assets/css/custom/*.css`

## 쌍둥이 레포 관계

```
market-pulse (private)                 dungan24.github.io (public)
├── writer/composer/publisher  ---->   ├── content/posts/*.md
└── chart-data extractor        ---->   ├── static/data/chart-data-*.json
                                       └── Hugo + JS 렌더링
```

데이터 흐름은 단방향(`market-pulse -> dungan24.github.io`)입니다.
이 레포는 사실 생성이 아니라 렌더링/표현 계층을 담당합니다.

## 계약 문서 (Cross-Repo SSOT)

- 렌더 계약: `../market-pulse/specs/render-contract.md`
- 내러티브 계약: `../market-pulse/specs/narrative-contract.md`
- 슬롯 계약: `../market-pulse/specs/mid-day-slot-contract-v1.md`

### 현재 계약 핵심 (요약)

- Front matter 계약 타깃:
  - `slot`, `generatedAt`, `asOfTime`, `regime`, `summary`, `tags`, `chartData`
- 뉴스 카드:
  - 메타 구분자 `·` 고정
  - `blockquote(>)` excerpt 필수
- 캘린더:
  - `MP_KEY_EVENTS_START/END`, `MP_KEY_EVENT_START/END` 마커
- 블록 스키마 v2:
  - `MP_BLOCK_START {"schema_version":"mp-block-v2", ...}`
- 메타 푸터:
  - `mp-briefing-meta` div 구조 유지

참고: 현재 upstream publisher가 front matter 전체 필드를 항상 채우지 않는 구간이 있을 수 있습니다.
blog는 카드/필터 렌더에서 fallback 로직으로 화면 안정성을 유지합니다.

## 마크다운 -> UI 변환 규약

`extend-footer.html`은 로더만 수행하고, 실제 변환은 JS 모듈이 담당합니다.

### 뉴스 섹션

```markdown
1. [**한국어 번역 제목**](https://...)
   Source · 2026-02-12 11:04 KST · 카테고리
   원문: English Original Headline
   > 한줄 요약/발췌
```

- `원문:` 라인은 번역 제목이 있을 때만 사용
- excerpt는 blockquote 라인으로 분리

### 존 분리

```markdown
<!-- FACT_ZONE_START --> ... <!-- FACT_ZONE_END -->
<!-- OPINION_ZONE_START --> ... <!-- OPINION_ZONE_END -->
```

### 블록 메타 (v2)

```markdown
<!-- MP_BLOCK_START {"schema_version":"mp-block-v2","block_id":"news.top","priority":60,"as_of_kst":"2026-02-18 20:14:42","max_items":8} -->
...
<!-- MP_BLOCK_END -->
```

### 캘린더 이벤트 마커

```markdown
<!-- MP_KEY_EVENTS_START -->
<!-- MP_KEY_EVENT_START -->
- ...
<!-- MP_KEY_EVENT_END -->
<!-- MP_KEY_EVENTS_END -->
```

### 메타 푸터

```html
<div class="mp-briefing-meta">
  <span>생성 시각: {{GENERATED_AT}}</span>
  <span>브리핑 슬롯: {{SLOT_ID}} ({{SLOT_LABEL}})</span>
  <span>데이터 기준 시각: {{AS_OF_TIME}}</span>
</div>
```

## 런타임 구조

- Loader (조건부):
  - `layouts/partials/extend-footer.html` — `$isBriefingPost`(slot 보유 페이지) / `$isStandaloneCalendar`(/market-calendar/) / `.IsHome` 등으로 스크립트 조건부 로딩
  - ⚠️ `footer.html`에서 반드시 `partial "extend-footer.html" .` 형태 사용 — `partialCached` 불가 (페이지 context `.IsPage`, `.Params`, `.RelPermalink` 필요)
- Data bridge:
  - `layouts/partials/extend-head-uncached.html` (`window.__MP_CONFIG`, 조건부 `window.__MP_PAGE`)
- Post transform:
  - `static/js/briefing/*.js`
  - `static/js/market-pulse-enhancements.js`
- Calendar:
  - `static/js/calendar/*.js`
  - `static/js/market-pulse-calendar.js` (adapter only)
- Charts:
  - `static/js/market-charts-loader.js`
  - `static/js/render-charts.js`

## 로컬 개발/검증

개발 서버:

```bash
hugo server --port 1314 --bind 0.0.0.0 --navigateToChanged
```

또는:

```bash
serve.cmd
```

검증 명령:

```bash
pwsh -File tools/architecture-lint.ps1 -FailOnFindings
pwsh -File tools/agent-preflight.ps1 -RunBuild -FailOnFindings
pwsh -File tools/agent-preflight.ps1 -RunUiViewportSmoke -FailOnFindings
pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314
```

## Git 워크플로우

**1인 운영 블로그 — main 직접 작업 허용 (전역 규칙 예외)**

- UI 개발, 콘텐츠 발행 모두 main에 직접 commit
- feature 브랜치 / PR 불필요
- 파이프라인 publish도 main에 직접 push
- 대규모 리팩토링이나 실험적 작업에만 선택적으로 feature 브랜치 사용

## 변경 원칙

- `content/posts/`는 파이프라인 산출물이므로 수동 편집을 지양
- 파서/렌더 규칙 변경 시 계약 문서와 동기화
- `layouts/`에 신규 인라인 `<script>/<style>` 추가 금지
  - 예외: `extend-head-uncached.html`의 데이터 브리지 인라인 스크립트
- 모바일(640/768/1024)에서 렌더 회귀 확인 필수

### XSS 방어 패턴 (2026-02-21 적용)

- 공통 유틸: `static/js/briefing/dom-utils.js`에 `ns.escapeHtml()` + `ns.sanitizeHref()` 정의
  - 브리핑 JS 전체에서 `MPBriefing.dom.escapeHtml()` / `MPBriefing.dom.sanitizeHref()` 사용
  - 독자 IIFE(`market-pulse-enhancements.js` 등)는 로컬 `escapeHtml()` 함수 별도 선언
- regime badge: `badge.setAttribute("data-regime", r.current)` 필수 — `theme-fixes.css`의 `[data-regime="RISK_ON"]` CSS와 연동
- innerHTML 사용 시 외부 데이터(href, headline, source, excerpt 등)는 반드시 이스케이프

## 교차 레포 문서 동기화

계약/운영 변경 시 같은 세션에서 함께 업데이트:

- `market-pulse`: `AGENTS.md`, `CLAUDE.md`, 계약 문서
- `dungan24.github.io`: `AGENTS.md`, `CLAUDE.md`, 필요 시 `README.md`
