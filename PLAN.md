# Market Pulse UI/UX Implementation Plan (LLM-Lite Friendly)

Last Updated: 2026-02-17
Repo: `market-pulse-blog`
Branch: `ui/enhanced`
Owner: AI Agent
Plan Mode: One-task-at-a-time (한 번에 1개 카드만 `DOING`)

## 0) 2026-02-17 규칙 준수 재점검 (Addendum)

- [x] 규칙 점검 명령 PASS
  - `pwsh -File tools/agent-preflight.ps1 -RunBuild -FailOnFindings`
  - `pwsh -File tools/architecture-lint.ps1 -FailOnFindings`
  - `pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314`
  - `npm run test:ui-smoke`
- [x] 문서-코드 정합성 갱신
  - 폰트 표기를 `Noto Sans KR` 단일 스택 기준으로 통일
  - 템플릿 인라인 정책 예외(`layouts/partials/extend-head-uncached.html` 데이터 브리지)를 명시

## 1) 목표

홈/브리핑/아티클 UI를 "실시간 마켓 대시보드" 수준으로 개선하되,
저비용 모델도 작업 순서와 상태를 잃지 않고 구현할 수 있게
작업 단위를 작게 쪼개고, 상태 전이를 엄격하게 관리합니다.

## 2) 현재 코드베이스 점검 결과 (2026-02-16 기준)

- [x] 기본 품질 게이트 통과
  - `pwsh -File tools/agent-preflight.ps1` PASS
  - `hugo --gc --minify` PASS
- [x] 홈/브리핑/아티클의 주요 커스텀 진입점 존재
  - `layouts/partials/home/custom.html`
  - `layouts/partials/home/recent-briefings.html`
  - `static/js/home-market-overview.js`
  - `static/js/market-pulse-enhancements.js`
  - `static/js/briefing/*.js`
  - `assets/css/custom/*.css`
- [~] 일부 기능 초안 파일은 존재하지만 로더 미연결
  - `static/js/theme-transition.js`
  - `static/js/reading-progress.js`
  - `assets/css/custom/reading-progress.css`
  - `assets/css/custom/post-hero.css`
  - `assets/css/custom/skeleton.css`
- [!] CSS 리스크 확인
  - `assets/css/custom/toc-and-effects.css`에서 `/* ===== Modern Redesign...` 코멘트 시작 후 닫힘(`*/`) 누락 의심
  - 해당 지점 이후 스타일이 무효화될 가능성 있음
- [!] 아키텍처 제약 확인
  - `layouts/partials/extend-footer.html` 스크립트 로더 순서는 `tools/architecture-lint.ps1`에서 고정 검사됨
  - 새 JS 추가 시 로더/린트 규칙을 함께 갱신하거나, 기존 로드 파일에 통합해야 함
  - CSS는 `layouts/partials/extend-head-uncached.html`의 명시 목록에 없으면 로드되지 않음

## 3) 상태관리 규칙 (필수)

### 3.1 상태 코드

- `TODO`: 시작 전
- `DOING`: 진행 중 (항상 1개만 허용)
- `REVIEW`: 구현 완료, 검증 대기
- `DONE`: 검증까지 완료
- `BLOCKED`: 외부 의존/의사결정 필요
- `SKIPPED`: 범위에서 제외

### 3.2 작업 카드 필드 템플릿

모든 작업은 아래 필드를 반드시 유지합니다.

```md
### T-000
Status: TODO | DOING | REVIEW | DONE | BLOCKED | SKIPPED
Priority: P0 | P1 | P2
Owner: AI Agent
DependsOn: -
Files:
- path/a
- path/b
Steps:
1. ...
2. ...
DoD:
- ...
Verify:
- command 1
- command 2
Notes:
- ...
```

### 3.3 상태 전이 규칙

