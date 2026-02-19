# Testing Patterns

**Analysis Date:** 2026-02-19

## Test Framework

**Runner:**
- Playwright `@playwright/test` v1.58.2
- Config: no `playwright.config.js` in repo root (uses defaults)

**Assertion Library:**
- Playwright's built-in `expect()` API

**Run Commands:**
```bash
npm run test:calendar-smoke         # Run calendar filter smoke tests
npm run test:ui-smoke               # Run UI viewport smoke tests
npm run test:calendar-smoke:install-browser  # Install Chromium for tests
```

## Test File Organization

**Location:**
- `tools/` directory (not co-located with source)
- Pattern: `tools/{test-name}.smoke.spec.js`

**Naming:**
- Suffix: `.smoke.spec.js` indicates smoke/integration tests
- Prefix describes domain: `calendar-filters`, `ui-viewport`

**Structure:**
```
tools/
├── calendar-filters.smoke.spec.js    # Calendar filter interactions
├── ui-viewport.smoke.spec.js         # UI rendering across viewports
├── smoke-config.js                   # Shared config/helpers
├── smoke-config.ps1                  # PowerShell version
└── calendar-smoke.ps1                # Dedicated PS1 wrapper
```

## Test Structure

**Suite Organization:**

```javascript
// tools/ui-viewport.smoke.spec.js
const { test, expect } = require('@playwright/test');
const { resolveBaseUrl } = require('./smoke-config');

const BASE_URL = resolveBaseUrl();

test.describe('Market Pulse UI Smoke', () => {
  test('Homepage loads with critical sections', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('.mp-heartbeat-title')).toBeVisible();
  });
});
```

**Patterns:**
- **Setup:** `resolveBaseUrl()` helper to determine target URL from environment
- **Teardown:** Implicit (Playwright browser closes after test)
- **Assertion:** Playwright's async `await expect()` with matchers like `.toBeVisible()`, `.toHaveCount()`

## Test Patterns

### Locator-Based Assertions

```javascript
// CSS class selector
await expect(page.locator('.mp-heartbeat-title')).toBeVisible();

// Data attribute
const filters = page.locator('.mp-upcoming__filters');

// Text-based + index
const pill = group.locator('.mp-filter-pill', { hasText: label }).first();
```

### Viewport Testing

```javascript
// Mobile (iPhone 12)
await page.setViewportSize({ width: 390, height: 844 });

// Desktop
await page.setViewportSize({ width: 1280, height: 800 });
```

### Navigation & Click Flow

```javascript
// Wait for navigation after click
await Promise.all([
  page.waitForURL(/\/posts\//),
  firstCard.click()
]);

// Click pill to toggle state
await pill.click();
await expect(pill).toHaveClass(/is-active/);
```

### Dynamic Element Detection

```javascript
// Auto-inject check - element added by JavaScript
const bar = document.getElementById('mp-reading-progress');
if (!bar) {
  bar = document.createElement('div');
  bar.id = 'mp-reading-progress';
  document.body.appendChild(bar);
}

// In test, wait for attachment after JS runs
const progressBar = page.locator('#mp-reading-progress');
await expect(progressBar).toBeAttached();
```

## Mocking

**Framework:** No mocking library

**What's Mocked:**
- External HTTP requests (Playwright intercepts)
- Browser APIs are real (DOM, localStorage, etc.)

**Pattern - Fallback File Detection:**

```javascript
// tools/calendar-filters.smoke.spec.js
function resolveLatestPreMarketPath() {
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  const files = fs.readdirSync(postsDir)
    .filter((name) => /^pre-market-\d{4}-\d{2}-\d{2}\.md$/.test(name))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.warn('WARN: No pre-market files found. Falling back...');
    const anyPosts = fs.readdirSync(postsDir)
      .filter((name) => /^(mid-day|post-market)-\d{4}-\d{2}-\d{2}\.md$/.test(name))
      .sort()
      .reverse();
    if (anyPosts.length > 0) {
      const match = anyPosts[0].match(/(mid-day|post-market)-\d{4}-\d{2}-\d{2}/);
      return `/posts/${match[0]}/`;
    }
    throw new Error('No post files found for smoke target.');
  }
  const matched = files[0].match(/\d{4}-\d{2}-\d{2}/);
  return `/posts/pre-market-${matched[0]}/`;
}
```

**What NOT to Mock:**
- DOM rendering (test real HTML)
- JavaScript module initialization
- HTTP responses from Hugo server (use real server for tests)

## Fixtures and Factories

**Test Data:**
- Uses real post markdown files from `content/posts/`
- Resolves latest published post dynamically
- Fallback chain: pre-market → mid-day → post-market

**Location:**
- Post files: `content/posts/pre-market-YYYY-MM-DD.md`
- Resolved at runtime by `resolveLatestPreMarketPath()`

## Coverage

**Requirements:** No coverage targets enforced

**View Coverage:**
- Not configured - no coverage reporting tool

## Test Types

**Smoke Tests (Integration Tests):**
- Location: `tools/` directory
- Scope: End-to-end rendering validation
- Approach: Live browser (Chromium) against Hugo server

**Unit Tests:**
- None present in codebase
- JavaScript modules designed to be browser-only (DOM-dependent)

**E2E Tests:**
- Partially covered via Playwright smoke tests
- Tests run against real Hugo server (requires `hugo server` running)

## Common Patterns

### Async Test with Timeouts

```javascript
test('importance/period/country filters render safely', async ({ page }) => {
  test.setTimeout(60_000);
  const targetUrl = buildTargetUrl();
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  const filters = page.locator('.mp-upcoming__filters');
  await expect(filters).toBeVisible({ timeout: 20_000 });
});
```

### Visibility Testing Across Breakpoints

```javascript
test('Mobile view shows bottom nav', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(BASE_URL);
  const bottomNav = page.locator('#mp-mobile-bottom-nav');
  await expect(bottomNav).toBeVisible();
});

test('Desktop view hides bottom nav', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE_URL);
  const bottomNav = page.locator('#mp-mobile-bottom-nav');
  await expect(bottomNav).toBeHidden();
});
```

### CSS Property Validation

```javascript
const cardContainer = page.locator('.mp-briefing-cards');
await expect(cardContainer).toHaveCSS('overflow-x', 'auto');
```

## Test Dependencies

**Required for Running Tests:**

1. **Hugo Server Running:**
   ```bash
   hugo server --port 1314 --bind 0.0.0.0 --navigateToChanged
   ```

2. **Chromium Browser:**
   ```bash
   npm run test:calendar-smoke:install-browser
   ```

3. **Node.js** with npm

**Environment Setup:**
- Tests auto-detect latest post file by parsing `content/posts/` directory
- Falls back to mid-day or post-market if pre-market not available
- Requires at least one post file matching pattern: `{slot}-YYYY-MM-DD.md`

---

*Testing analysis: 2026-02-19*
