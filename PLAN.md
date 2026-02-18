# Market Pulse — Code Quality & Improvement Plan

Last Updated: 2026-02-18
Repo: `dungan24.github.io`
Branch: `main` (feature 브랜치 → PR → merge 방식)
Owner: AI Agent
Plan Mode: One-task-at-a-time (한 번에 1개 카드만 `DOING`)

---

## 0) 이전 계획 완료 요약 (2026-02-16 ~ 2026-02-17)

UI/UX 개선 Phase 1 (M0~M8) 전체 완료. 주요 달성 항목:

- **M0** Baseline Hardening: preflight/lint/build 게이트 확립
- **M1** Homepage Market Overview: 레짐 색상, 바 게이지, pulse dot, skeleton
- **M2** Briefing Cards: 시간대 아이콘, NEW 배지, 수치 하이라이트, hover 효과
- **M3** Theme: 라이트/다크 일관성, 부드러운 전환, 동적 ambient orb
- **M4** Mobile UX: scroll-snap 카드, 하단 nav, sticky regime badge
- **M5** Article Page: reading progress bar, TOC scrollspy, post hero, section divider
- **M6** Micro Interactions: count-up 애니메이션, skeleton 로딩, scroll reveal
- **M7** Search/Filter UX: regime 필터, 날짜 그룹 타임라인, 검색 모달 스타일
- **M8** Tooling & CI: architecture lint, preflight, calendar smoke, CI quality gate

---

## 1) 현재 목표 (2026-02-18 기준)

**2026-02-18 코드베이스 전체 best practice 점검** 결과를 기반으로,
코드 품질·일관성·안전성을 개선한다.

우선순위:
1. 🔴 **MUST-FIX**: 규칙 위반 + 버그 리스크 (즉시 수정)
2. 🟡 **SHOULD-FIX**: Best practice 위반 (이번 사이클 내 수정)
3. 🟢 **MAY-FIX**: 코드 품질 개선 (여유 시 수정)

---

## 2) 2026-02-18 점검 결과 요약

### 🔴 MUST-FIX

| # | 파일 | 문제 |
|---|------|------|
| A | `static/js/render-charts.js` | ES5/ES6 문법 혼용 (`const`/`let`/화살표함수 vs `var`) |
| B | `assets/css/custom/calendar.css` | 동일 셀렉터 중복 선언 (L113~165 vs L217~239, 값 불일치) |
| C | `static/js/home-market-overview.js` | `DEFAULT_OVERVIEW_GROUPS` 중복 하드코딩 (mp-config.js와 DRY 위반) |
| D | `static/js/market-charts-loader.js` | `renderAllCharts` 전역 함수 암묵적 의존 (주석/명시 없음, 규칙 6.2 위반) |

### 🟡 SHOULD-FIX

| # | 파일 | 문제 |
|---|------|------|
| E | `static/js/calendar/renderer.js` | `innerHTML`에 외부 데이터 직접 삽입 (XSS 위험) |
| F | `static/js/calendar/renderer.js` | `getHours()`로 시간 포맷 (로컬 시간 의존, KST 불일치 버그) |
| G | `static/js/mp-config.js` | `mergeDeep`에서 `hasOwnProperty` 미체크 |
| H | `static/js/market-pulse-enhancements.js` | `'use strict'` 위치 불일치 (콜백 내부, 타 파일과 패턴 다름) |
| I | `assets/css/custom/calendar-polish.css` | `calendar.css` 로딩 순서 의존성 주석 미명시 (규칙 6.1 위반) |
| J | `static/js/home-market-overview.js` | `mp-ticker-groups` DOM 중복 조회 (L4 vs L144) |

### 🟢 MAY-FIX

| # | 파일 | 문제 |
|---|------|------|
| K | `static/js/calendar/parser.js` | `parseScheduleItem` compact/modern 블록 로직 중복 |
| L | `static/js/render-charts.js` | `__mpChartData` 전역 변수 네이밍 (네임스페이스 미사용) |
| M | `assets/css/custom/calendar.css` | `!important` 남용 (L626, L631) |

