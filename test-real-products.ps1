# Test prawdziwych produktów z EAN - KWANT Backend

$baseUrl = "https://dealsense-aplikacja.onrender.com"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST PRAWDZIWYCH PRODUKTÓW - KWANT + SearchAPI" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: iPhone 15 Pro (popularny produkt)
Write-Host "Test 1: iPhone 15 Pro..." -ForegroundColor Yellow
try {
    $body = @{
        product_name = "Apple iPhone 15 Pro 256GB"
        ean = "0195949045998"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/market" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
    Write-Host "SUCCESS: $($response.count) ofert znalezionych!" -ForegroundColor Green
    
    if ($response.offers -and $response.offers.Count -gt 0) {
        $offer = $response.offers[0]
        Write-Host "  Przykładowa oferta:" -ForegroundColor White
        Write-Host "    Sklep: $($offer.source)" -ForegroundColor White
        Write-Host "    Cena: €$($offer.price)" -ForegroundColor White
        Write-Host "    Link: $($offer.link)" -ForegroundColor White
    }
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
}

Write-Host ""

# Test 2: Samsung Galaxy S24
Write-Host "Test 2: Samsung Galaxy S24..." -ForegroundColor Yellow
try {
    $body = @{
        product_name = "Samsung Galaxy S24 128GB"
        ean = "8806095490915"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/market" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
    Write-Host "SUCCESS: $($response.count) ofert znalezionych!" -ForegroundColor Green
    
    if ($response.offers -and $response.offers.Count -gt 0) {
        $prices = $response.offers | ForEach-Object { $_.price } | Sort-Object
        $minPrice = $prices[0]
        $maxPrice = $prices[-1]
        $savings = [math]::Round((($maxPrice - $minPrice) / $maxPrice) * 100, 1)
        
        Write-Host "  Najniższa cena: €$minPrice" -ForegroundColor Green
        Write-Host "  Najwyższa cena: €$maxPrice" -ForegroundColor Red
        Write-Host "  OSZCZĘDNOŚCI: $savings%" -ForegroundColor Cyan
    }
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
}

Write-Host ""

# Test 3: Sony WH-1000XM5 (słuchawki - kategoria audio)
Write-Host "Test 3: Sony WH-1000XM5..." -ForegroundColor Yellow
try {
    $body = @{
        product_name = "Sony WH-1000XM5"
        ean = "4548736134980"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$baseUrl/api/market" -Method Post -Body $body -ContentType "application/json" -TimeoutSec 30
    Write-Host "SUCCESS: $($response.count) ofert znalezionych!" -ForegroundColor Green
    
    if ($response.offers -and $response.offers.Count -gt 0) {
        $prices = $response.offers | ForEach-Object { $_.price } | Sort-Object
        $minPrice = $prices[0]
        $maxPrice = $prices[-1]
        $savings = [math]::Round((($maxPrice - $minPrice) / $maxPrice) * 100, 1)
        
        Write-Host "  Najniższa cena: €$minPrice" -ForegroundColor Green
        Write-Host "  Najwyższa cena: €$maxPrice" -ForegroundColor Red
        Write-Host "  OSZCZĘDNOŚCI: $savings%" -ForegroundColor Cyan
    }
} catch {
    Write-Host "FAILED: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TESTY ZAKOŃCZONE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
