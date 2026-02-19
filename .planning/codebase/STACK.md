# Technology Stack

**Analysis Date:** 2026-02-19

## Languages

**Primary:**
- Go - Used by Hugo static site generator for build/compilation
- HTML/Template - Hugo templating language for layouts and partials
- CSS3 - Styling with custom CSS modules
- JavaScript (ES5 compatible) - Client-side interactivity and data processing
- TOML - Configuration files (hugo.toml, params.toml, languages.toml)
- JSON - Data files (chart-data-*.json)
- Markdown - Content authoring

**Secondary:**
- YAML - GitHub Actions workflow configuration

## Runtime

**Environment:**
- Hugo v0.155.3 (extended) - Static site generator
  - Enforced in GitHub Actions pipeline (`.github/workflows/hugo.yml`)
  - Built-in SCSS/CSS processor (Assets pipeline)
  - Markdown processor (Goldmark with unsafe HTML enabled)
  - Template engine (Go templates)

**Package Manager:**
- npm v10+ (implied by package.json presence)
- No lock file present in repository

## Frameworks

**Core:**
- Hugo static site generator v0.155.3 - Full website generation
- Blowfish theme - Hugo theme providing base layout, navigation, styling
  - Located at `themes/blowfish/`
  - Customized through site config and layout partials

**Testing:**
- Playwright v1.58.2 - Browser automation for smoke tests
  - Test config: `tools/calendar-filters.smoke.spec.js`, `tools/ui-viewport.smoke.spec.js`

**Build/Dev:**
- Hugo CLI - Build and dev server (`hugo server` command)
- Asset fingerprinting (sha512) - Cache busting for CSS/JS
- Asset minification - Automatic minify on production builds

## Key Dependencies

**Critical:**
- echarts v5.5.1 - JavaScript charting library via CDN
  - Loaded from: `https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js`
  - Used by: `static/js/render-charts.js` for market data visualization

- Google Fonts API - Web font delivery
  - Font: Noto Sans KR (weights: 300, 400, 500, 700, 900)
  - Loaded from: `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap`

**Infrastructure:**
- @playwright/test v1.58.2 - Browser testing framework
  - Script runners: `test:calendar-smoke`, `test:ui-smoke`
  - Reporter: line
  - Workers: 1 (for consistency)

## Configuration

**Environment:**
- `config/_default/hugo.toml` - Primary Hugo configuration
  - Base URL: `https://dungan24.github.io/`
  - Default language: Korean (ko)
  - Build settings: drafts disabled, future posts disabled, robots.txt enabled

- `config/_default/params.toml` - Theme and app parameters
  - Color scheme: "cyberpunk" (dark theme)
  - Market Pulse custom configuration (~200 lines)

- `config/_default/languages.ko.toml` - Korean language settings
  - Language code: ko-KR
  - Locale: Korean

- `config/_default/markup.toml` - Markdown rendering
  - Goldmark with unsafe HTML allowed (for shortcodes)
  - Syntax highlighting with CSS classes (noClasses: false)
  - Table of contents: levels 2-4

- `config/_default/menus.ko.toml` - Navigation menu structure

- `package.json` - npm scripts only (no dependencies)
  ```json
  {
    "private": true,
    "scripts": {
      "test:calendar-smoke": "playwright test tools/calendar-filters.smoke.spec.js --reporter=line --workers=1",
      "test:ui-smoke": "playwright test tools/ui-viewport.smoke.spec.js --reporter=line --workers=1",
      "test:calendar-smoke:install-browser": "playwright install chromium"
    },
    "devDependencies": {
      "@playwright/test": "^1.58.2"
    }
  }
  ```

**Build:**
- GitHub Actions CI/CD (`.github/workflows/hugo.yml`)
  - Triggers: Push to main, manual workflow dispatch
  - Environment: `HUGO_ENVIRONMENT=production`
  - Timezone: Asia/Seoul (TZ env var)
  - Cache: Hugo cache directory
  - Deployment: GitHub Pages

## Platform Requirements

**Development:**
- Hugo v0.155.3 (extended edition required for SCSS)
- Node.js (for Playwright tests)
- Git (with submodules for theme)

**Production:**
- GitHub Pages static hosting
- CDN for external resources (jsDelivr for echarts, Google Fonts)

## External CDN Resources

**Must-load on every page:**
1. Google Fonts CSS - Noto Sans KR (googleapis.com)
2. ECharts library - For market charts only if page has `chartData` param (jsdelivr.net)

**Loaded in head (uncached):**
- `layouts/partials/extend-head-uncached.html` loads fonts and echarts CDN
- Market Pulse configuration injected as window.__MP_CONFIG
- Page-specific data injected as window.__MP_PAGE (if regime/summary/chartData present)

---

*Stack analysis: 2026-02-19*
