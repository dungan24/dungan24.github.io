param(
  [int]$LargeBinaryThresholdKB = 300,
  [int]$LargeSourceThresholdLines = 800,
  [int]$JsThresholdLines = 600,
  [int]$CssThresholdLines = 700,
  [int]$TemplateThresholdLines = 350,
  [switch]$FailOnFindings
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Push-Location $repoRoot

try {
  function Normalize-GitPath {
    param([string]$PathValue)
    if ($null -eq $PathValue) { return "" }
    $normalized = $PathValue.Trim()
    if (-not $normalized) { return "" }
    return $normalized.Replace("\", "/")
  }

  $trackedFiles = git ls-files
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to read tracked files via git ls-files."
  }
  $untrackedFiles = git ls-files --others --exclude-standard
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to read untracked files via git ls-files --others --exclude-standard."
  }
  $normalizedTrackedFiles = @($trackedFiles | ForEach-Object { Normalize-GitPath $_ } | Where-Object { $_ })
  $normalizedUntrackedFiles = @($untrackedFiles | ForEach-Object { Normalize-GitPath $_ } | Where-Object { $_ })

  $trackedExistingFilesOnly = @($normalizedTrackedFiles | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf })
  $auditCandidates = @($normalizedTrackedFiles + $normalizedUntrackedFiles | Sort-Object -Unique)
  $trackedExistingFiles = @($auditCandidates | Where-Object { Test-Path -LiteralPath $_ -PathType Leaf })

  $textExtensions = @(
    ".css", ".scss", ".js", ".ts", ".html", ".md", ".toml", ".yaml", ".yml",
    ".json", ".txt", ".cmd", ".ps1", ".sh", ".svg", ".xml"
  )
  $sourcePrefixes = @(
    "assets/",
    "layouts/",
    "static/js/",
    "config/",
    "archetypes/",
    ".github/"
  )
  $binaryExcludePrefixes = @(
    "docs/screenshots/"
  )
  $inlineTemplateAllowlist = @(
    "layouts/partials/extend-head-uncached.html"
  )

  $largeBinaryFindings = @()
  $largeSourceFindings = @()
  $inlineTemplateFindings = @()

  foreach ($file in $trackedExistingFiles) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf)) {
      continue
    }

    $ext = [System.IO.Path]::GetExtension($file).ToLowerInvariant()
    try {
      $item = Get-Item -LiteralPath $file
    } catch {
      continue
    }

    if ($textExtensions -notcontains $ext) {
      $isExcludedBinaryPath = $false
      foreach ($prefix in $binaryExcludePrefixes) {
        if ($file.StartsWith($prefix)) {
          $isExcludedBinaryPath = $true
          break
        }
      }
      if ($isExcludedBinaryPath) {
        continue
      }
      if ($item.Length -ge ($LargeBinaryThresholdKB * 1KB)) {
        $largeBinaryFindings += [PSCustomObject]@{
          Path = $file
          SizeKB = [math]::Round($item.Length / 1KB, 1)
        }
      }
      continue
    }

    $isSourceCandidate = $false
    foreach ($prefix in $sourcePrefixes) {
      if ($file.StartsWith($prefix)) {
        $isSourceCandidate = $true
        break
      }
    }
    if (-not $isSourceCandidate) {
      continue
    }

    $lineThreshold = $LargeSourceThresholdLines
    if ($file.StartsWith("static/js/")) {
      $lineThreshold = [Math]::Min($lineThreshold, $JsThresholdLines)
    } elseif ($file.StartsWith("assets/css/")) {
      $lineThreshold = [Math]::Min($lineThreshold, $CssThresholdLines)
    } elseif ($file.StartsWith("layouts/")) {
      $lineThreshold = [Math]::Min($lineThreshold, $TemplateThresholdLines)
    }

    $lineCount = (Get-Content -LiteralPath $file | Measure-Object -Line).Lines
    if ($lineCount -ge $lineThreshold) {
      $largeSourceFindings += [PSCustomObject]@{
        Path = $file
        Lines = $lineCount
        Threshold = $lineThreshold
      }
    }

    if ($ext -eq ".html" -and $file.StartsWith("layouts/") -and ($inlineTemplateAllowlist -notcontains $file)) {
      $raw = Get-Content -LiteralPath $file -Raw
      $hasInlineStyle = [regex]::IsMatch($raw, "(?is)<style[^>]*>")
      $hasInlineScript = [regex]::IsMatch($raw, "(?is)<script(?![^>]*\bsrc=)[^>]*>")

      if ($hasInlineStyle) {
        $inlineTemplateFindings += [PSCustomObject]@{
          Path = $file
          Type = "inline-style"
        }
      }
      if ($hasInlineScript) {
        $inlineTemplateFindings += [PSCustomObject]@{
          Path = $file
          Type = "inline-script"
        }
      }
    }
  }

  $scratchRegex = "(^|/)(_tmp-.*|lsp-test\.(ts|js)|toc-snapshot\.txt)$"
  $scratchTracked = @($trackedExistingFilesOnly | Where-Object { $_ -match $scratchRegex })

  Write-Host ""
  Write-Host "=== Agent Repository Audit ==="
  Write-Host "Root: $repoRoot"
  Write-Host "Audited files (tracked + untracked): $($trackedExistingFiles.Count)"
  Write-Host ""

  Write-Host "[1/4] Large tracked binary files >= ${LargeBinaryThresholdKB}KB"
  if ($largeBinaryFindings.Count -eq 0) {
    Write-Host "  OK: no findings."
  } else {
    $largeBinaryFindings |
      Sort-Object -Property SizeKB -Descending |
      Select-Object -First 20 |
      ForEach-Object {
        Write-Host ("  - {0} ({1} KB)" -f $_.Path, $_.SizeKB)
      }
    if ($largeBinaryFindings.Count -gt 20) {
      Write-Host "  ... and $($largeBinaryFindings.Count - 20) more."
    }
  }
  Write-Host ""

  Write-Host "[2/4] Large source files by domain thresholds"
  Write-Host "  static/js >= $JsThresholdLines, assets/css >= $CssThresholdLines, layouts >= $TemplateThresholdLines, default >= $LargeSourceThresholdLines"
  if ($largeSourceFindings.Count -eq 0) {
    Write-Host "  OK: no findings."
  } else {
    $largeSourceFindings |
      Sort-Object -Property Lines -Descending |
      ForEach-Object {
        Write-Host ("  - {0} ({1} lines, threshold {2})" -f $_.Path, $_.Lines, $_.Threshold)
      }
  }
  Write-Host ""

  Write-Host "[3/4] Inline <script>/<style> blocks in layout templates"
  if ($inlineTemplateFindings.Count -eq 0) {
    Write-Host "  OK: no findings."
  } else {
    $inlineTemplateFindings |
      Sort-Object -Property Path, Type |
      ForEach-Object {
        Write-Host ("  - {0} ({1})" -f $_.Path, $_.Type)
      }
  }
  Write-Host ""

  Write-Host "[4/4] Scratch/test files tracked by git"
  if ($scratchTracked.Count -eq 0) {
    Write-Host "  OK: no findings."
  } else {
    $scratchTracked | ForEach-Object { Write-Host "  - $_" }
  }
  Write-Host ""

  # T-806: Check for unlinked assets
  Write-Host "[5/5] Unlinked JS/CSS Assets (Unreferenced in layouts)"
  $unlinkedFindings = @()
  
  # Scan only our custom assets
  $assetCandidates = @($trackedExistingFilesOnly | Where-Object { 
    ($_ -match "^static/js/.*\.js$" -or $_ -match "^assets/css/custom/.*\.css$") -and
    $_ -notmatch "market-charts-loader" -and # Exception: shortcode
    $_ -notmatch "footer-clock" # Exception: footer
  })

  # Very basic grep across layouts to find references
  # We look for partial filename match
  foreach ($asset in $assetCandidates) {
    $fileName = Split-Path $asset -Leaf
    $baseName = $fileName -replace "\.(js|css)$", ""
    
    # We grep all layout files
    $grep = git grep -q --fixed-strings $fileName layouts/
    if ($LASTEXITCODE -ne 0) {
       # Try finding by js/name.js or css/custom/name.css short path used in hugo
       $shortPath = ""
       if ($asset -match "^static/js/(.*)$") { $shortPath = $matches[1] }
       if ($asset -match "^assets/(.*)$") { $shortPath = $matches[1] }
       
       if ($shortPath) {
         git grep -q --fixed-strings $shortPath layouts/
         if ($LASTEXITCODE -ne 0) {
            $unlinkedFindings += $asset
         }
       } else {
         $unlinkedFindings += $asset
       }
    }
  }

  if ($unlinkedFindings.Count -eq 0) {
    Write-Host "  OK: no findings."
  } else {
    $unlinkedFindings | ForEach-Object { Write-Host "  - Unlinked Asset? $_" }
    # Only WARN, do not count towards failure yet as false positives are possible with dynamic loading
    Write-Host "  (Note: Verify if these are truly unused or dynamically loaded)"
  }
  Write-Host ""

  $findingCount = $largeBinaryFindings.Count + $largeSourceFindings.Count + $inlineTemplateFindings.Count + $scratchTracked.Count
  # $unlinkedFindings intentionally excluded from failure count for now to be non-blocking
  
  if ($findingCount -eq 0) {
    Write-Host "Result: PASS (no findings)"
    exit 0
  }

  Write-Host "Result: WARN ($findingCount findings)"
  if ($FailOnFindings) {
    exit 2
  }
}
finally {
  Pop-Location
}
