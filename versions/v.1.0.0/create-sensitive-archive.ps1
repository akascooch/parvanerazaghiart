#Requires -Version 5.1
# Builds AES-256 zip of sensitive transfer files. Password is prompted; never written to disk.
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$seven = 'C:\Program Files\7-Zip\7z.exe'
if (-not (Test-Path $seven)) {
    Write-Error '7-Zip not found at C:\Program Files\7-Zip\7z.exe'
    exit 1
}
$out = Join-Path $here 'parvanerazaghiart-v1.0.0-sensitive.zip'
if (Test-Path $out) {
    Write-Error "Refusing to overwrite existing $out"
    exit 1
}

$repoRoot = (Resolve-Path (Join-Path $here '..\..\')).Path
$items = @()
foreach ($rel in @(
        'Local Info.txt',
        'Server Info.txt'
    )) {
    $p = Join-Path $repoRoot $rel
    if (Test-Path $p) { $items += $p }
}
Get-ChildItem (Join-Path $here 'database') -Filter '*.dump' -ErrorAction SilentlyContinue | ForEach-Object { $items += $_.FullName }
$manifest = Join-Path $here 'SENSITIVE_MANIFEST.txt'
if (Test-Path $manifest) { $items += $manifest }

if ($items.Count -eq 0) {
    Write-Error 'No sensitive files found to archive'
    exit 1
}

Write-Host 'Files to encrypt (paths only):'
$items | ForEach-Object { Write-Host " - $_" }
Write-Host '7-Zip will prompt for a password. It will not be echoed to this script or saved in the repo.'
Write-Host 'Use a strong unique password. Share it only through a private channel, not inside the ZIP folder.'

& $seven a -tzip -mem=AES256 -p -- $out @items
exit $LASTEXITCODE