---

## 3) 상태관리 규칙

### 3.1 상태 코드

- `TODO`: 시작 전
- `DOING`: 진행 중 (항상 1개만 허용)
- `REVIEW`: 구현 완료, 검증 대기
- `DONE`: 검증까지 완료
- `BLOCKED`: 외부 의존/의사결정 필요
- `SKIPPED`: 범위에서 제외

### 3.2 작업 카드 필드 템플릿

```md
### T-000
Status: TODO | DOING | REVIEW | DONE | BLOCKED | SKIPPED
Priority: P0 | P1 | P2
Severity: 🔴 MUST | 🟡 SHOULD | 🟢 MAY
DependsOn: -
Files:
- path/a
Steps:
1. ...
DoD:
- ...
Verify:
- command
Notes:
- ...
```

### 3.3 상태 전이 규칙

1. 작업 시작 직전 `TODO → DOING`
2. 코드 수정 후 `DOING → REVIEW`
3. 검증 통과 시 `REVIEW → DONE`
4. 실패 시 `REVIEW → DOING` 또는 `DOING → BLOCKED`
5. `BLOCKED`는 차단 원인과 해제 조건을 반드시 `Notes`에 기록

### 3.4 실행 로그 규칙

- 각 작업 종료 시 `## 8) Execution Log`에 한 줄 추가
- 형식: `YYYY-MM-DD | T-### | STATUS | 핵심 결과 | 검증 결과`

---

## 4) 전역 제약조건

- 파이프라인 산출물 직접 수정 금지
  - `content/posts/pre-market-*.md`
  - `static/data/chart-data-*.json`
- 스타일은 `assets/css/custom/`에, 동작은 `static/js/`에 위치
- 인라인 `<script>/<style>` 신규 추가 금지 (예외: `extend-head-uncached.html` 데이터 브리지)
- 모바일 브레이크포인트 유지: `640px`, `768px`, `1024px`
- 최소 변경 원칙: 관련 없는 파일/포맷 변경 금지
- JS 파일 전체는 ES5 스타일(`var`, `function`) 통일 유지 (`render-charts.js` 예외 수정 후)

---

## 5) 마일스톤

- `M9` Code Quality — MUST-FIX (🔴 4건)
- `M10` Code Quality — SHOULD-FIX (🟡 6건)
- `M11` Code Quality — MAY-FIX (🟢 3건)
- `M12` CSS Architecture — calendar.css 구조 정리
- `M13` 다음 기능 개선 (TBD)

---

## 6) Task Board (SSOT)

---

### M9 — Code Quality: MUST-FIX

---

### T-901
Status: DONE
Priority: P0
Severity: 🔴 MUST
DependsOn: -
Files:
- `static/js/render-charts.js`
Steps:
1. 파일 전체에서 `const` → `var`, `let` → `var` 치환
2. 화살표 함수(`=>`) → `function` 키워드로 전환
   - `normalizeToPercent`, `formatter`, `getCorrColor` 등 내부 함수 포함
   - ECharts 옵션 내 `=>` 콜백도 모두 변환
