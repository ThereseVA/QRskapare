@echo off
echo 🚀 Starting QR Creator development server and test page...

REM Kill any existing process on port 4321
powershell -Command "try { $process = Get-NetTCPConnection -LocalPort 4321 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($process) { Stop-Process -Id $process -Force; Write-Host 'Killed process on port 4321' } else { Write-Host 'No process found on port 4321' } } catch { Write-Host 'Port 4321 is available' }"

echo ⏳ Starting development server...
start /b gulp serve --nobrowser

echo ⏳ Waiting for server to be ready...
timeout /t 10 /nobreak

echo 🌐 Opening SharePoint test page...
start https://gustafkliniken.sharepoint.com/sites/Gustafkliniken/SitePages/Testsida.aspx?debug=true^&noredir=true^&debugManifestsFile=https://localhost:4321/temp/build/manifests.js

echo ✅ Development environment ready!
echo 📝 Server running at: https://localhost:4321
echo ⚠️  Close this window to stop the server
pause