try {
    Write-Host "GET /api/listings"
    $r1 = Invoke-RestMethod -Uri 'http://localhost:8080/api/listings' -Method GET -ErrorAction Stop
    $r1 | ConvertTo-Json -Depth 6
    Write-Host "\nPOST /api/login (master)"
    $r2 = Invoke-RestMethod -Uri 'http://localhost:8080/api/login' -Method POST -Body (ConvertTo-Json @{role='master'; password='KVMASTER2026'}) -ContentType 'application/json' -ErrorAction Stop
    $r2 | ConvertTo-Json -Depth 6
    $token = $r2.token
    Write-Host "\nCreate agent (master auth)"
    $r3 = Invoke-RestMethod -Uri 'http://localhost:8080/api/agents' -Method POST -Body (ConvertTo-Json @{name='Test Agent'; phone='60123456789'; password='agent123'; company='TestCo'; areaFocus='KL'; activeToday=$true}) -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
    $r3 | ConvertTo-Json -Depth 6
    $agentId = $r3.id
    Write-Host "\nVerify agent via PUT /api/agents/$agentId"
    $r4 = Invoke-RestMethod -Uri "http://localhost:8080/api/agents/$agentId" -Method PUT -Body (ConvertTo-Json @{verified=$true; activeToday=$true}) -ContentType 'application/json' -Headers @{ Authorization = "Bearer $token" } -ErrorAction Stop
    $r4 | ConvertTo-Json -Depth 6
    Write-Host "\nPOST /api/leads (public)"
    $r5 = Invoke-RestMethod -Uri 'http://localhost:8080/api/leads' -Method POST -Body (ConvertTo-Json @{userName='Alice'; userPhone='60111222333'; listingId=1; userMessage='Interested in viewing'}) -ContentType 'application/json' -ErrorAction Stop
    $r5 | ConvertTo-Json -Depth 6
} catch {
    Write-Host 'ERROR:' $_.Exception.Message
    exit 1
}