3. 템플릿 리터럴(`` ` ``) → 문자열 연결(`+`)로 변환
4. 스프레드 연산자(`...`) → `Object.assign()` 또는 명시적 복사로 변환
   - `...getTooltipStyle()` 패턴 처리
5. `let __mpChartData` → `var __mpChartData` 변환 (T-L과 연계)
6. `hugo --gc --minify` 빌드 확인
DoD:
- `render-charts.js` 내 ES6+ 문법 0건
- 차트 렌더링 동작 유지 (시각 확인)
- 빌드 PASS
Verify:
- `hugo --gc --minify`
- `pwsh -File tools/agent-preflight.ps1 -RunBuild -FailOnFindings`
- 홈/포스트 페이지에서 차트 4종 렌더 확인
Notes:
- 파일 크기가 크므로(613줄) 섹션별로 나눠서 처리
- ECharts API는 ES5 호환이므로 동작 변화 없음
- `hexToRgba` 함수의 템플릿 리터럴도 변환 대상

---

### T-902
Status: DONE
Priority: P0
Severity: 🔴 MUST
DependsOn: -
Files:
- `assets/css/custom/calendar.css`
Steps:
1. L113~165 구간과 L217~239 구간의 중복 셀렉터 식별
   - `.mp-calendar__tooltip-list` (2회)
   - `.mp-calendar__tooltip-item` (2회)
   - `.mp-calendar__tooltip-item.is-high` (2회)
   - `.mp-calendar__tooltip-name` (2회)
2. 두 선언을 병합하여 최종 의도한 값으로 단일화
   - `max-height: 400px; overflow-y: auto;` → 첫 번째 선언에 유지
   - `border-left` 두께: 3px vs 2px → 의도 확인 후 단일값 결정
   - `font-size` 0.78rem vs 0.75rem → 의도 확인 후 단일값 결정
3. 중복 선언 제거 후 L217~239 구간 삭제
4. 라이트 모드 오버라이드 블록도 중복 없는지 재확인
DoD:
- 동일 셀렉터 중복 선언 0건
- 툴팁 스크롤 (`max-height`) 정상 동작
- 다크/라이트 모드 툴팁 시각 확인
Verify:
- `hugo --gc --minify`
- 캘린더 툴팁 hover 확인 (다크/라이트)
Notes:
- 두 번째 선언이 첫 번째를 덮어쓰므로 현재는 `max-height`가 무효화된 상태
- 병합 기준: 두 번째 선언의 값이 "의도적 수정"인지 확인 필요

---

### T-903
Status: DONE
Priority: P0
Severity: 🔴 MUST
DependsOn: -
Files:
- `static/js/home-market-overview.js`
Steps:
1. L36~65의 `DEFAULT_OVERVIEW_GROUPS` 하드코딩 블록 제거
2. `GROUPS` 변수를 `config.home.overview_groups`에서 직접 읽도록 변경
   ```js
   // 변경 전
   var DEFAULT_OVERVIEW_GROUPS = [ ... ]; // 중복 하드코딩
   var GROUPS = (Array.isArray(home.overview_groups) && ...) ? home.overview_groups : DEFAULT_OVERVIEW_GROUPS;

   // 변경 후
   // WHY: mp-config.js의 defaultConfig가 이미 fallback을 제공하므로 중복 불필요
   var GROUPS = home.overview_groups || [];
   ```
3. `GROUPS`가 빈 배열일 때 렌더링 skip 로직 확인 (L196 `if (!hasData) continue;`)
4. 동작 확인: 홈 Market Overview 섹션 정상 렌더
DoD:
- `DEFAULT_OVERVIEW_GROUPS` 하드코딩 제거
- `mp-config.js`가 단일 진실 공급원(SSOT)으로 동작
- 홈 Market Overview 정상 렌더
Verify:
- `hugo --gc --minify`
- 홈 Market Overview 3개 그룹 렌더 확인
Notes:
- `mp-config.js`의 `defaultConfig.home.overview_groups`가 이미 동일 데이터를 가짐
- `window.__MP_CONFIG`로 오버라이드 시에도 정상 동작해야 함

---

### T-904
Status: DONE
Priority: P0
Severity: 🔴 MUST
DependsOn: -
Files:
- `static/js/market-charts-loader.js`
- `layouts/partials/extend-head-uncached.html` (주석 확인용)
Steps:
1. `market-charts-loader.js` L69 위에 의존성 주석 추가
   ```js
   // WHY: render-charts.js가 선행 로드되어야 renderAllCharts가 전역에 존재함.
   // CONSTRAINT: extend-head-uncached.html에서 echarts CDN 로드 후,
   //             render-charts.js가 market-charts-loader.js보다 먼저 실행되어야 함.
   if (typeof renderAllCharts === 'function') {
   ```
2. `extend-head-uncached.html`에서 스크립트 로딩 순서 확인
   - `render-charts.js`가 `market-charts-loader.js`보다 먼저 로드되는지 검증
   - 현재 구조: `extend-head-uncached.html`에서 echarts CDN만 로드, 나머지는 `extend-footer.html`
   - `market-charts-loader.js`는 `extend-footer.html`에 없음 → 로드 경로 추적 필요
3. 로딩 경로가 불명확하면 `extend-footer.html`에 명시적 순서 주석 추가
DoD:
- 의존성이 코드 주석으로 명시됨
- 로딩 순서가 문서/주석으로 추적 가능
Verify:
- `pwsh -File tools/architecture-lint.ps1 -FailOnFindings`
- 포스트 페이지에서 차트 정상 렌더 확인
Notes:
- `market-charts-loader.js`의 실제 로드 경로 먼저 파악 필요
- 포스트 템플릿에서 직접 `<script src>` 태그로 로드할 가능성 있음

---

### M10 — Code Quality: SHOULD-FIX

---

### T-1001
Status: DONE
Priority: P1
Severity: 🟡 SHOULD
DependsOn: -
Files:
- `static/js/calendar/renderer.js`
Steps:
1. `updateTooltip` 함수 내 `innerHTML` 사용 부분 식별 (L78~100)
2. 외부 데이터(`ev.name`, `ev.nameKo`, `ev.country`, `c.key`)를 escape 처리
3. `escapeHtml` 헬퍼 함수 추가
   ```js
   function escapeHtml(str) {
     return String(str || '')
       .replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;');
   }
   ```
4. `innerHTML` 문자열 내 모든 외부 데이터 변수에 `escapeHtml()` 적용
5. 툴팁 렌더 동작 확인
DoD:
- 외부 데이터가 `innerHTML`에 삽입되기 전 escape 처리됨
- 툴팁 정상 렌더
Verify:
- `hugo --gc --minify`
- 캘린더 툴팁 hover 확인
Notes:
- 정적 사이트라 현재 실제 XSS 위험은 낮지만, 데이터 파이프라인 변경 시 즉시 위험해짐
- `ev.status`는 `model.getStatusBadgeClass()`를 거치므로 안전

---

### T-1002
Status: DONE
Priority: P1
Severity: 🟡 SHOULD
DependsOn: -
Files:
- `static/js/calendar/renderer.js`
Steps:
1. L282~284 시간 포맷 코드 식별
   ```js
   // 현재 (로컬 시간 의존)
   var timeStr = e.dateTime.getHours() === 0 && e.dateTime.getMinutes() === 0
     ? '--:--'
     : String(e.dateTime.getHours()).padStart(2, '0') + ':' + String(e.dateTime.getMinutes()).padStart(2, '0');
   ```
2. `parser.formatKst()`를 활용하거나 `Intl.DateTimeFormat`으로 KST 기준 시간 추출
   ```js
   // 변경 후 (KST 기준)
   // WHY: getHours()는 브라우저 로컬 시간 기준이므로 해외 접속 시 KST와 불일치
   var kstFormatted = parser.formatKst(e.dateTime); // "YYYY-MM-DD HH:mm KST"
   var timePart = kstFormatted.split(' ')[1]; // "HH:mm"
   var isAllDay = timePart === '00:00';
   var timeStr = isAllDay ? '--:--' : timePart;
   ```
3. 자정(00:00) 판정 로직도 KST 기준으로 동작하는지 확인
DoD:
- 시간 표시가 KST 기준으로 일관됨
- 해외 시간대에서도 동일한 시간 표시
Verify:
- `hugo --gc --minify`
- 캘린더 upcoming 이벤트 시간 표시 확인
Notes:
- `parser.formatKst()`는 `"YYYY-MM-DD HH:mm KST"` 형식 반환
- split(' ')[1]로 HH:mm 추출 가능

---

### T-1003
Status: DONE
Priority: P1
Severity: 🟡 SHOULD
DependsOn: -
Files:
- `static/js/mp-config.js`
Steps:
1. `mergeDeep` 함수 L180의 `for...in` 루프에 `hasOwnProperty` 가드 추가
   ```js
   // 변경 전
   for (var key in source) {
     if (source[key] && typeof source[key] === 'object' ...) { ... }
   }

   // 변경 후
   // WHY: for...in은 프로토타입 체인까지 순회하므로 오염된 환경에서 예상치 못한 동작 방지
   for (var key in source) {
     if (!Object.prototype.hasOwnProperty.call(source, key)) continue;
     if (source[key] && typeof source[key] === 'object' ...) { ... }
   }
   ```
DoD:
- `mergeDeep`에서 프로토타입 체인 속성 무시
- 기존 config merge 동작 유지
Verify:
- `hugo --gc --minify`
- 홈 Market Overview 정상 동작 확인
Notes:
- `Object.prototype.hasOwnProperty.call(source, key)` 패턴이 안전한 방식

---

### T-1004
Status: DONE
Priority: P1
Severity: 🟡 SHOULD
DependsOn: -
Files:
- `static/js/market-pulse-enhancements.js`
Steps:
1. L1~2의 패턴 변경
   ```js
   // 변경 전
   document.addEventListener('DOMContentLoaded', function() {
     'use strict';

   // 변경 후
   // WHY: 타 파일과 동일하게 IIFE + 'use strict' 패턴으로 통일
   (function() {
     'use strict';
     document.addEventListener('DOMContentLoaded', function() {
   ```
2. 파일 끝 닫는 괄호도 IIFE 패턴에 맞게 조정 (`})();`)
3. 내부 변수 스코프 영향 없는지 확인 (이미 함수 스코프 내부이므로 동일)
DoD:
- `'use strict'` 위치가 IIFE 최상단으로 이동
- 타 파일과 동일한 패턴
- 동작 변화 없음
Verify:
- `hugo --gc --minify`
- 홈/포스트 페이지 JS 기능 정상 동작 확인
Notes:
- 단순 패턴 변경이므로 동작 영향 없음

---

### T-1005
Status: DONE
Priority: P1
Severity: 🟡 SHOULD
DependsOn: T-902
Files:
- `assets/css/custom/calendar-polish.css`
Steps:
1. 파일 최상단에 로딩 순서 의존성 주석 추가
   ```css
   /*
    * WHY: 이 파일은 calendar.css의 스타일을 의도적으로 override합니다.
    * CONSTRAINT: extend-head-uncached.html에서 반드시 calendar.css 이후에 로드되어야 합니다.
    *             로딩 순서: calendar.css → calendar-polish.css
    * COMPAT: calendar.css의 .mp-filter-pills, .mp-filter-pill, .mp-filter-group 등을
    *         더 세련된 "Control Deck" 스타일로 교체합니다.
    */
   ```
2. `extend-head-uncached.html`에서 실제 로딩 순서 확인 및 주석 추가
   ```html
   {{/* calendar-polish.css는 calendar.css override 목적으로 반드시 뒤에 위치해야 함 */}}
   ```
DoD:
- 로딩 순서 의존성이 CSS 파일과 로더 파일 양쪽에 명시됨
- 규칙 6.1 준수
Verify:
- `pwsh -File tools/architecture-lint.ps1 -FailOnFindings`
Notes:
- 실제 동작 변경 없음, 문서화 작업

---

### T-1006
Status: DONE
Priority: P1
Severity: 🟡 SHOULD
DependsOn: T-903
Files:
- `static/js/home-market-overview.js`
Steps:
1. L144의 `document.getElementById('mp-ticker-groups')` 중복 조회 제거
   ```js
   // 변경 전 (L144)
   function renderTickerGroups(ts) {
     var container = document.getElementById('mp-ticker-groups'); // 중복!

   // 변경 후
   function renderTickerGroups(ts) {
     var container = root; // WHY: 파일 최상단 L4에서 이미 조회한 root 변수 재사용
   ```
2. `root`가 null인 경우 이미 L5에서 early return하므로 추가 null 체크 불필요
DoD:
- DOM 중복 조회 제거
- `renderTickerGroups` 동작 유지
Verify:
- `hugo --gc --minify`
- 홈 Market Overview 티커 렌더 확인
Notes:
- 단순 변수 참조 변경, 동작 영향 없음

---

### M11 — Code Quality: MAY-FIX

---

### T-1101
Status: DONE
Priority: P2
Severity: 🟢 MAY
DependsOn: T-901
Files:
- `static/js/calendar/parser.js`
Steps:
1. `parseScheduleItem` 함수 내 compact/modern 파싱 블록의 공통 로직 추출
2. 데이터 추출 헬퍼 함수 `extractScheduleFields(raw)` 작성
   - `statusMatch`, `impactMatch`, `watchMatch`, `dataMatch`, `nameKoMatch` 추출
   - `previous`, `consensus`, `actual` 파싱
3. compact 블록과 modern 블록에서 헬퍼 함수 호출로 대체
4. 반환 객체 구조는 동일하게 유지 (COMPAT)
DoD:
- 중복 코드 제거
- `parseScheduleItem` 동작 유지
- 캘린더 렌더 정상 동작
Verify:
- `hugo --gc --minify`
- `pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314`
Notes:
- 리팩토링이므로 동작 변화 없어야 함
- 테스트 후 smoke 확인 필수

---

### T-1102
Status: DONE
Priority: P2
Severity: 🟢 MAY
DependsOn: T-901
Files:
- `static/js/render-charts.js`
Steps:
1. T-901 완료 후 `var __mpChartData = null;` 네이밍 개선
2. 전역 네임스페이스 오염 최소화를 위해 IIFE 스코프 변수로 유지하되,
   외부 접근이 필요하면 `window.MPCharts = window.MPCharts || {}; window.MPCharts._data = null;` 패턴 적용
3. `renderAllCharts` 함수도 동일하게 네임스페이스 정리 고려
DoD:
- 전역 변수 네이밍이 규칙 3.3 준수
- 차트 렌더 동작 유지
Verify:
- `hugo --gc --minify`
- 포스트 페이지 차트 4종 렌더 확인
Notes:
- `market-charts-loader.js`에서 `renderAllCharts`를 참조하므로 네임스페이스 변경 시 연동 수정 필요

---

### T-1103
Status: DONE
Priority: P2
Severity: 🟢 MAY
DependsOn: T-902
Files:
- `assets/css/custom/calendar.css`
Steps:
1. L626, L631의 `!important` 제거
2. 셀렉터 specificity를 높여 동일 효과 달성
   ```css
   /* 변경 전 */
   :root:not(.dark) .mp-filter-group__label {
     color: #334155 !important;
   }

   /* 변경 후 */
   :root:not(.dark) .mp-upcoming__filters .mp-filter-group__label {
     color: #334155;
   }
   ```
3. 라이트 모드에서 시각 확인
DoD:
- `!important` 0건 (calendar.css 내)
- 라이트 모드 스타일 동일하게 유지
Verify:
- `hugo --gc --minify`
- 라이트 모드 캘린더 필터 레이블 색상 확인
Notes:
- specificity 충돌이 있어서 `!important`가 필요했던 것이므로, 원인 셀렉터 파악 후 수정

---

### M12 — CSS Architecture: calendar.css 구조 정리

---

### T-1201
Status: TODO
Priority: P2
Severity: 🟡 SHOULD
DependsOn: T-902, T-1005, T-1103
Files:
- `assets/css/custom/calendar.css`
- `assets/css/custom/calendar-polish.css`
Steps:
1. T-902 완료 후 두 파일의 셀렉터 중복 현황 재점검
2. `calendar.css`에서 `calendar-polish.css`가 완전히 override하는 규칙 식별
3. 완전히 override되는 규칙은 `calendar.css`에서 제거 (dead code 정리)
4. 두 파일의 역할 명확히 분리:
   - `calendar.css`: 구조/레이아웃/기본 토큰
   - `calendar-polish.css`: 시각적 polish/override
5. 각 파일 상단에 역할 주석 추가
DoD:
- 두 파일 간 불필요한 중복 제거
- 역할 분리가 주석으로 명시됨
- 캘린더 시각 동일하게 유지
Verify:
- `hugo --gc --minify`
- 다크/라이트 모드 캘린더 전체 확인
Notes:
- T-902, T-1005, T-1103 완료 후 진행
- 대규모 CSS 정리이므로 신중하게 진행

---

## 7) 실행 순서 (권장)

### Phase 1: MUST-FIX (M9) — 즉시 처리
```
T-902 (calendar.css 중복 선언) → 독립적, 먼저 처리
T-903 (DEFAULT_OVERVIEW_GROUPS 중복) → 독립적
T-904 (암묵적 의존성 주석) → 독립적
T-901 (render-charts.js ES5 통일) → 가장 큰 파일, 마지막
```

### Phase 2: SHOULD-FIX (M10) — 이번 사이클
```
T-1003 (hasOwnProperty) → 독립적, 빠름
T-1004 ('use strict' 위치) → 독립적, 빠름
T-1006 (DOM 중복 조회) → T-903 이후
T-1005 (로딩 순서 주석) → T-902 이후
T-1002 (KST 시간 포맷) → 독립적
T-1001 (innerHTML escape) → 독립적
```

### Phase 3: MAY-FIX + CSS 정리 (M11, M12) — 여유 시
```
T-1101 (parser.js 중복 제거)
T-1102 (전역 변수 네이밍)
T-1103 (!important 제거)
T-1201 (calendar CSS 구조 정리) → 위 3개 완료 후
```

---

## 8) 검증 게이트

각 마일스톤 종료 시 실행:

```bash
hugo --gc --minify
pwsh -File tools/agent-preflight.ps1 -RunBuild -FailOnFindings
pwsh -File tools/architecture-lint.ps1 -FailOnFindings
pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314
```

수동 확인:
- `/` (홈: Market Overview, 브리핑 카드)
- `/posts/pre-market-YYYY-MM-DD/` (캘린더, 차트, TOC)
- 다크/라이트 모드 각각
- 모바일(390px) + 데스크톱(1280px)

---

## 9) Execution Log

### 이전 Phase (2026-02-16 ~ 2026-02-17)
- 2026-02-16 | T-000 | DONE | preflight/build 베이스라인 확보 | PASS
- 2026-02-16 | T-001 | DONE | toc-and-effects.css comment fixed | PASS
- 2026-02-16 | T-002 | DONE | Adopted reading-progress, skeleton, post-hero; updated loader | PASS
- 2026-02-16 | T-003 | DONE | Removed inline styles from briefing cards | PASS
- 2026-02-16 | T-101 | DONE | Migrated REGIME_COLORS to MP_CONFIG | PASS
- 2026-02-16 | T-102 | DONE | Added mini bar gauge to ticker rows | PASS
- 2026-02-16 | T-103 | DONE | Added pulse dot to Market Overview header | PASS
- 2026-02-16 | T-104 | DONE | Implemented skeleton loading for tickers | PASS
- 2026-02-16 | T-201 | DONE | Added icons and improved tag contrast for briefing cards | PASS
- 2026-02-16 | T-202 | DONE | Added 'NEW' badge for today's briefings | PASS
- 2026-02-16 | T-203 | DONE | Added summary highlights for key metrics | PASS
- 2026-02-16 | T-204 | DONE | Added regime-based hover effects | PASS
- 2026-02-16 | T-301 | DONE | Standardized light mode variables and cleaned up CSS | PASS
- 2026-02-16 | T-302 | DONE | Implemented smooth theme transition | PASS
- 2026-02-16 | T-303 | DONE | Implemented dynamic ambient orbs | PASS
- 2026-02-16 | T-401 | DONE | Implemented horizontal scroll snap for mobile cards | PASS
- 2026-02-16 | T-402 | DONE | Added mobile bottom navigation bar | PASS
- 2026-02-16 | T-403 | DONE | Added sticky regime badge on scroll | PASS
- 2026-02-16 | T-501 | DONE | Implemented reading progress bar via JS injection | PASS
- 2026-02-16 | T-502 | DONE | Enhanced TOC scrollspy for H2/H3 and active states | PASS
- 2026-02-16 | T-503 | DONE | Added Quick View metrics (SPX/VIX) to post hero | PASS
- 2026-02-16 | T-504 | DONE | Added Cyberpunk dividers between sections | PASS
- 2026-02-16 | T-601 | DONE | Added count-up animation to ticker numbers | PASS
- 2026-02-16 | T-602 | DONE | Verified skeleton loading (applied in T-104) | PASS
- 2026-02-16 | T-603 | DONE | Added scroll reveal effects to briefing sections | PASS
- 2026-02-16 | T-701 | DONE | Implemented client-side regime filtering | PASS
- 2026-02-16 | T-702 | DONE | Grouped recent briefings by date in timeline view | PASS
- 2026-02-16 | T-703 | DONE | Styled search modal with cyberpunk aesthetic | PASS
- 2026-02-16 | T-801 | DONE | Updated architecture lint | PASS
- 2026-02-16 | T-802 | DONE | Added UI Viewport Smoke Test support to preflight | PASS
- 2026-02-16 | T-803 | DONE | Improved calendar smoke test robustness | PASS
- 2026-02-16 | T-804 | DONE | Updated CI workflow to include smoke tests | PASS
- 2026-02-16 | T-805 | DONE | Updated README/AGENTS/PROJECT_MAP docs | PASS
- 2026-02-16 | T-806 | DONE | Added unlinked asset check to audit tool | PASS
- 2026-02-17 | DOC-901 | DONE | Rule-compliance re-audit + docs sync | PASS
- 2026-02-18 | AUDIT-001 | DONE | 전체 코드베이스 best practice 점검 완료 | 13건 발견

### 현재 Phase (2026-02-18~)
- 2026-02-18 | T-902 | DONE | calendar.css 중복 셀렉터 제거 및 선언 병합 | PASS
- 2026-02-18 | T-903 | DONE | home-market-overview.js 중복 하드코딩 제거 | PASS
- 2026-02-18 | T-904 | DONE | market-charts-loader.js 의존성 주석 추가 | PASS
- 2026-02-18 | T-901 | DONE | render-charts.js ES5 문법으로 전면 재작성 | PASS
- 2026-02-18 | T-1005 | DONE | calendar-polish.css 로딩 순서 의존성 주석 추가 | PASS
- 2026-02-18 | T-1006 | DONE | home-market-overview.js DOM 중복 조회 확인 및 제거 | PASS
- 2026-02-18 | T-1101 | DONE | parser.js parseScheduleItem 중복 로직 리팩토링 | PASS
- 2026-02-18 | T-1102 | DONE | render-charts.js 네임스페이스(MPCharts) 적용 | PASS
- 2026-02-18 | T-1103 | DONE | calendar.css !important 제거 및 specificity 상향 | PASS
<!-- 작업 완료 시 여기에 추가 -->

---

## 10) Change Log

- 2026-02-16: 기존 개략 계획을 코드베이스 실측 기반의 상세 Task Board + 상태관리형 계획으로 전면 교체
- 2026-02-17: 규칙 준수 재점검 결과를 반영해 문서 정합성 최신화
- 2026-02-18: 전체 코드베이스 best practice 점검 결과를 기반으로 M9~M12 신규 계획 수립 (기존 완료 내용 요약 보존)