1. 작업 시작 직전에 `TODO -> DOING`
2. 코드 수정 후 `DOING -> REVIEW`
3. 검증 통과 시 `REVIEW -> DONE`
4. 실패 시 `REVIEW -> DOING` 또는 `DOING -> BLOCKED`
5. `BLOCKED`는 차단 원인과 해제 조건을 반드시 `Notes`에 기록

### 3.4 실행 로그 규칙

- 각 작업 종료 시 `## 9) Execution Log`에 한 줄 추가
- 형식:
  - `YYYY-MM-DD | T-### | STATUS | 핵심 결과 | 검증 결과`

## 4) 전역 제약조건

- 파이프라인 산출물 직접 수정 금지
  - `content/posts/pre-market-*.md`
  - `static/data/chart-data-*.json`
- 스타일은 `assets/css/custom/`에, 동작은 `static/js/`에 위치
- 인라인 `<script>/<style>` 신규 추가 금지 (예외: `layouts/partials/extend-head-uncached.html` 데이터 브리지)
- 모바일 브레이크포인트 유지: `640px`, `768px`, `1024px`
- 가능한 한 기존 모듈에 통합하고, 새 파일 추가는 최소화

## 5) 마일스톤

- `M0` Baseline Hardening
- `M1` Homepage: Market Overview
- `M2` Briefing Cards
- `M3` Theme (Dark/Light)
- `M4` Mobile UX
- `M5` Article Page
- `M6` Micro Interactions
- `M7` Search/Filter UX
- `M8` Tooling & CI Alignment

## 6) Task Board (SSOT)

### M0 - Baseline Hardening

### T-000
Status: DONE
Priority: P0
Owner: AI Agent
DependsOn: -
Files:
- `tools/agent-preflight.ps1`
- `tools/architecture-lint.ps1`
Steps:
1. 베이스라인 검증 명령 실행
2. 결과를 계획 문서에 반영
DoD:
- 현재 기준 PASS/FAIL 상태가 문서에 기록됨
Verify:
- `pwsh -File tools/agent-preflight.ps1`
- `hugo --gc --minify`
Notes:
- 2026-02-16 실행 완료, PASS

### T-001
Status: DONE
Priority: P0
Owner: AI Agent
DependsOn: T-000
Files:
- `assets/css/custom/toc-and-effects.css`
Steps:
1. 미종결 코멘트(`/* ...`)를 정상 코멘트로 정리
2. 해당 구간 애니메이션/접근성 CSS가 실제 적용되는지 확인
DoD:
- CSS 파싱 에러 없이 의도한 스타일 규칙이 활성화됨
Verify:
- `hugo --gc --minify`
- `pwsh -File tools/agent-preflight.ps1 -FailOnFindings`
Notes:
- 라인 기준: 약 `448` 부근부터 점검

### T-002
Status: DONE
Priority: P0
Owner: AI Agent
DependsOn: T-000
Files:
- `static/js/theme-transition.js`
- `static/js/reading-progress.js`
- `assets/css/custom/reading-progress.css`
- `assets/css/custom/post-hero.css`
- `assets/css/custom/skeleton.css`
- `layouts/partials/extend-head-uncached.html`
- `layouts/partials/extend-footer.html`
- `tools/architecture-lint.ps1`
Steps:
1. 미연결 WIP 파일을 "채택" 또는 "폐기"로 결정
2. 채택 시 로더/린트 규칙까지 함께 정합성 맞춤
3. 폐기 시 중복 기능을 기존 파일로 흡수
DoD:
- 미연결 파일 상태가 명확히 정리됨
- 린트/빌드가 계획된 구조와 일치
Verify:
- `pwsh -File tools/architecture-lint.ps1 -FailOnFindings`
- `hugo --gc --minify`
Notes:
- 로더 순서 변경 시 아키텍처 린트 동시 수정 필요

