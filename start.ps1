# Usage:
#   .\start.ps1                        # dev mode, both services
#   .\start.ps1 -Mode prod             # prod mode, both services
#   .\start.ps1 -BackendOnly           # dev mode, backend only
#   .\start.ps1 -Mode prod -FrontendOnly

param(
    [ValidateSet("dev", "prod")]
    [string]$Mode = "dev",
    [switch]$BackendOnly,
    [switch]$FrontendOnly
)

$Root = $PSScriptRoot

function Start-Backend {
    $dir = "$Root\backend"
    $venv = "$dir\.venv"
    $uvicorn = "$venv\Scripts\uvicorn.exe"
    $pip = "$venv\Scripts\pip.exe"

    $extraArgs = if ($Mode -eq "dev") { "--reload" } else { "--workers 4" }

    # Build the init + run command that will execute inside the new window
    $initCmd = ""
    if (-not (Test-Path $venv)) {
        $initCmd += "Write-Host '[backend] Creating venv...' -ForegroundColor Yellow; python -m venv '$venv'; "
    }
    if (-not (Test-Path $uvicorn)) {
        $initCmd += "Write-Host '[backend] Installing dependencies...' -ForegroundColor Yellow; & '$pip' install -r requirements.txt; "
    }

    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "Write-Host '[backend] $Mode' -ForegroundColor Green; " +
        "Set-Location '$dir'; " +
        "$initCmd" +
        "& '$uvicorn' main:app $extraArgs"
}

function Start-Frontend {
    $dir = "$Root\frontend"

    if (-not (Test-Path "$dir\node_modules")) {
        Write-Error "node_modules missing. Run: cd frontend; npm install"
        exit 1
    }

    $cmd = if ($Mode -eq "dev") {
        "npm run dev"
    } else {
        "Write-Host 'Building...' -ForegroundColor Yellow; npm run build; npm run preview"
    }

    Start-Process powershell -ArgumentList "-NoExit", "-Command", `
        "Write-Host '[frontend] $Mode' -ForegroundColor Cyan; " +
        "Set-Location '$dir'; " +
        "$cmd"
}

Write-Host "geo-heatmap-studio — $Mode mode" -ForegroundColor Magenta

if (-not $FrontendOnly) { Start-Backend }
if (-not $BackendOnly)  { Start-Frontend }
