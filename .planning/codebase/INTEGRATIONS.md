# External Integrations

**Analysis Date:** 2026-02-19

## APIs & External Services

**Chart Data Delivery:**
- Internal source: JSON files served from same site
  - Path: `/data/chart-data-YYYY-MM-DD.json`
  - Format: TimeSeries, Correlations, Regime scores, Sector strength
  - Loaded by: `static/js/market-charts-loader.js`
  - Method: Fetch API with 15s timeout

**Charting Library:**
- ECharts v5.5.1 (Apache-2.0 Licensed)
  - SDK/Client: echarts via CDN
  - URL: `https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js`
  - Conditional load: Only when page has `chartData` front matter parameter
  - Used by: `static/js/render-charts.js` for timeseries, correlation, regime, sector charts
  - No authentication required

## Data Storage

**Databases:**
- None - Static site generation model
- All data delivered as JSON files committed to repository

**File Storage:**
- Local filesystem in repository
  - Chart data: `static/data/chart-data-*.json` (one per day)
  - Static assets: `static/js/`, `static/img/`
  - Generated site: `public/` (built by Hugo)

**Caching:**
- No server-side cache (static files only)
- Browser cache via fingerprinted assets (sha512 integrity hashes)
- Asset fingerprinting in production: `integrity="{{ $css.Data.Integrity }}"` attributes
- CDN caching: Google Fonts and jsDelivr handle their own caching

## Content Sources

**Upstream Data Pipeline:**
- Market Pulse private repository (`../market-pulse/`)
  - Publishes markdown files to `content/posts/`
  - Provides chart data JSON to `static/data/`
  - One-way dependency: market-pulse → dungan24.github.io

**Data Contracts:**
- Render contract: `../market-pulse/specs/render-contract.md`
  - Defines front matter schema (regime, generatedAt, asOfTime, summary, tags, chartData)
- Narrative contract: `../market-pulse/specs/narrative-contract.md`
  - Defines markdown structure for briefings
- Slot contract: `../market-pulse/specs/mid-day-slot-contract-v1.md`
  - Defines briefing time slots and metadata

## Web Fonts

**Font Provider:**
- Google Fonts API
  - Font: Noto Sans KR
  - Weights: 300, 400, 500, 700, 900
  - Display strategy: swap
  - URL: `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap`
  - Configurable in: `config/_default/params.toml` → `market_pulse.external.fonts_css_url`
  - Loaded by: `layouts/partials/extend-head-uncached.html`

## Authentication & Identity

**Auth Provider:**
- None for public content
- GitHub Pages automatic deployment (GitHub Actions)
  - Permissions: contents (read), pages (write), id-token (write)
  - Deployment credentials: GitHub Actions default GITHUB_TOKEN

## Monitoring & Observability

**Error Tracking:**
- None - Client-side errors logged to console only
  - `console.error()` and `console.warn()` in JS modules
  - No external error tracking service

**Logs:**
- Hugo build logs: GitHub Actions workflow logs (`.github/workflows/hugo.yml`)
- Client-side logging: Browser console only
  - Error states for chart loading (timeout, HTTP errors, missing renderers)
  - Calendar transformation warnings

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (dungan24.github.io)
- Automatic deployment on push to main branch
- Workflow: `.github/workflows/hugo.yml`

**CI Pipeline:**
- GitHub Actions
  - Trigger: Push to main / Manual workflow_dispatch
  - Build step: Hugo v0.155.3 with --minify, --gc flags
  - Artifact upload: `public/` directory
  - Deploy step: GitHub Pages deployment action
  - Concurrency: Single active build (cancel-in-progress: false)

**Build Configuration:**
- `HUGO_VERSION=0.155.3`
- `HUGO_ENVIRONMENT=production`
- `TZ=Asia/Seoul`
- Cache directory: `${{ runner.temp }}/hugo_cache`

## Environment Configuration

**Required env vars (Development):**
- None explicitly required for local development
- Optional Hugo environment override: `HUGO_ENVIRONMENT`
- Timezone: `TZ=Asia/Seoul` (for consistent date handling)

**Secrets location:**
- GitHub Actions secrets: None detected
  - No API keys, credentials, or tokens in configuration
  - Deployment uses GitHub Pages built-in GITHUB_TOKEN

**Config-as-code:**
- All configuration in TOML files (committed to repository)
  - Safe to commit: No secrets in config files
  - Market Pulse parameters fully in `config/_default/params.toml`

## Webhooks & Callbacks

**Incoming:**
- None - Static site only

**Outgoing:**
- None - No external API calls from site
- Chart data is pre-computed and committed as JSON
- No real-time data integration

## Data Flow

**Content Publishing Pipeline:**
```
market-pulse (private)
  └─> Creates markdown + JSON data
      └─> Pushes to dungan24.github.io
          └─> Hugo builds static site
              └─> GitHub Pages deploys public/
                  └─> Browser fetches public HTML/CSS/JS
                      └─> JS loads chart data from /data/chart-data-*.json
                          └─> ECharts renders from CDN library
```

**Chart Rendering Flow:**
1. Page HTML includes `data-chart-data-url="/data/chart-data-2026-02-19.json"`
2. `market-charts-loader.js` fetches JSON file (15s timeout)
3. Custom event `mp:chart-data-ready` dispatched with data
4. `render-charts.js` listens and calls `window.MPCharts.renderAllCharts(data)`
5. ECharts instance renders to DOM containers

**Asset Delivery:**
- Site assets: GitHub Pages CDN
- Fonts: Google Fonts CDN (googleapis.com)
- Charting library: jsDelivr CDN (cdn.jsdelivr.net)
- Data files: Served from GitHub Pages

---

*Integration audit: 2026-02-19*