### T-003
Status: DONE
Priority: P0
Owner: AI Agent
DependsOn: T-002
Files:
- `layouts/partials/home/recent-briefings.html`
- `assets/css/custom/home-briefing-cards.css`
Steps:
1. 카드 footer의 인라인 색상(`style="color:..."`) 제거
2. `data-regime` 또는 클래스 기반 스타일로 전환
DoD:
- 템플릿 인라인 스타일 0건
- 레짐 색상 표현 유지
Verify:
- `pwsh -File tools/agent-preflight.ps1 -FailOnFindings`
- 홈 화면 수동 확인
Notes:
- AGENTS 가이드의 "inline style 최소화"와 일치

### M1 - Homepage: Market Overview

### T-101
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-002
Files:
- `static/js/home-market-overview.js`
- `static/js/mp-config.js`
Steps:
1. `REGIME_COLORS` 하드코딩을 `MP_CONFIG` 기반으로 전환
2. hex/rgb fallback만 코드에 유지
DoD:
- 레짐 색상 변경이 설정 중심으로 동작
Verify:
- `hugo --gc --minify`
- 홈에서 레짐별 색상 반영 확인
Notes:
- 기존 `MP_CONFIG.colors.regime` 재사용

### T-102
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-101
Files:
- `static/js/home-market-overview.js`
- `assets/css/custom/home-market-overview.css`
Steps:
1. 각 ticker row에 미니 gauge/bar 마크업 추가
2. 등락률 기반 width 계산 및 clamping 적용
3. 모바일 축소 스타일 포함
DoD:
- 모든 그룹 카드에 시각 지표 표시
- 텍스트만 있을 때보다 스캔 속도 개선
Verify:
- 홈 데스크톱/모바일 수동 확인
- `hugo --gc --minify`
Notes:
- gauge는 단순 바 형태로 시작 (복잡 SVG 금지)

### T-103
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-101
Files:
- `layouts/partials/home/custom.html`
- `assets/css/custom/home-market-overview.css`
- `static/js/home-market-overview.js`
Steps:
1. `Market Overview` 헤더 옆 pulse dot 마크업 추가
2. 데이터 fetch 성공/실패/오래됨 상태를 색상으로 구분
DoD:
- pulse dot이 데이터 신선도를 명확히 표시
Verify:
- 홈 화면 수동 확인
- 네트워크 실패 시 fallback 색상 확인
Notes:
- 상태값: `fresh`, `stale`, `error`

### T-104
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-102
Files:
- `assets/css/custom/home-market-overview.css`
- `assets/css/custom/skeleton.css`
- `static/js/home-market-overview.js`
Steps:
1. `Loading...` 텍스트를 skeleton 블록으로 대체
2. 데이터 도착 시 skeleton 제거
DoD:
- 로딩 체감 개선, 레이아웃 점프 최소화
Verify:
- 캐시 비활성화 후 홈 로드 테스트
Notes:
- `prefers-reduced-motion`에서 shimmer 완화

### M2 - Briefing Cards

### T-201
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-003
Files:
- `layouts/partials/home/recent-briefings.html`
- `assets/css/custom/home-briefing-cards.css`
Steps:
1. 시간대별 아이콘(Pre/Mid/Post) 표시 추가
2. 타입 태그 대비를 다크/라이트 모두에서 보장
DoD:
- 카드 타입 식별이 텍스트 없이 가능
Verify:
- 홈 카드 6개 수동 확인
Notes:
- 아이콘 매핑: `pre=🌅`, `mid=☀️`, `post=🌙`

### T-202
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-201
Files:
- `layouts/partials/home/recent-briefings.html`
- `assets/css/custom/home-briefing-cards.css`
Steps:
1. 오늘 발행 카드에 `NEW` 배지 추가
2. 기준 시간대는 `Asia/Seoul`로 고정
DoD:
- 오늘 카드가 즉시 식별 가능
Verify:
- 오늘/어제 포스트 각각 배지 표시 검증
Notes:
- Hugo 템플릿 날짜 비교 로직 단순 유지

