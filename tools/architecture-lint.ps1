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
    # T-801: loader contract check
    $requiredScripts = @(
      "js/mp-config.js",
      "js/theme-transition.js",
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
      "js/reading-progress.js",
      "js/branding-patch.js",
      "js/footer-clock.js"
    )

    $lines = Get-Content -Path $extendFooterPath
    $loadedScripts = @()
    $hasInvalidLines = $false

    foreach ($line in $lines) {
      $trim = $line.Trim()
      if (-not $trim) { continue }
      if ($trim -match '^<!--.*-->$') { continue }

      # Strict loader pattern: <script src="{{ "path" | relURL }}"></script>
      if ($trim -match '^<script src="\{\{\s*"([^"]+)"\s*\|\s*relURL\s*\}\}"></script>$') {
        $loadedScripts += $matches[1]
      } else {
        Add-Finding -Check "extend-footer-loader" -Message "Invalid loader line format: $trim"
        $hasInvalidLines = $true
      }
    }

    foreach ($req in $requiredScripts) {
      if ($loadedScripts -notcontains $req) {
        Add-Finding -Check "extend-footer-missing" -Message "Missing required script: $req"
      }
    }

    if ($loadedScripts.Count -gt 0) {
      if ($loadedScripts[0] -ne "js/mp-config.js") {
        Add-Finding -Check "extend-footer-order" -Message "First script must be js/mp-config.js (actual: $($loadedScripts[0]))"
      }

      $parserIdx = [Array]::IndexOf($loadedScripts, "js/calendar/parser.js")
      $modelIdx = [Array]::IndexOf($loadedScripts, "js/calendar/model.js")
      $rendererIdx = [Array]::IndexOf($loadedScripts, "js/calendar/renderer.js")
      $entryIdx = [Array]::IndexOf($loadedScripts, "js/market-pulse-calendar.js")
      $loaderIdx = [Array]::IndexOf($loadedScripts, "js/briefing/calendar-loader.js")
      $enhancementsIdx = [Array]::IndexOf($loadedScripts, "js/market-pulse-enhancements.js")

      if ($parserIdx -ge 0 -and $modelIdx -ge 0 -and $parserIdx -gt $modelIdx) {
        Add-Finding -Check "extend-footer-order" -Message "Calendar parser must load before model."
      }
      if ($modelIdx -ge 0 -and $rendererIdx -ge 0 -and $modelIdx -gt $rendererIdx) {
        Add-Finding -Check "extend-footer-order" -Message "Calendar model must load before renderer."
      }
      if ($rendererIdx -ge 0 -and $entryIdx -ge 0 -and $rendererIdx -gt $entryIdx) {
        Add-Finding -Check "extend-footer-order" -Message "Calendar renderer must load before calendar entrypoint."
      }
      if ($entryIdx -ge 0 -and $loaderIdx -ge 0 -and $entryIdx -gt $loaderIdx) {
        Add-Finding -Check "extend-footer-order" -Message "Calendar entrypoint must load before calendar loader."
      }
      if ($loaderIdx -ge 0 -and $enhancementsIdx -ge 0 -and $loaderIdx -gt $enhancementsIdx) {
        Add-Finding -Check "extend-footer-order" -Message "Calendar loader must load before market-pulse-enhancements."
      }
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
    if ($raw -notmatch '<script src="(?:/js/market-charts-loader\.js|\{\{\s*"js/market-charts-loader\.js"\s*\|\s*relURL\s*\}\})"></script>') {
      Add-Finding -Check "market-charts-loader" -Message "Missing external loader script in $chartsShortcode"
    }
  }

  $qualityWorkflow = ".github/workflows/quality-gate.yml"
  if (-not (Test-Path -Path $qualityWorkflow -PathType Leaf)) {
    Add-Finding -Check "quality-workflow" -Message "Missing workflow: $qualityWorkflow"
  }

  # ES5 enforcement: static/js/ 파일 전체에 ES6+ 문법 금지
  # WHY: 프로젝트 전체가 ES5 스타일로 통일됨 (T-901). AI agent가 ES6를 다시 도입하는 것을 방지.
  $jsRoot = "static/js"
  if (Test-Path -Path $jsRoot -PathType Container) {
    $jsFiles = Get-ChildItem -Path $jsRoot -Recurse -Filter "*.js"
    foreach ($jsFile in $jsFiles) {
      $relPath = $jsFile.FullName.Replace($repoRoot + "\", "").Replace("\", "/")
      $lines = Get-Content -LiteralPath $jsFile.FullName
      $lineNum = 0
      foreach ($line in $lines) {
        $lineNum++
        $trimmed = $line.Trim()
        # 주석 라인은 건너뜀 (// 또는 * 또는 /*)
        if ($trimmed -match '^(//|/?\*)') { continue }
        if ($trimmed -match '\bconst\s+|\blet\s+| => |(?<![''"`])`(?![''"`])') {
          Add-Finding -Check "es5-violation" -Message ("ES6+ syntax at {0}:{1} — {2}" -f $relPath, $lineNum, $trimmed.Substring(0, [Math]::Min(100, $trimmed.Length)))
        }
      }
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
