# Run Waitress WSGI Production Server for Django on Port 9191
Set-Location -Path $PSScriptRoot
Write-Host "Starting Django Production Backend on http://localhost:9191 ..." -ForegroundColor Green
.\venv\Scripts\python.exe -m waitress --host=0.0.0.0 --port=9191 backend.wsgi:application
