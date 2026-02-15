# Market Pulse Blog

> Fact-driven market intelligence — 사이버펑크 스타일 시장 브리핑 블로그

[![Deploy](https://img.shields.io/github/actions/workflow/status/dungan24/dungan24.github.io/pages-build-deployment?label=deploy)](https://dungan24.github.io)
[![License: MIT](https://img.shields.io/badge/code-MIT-7C3AED)](LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/content-CC%20BY--NC--SA%204.0-00F0FF)](LICENSE)

**[dungan24.github.io](https://dungan24.github.io)**

## Overview

매일 개장 전 시장 브리핑을 자동 생성·발행하는 블로그입니다. Hugo 정적 사이트 위에 사이버펑크 테마를 커스텀 구현했습니다.

### Features

- **Regime Hero** — 시장 국면(Risk-On/Cautious/Risk-Off/Panic) 실시간 배지
- **ECharts 대시보드** — Trend, Correlation, Regime, Sectors 4종 차트
- **뉴스 카드 그리드** — 글로벌/국내 뉴스 2열 카드 변환
- **티커 카드** — 핵심 수치 테이블을 컴팩트 카드로 변환
- **Fact/Opinion 분리** — 팩트(보라) vs 해석(시안) 시각 구분
- **다크/라이트 모드** — 사이버펑크 다크 기본, 클린 라이트 지원
- **모바일 반응형** — 375px~1920px 풀 반응형

## Architecture

```
market-pulse (private)              market-pulse-blog (public)
├── Writer    → 마크다운 생성         ├── content/posts/    ← 브리핑 수신
├── Publisher → git push             ├── static/data/      ← 차트 JSON
└── templates/                       ├── assets/css/       ← 사이버펑크 CSS
                                     ├── layouts/partials/ ← JS 변환 엔진
                                     └── → GitHub Pages 배포
```

콘텐츠는 쌍둥이 레포 `market-pulse`의 파이프라인이 자동 생성·발행합니다.

### Rendering Structure

- `layouts/partials/extend-footer.html` — JS loader only
- `static/js/briefing/*.js` — post-page transformation modules
- `static/js/market-pulse-enhancements.js` — module orchestrator
- `static/js/calendar/*.js` — calendar parser/model/renderer modules
- `static/js/market-pulse-calendar.js` — calendar converter entrypoint
- `assets/css/custom.css` + `assets/css/custom/*.css` — semantic style layers

## Tech Stack

| Layer | Tech |
|-------|------|
| SSG | Hugo |
| Theme | Blowfish |
| Styling | Custom CSS (Cyberpunk) |
| Fonts | Orbitron · Exo 2 · JetBrains Mono |
| Charts | ECharts |
| Deploy | GitHub Pages |

## Local Development

```bash
# Hugo 서버 실행 (serve.cmd 사용)
serve.cmd
# → http://localhost:1314
```

## Agent Workflow

```bash
# 빠른 구조/용량 점검
pwsh -File tools/agent-audit.ps1

# 점검 + 프로덕션 빌드 검증
pwsh -File tools/agent-preflight.ps1 -RunBuild

# 캘린더 필터 브라우저 스모크 (importance/period/country)
pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314

# 아키텍처 규칙 위반 점검
pwsh -File tools/architecture-lint.ps1 -FailOnFindings
```

- `.ignore`는 에이전트 탐색 시 대용량 바이너리/벤더 경로를 기본 제외합니다.
- 벤더 파일이나 스크린샷까지 전체 검색이 필요하면 `rg --no-ignore`를 사용합니다.
- 디버깅 스크린샷은 `docs/screenshots/` 아카이브로 관리합니다.
- `tools/agent-audit.ps1`는 도메인별 파일 길이 임계값과 `layouts/` 인라인 `<script>/<style>` 규칙을 점검합니다.

## License

이 프로젝트는 **듀얼 라이선스** 구조입니다.

| 대상 | 라이선스 | 범위 |
|------|---------|------|
| **코드** | [MIT](LICENSE) | `assets/`, `layouts/`, `static/js/`, 설정 파일 |
| **콘텐츠** | [CC BY-NC-SA 4.0](LICENSE) | `content/`, `static/data/` |
| **테마** | [MIT](themes/blowfish/LICENSE) | Blowfish (third-party) |

- 코드: 자유롭게 사용·수정·재배포 가능
- 콘텐츠: 출처 표시 필수, 상업적 사용 금지, 동일 조건 공유
