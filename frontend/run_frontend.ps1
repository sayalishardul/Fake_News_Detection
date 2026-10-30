# Host Compiled React Frontend Production Build on Port 8181
Set-Location -Path $PSScriptRoot
Write-Host "Starting React Production Frontend on http://localhost:8181 ..." -ForegroundColor Green
npx serve -s dist -l 8181