### T-203
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-201
Files:
- `layouts/partials/home/recent-briefings.html`
- `assets/css/custom/home-briefing-cards.css`
Steps:
1. summary에서 `%`, `bp`, `+/-숫자` 패턴 강조
2. 강조 과도 적용 방지를 위해 최대 2개만 하이라이트
DoD:
- 핵심 수치가 summary 내에서 눈에 띔
Verify:
- 한글/영문 summary 샘플 확인
Notes:
- 템플릿 처리 어려우면 JS 후처리 방식 사용

### T-204
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-003
Files:
- `assets/css/custom/home-briefing-cards.css`
Steps:
1. hover 시 regime 기반 그라데이션 오버레이 추가
2. 라이트 모드에서 대비(텍스트 가독성) 유지
DoD:
- hover 효과가 regime 문맥과 일치
Verify:
- 마우스 hover 스크린 확인
Notes:
- `data-regime` 속성 기반 selector 사용

### M3 - Theme (Dark/Light)

### T-301
Status: DOING
Priority: P1
Owner: AI Agent
DependsOn: T-001
Files:
- `assets/css/custom/theme-fixes.css`
- `assets/css/custom/layout-overrides.css`
- `assets/css/custom/home-market-overview.css`
Steps:
1. 라이트 모드 중복 규칙 통합
2. glassmorphism 강도(배경/보더/그림자) 최소 세트 정의
DoD:
- 라이트/다크 모두에서 같은 컴포넌트가 일관된 위계를 가짐
Verify:
- 테마 토글 전후 시각 비교
Notes:
- `!important` 남용 규칙 정리 포함

### T-302
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-002
Files:
- `static/js/theme-transition.js` (채택 시)
- `assets/css/custom/theme-fixes.css`
- `themes/blowfish/layouts/partials/header/components/desktop-menu.html`
- `themes/blowfish/layouts/partials/header/components/mobile-menu.html`
Steps:
1. 테마 전환 transition 클래스를 데스크톱/모바일 스위처에 모두 적용
2. 전환 flash 완화용 CSS transition 범위 지정
DoD:
- 전환 시 즉시 깜빡임 감소
Verify:
- 데스크톱/모바일 스위처 각각 3회 토글
Notes:
- 테마 코어 로직은 Blowfish 기존 동작 유지

### T-303
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-101
Files:
- `assets/css/custom/home-market-overview.css`
- `static/js/home-market-overview.js`
Steps:
1. 라이트 모드 ambient orb 팔레트 재설정
2. regime에 따라 orb 색상/투명도 동적 연동
DoD:
- 라이트 모드에서도 orb가 흐리거나 탁하지 않음
Verify:
- 레짐 4종 시각 비교
Notes:
- 과도한 blur/채도 방지

### M4 - Mobile UX

### T-401
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-201
Files:
- `assets/css/custom/home-briefing-cards.css`
- `layouts/partials/home/recent-briefings.html`
Steps:
1. 모바일에서 카드 영역을 horizontal scroll-snap으로 전환
2. 카드 폭/간격/스냅 포인트 최적화
DoD:
- 손가락 스와이프로 카드 탐색 가능
Verify:
- 390px, 430px 뷰포트 수동 확인
Notes:
- JS 캐러셀 대신 CSS scroll-snap 우선

### T-402
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-401
Files:
- `layouts/partials/footer.html` 또는 `layouts/partials/home/custom.html`
- `assets/css/custom/layout-overrides.css`
Steps:
1. 모바일 전용 bottom nav 추가
2. 브리핑/태그/상단 이동 앵커 연결
DoD:
- 모바일 핵심 이동 동선 단축
Verify:
- 홈/포스트 페이지에서 동작 확인
Notes:
- 데스크톱에서는 숨김

### T-403
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-103
Files:
- `layouts/partials/home/custom.html`
- `assets/css/custom/home-market-overview.css`
- `static/js/home-market-overview.js`
Steps:
1. 스크롤 시 상단 고정되는 regime badge 추가
2. sticky 상태 전환 클래스를 JS로 제어
DoD:
- 스크롤 중 현재 시장 상태를 지속 노출
Verify:
- 모바일 스크롤 3회 이상 반복 확인
Notes:
- 기존 `#mp-regime-badge` 재사용 가능

