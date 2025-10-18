#!/usr/bin/env pwsh

# QR Generator - Port Management and Testing Script
# Ensures clean startup and proper testing environment

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   QR Generator - Port Management Test" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    }
    catch {
        return $false
    }
}

# Function to kill process on port
function Stop-ProcessOnPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | 
                    Select-Object -ExpandProperty OwningProcess -Unique
        
        if ($processes) {
            foreach ($processId in $processes) {
                Write-Host "Killing process $processId on port $Port..." -ForegroundColor Yellow
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            }
            Start-Sleep -Seconds 2
            return $true
        }
        return $false
    }
    catch {
        Write-Host "Error managing port $Port" -ForegroundColor Red
        return $false
    }
}

# Check common ports
$portsToCheck = @(4321, 35729, 3000, 8080)
$portsKilled = @()

Write-Host "Checking for processes on common ports..." -ForegroundColor Blue
foreach ($port in $portsToCheck) {
    if (Test-Port $port) {
        Write-Host "Port $port is in use" -ForegroundColor Yellow
        if (Stop-ProcessOnPort $port) {
            $portsKilled += $port
            Write-Host "Cleaned port $port" -ForegroundColor Green
        }
    } else {
        Write-Host "Port $port is available" -ForegroundColor Green
    }
}

if ($portsKilled.Count -gt 0) {
    Write-Host ""
    Write-Host "Cleaned ports: $($portsKilled -join ', ')" -ForegroundColor Green
    Write-Host "Waiting for ports to fully release..." -ForegroundColor Blue
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Testing Build Process" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Test build
Write-Host "Running build test..." -ForegroundColor Blue
try {
    $buildResult = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed" -ForegroundColor Red
        Write-Host $buildResult
        exit 1
    }
} catch {
    Write-Host "❌ Build error: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting Test Server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

# Start the test server
Write-Host "Starting development server for Gustaf Kliniken testing..." -ForegroundColor Blue
Write-Host ""
Write-Host "Test URLs will be:" -ForegroundColor Yellow
Write-Host "1. https://gustafkliniken.sharepoint.com/sites/Gustafkliniken/SitePages/Testsida.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js" -ForegroundColor White
Write-Host "2. https://gustafkliniken.sharepoint.com/_layouts/15/workbench.aspx?debug=true&noredir=true&debugManifestsFile=https://localhost:4321/temp/build/manifests.js" -ForegroundColor White
Write-Host ""
Write-Host "Starting server..." -ForegroundColor Blue

# Start the gulp serve process
gulp serve --nobrowser