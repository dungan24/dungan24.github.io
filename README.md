# Market Pulse Blog

> Fact-driven market briefing renderer for `dungan24.github.io`

[![Deploy](https://img.shields.io/github/actions/workflow/status/dungan24/dungan24.github.io/pages-build-deployment?label=deploy)](https://dungan24.github.io)
[![Quality Gate](https://img.shields.io/github/actions/workflow/status/dungan24/dungan24.github.io/quality-gate.yml?label=quality)](https://github.com/dungan24/dungan24.github.io/actions/workflows/quality-gate.yml)
[![License: MIT](https://img.shields.io/badge/code-MIT-7C3AED)](LICENSE)
[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/content-CC%20BY--NC--SA%204.0-00F0FF)](LICENSE)

Production: **[https://dungan24.github.io](https://dungan24.github.io)**

## Overview

이 저장소는 `market-pulse` 파이프라인이 생성한 브리핑 콘텐츠를 Hugo에서 렌더링/발행하는 프론트엔드 레이어입니다.

- 슬롯: `pre-market`, `mid-day`, `post-market`
- 입력: `content/posts/{slot}-{date}.md`, `static/data/chart-data-{date}.json`
- 출력: GitHub Pages 정적 사이트

## Key Features

- Regime-aware home cards and filters
- ECharts dashboard (Trend / Correlation / Regime / Sectors)
- Markdown-to-card transforms for news/ticker/calendar
- Calendar model/parser/renderer modular architecture
- Contract-aware fallback rendering for partial upstream data
- Mobile bottom nav + responsive breakpoints (640/768/1024)

## Architecture

```
market-pulse (private)                 market-pulse-blog (public)
├── writer/composer/publisher  ---->   ├── content/posts/*.md
└── chart-data extractor       ---->   ├── static/data/chart-data-*.json
                                       ├── static/js/*
                                       ├── assets/css/custom/*
                                       └── Hugo pages
```

Core files:

- `layouts/partials/extend-footer.html` (script loader only)
- `static/js/market-pulse-enhancements.js` (orchestrator)
- `static/js/briefing/*.js` (post transforms)
- `static/js/calendar/{parser,model,renderer}.js` (calendar core)
- `static/js/market-pulse-calendar.js` (calendar adapter)
- `layouts/partials/extend-head-uncached.html` (config/data bridge)

## Local Development

```bash
hugo server --port 1314 --bind 0.0.0.0 --navigateToChanged
```

Windows helper:

```bash
serve.cmd
```

## Quality Checks

```bash
hugo --gc --minify
pwsh -File tools/architecture-lint.ps1 -FailOnFindings
pwsh -File tools/agent-preflight.ps1 -RunBuild -FailOnFindings
pwsh -File tools/agent-preflight.ps1 -RunUiViewportSmoke -FailOnFindings
pwsh -File tools/calendar-smoke.ps1 -BaseUrl http://localhost:1314
```

## Contract Sync Policy

렌더 계약 변경 시 `market-pulse`와 `market-pulse-blog` 문서를 같은 세션에서 함께 업데이트해야 합니다.

- Upstream contract:
  - `../market-pulse/specs/render-contract.md`
  - `../market-pulse/specs/narrative-contract.md`
- This repo guides:
  - `AGENTS.md`
  - `CLAUDE.md`
  - `docs/agent-architecture-roadmap.md`

## License

Dual-license model:

- Code: MIT
- Content/Data: CC BY-NC-SA 4.0
- Theme (`themes/blowfish`): third-party MIT