### M5 - Article Page

### T-501
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-002
Files:
- `themes/blowfish/layouts/_default/single.html`
- `static/js/reading-progress.js` (채택 시)
- `assets/css/custom/reading-progress.css` (채택 시)
- `layouts/partials/extend-head-uncached.html`
Steps:
1. 아티클 상단 progress bar DOM 추가
2. 스크롤 기반 width 업데이트 연결
3. 홈에서는 비활성 처리
DoD:
- 읽기 진행률이 상단에 실시간 반영
Verify:
- 긴 포스트에서 0% -> 100% 확인
Notes:
- 기존 untracked 초안 재사용 우선. JS에서 동적 주입으로 처리하여 테마 파일 오버라이드 최소화.

### T-502
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-001
Files:
- `static/js/briefing/toc-scrollspy.js`
- `assets/css/custom/toc-and-effects.css`
Steps:
1. scrollspy 대상에 `h3` 포함 옵션 추가
2. active 상태 시각 강조를 한 단계 강화
DoD:
- 현재 섹션 인지가 빠름
Verify:
- TOC가 깊은 문서에서 active 추적 확인
Notes:
- `IntersectionObserver` rootMargin 미세 조정 포함

### T-503
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-501
Files:
- `static/js/briefing/regime-hero.js`
- `assets/css/custom/briefing-sections.css`
- `assets/css/custom/post-hero.css` (채택 시)
Steps:
1. post hero에 quick-view 메트릭 슬롯 추가
2. 레짐 색상과 일관된 그라데이션 적용
DoD:
- 아티클 상단에서 핵심 상태를 즉시 파악 가능
Verify:
- pre/mid/post 샘플 포스트 1개씩 확인
Notes:
- 데이터 없으면 슬롯 자동 숨김

### T-504
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-001
Files:
- `assets/css/custom/briefing-sections.css`
- `assets/css/custom/post-content.css`
Steps:
1. 섹션 사이 cyberpunk divider 추가
2. 과도한 장식으로 본문 가독성 저하되지 않게 조정
DoD:
- 섹션 경계 인식이 개선됨
Verify:
- 다크/라이트 비교
Notes:
- `prefers-reduced-motion` 고려

### M6 - Micro Interactions

### T-601
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-102
Files:
- `static/js/home-market-overview.js`
- `assets/css/custom/home-market-overview.css`
Steps:
1. 핵심 숫자 count-up 애니메이션 추가
2. 값 변동이 없으면 애니메이션 생략
DoD:
- 숫자 로딩 체감 개선
Verify:
- 홈 최초 로딩 시 동작 확인
Notes:
- 성능 위해 표시 중인 소수 요소만 적용

### T-602
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-104
Files:
- `assets/css/custom/skeleton.css`
- `static/js/home-market-overview.js`
- `static/js/market-pulse-enhancements.js`
Steps:
1. 뉴스/카드/티커의 로딩 텍스트를 skeleton으로 치환
2. 로딩 실패 시 사용자 친화 문구로 fallback
DoD:
- "Loading..." 직접 노출 최소화
Verify:
- 네트워크 지연 시 화면 확인
Notes:
- skeleton class 표준화

### T-603
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-001
Files:
- `static/js/market-pulse-enhancements.js`
- `assets/css/custom/toc-and-effects.css`
Steps:
1. scroll reveal 대상을 briefing 섹션 전체로 확대
2. 뷰포트 진입 시 fade-in 트리거 통일
DoD:
- 섹션 등장 전환이 자연스럽고 일관됨
Verify:
- 긴 포스트 스크롤 테스트
Notes:
- reduced-motion 환경에서는 비활성

### M7 - Search/Filter UX

