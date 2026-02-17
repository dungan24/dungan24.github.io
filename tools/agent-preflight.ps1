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
  [string]$CalendarSmokeBaseUrl = "",
  [string]$CalendarSmokePagePath = ""
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$smokeConfig = Join-Path $PSScriptRoot "smoke-config.ps1"
if (-not (Test-Path -Path $smokeConfig -PathType Leaf)) {
  throw "Missing smoke config script: $smokeConfig"
}
. $smokeConfig

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

  $resolvedCalendarBaseUrl = Get-SmokeBaseUrl -Explicit $CalendarSmokeBaseUrl
  & $calendarSmokeScript `
    -BaseUrl $resolvedCalendarBaseUrl `
    -PagePath $CalendarSmokePagePath
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
}

if ($RunUiViewportSmoke) {
  # Placeholder for UI Viewport Smoke - will be implemented via npm script for now or node call
  # This requires node and playwright dependencies installed
  Write-Host "Running UI Viewport Smoke Test..."
  
  $uiSmokeBaseUrl = Get-SmokeBaseUrl -Explicit $CalendarSmokeBaseUrl
  $env:MP_BASE_URL = $uiSmokeBaseUrl

  # Check if target server is reachable (basic TCP check)
  try {
    $uri = [Uri]$uiSmokeBaseUrl
    $targetHost = $uri.Host
    $targetPort = if ($uri.IsDefaultPort) { if ($uri.Scheme -eq "https") { 443 } else { 80 } } else { $uri.Port }
    $conn = Test-NetConnection -ComputerName $targetHost -Port $targetPort -WarningAction SilentlyContinue
    if (-not $conn.TcpTestSucceeded) {
      throw "Server is not running on $uiSmokeBaseUrl. Start the Hugo server before running UI smoke tests."
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
