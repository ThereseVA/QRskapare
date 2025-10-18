# QR Generator Test Script for Gustafkliniken
# PowerShell version

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   QR Generator - Gustafkliniken Testing" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing processes on port 4321
Write-Host "Checking for existing processes on port 4321..." -ForegroundColor Yellow
try { 
    $process = Get-NetTCPConnection -LocalPort 4321 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) { 
        Stop-Process -Id $process -Force
        Write-Host "Killed existing process on port 4321" -ForegroundColor Green
    } else { 
        Write-Host "Port 4321 is available" -ForegroundColor Green
    } 
} catch { 
    Write-Host "Port 4321 is available" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host ""

# Trust certificate
Write-Host "Ensuring development certificate is trusted..." -ForegroundColor Yellow
& gulp trust-dev-cert

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Test URLs for Gustafkliniken" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "1. YOUR TEST PAGE:" -ForegroundColor White
Write-Host "https://gustafkliniken.sharepoint.com/sites/Gustafkliniken/SitePages/Testsida.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. SHAREPOINT WORKBENCH:" -ForegroundColor White  
Write-Host "https://gustafkliniken.sharepoint.com/_layouts/15/workbench.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   Instructions" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "1. Wait for server to start completely" -ForegroundColor White
Write-Host "2. Copy and paste one of the URLs above into your browser" -ForegroundColor White
Write-Host "3. Edit the page and add the QR Generator web part" -ForegroundColor White
Write-Host "4. Test the cleaned and optimized solution!" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done testing" -ForegroundColor Yellow
Write-Host ""

# Start the server
& gulp serve --nobrowser