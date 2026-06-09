$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$WorkbenchName = "{0}{1}{2}" -f [char]0x5DE5, [char]0x4F5C, [char]0x53F0
$WorkbenchRoot = $env:CODEX_WORKBENCH_INSTALL_ROOT
if (-not $WorkbenchRoot) {
  $WorkbenchRoot = Join-Path ([System.IO.Path]::GetPathRoot($ProjectRoot)) $WorkbenchName
}
$WorkbenchEntry = Join-Path $WorkbenchRoot "wb.ps1"

if (-not (Test-Path $WorkbenchEntry)) {
  Write-Error "Codex workbench shortcut not found at $WorkbenchEntry"
  exit 127
}

$env:CODEX_WORKBENCH_ROOT = $ProjectRoot
& $WorkbenchEntry @args
exit $LASTEXITCODE
