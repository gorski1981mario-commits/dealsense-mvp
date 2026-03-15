# Test KWANT Backend na Render

$baseUrl = "https://dealsense-aplikacja.onrender.com"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "KWANT BACKEND TESTS - RENDER PRODUCTION" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "URL: $baseUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Health
Write-Host "Testing /health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "SUCCESS: Health check OK" -ForegroundColor Green
    Write-Host "  Service: $($response.service)" -ForegroundColor White
    Write-Host "  Status: $($response.status)" -ForegroundColor White
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Status
Write-Host "Testing /api/status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/status" -Method Get
    Write-Host "SUCCESS: API Status OK" -ForegroundColor Green
    Write-Host "  KWANT Engine: $($response.kwant.engine)" -ForegroundColor White
    Write-Host "  Cache: $($response.kwant.cache)" -ForegroundColor White
    Write-Host "  Queue: $($response.kwant.queue)" -ForegroundColor White
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: TOP3 (KWANT Engine)
Write-Host "Testing /api/top3 (KWANT Engine)..." -ForegroundColor Yellow
try {
    $body = @{
        product_name = "iPhone 15 Pro"
        base_price = 1199
        ean = $null
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/top3" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
    Write-Host "SUCCESS: KWANT TOP3 OK" -ForegroundColor Green
    Write-Host "  Product: $($response.product_name)" -ForegroundColor White
    Write-Host "  Base Price: $($response.base_price)" -ForegroundColor White
    if ($response.result) {
        Write-Host "  Result: $($response.result | ConvertTo-Json -Depth 3)" -ForegroundColor White
    }
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
}

Write-Host ""

# Test 4: Market API
Write-Host "Testing /api/market..." -ForegroundColor Yellow
try {
    $body = @{
        product_name = "Samsung Galaxy S24"
        ean = $null
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/market" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
    Write-Host "SUCCESS: Market API OK" -ForegroundColor Green
    Write-Host "  Product: $($response.product_name)" -ForegroundColor White
    Write-Host "  Offers Count: $($response.count)" -ForegroundColor White
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TESTS COMPLETE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
