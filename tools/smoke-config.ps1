function Get-SmokeBaseUrl {
  param([string]$Explicit = "")
  if ($Explicit) { return $Explicit }
  if ($env:MP_BASE_URL) { return $env:MP_BASE_URL }
  if ($env:MP_DEFAULT_BASE_URL) { return $env:MP_DEFAULT_BASE_URL }
  return "http://localhost:1314"
}
