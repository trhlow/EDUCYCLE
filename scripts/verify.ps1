# EduCycle — local verify (BE + FE). Run from repo root: .\scripts\verify.ps1
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

Write-Host "== Backend: mvn clean verify ==" -ForegroundColor Cyan
Push-Location (Join-Path $Root "source\backend\educycle-java")
try {
  mvn -q clean verify
} finally {
  Pop-Location
}

Write-Host "== Frontend: typecheck + build ==" -ForegroundColor Cyan
Push-Location (Join-Path $Root "source\frontend")
try {
  npm run typecheck
  npm run build
} finally {
  Pop-Location
}

Write-Host "Done." -ForegroundColor Green
