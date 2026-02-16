param(
  [switch]$RunBuild,
  [switch]$RunCalendarSmoke,
  [switch]$RunUiViewportSmoke,
  [switch]$FailOnFindings,
  [int]$LargeBinaryThresholdKB = 300,
  [int]$LargeSourceThresholdLines = 800,
  [int]$JsThresholdLines = 600,
  [int]$CssThresholdLines = 700,
  [int]$TemplateThresholdLines = 350,
  [string]$CalendarSmokeBaseUrl = "http://localhost:1314",
  [string]$CalendarSmokePagePath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$auditScript = Join-Path $PSScriptRoot "agent-audit.ps1"
if (-not (Test-Path -Path $auditScript -PathType Leaf)) {
  throw "Missing audit script: $auditScript"
}
$architectureLintScript = Join-Path $PSScriptRoot "architecture-lint.ps1"
if (-not (Test-Path -Path $architectureLintScript -PathType Leaf)) {
  throw "Missing architecture lint script: $architectureLintScript"
}

& $auditScript `
  -LargeBinaryThresholdKB $LargeBinaryThresholdKB `
  -LargeSourceThresholdLines $LargeSourceThresholdLines `
  -JsThresholdLines $JsThresholdLines `
  -CssThresholdLines $CssThresholdLines `
  -TemplateThresholdLines $TemplateThresholdLines `
  -FailOnFindings:$FailOnFindings

if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

& $architectureLintScript -FailOnFindings:$FailOnFindings
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

if (-not $RunBuild -and -not $RunCalendarSmoke -and -not $RunUiViewportSmoke) {
  Write-Host "Preflight completed (audit + architecture lint only)."
  exit 0
}

if ($RunBuild) {
  $hugo = Get-Command hugo -ErrorAction SilentlyContinue
  if (-not $hugo) {
    throw "hugo command not found. Install Hugo or run without -RunBuild."
  }

  Write-Host "Running Hugo production build check: hugo --gc --minify"
  hugo --gc --minify
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

if ($RunCalendarSmoke) {
  $calendarSmokeScript = Join-Path $PSScriptRoot "calendar-smoke.ps1"
  if (-not (Test-Path -Path $calendarSmokeScript -PathType Leaf)) {
    throw "Missing calendar smoke script: $calendarSmokeScript"
  }

  & $calendarSmokeScript `
    -BaseUrl $CalendarSmokeBaseUrl `
    -PagePath $CalendarSmokePagePath
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

if ($RunUiViewportSmoke) {
  # Placeholder for UI Viewport Smoke - will be implemented via npm script for now or node call
  # This requires node and playwright dependencies installed
  Write-Host "Running UI Viewport Smoke Test..."
  
  # Check if server is running on port 1314 (basic check)
  try {
    $conn = Test-NetConnection -ComputerName localhost -Port 1314 -WarningAction SilentlyContinue
    if (-not $conn.TcpTestSucceeded) {
      throw "Server is not running on http://localhost:1314. Please start 'hugo server --port 1314' before running UI smoke tests."
    }
  } catch {
    # If Test-NetConnection fails (some environments), just warn
    Write-Warning "Could not verify if server is running. Proceeding with smoke test..."
  }

  npm run test:ui-smoke
  if ($LASTEXITCODE -ne 0) {
    Write-Error "UI Viewport Smoke Test Failed."
    exit $LASTEXITCODE
  }
}

Write-Host "Preflight completed successfully."

