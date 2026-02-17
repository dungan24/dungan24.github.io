param(
  [string]$BaseUrl = "",
  [string]$PagePath = "",
  [switch]$InstallBrowser
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Push-Location $repoRoot

try {
  $smokeConfig = Join-Path $PSScriptRoot "smoke-config.ps1"
  if (-not (Test-Path -Path $smokeConfig -PathType Leaf)) {
    throw "Missing smoke config script: $smokeConfig"
  }
  . $smokeConfig
  $BaseUrl = Get-SmokeBaseUrl -Explicit $BaseUrl

  $spec = Join-Path $PSScriptRoot "calendar-filters.smoke.spec.js"
  if (-not (Test-Path -Path $spec -PathType Leaf)) {
    throw "Missing smoke spec: $spec"
  }
  $playwrightPkg = Join-Path $repoRoot "node_modules/@playwright/test/package.json"
  if (-not (Test-Path -Path $playwrightPkg -PathType Leaf)) {
    throw "Missing @playwright/test dependency. Run: npm install"
  }

  try {
    Invoke-WebRequest -UseBasicParsing -Uri $BaseUrl -TimeoutSec 3 | Out-Null
  } catch {
    throw "Calendar smoke requires a reachable server at $BaseUrl. Start serve.cmd or provide -BaseUrl."
  }

  if ($InstallBrowser) {
    Write-Host "Installing Chromium for Playwright (one-time setup)..."
    npx --yes playwright install chromium
    if ($LASTEXITCODE -ne 0) {
      exit $LASTEXITCODE
    }
  }

  $env:MP_BASE_URL = $BaseUrl
  if ($PagePath) {
    $env:MP_CALENDAR_PAGE_PATH = $PagePath
  } else {
    Remove-Item Env:MP_CALENDAR_PAGE_PATH -ErrorAction SilentlyContinue
  }

  Write-Host "Running calendar filter smoke test against $BaseUrl"
  
  try {
    npx --yes playwright test tools/calendar-filters.smoke.spec.js --reporter=line --workers=1
    if ($LASTEXITCODE -ne 0) {
      throw "Playwright test failed with exit code $LASTEXITCODE. Check console output above."
    }
  } catch {
    Write-Error "Calendar Smoke Test Failed!"
    Write-Error "Target: $BaseUrl"
    if ($PagePath) { Write-Error "Explicit Path: $PagePath" }
    Write-Error "Tip: Verify the page contains '#mp-calendar-container' and the calendar JS is loading."
    exit 1
  }

  Write-Host "Calendar filter smoke passed."
}
finally {
  Pop-Location
}
