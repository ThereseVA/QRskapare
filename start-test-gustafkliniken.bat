@echo off
echo.
echo ========================================
echo   QR Generator - Gustafkliniken Testing
echo ========================================
echo.
echo Starting development server...
echo.

REM Kill any existing processes on port 4321
echo Checking for existing processes on port 4321...
powershell -Command "try { $process = Get-NetTCPConnection -LocalPort 4321 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique; if ($process) { Stop-Process -Id $process -Force; Write-Host 'Killed existing process on port 4321' } else { Write-Host 'Port 4321 is available' } } catch { Write-Host 'Port 4321 is available' }"

REM Trust certificate if needed
echo.
echo Ensuring development certificate is trusted...
gulp trust-dev-cert

REM Start development server
echo.
echo Starting development server...
echo Server will be available at: https://localhost:4321
echo.
echo ========================================
echo   Test URLs for Gustafkliniken
echo ========================================
echo.
echo 1. YOUR TEST PAGE:
echo https://gustafkliniken.sharepoint.com/sites/Gustafkliniken/SitePages/Testsida.aspx?debug=true^&noredir=true^&debugManifestsFile=https://localhost:4321/temp/build/manifests.js
echo.
echo 2. SHAREPOINT WORKBENCH:
echo https://gustafkliniken.sharepoint.com/_layouts/15/workbench.aspx?debug=true^&noredir=true^&debugManifestsFile=https://localhost:4321/temp/build/manifests.js
echo.
echo ========================================
echo   Instructions
echo ========================================
echo.
echo 1. Wait for server to start completely
echo 2. Copy and paste one of the URLs above into your browser
echo 3. Edit the page and add the QR Generator web part
echo 4. Test the cleaned and optimized solution!
echo.
echo Press Ctrl+C to stop the server when done testing
echo.

REM Start the server
gulp serve --nobrowser