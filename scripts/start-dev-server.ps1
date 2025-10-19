# Start development server and open SharePoint test page
param()

Write-Host "🚀 Starting QR Creator development server..." -ForegroundColor Green

# Kill any existing process on port 4321
try {
    $process = Get-NetTCPConnection -LocalPort 4321 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    if ($process) {
        Stop-Process -Id $process -Force
        Write-Host "✅ Killed existing process on port 4321" -ForegroundColor Yellow
    } else {
        Write-Host "ℹ️  No existing process found on port 4321" -ForegroundColor Cyan
    }
} catch {
    Write-Host "ℹ️  Port 4321 is available" -ForegroundColor Cyan
}

# Start the development server in background
Write-Host "🔧 Starting SPFx development server..." -ForegroundColor Blue
$serverJob = Start-Job -ScriptBlock {
    Set-Location $args[0]
    & gulp serve --nobrowser
} -ArgumentList (Get-Location).Path

# Wait for server to start (check every 2 seconds for up to 30 seconds)
$maxWait = 30
$waited = 0
$serverReady = $false

Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow

while ($waited -lt $maxWait -and -not $serverReady) {
    Start-Sleep -Seconds 2
    $waited += 2
    
    try {
        $response = Invoke-WebRequest -Uri "https://localhost:4321/temp/build/manifests.js" -UseBasicParsing -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serverReady = $true
        }
    } catch {
        Write-Host "⏳ Still waiting... ($waited/$maxWait seconds)" -ForegroundColor Yellow
    }
}

if ($serverReady) {
    Write-Host "✅ Development server is ready!" -ForegroundColor Green
    
    # Open SharePoint test page
    $testUrl = "https://gustafkliniken.sharepoint.com/sites/Gustafkliniken/SitePages/Testsida.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js"
    Write-Host "🌐 Opening SharePoint test page..." -ForegroundColor Magenta
    Start-Process $testUrl
    
    Write-Host "🎉 Development environment ready!" -ForegroundColor Green
    Write-Host "📝 Server running at: https://localhost:4321" -ForegroundColor Cyan
    Write-Host "🔗 Test page: $testUrl" -ForegroundColor Cyan
    Write-Host "⚠️  Press Ctrl+C to stop the server" -ForegroundColor Red
    
    # Keep the job running and show output
    try {
        while ($serverJob.State -eq "Running") {
            $output = Receive-Job -Job $serverJob
            if ($output) {
                Write-Host $output
            }
            Start-Sleep -Seconds 1
        }
    } finally {
        Write-Host "🛑 Stopping development server..." -ForegroundColor Red
        Stop-Job -Job $serverJob -Force
        Remove-Job -Job $serverJob -Force
    }
} else {
    Write-Host "❌ Server failed to start within $maxWait seconds" -ForegroundColor Red
    Stop-Job -Job $serverJob -Force
    Remove-Job -Job $serverJob -Force
    exit 1
}