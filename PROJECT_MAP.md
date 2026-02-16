# 🗺️ 프로젝트 상황판 (PROJECT_MAP.md)

**최종 업데이트**: 2026-02-16
**담당 에이전트**: Battlecruiser

---

> **"이 문서는 AI 에이전트가 이 프로젝트에서 작업을 시작하기 전 가장 먼저 읽어야 할 '작전 지도'다. 모든 작업은 이 지도를 기준으로 수행한다."**

## 1. 프로젝트 개요 (Project Overview)

- **프로젝트명**: `market-pulse-blog` (dungan24.github.io)
- **목적**:
    1.  **IT 엔지니어 포트폴리오**: Hugo, CSS, JS 커스터마이징 및 자동화 파이프라인 구축 역량을 보여주는 기술 쇼케이스.
    2.  **둥안티콘 브랜딩**: '둥안티콘'이라는 캐릭터 IP를 활용하여 기술 블로그에 독창적인 정체성을 부여.
- **기술 스택**: Hugo (Blowfish 테마 기반) + Vanilla JS + Custom CSS

## 2. 핵심 파일 위치 (Key File Locations)

- **로고 및 브랜딩**:
    - **메인 로고**: `themes/blowfish/logo.png` (테마 기본값)
    - **홈페이지 히어로 이미지**: `assets/img/hero.svg` (커스텀)
    - **파비콘**: `themes/blowfish/static/favicon.ico` (및 관련 파일)
- **메인 CSS**:
    - **진입점**: `assets/css/custom.css`
    - **모듈**: `assets/css/custom/*.css` (기능별로 분리된 CSS 파일들)
- **콘텐츠 (글)**:
    - **저장소**: `content/posts/`
    - **주요 형식**: `pre-market-YYYY-MM-DD.md` 형식의 마크다운 파일.
- **커스텀 JS**:
    - **전체 경로**: `static/js/`
    - **핵심 로직**: `market-pulse-enhancements.js`, `market-pulse-calendar.js`
    - **모듈**: `briefing/`, `calendar/` 등 하위 디렉토리 참고.
- **AI 관리 파일**:
    - **최고 우선순위**: `CLAUDE.md`
    - **에이전트 규칙**: `AGENTS.md`
    - **코딩 규칙**: `AI_CODING_RULES.md`
    - **작업 계획**: `PLAN.md`

## 3. 주요 커스터마이징 내역 (Major Customizations)

> ⚠️ **주의**: 아래 목록은 Blowfish 테마 원본에서 우리가 직접 수정하거나 추가한 기능들이다. 향후 테마 업데이트 시 이 부분들이 깨지지 않는지 반드시 확인해야 한다.

### 3.1. 스타일 및 레이아웃 (CSS & Layouts)

- **전역 폰트 변경**:
    - 모든 폰트를 `Noto Sans KR`로 통일 (`custom.css`).
- **사이버펑크 UI/UX**:
    - 터미널 스타일 푸터 (`terminal-footer.css`, `footer.html`).
    - 네온 그리드, HUD 코너, 스캔라인 등 시각 효과 (`toc-and-effects.css`).
    - 글래스모피즘 기반 카드 UI (`briefing-sections.css`, `chart-cards.css` 등).
- **레이아웃 확장**:
    - FHD 환경에서 본문 폭을 확장하고, 특정 섹션(`briefing-section`)이 화면 전체 폭을 사용하도록 오버라이드 (`layout-overrides.css`).
- **홈페이지 커스터마이징**:
    - `custom.html` 레이아웃을 사용하여 직접 만든 컴포넌트(시장 현황, 최근 브리핑 카드)를 렌더링.
- **라이트/다크 모드 개선**:
    - 다크 모드를 기본으로 하되, 라이트 모드 가독성을 높이기 위해 변수 기반 오버라이드 적용 (`custom.css`, `theme-fixes.css`).

### 3.2. 기능 및 로직 (JS & Shortcodes)

- **설정 외부화 시스템**:
    - `params.toml`의 `[market_pulse]` 섹션에 주요 설정(섹션 제목, 라벨, 색상 등)을 정의.
    - `mp-config.js`가 이 설정을 런타임에 주입하여 JS 코드 수정 없이 동작을 변경할 수 있도록 설계.
- **동적 콘텐츠 렌더링**:
    - 마크다운 테이블을 동적으로 티커 카드(`ticker-cards.js`)나 뉴스 카드(`news-grid.js`)로 변환.
    - `pre-market-*.md`의 특정 섹션을 분석하여 시장 레짐 히어로 배너(`regime-hero.js`), 접기/펴기 기능(`collapsible.js`) 등을 동적으로 추가.
- **인터랙티브 캘린더**:
    - 마크다운 리스트를 파싱하여 인터랙티브한 이벤트 캘린더로 렌더링 (`market-pulse-calendar.js` 및 하위 모듈).
- **커스텀 숏코드**:
    - `market-charts`, `news-grid`, `ticker-group` 등 복잡한 UI를 마크다운에서 간단히 호출할 수 있도록 숏코드 다수 제작.

---
**"상황판 브리핑 끝. 작전 개시 전 반드시 숙지하도록."**