### T-701
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-201
Files:
- `layouts/partials/home/recent-briefings.html`
- `static/js/market-pulse-enhancements.js`
- `assets/css/custom/home-briefing-cards.css`
Steps:
1. regime 필터 칩 UI 추가
2. 카드 `data-regime` 기반 클라이언트 필터링 구현
DoD:
- 선택한 regime 카드만 표시 가능
Verify:
- 4개 regime 필터 수동 확인
Notes:
- 초기값 `ALL`

### T-702
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-701
Files:
- `layouts/partials/home/recent-briefings.html`
- `assets/css/custom/home-briefing-cards.css`
Steps:
1. 최근 브리핑을 날짜 그룹 타임라인 형태로 렌더
2. 기존 카드 재사용으로 구현 복잡도 최소화
DoD:
- 날짜 흐름 기반 탐색이 가능
Verify:
- 날짜 그룹 헤더/카드 정렬 확인
Notes:
- 데이터 소스는 기존 `.Site.RegularPages` 유지

### T-703
Status: DONE
Priority: P2
Owner: AI Agent
DependsOn: T-301
Files:
- `themes/blowfish/layouts/partials/search.html`
- `assets/css/custom/layout-overrides.css`
- `assets/css/custom/theme-fixes.css`
Steps:
1. Blowfish 기본 검색 모달을 프로젝트 톤에 맞게 스타일링
2. 접근성(대비/포커스 링) 유지
DoD:
- 검색 UI가 사이트 스타일과 일관됨
Verify:
- 검색 모달 열기/닫기/키보드 포커스 확인
Notes:
- 구조 변경보다 스타일 우선. CSS 오버라이드로 처리.

### M8 - Tooling & CI Alignment

### T-801
Status: DONE
Priority: P0
Owner: AI Agent
DependsOn: T-002
Files:
- `tools/architecture-lint.ps1`
- `layouts/partials/extend-footer.html`
Steps:
1. JS 로더 순서 검증 로직을 "하드코딩 배열"에서 유지보수 가능한 형태로 개선
2. 새 런타임 파일 추가 시 lint 수정 포인트를 단일화
DoD:
- 로더 변경 시 lint 정책과 실제 로더가 쉽게 동기화됨
Verify:
- `pwsh -File tools/architecture-lint.ps1 -FailOnFindings`
Notes:
- 현재는 로더 순서가 스크립트 내부 상수에 강결합됨

### T-802
Status: DONE
Priority: P0
Owner: AI Agent
DependsOn: T-000
Files:
- `tools/agent-preflight.ps1`
- `tools/ui-viewport.smoke.spec.js`
- `package.json`
Steps:
1. preflight에 UI viewport smoke 실행 옵션 추가 (`-RunUiViewportSmoke`)
2. npm script로 UI smoke 명령을 표준화
DoD:
- preflight 단일 명령으로 구조/빌드/브라우저 스모크 실행 가능
Verify:
- `pwsh -File tools/agent-preflight.ps1 -RunUiViewportSmoke`
- `npm run test:ui-smoke`
Notes:
- 서버 필요 조건(`http://localhost:1314`)을 명확한 에러로 안내

### T-803
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-802
Files:
- `tools/calendar-smoke.ps1`
- `tools/calendar-filters.smoke.spec.js`
Steps:
1. 실패 메시지에 대상 URL/페이지 경로/선택자 상태를 포함해 디버깅성 강화
2. 최신 pre-market 탐색 실패 시 대체 페이지 경로 처리 로직 보강
DoD:
- 캘린더 스모크 실패 원인이 로그에서 즉시 식별됨
Verify:
- `pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314`
Notes:
- flaky 원인 추적 시간 단축 목적

### T-804
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-802
Files:
- `.github/workflows/quality-gate.yml`
- `tools/agent-preflight.ps1`
Steps:
1. CI quality gate에 선택적 UI smoke 스텝 추가(조건부/야간/라벨 기반)
2. CI 시간 증가를 최소화하는 실행 조건 설계
DoD:
- CI에서 핵심 브라우저 회귀를 자동 감지 가능
Verify:
- PR에서 quality workflow green 확인
Notes:
- 전체 PR 강제 실행 대신 조건부 실행 권장. `agent-preflight.ps1`에 통합됨.

