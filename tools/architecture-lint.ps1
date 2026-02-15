param(
  [switch]$FailOnFindings
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Push-Location $repoRoot

try {
  $findings = @()

  function Add-Finding {
    param(
      [string]$Check,
      [string]$Message
    )
    $script:findings += [PSCustomObject]@{
      Check = $Check
      Message = $Message
    }
  }

  $requiredFiles = @(
    "layouts/partials/extend-footer.html",
    "layouts/shortcodes/market-charts.html",
    "static/js/market-pulse-enhancements.js",
    "static/js/market-pulse-calendar.js",
    "static/js/briefing/calendar-loader.js",
    "static/js/calendar/parser.js",
    "static/js/calendar/model.js",
    "static/js/calendar/renderer.js"
  )

  foreach ($file in $requiredFiles) {
    if (-not (Test-Path -Path $file -PathType Leaf)) {
      Add-Finding -Check "required-files" -Message "Missing required architecture file: $file"
    }
  }

  $extendFooterPath = "layouts/partials/extend-footer.html"
  if (Test-Path -Path $extendFooterPath -PathType Leaf) {
    $expectedLoaderOrder = @(
      "js/briefing/dom-utils.js",
      "js/briefing/section-wrapping.js",
      "js/briefing/regime-hero.js",
      "js/briefing/collapsible.js",
      "js/briefing/news-grid.js",
      "js/briefing/ticker-cards.js",
      "js/briefing/toc-scrollspy.js",
      "js/calendar/parser.js",
      "js/calendar/model.js",
      "js/calendar/renderer.js",
      "js/market-pulse-calendar.js",
      "js/briefing/calendar-loader.js",
      "js/market-pulse-enhancements.js",
      "js/branding-patch.js",
      "js/footer-clock.js"
    )

    $actualLoaderOrder = @()
    $invalidLoaderLines = @()
    $lines = Get-Content -Path $extendFooterPath
    foreach ($line in $lines) {
      $trim = $line.Trim()
      if (-not $trim) { continue }
      if ($trim -match '^<!--.*-->$') { continue }

      $m = [regex]::Match($trim, '^<script src="\{\{\s*"([^"]+)"\s*\|\s*relURL\s*\}\}"></script>$')
      if ($m.Success) {
        $actualLoaderOrder += $m.Groups[1].Value
      } else {
        $invalidLoaderLines += $trim
      }
    }

    if ($invalidLoaderLines.Count -gt 0) {
      Add-Finding -Check "extend-footer-loader" -Message ("extend-footer contains non-loader lines: {0}" -f ($invalidLoaderLines -join " | "))
    }

    $expectedJoined = $expectedLoaderOrder -join "||"
    $actualJoined = $actualLoaderOrder -join "||"
    if ($expectedJoined -ne $actualJoined) {
      Add-Finding -Check "extend-footer-order" -Message ("Script loader order mismatch. expected=[{0}] actual=[{1}]" -f ($expectedLoaderOrder -join ", "), ($actualLoaderOrder -join ", "))
    }
  }

  $calendarEntrypoint = "static/js/market-pulse-calendar.js"
  if (Test-Path -Path $calendarEntrypoint -PathType Leaf) {
    $entryRaw = Get-Content -Path $calendarEntrypoint -Raw
    $entryLines = (Get-Content -Path $calendarEntrypoint | Measure-Object -Line).Lines
    if ($entryLines -gt 90) {
      Add-Finding -Check "calendar-entry-size" -Message "Entrypoint should stay thin (<=90 lines): $calendarEntrypoint ($entryLines lines)"
    }

    $requiredTokens = @(
      "createParser",
      "createModel",
      "createRenderer",
      "window.MPCreateCalendarConverter"
    )
    foreach ($token in $requiredTokens) {
      if ($entryRaw -notmatch [regex]::Escape($token)) {
        Add-Finding -Check "calendar-entry-contract" -Message "Entrypoint missing required token '$token': $calendarEntrypoint"
      }
    }

    $forbiddenTokens = @(
      "parseScheduleItem",
      "buildCalendarModel",
      "renderUpcomingList",
      "getEventStatus"
    )
    foreach ($token in $forbiddenTokens) {
      if ($entryRaw -match [regex]::Escape($token)) {
        Add-Finding -Check "calendar-entry-leak" -Message "Entrypoint contains implementation token '$token': $calendarEntrypoint"
      }
    }
  }

  $briefingDir = "static/js/briefing"
  if (Test-Path -Path $briefingDir -PathType Container) {
    $briefingFiles = Get-ChildItem -Path $briefingDir -File -Filter "*.js"
    foreach ($file in $briefingFiles) {
      if ($file.Name -eq "calendar-loader.js") { continue }
      $raw = Get-Content -Path $file.FullName -Raw
      if ($raw -match "mp-calendar__|parseScheduleItem|buildCalendarModel|MPCreateCalendarConverter") {
        Add-Finding -Check "calendar-boundary" -Message "Calendar implementation leaked into briefing module: $($file.FullName)"
      }
    }
  }

  $chartsShortcode = "layouts/shortcodes/market-charts.html"
  if (Test-Path -Path $chartsShortcode -PathType Leaf) {
    $raw = Get-Content -Path $chartsShortcode -Raw

    if ([regex]::IsMatch($raw, "(?is)<script(?![^>]*\bsrc=)[^>]*>")) {
      Add-Finding -Check "market-charts-inline-script" -Message "Inline <script> is not allowed in $chartsShortcode"
    }
    if ($raw -notmatch "data-chart-data-url=") {
      Add-Finding -Check "market-charts-contract" -Message "Missing data-chart-data-url attribute in $chartsShortcode"
    }
    if ($raw -notmatch '<script src="/js/market-charts-loader\.js"></script>') {
      Add-Finding -Check "market-charts-loader" -Message "Missing external loader script in $chartsShortcode"
    }
  }

  $qualityWorkflow = ".github/workflows/quality-gate.yml"
  if (-not (Test-Path -Path $qualityWorkflow -PathType Leaf)) {
    Add-Finding -Check "quality-workflow" -Message "Missing workflow: $qualityWorkflow"
  } else {
    $workflowRaw = Get-Content -Path $qualityWorkflow -Raw
    if ($workflowRaw -notmatch "agent-preflight\.ps1") {
      Add-Finding -Check "quality-workflow" -Message "Quality workflow does not run agent preflight."
    }
    if ($workflowRaw -notmatch "-RunBuild") {
      Add-Finding -Check "quality-workflow" -Message "Quality workflow does not include build verification."
    }
    if ($workflowRaw -notmatch "-FailOnFindings") {
      Add-Finding -Check "quality-workflow" -Message "Quality workflow does not fail on findings."
    }
  }

  Write-Host ""
  Write-Host "=== Architecture Lint ==="
  Write-Host "Root: $repoRoot"
  if ($findings.Count -eq 0) {
    Write-Host "Result: PASS (no findings)"
    exit 0
  }

  for ($i = 0; $i -lt $findings.Count; $i++) {
    $f = $findings[$i]
    Write-Host ("[{0}] ({1}) {2}" -f ($i + 1), $f.Check, $f.Message)
  }
  Write-Host ("Result: WARN ({0} findings)" -f $findings.Count)

  if ($FailOnFindings) {
    exit 2
  }
}
finally {
  Pop-Location
}
