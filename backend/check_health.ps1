for ($i=0; $i -lt 20; $i++) {
    try {
        $r = Invoke-RestMethod -Uri 'http://localhost:8080/api/health' -Method GET -ErrorAction Stop
        $r | ConvertTo-Json -Depth 4
        exit 0
    } catch {
        Start-Sleep -Milliseconds 300
    }
}
Write-Host 'ERROR: no response after retries'
exit 1
