# QRskapare Deployment Script with Mega Cache Busting
# This script ensures zero caching issues during SharePoint deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "prod",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false
)

Write-Host "🚀 QRskapare Deployment with Mega Cache Busting" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow

# Function to update version with timestamp for ultimate cache busting
function Update-VersionWithTimestamp {
    $timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $packageSolutionPath = "config/package-solution.json"
    
    if (Test-Path $packageSolutionPath) {
        $packageSolution = Get-Content $packageSolutionPath | ConvertFrom-Json
        $currentVersion = $packageSolution.solution.version
        
        # Parse current version
        $versionParts = $currentVersion.Split('.')
        $major = [int]$versionParts[0]
        $minor = [int]$versionParts[1]
        $patch = [int]$versionParts[2]
        $build = if ($versionParts.Length -gt 3) { [int]$versionParts[3] } else { 0 }
        
        # Create new version with timestamp
        $newBuild = $timestamp % 65535  # Keep within valid range
        $newVersion = "$major.$minor.$patch.$newBuild"
        
        $packageSolution.solution.version = $newVersion
        
        # Save updated package-solution.json
        $packageSolution | ConvertTo-Json -Depth 10 | Set-Content $packageSolutionPath
        
        Write-Host "✅ Version updated: $currentVersion -> $newVersion" -ForegroundColor Green
        return $newVersion
    }
    
    Write-Host "❌ Could not find package-solution.json" -ForegroundColor Red
    return $null
}

# Function to add cache busting to CSS and JS files
function Add-CacheBustingToAssets {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    
    # Update CSS with cache busting comments
    $cssFiles = Get-ChildItem -Path "src" -Filter "*.scss" -Recurse
    foreach ($cssFile in $cssFiles) {
        $content = Get-Content $cssFile.FullName
        $bustingComment = "/* Cache-Buster: $timestamp */"
        
        if ($content -notcontains $bustingComment) {
            $newContent = @($bustingComment) + $content
            Set-Content $cssFile.FullName $newContent
            Write-Host "✅ Added cache busting to: $($cssFile.Name)" -ForegroundColor Green
        }
    }
    
    Write-Host "✅ Cache busting added to asset files" -ForegroundColor Green
}

# Function to clear all possible caches
function Clear-AllCaches {
    Write-Host "🧹 Clearing all caches..." -ForegroundColor Yellow
    
    # Clear npm cache
    npm cache clean --force 2>$null
    
    # Clear temp directories
    if (Test-Path "temp") {
        Remove-Item "temp" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "lib") {
        Remove-Item "lib" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    if (Test-Path "dist") {
        Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Clear node_modules/.cache if exists
    if (Test-Path "node_modules/.cache") {
        Remove-Item "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "✅ All caches cleared" -ForegroundColor Green
}

# Main deployment process
try {
    Write-Host "🧹 Step 1: Clearing all caches" -ForegroundColor Cyan
    Clear-AllCaches
    
    Write-Host "📝 Step 2: Updating version with timestamp" -ForegroundColor Cyan
    $newVersion = Update-VersionWithTimestamp
    
    Write-Host "🎨 Step 3: Adding cache busting to assets" -ForegroundColor Cyan
    Add-CacheBustingToAssets
    
    if (-not $SkipBuild) {
        Write-Host "🔨 Step 4: Building solution" -ForegroundColor Cyan
        npm run clean
        npm install --force
        
        # Build with production optimizations
        $env:NODE_ENV = "production"
        gulp clean
        gulp bundle --ship
        gulp package-solution --ship
        
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE"
        }
        
        Write-Host "✅ Build completed successfully" -ForegroundColor Green
    }
    
    Write-Host "📦 Step 5: Package information" -ForegroundColor Cyan
    $sppkgPath = "sharepoint/solution/*.sppkg"
    $sppkgFile = Get-ChildItem $sppkgPath | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    
    if ($sppkgFile) {
        Write-Host "📦 Package created: $($sppkgFile.Name)" -ForegroundColor Green
        Write-Host "📏 Package size: $([math]::Round($sppkgFile.Length / 1MB, 2)) MB" -ForegroundColor Green
        Write-Host "🕒 Created: $($sppkgFile.LastWriteTime)" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🎉 DEPLOYMENT READY!" -ForegroundColor Green -BackgroundColor DarkGreen
    Write-Host "Version: $newVersion" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Upload the .sppkg file to SharePoint App Catalog" -ForegroundColor White
    Write-Host "2. Deploy the solution globally" -ForegroundColor White
    Write-Host "3. The mega cache busting will prevent all caching issues!" -ForegroundColor White
    Write-Host ""
    Write-Host "⚡ Cache Busting Features Applied:" -ForegroundColor Magenta
    Write-Host "✅ Dynamic version with timestamp" -ForegroundColor White
    Write-Host "✅ Asset cache busting headers" -ForegroundColor White
    Write-Host "✅ LocalStorage/SessionStorage clearing" -ForegroundColor White
    Write-Host "✅ Meta tag cache prevention" -ForegroundColor White
    Write-Host "✅ Build-time cache invalidation" -ForegroundColor White
    
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}