### T-805
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-802
Files:
- `README.md`
- `AGENTS.md`
- `PROJECT_MAP.md`
Steps:
1. tools 명령(로컬/CI)과 실제 스크립트 옵션 문서를 동기화
2. 새 smoke 명령과 사용 조건을 문서에 반영
DoD:
- 문서의 실행 명령이 실제와 1:1로 일치
Verify:
- 문서 명령을 복붙 실행하여 동작 확인
Notes:
- 신규 에이전트 온보딩 정확도 개선 목적

### T-806
Status: DONE
Priority: P1
Owner: AI Agent
DependsOn: T-801
Files:
- `tools/agent-audit.ps1`
Steps:
1. 감사 리포트에 "미연결 자산(생성됐지만 로드되지 않는 CSS/JS)" 점검 항목 추가
2. 결과를 WARN으로 표시하고 FailOnFindings 대응
DoD:
- 죽은 파일/미연결 파일이 preflight에서 조기에 탐지됨
Verify:
- `pwsh -File tools/agent-audit.ps1 -FailOnFindings`
Notes:
- 현재 문제였던 untracked/WIP 파일 정리를 자동화하는 목적

## 7) 실행 순서 (권장)

1. `M0 + M8` 완료 후 기능 확장 시작 (기준선 + 도구 정합성 선확보)
2. 가시 효과가 큰 `M1 -> M2 -> M3` 순서 진행
3. UX 확장은 `M4 -> M5 -> M6 -> M7` 순서로 마무리

## 8) 검증 게이트

각 마일스톤 종료 시 아래를 실행합니다.

- `hugo --gc --minify`
- `pwsh -File tools/agent-preflight.ps1 -RunBuild -FailOnFindings`
- `pwsh -File tools/architecture-lint.ps1 -FailOnFindings`
- `pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314` (서버 실행 후)
- 수동 확인:
  - `/`
  - `/posts/`
  - `/posts/pre-market-YYYY-MM-DD/`
  - 모바일(390px) + 태블릿(768px) + 데스크톱(1280px)

## 9) Execution Log

- 2026-02-16 | T-000 | DONE | preflight/build 베이스라인 확보 | PASS
- 2026-02-16 | T-001 | DONE | assets/css/custom/toc-and-effects.css comment fixed | PASS
- 2026-02-16 | T-002 | DONE | Adopted reading-progress, skeleton, post-hero; updated loader | PASS
- 2026-02-16 | T-003 | DONE | Removed inline styles from briefing cards | PASS
- 2026-02-16 | T-101 | DONE | Migrated REGIME_COLORS to MP_CONFIG and updated MP_CONFIG | PASS
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
- 2026-02-16 | T-801 | DONE | Updated architecture lint to be more flexible with JS loaders | PASS
- 2026-02-16 | T-802 | DONE | Added UI Viewport Smoke Test support to preflight | PASS
- 2026-02-16 | T-803 | DONE | Improved calendar smoke test robustness and fallback | PASS
- 2026-02-16 | T-804 | DONE | Updated CI workflow to include smoke tests | PASS
- 2026-02-16 | T-805 | DONE | Updated README/AGENTS/PROJECT_MAP docs | PASS
- 2026-02-16 | T-806 | DONE | Added unlinked asset check to audit tool | PASS
- 2026-02-17 | DOC-901 | DONE | Rule-compliance re-audit + docs sync (fonts/inline policy) | PASS

## 10) Change Log

- 2026-02-16: 기존 개략 계획을 코드베이스 실측 기반의 상세 Task Board + 상태관리형 계획으로 전면 교체
- 2026-02-17: 규칙 준수 재점검 결과를 반영해 문서 정합성(폰트/인라인 예외/검증 명령)을 최신화
