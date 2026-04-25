param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

$script:Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$script:DataDir = Join-Path $script:Root "data"
$script:ListingsPath = Join-Path $script:DataDir "listings.json"
$script:AgentsPath = Join-Path $script:DataDir "agents.json"
$script:LeadsPath = Join-Path $script:DataDir "leads.json"
$script:RotationPath = Join-Path $script:DataDir "agent-rotation.json"
$script:Tokens = @{}

if (-not (Test-Path $script:DataDir)) {
    New-Item -ItemType Directory -Path $script:DataDir | Out-Null
}

function Initialize-ListingsFile {
    if (Test-Path $script:ListingsPath) { return }
    @(
        @{
            id = 1; title = "Arcoris Signature Residences"; location = "Mont Kiara, Kuala Lumpur"; area = "Mont Kiara"
            price = 830000; type = "condo"; bedrooms = 2; bathrooms = 2; sqft = 1100; psf = 755
            badge = "hot"; image = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
            mapLink = "https://www.google.com/maps/search/Mont+Kiara,+Kuala+Lumpur"; aiScore = 95; yield = 4.1; growth = 18
            commute = "8 min to Sri Hartamas"; vibe = "Expat-friendly, premium, dining-led"; tags = @("luxury", "yield", "mrt")
            fit = "Investor-friendly luxury entry with steady rental demand."; verifiedType = "owner"
        },
        @{
            id = 2; title = "The CloutHaus KLCC"; location = "Jalan P Ramlee, KLCC"; area = "KLCC"
            price = 2320000; type = "condo"; bedrooms = 2; bathrooms = 2; sqft = 800; psf = 2900
            badge = "new"; image = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
            mapLink = "https://www.google.com/maps/search/KLCC,+Kuala+Lumpur"; aiScore = 98; yield = 3.2; growth = 9
            commute = "Walkable CBD lifestyle"; vibe = "Skyline views, prestige, hospitality"; tags = @("luxury", "mrt")
            fit = "Best for prestige buyers prioritizing address and lifestyle over yield."; verifiedType = "agent"
        },
        @{
            id = 3; title = "Setia Federal Hill"; location = "Jalan Bangsar, Bangsar"; area = "Bangsar"
            price = 1350000; type = "serviced"; bedrooms = 2; bathrooms = 2; sqft = 900; psf = 1500
            badge = "new"; image = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
            mapLink = "https://www.google.com/maps/search/Bangsar,+Kuala+Lumpur"; aiScore = 92; yield = 3.8; growth = 12
            commute = "10 min to Mid Valley"; vibe = "Lifestyle-led, central, high demand"; tags = @("mrt", "luxury")
            fit = "A strong central option for professionals who want quality and convenience."; verifiedType = "agent"
        }
    ) | ConvertTo-Json -Depth 8 | Set-Content -Path $script:ListingsPath -Encoding UTF8
}

function Read-Listings {
    Initialize-ListingsFile
    $raw = Get-Content -Raw -Path $script:ListingsPath
    if ([string]::IsNullOrWhiteSpace($raw)) { return @() }
    $items = $raw | ConvertFrom-Json
    if ($items -is [System.Array]) { return @($items) }
    return @($items)
}

function Save-Listings($items) {
    $items | ConvertTo-Json -Depth 8 | Set-Content -Path $script:ListingsPath -Encoding UTF8
}

function Initialize-JsonFile($Path, $DefaultJson) {
    if (-not (Test-Path $Path)) {
        Set-Content -Path $Path -Value $DefaultJson -Encoding UTF8
    }
}

function Read-JsonArray($Path) {
    $raw = Get-Content -Raw -Path $Path
    if ([string]::IsNullOrWhiteSpace($raw)) { return @() }
    $items = $raw | ConvertFrom-Json
    if ($items -is [System.Array]) { return @($items) }
    return @($items)
}

function Save-JsonArray($Path, $Items) {
    $Items | ConvertTo-Json -Depth 8 | Set-Content -Path $Path -Encoding UTF8
}

function Read-Agents {
    Initialize-JsonFile $script:AgentsPath "[]"
    $items = @(Read-JsonArray $script:AgentsPath)
    foreach ($agent in $items) {
        if (-not ($agent.PSObject.Properties.Name -contains "password")) { $agent | Add-Member -NotePropertyName password -NotePropertyValue "agent123" }
        if (-not ($agent.PSObject.Properties.Name -contains "verified")) { $agent | Add-Member -NotePropertyName verified -NotePropertyValue $true }
    }
    return $items
}

function Save-Agents($Items) {
    Save-JsonArray $script:AgentsPath $Items
}

function Read-Leads {
    Initialize-JsonFile $script:LeadsPath "[]"
    return @(Read-JsonArray $script:LeadsPath)
}

function Save-Leads($Items) {
    Save-JsonArray $script:LeadsPath $Items
}

function Read-RotationState {
    Initialize-JsonFile $script:RotationPath "{`"lastIndex`":-1}"
    return (Get-Content -Raw -Path $script:RotationPath | ConvertFrom-Json)
}

function Save-RotationState($State) {
    $State | ConvertTo-Json -Depth 4 | Set-Content -Path $script:RotationPath -Encoding UTF8
}

function Get-NextActiveAgent {
    $agents = @(Read-Agents | Where-Object { $_.activeToday -eq $true -and $_.verified -eq $true })
    if (-not $agents.Count) { return $null }
    $state = Read-RotationState
    $nextIndex = ($state.lastIndex + 1) % $agents.Count
    $state.lastIndex = $nextIndex
    Save-RotationState $state
    return $agents[$nextIndex]
}

function New-Response([int]$StatusCode, $Body, [string]$ContentType = "application/json; charset=utf-8") {
    return @{
        StatusCode = $StatusCode
        Body = if ($ContentType -like "application/json*") { ($Body | ConvertTo-Json -Depth 8) } else { [string]$Body }
        ContentType = $ContentType
    }
}

function Get-ReasonPhrase([int]$StatusCode) {
    switch ($StatusCode) {
        200 { "OK" }
        201 { "Created" }
        204 { "No Content" }
        400 { "Bad Request" }
        401 { "Unauthorized" }
        403 { "Forbidden" }
        404 { "Not Found" }
        500 { "Internal Server Error" }
        default { "OK" }
    }
}

function Write-HttpResponse($Writer, $Response) {
    $body = if ($null -eq $Response.Body) { "" } else { [string]$Response.Body }
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($body)
    $Writer.NewLine = "`r`n"
    $Writer.WriteLine("HTTP/1.1 $($Response.StatusCode) $(Get-ReasonPhrase $Response.StatusCode)")
    $Writer.WriteLine("Content-Type: $($Response.ContentType)")
    $Writer.WriteLine("Content-Length: $($bytes.Length)")
    $Writer.WriteLine("Access-Control-Allow-Origin: *")
    $Writer.WriteLine("Access-Control-Allow-Headers: Content-Type, Authorization")
    $Writer.WriteLine("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, OPTIONS")
    $Writer.WriteLine("Connection: close")
    $Writer.WriteLine("")
    $Writer.Flush()
    if ($bytes.Length -gt 0) {
        $Writer.BaseStream.Write($bytes, 0, $bytes.Length)
        $Writer.BaseStream.Flush()
    }
}

function Parse-Request($Client) {
    # Read raw bytes from the network stream to reliably parse headers and a UTF-8 body.
    $stream = $Client.GetStream()
    $stream.ReadTimeout = 5000

    $buffer = New-Object byte[] 1024
    $headerBuffer = New-Object System.IO.MemoryStream
    $headersBytes = $null
    $remainingBytes = @()
    $foundHeaders = $false

    while ($true) {
        $read = $stream.Read($buffer, 0, $buffer.Length)
        if ($read -le 0) { break }
        $headerBuffer.Write($buffer, 0, $read)
        $arr = $headerBuffer.ToArray()
        if ($arr.Length -ge 4) {
            for ($i = 0; $i -le $arr.Length - 4; $i++) {
                if ($arr[$i] -eq 13 -and $arr[$i+1] -eq 10 -and $arr[$i+2] -eq 13 -and $arr[$i+3] -eq 10) {
                    $headersLength = $i + 4
                    $headersBytes = New-Object byte[] $headersLength
                    [System.Array]::Copy($arr, 0, $headersBytes, 0, $headersLength)
                    $remainingLength = $arr.Length - $headersLength
                    if ($remainingLength -gt 0) {
                        $remainingBytes = New-Object byte[] $remainingLength
                        [System.Array]::Copy($arr, $headersLength, $remainingBytes, 0, $remainingLength)
                    } else {
                        $remainingBytes = @()
                    }
                    $foundHeaders = $true
                    break
                }
            }
        }
        if ($foundHeaders) { break }
        if ($headerBuffer.Length -gt 65536) { break }
    }

    if (-not $headersBytes) { return $null }

    $headerText = [System.Text.Encoding]::ASCII.GetString($headersBytes)
    $headerLines = $headerText -split "`r`n"
    $requestLine = $headerLines[0]
    if ([string]::IsNullOrWhiteSpace($requestLine)) { return $null }

    $parts = $requestLine.Split(" ")
    $method = $parts[0]
    $path = $parts[1]

    $headers = @{}
    for ($j = 1; $j -lt $headerLines.Length; $j++) {
        $line = $headerLines[$j]
        if ([string]::IsNullOrWhiteSpace($line)) { continue }
        $idx = $line.IndexOf(":")
        if ($idx -gt 0) {
            $name = $line.Substring(0, $idx).Trim()
            $value = $line.Substring($idx + 1).Trim()
            $headers[$name] = $value
        }
    }

    # Read body bytes according to Content-Length, preferring UTF-8 decoding.
    $body = ""
    if ($headers.ContainsKey("Content-Length")) {
        try {
            $contentLength = [int]$headers["Content-Length"]
        } catch {
            $contentLength = 0
        }
        if ($contentLength -gt 0) {
            $bodyBytesList = New-Object System.Collections.Generic.List[byte]
            if ($remainingBytes -ne $null -and $remainingBytes.Length -gt 0) { $bodyBytesList.AddRange($remainingBytes) }

            while ($bodyBytesList.Count -lt $contentLength) {
                $toRead = [Math]::Min(8192, $contentLength - $bodyBytesList.Count)
                $buf = New-Object byte[] $toRead
                $read = $stream.Read($buf, 0, $buf.Length)
                if ($read -le 0) { break }
                if ($read -lt $buf.Length) {
                    $tmp = New-Object byte[] $read
                    [System.Array]::Copy($buf, 0, $tmp, 0, $read)
                    $bodyBytesList.AddRange($tmp)
                } else {
                    $bodyBytesList.AddRange($buf)
                }
            }
            $bodyBytes = $bodyBytesList.ToArray()
            $body = [System.Text.Encoding]::UTF8.GetString($bodyBytes, 0, [Math]::Min($bodyBytes.Length, $contentLength))
        }
    }

    return @{
        Method = $method
        Path = ($path.Split("?")[0].TrimEnd("/"))
        Headers = $headers
        Body = $body
        Stream = $stream
    }
}

function Get-AuthSession($Request) {
    $header = $Request.Headers["Authorization"]
    if (-not $header -or -not $header.StartsWith("Bearer ")) { return $null }
    $token = $header.Substring(7)
    if ($script:Tokens.ContainsKey($token)) { return $script:Tokens[$token] }
    return $null
}

function Require-Master($Request) {
    $session = Get-AuthSession $Request
    if (-not $session) { return (New-Response 401 @{ error = "Unauthorized" }) }
    if ($session.role -ne "master") { return (New-Response 403 @{ error = "Master access required" }) }
    return $session
}

function Require-Agent($Request) {
    $session = Get-AuthSession $Request
    if (-not $session) { return (New-Response 401 @{ error = "Unauthorized" }) }
    if ($session.role -ne "agent") { return (New-Response 403 @{ error = "Agent access required" }) }
    return $session
}

function Handle-Request($Request) {
    $method = $Request.Method.ToUpperInvariant()
    $path = if ([string]::IsNullOrWhiteSpace($Request.Path)) { "/" } else { $Request.Path }

    if ($method -eq "OPTIONS") { return @{ StatusCode = 204; Body = ""; ContentType = "text/plain; charset=utf-8" } }

    if ($path -eq "/api/health" -and $method -eq "GET") {
        return (New-Response 200 @{ ok = $true; runtime = "powershell-tcp"; port = $Port })
    }

    if ($path -eq "/api/login" -and $method -eq "POST") {
        $body = if ($Request.Body) { $Request.Body | ConvertFrom-Json } else { $null }
        $role = [string]$body.role
        $password = [string]$body.password
        $name = if ($body.name) { [string]$body.name } else { $role }
        $agentPhone = if ($body.phone) { [string]$body.phone } else { "" }
        $agent = $null

        if ($role -eq "agent") {
            $agent = Read-Agents | Where-Object { $_.phone -eq $agentPhone } | Select-Object -First 1
            if (-not $agent) { return (New-Response 401 @{ error = "Agent account not found" }) }
            if (-not $agent.verified) { return (New-Response 403 @{ error = "Agent account is awaiting master verification" }) }
        }

        $valid = ($role -eq "user" -and $password -eq "user123") -or ($role -eq "master" -and $password -eq "KVMASTER2026") -or ($role -eq "agent" -and $agent -and $agent.password -eq $password)
        if (-not $valid) { return (New-Response 401 @{ error = "Invalid credentials" }) }

        $token = [guid]::NewGuid().ToString()
        $resolvedName = if ($role -eq "agent" -and $agent) { [string]$agent.name } else { $name }
        $script:Tokens[$token] = @{ role = $role; name = $resolvedName; phone = $agentPhone; issuedAt = (Get-Date).ToString("o") }
        return (New-Response 200 @{ token = $token; role = $role; name = $resolvedName })
    }

    if ($path -eq "/api/listings" -and $method -eq "GET") {
        return (New-Response 200 @{ items = @(Read-Listings) })
    }

    if ($path -eq "/api/agents/active" -and $method -eq "GET") {
        return (New-Response 200 @{ items = @(Read-Agents | Where-Object { $_.activeToday -eq $true -and $_.verified -eq $true }) })
    }

    if ($path -eq "/api/agents" -and $method -eq "GET") {
        $guard = Require-Master $Request
        if ($guard -is [hashtable] -and $guard.ContainsKey("StatusCode")) { return $guard }
        return (New-Response 200 @{ items = @(Read-Agents) })
    }

    if ($path -eq "/api/agents" -and $method -eq "POST") {
        $guard = Require-Master $Request
        if ($guard -is [hashtable] -and $guard.ContainsKey("StatusCode")) { return $guard }
        $body = $Request.Body | ConvertFrom-Json
        $agents = @(Read-Agents)
        $nextId = if ($agents.Count) { (($agents | Measure-Object -Property id -Maximum).Maximum + 1) } else { 1 }
        $agent = [ordered]@{
            id = $nextId
            name = $body.name
            phone = $body.phone
            password = if ($body.password) { [string]$body.password } else { "agent123" }
            company = $body.company
            areaFocus = $body.areaFocus
            activeToday = [bool]$body.activeToday
            verified = $false
        }
        $agents = @($agent) + $agents
        Save-Agents $agents
        return (New-Response 201 $agent)
    }

    if ($path -eq "/api/listings" -and $method -eq "POST") {
        $guard = Require-Master $Request
        if ($guard -is [hashtable] -and $guard.ContainsKey("StatusCode")) { return $guard }

        $body = $Request.Body | ConvertFrom-Json
        $listings = @(Read-Listings)
        $nextId = if ($listings.Count) { (($listings | Measure-Object -Property id -Maximum).Maximum + 1) } else { 1 }

        $item = [ordered]@{
            id = $nextId
            title = $body.title
            location = $body.location
            area = $body.area
            price = [int]$body.price
            type = $body.type
            bedrooms = [int]$body.bedrooms
            bathrooms = [int]$body.bathrooms
            sqft = [int]$body.sqft
            psf = [int]$body.psf
            badge = if ($body.badge) { $body.badge } else { "new" }
            image = $body.image
            mapLink = $body.mapLink
            aiScore = if ($body.aiScore) { [int]$body.aiScore } else { 91 }
            yield = if ($body.yield) { [double]$body.yield } else { 3.8 }
            growth = if ($body.growth) { [double]$body.growth } else { 5 }
            commute = $body.commute
            vibe = $body.vibe
            tags = if ($body.tags) { @($body.tags) } else { @($body.type) }
            fit = $body.fit
            verifiedType = if ($body.verifiedType) { $body.verifiedType } else { "unverified" }
        }

        $listings = @($item) + $listings
        Save-Listings $listings
        return (New-Response 201 $item)
    }

    if ($path -match "^/api/listings/(\d+)$") {
        $id = [int]$Matches[1]
        $listings = @(Read-Listings)
        $item = $listings | Where-Object { $_.id -eq $id } | Select-Object -First 1
        if (-not $item) { return (New-Response 404 @{ error = "Listing not found" }) }

        if ($method -eq "GET") {
            return (New-Response 200 $item)
        }

        if ($method -eq "PUT") {
            $guard = Require-Master $Request
            if ($guard -is [hashtable] -and $guard.ContainsKey("StatusCode")) { return $guard }

            $body = $Request.Body | ConvertFrom-Json
            foreach ($listing in $listings) {
                if ($listing.id -eq $id) {
                    foreach ($prop in $body.PSObject.Properties) {
                        $listing.$($prop.Name) = $prop.Value
                    }
                }
            }
            Save-Listings $listings
            $updated = $listings | Where-Object { $_.id -eq $id } | Select-Object -First 1
            return (New-Response 200 $updated)
        }
    }

    if ($path -match "^/api/listings/(\d+)/verify$" -and $method -eq "PATCH") {
        $guard = Require-Master $Request
        if ($guard -is [hashtable] -and $guard.ContainsKey("StatusCode")) { return $guard }

        $id = [int]$Matches[1]
        $body = $Request.Body | ConvertFrom-Json
        $verifiedType = [string]$body.verifiedType
        if ($verifiedType -notin @("owner", "agent", "unverified")) {
            return (New-Response 400 @{ error = "verifiedType must be owner, agent, or unverified" })
        }

        $listings = @(Read-Listings)
        $found = $false
        foreach ($listing in $listings) {
            if ($listing.id -eq $id) {
                $listing.verifiedType = $verifiedType
                $found = $true
            }
        }
        if (-not $found) { return (New-Response 404 @{ error = "Listing not found" }) }

        Save-Listings $listings
        $updated = $listings | Where-Object { $_.id -eq $id } | Select-Object -First 1
        return (New-Response 200 $updated)
    }

    if ($path -match "^/api/agents/(\d+)$" -and $method -eq "PUT") {
        $guard = Require-Master $Request
        if ($guard -is [hashtable] -and $guard.ContainsKey("StatusCode")) { return $guard }
        $id = [int]$Matches[1]
        $body = $Request.Body | ConvertFrom-Json
        $agents = @(Read-Agents)
        $found = $false
        foreach ($agent in $agents) {
            if ($agent.id -eq $id) {
                foreach ($prop in $body.PSObject.Properties) {
                    $agent.$($prop.Name) = $prop.Value
                }
                $found = $true
            }
        }
        if (-not $found) { return (New-Response 404 @{ error = "Agent not found" }) }
        Save-Agents $agents
        return (New-Response 200 ($agents | Where-Object { $_.id -eq $id } | Select-Object -First 1))
    }

    if ($path -eq "/api/leads" -and $method -eq "POST") {
        $body = $Request.Body | ConvertFrom-Json
        if (-not $body.userName -or -not $body.userPhone -or -not $body.listingId) {
            return (New-Response 400 @{ error = "userName, userPhone, and listingId are required" })
        }

        $agent = Get-NextActiveAgent
        if (-not $agent) {
            return (New-Response 400 @{ error = "No active agents available today" })
        }

        $leads = @(Read-Leads)
        $nextId = if ($leads.Count) { (($leads | Measure-Object -Property id -Maximum).Maximum + 1) } else { 1 }
        $listing = (Read-Listings | Where-Object { $_.id -eq [int]$body.listingId } | Select-Object -First 1)
        $lead = [ordered]@{
            id = $nextId
            listingId = [int]$body.listingId
            listingTitle = if ($listing) { $listing.title } else { $body.listingTitle }
            userName = [string]$body.userName
            userPhone = [string]$body.userPhone
            userMessage = if ($body.userMessage) { [string]$body.userMessage } else { "" }
            assignedAgentId = $agent.id
            assignedAgentName = $agent.name
            assignedAgentPhone = $agent.phone
            createdAt = (Get-Date).ToString("o")
        }
        $leads = @($lead) + $leads
        Save-Leads $leads

        $message = [System.Uri]::EscapeDataString("Hi $($agent.name), I'm $($lead.userName). My phone is $($lead.userPhone). I'm interested in $($lead.listingTitle). $($lead.userMessage)")
        $whatsAppUrl = "https://wa.me/$($agent.phone)?text=$message"

        return (New-Response 201 @{
            lead = $lead
            whatsAppUrl = $whatsAppUrl
            agent = $agent
        })
    }

    if ($path -eq "/api/leads" -and $method -eq "GET") {
        $guard = Require-Master $Request
        if ($guard -is [hashtable] -and $guard.ContainsKey("StatusCode")) { return $guard }
        return (New-Response 200 @{ items = @(Read-Leads) })
    }

    if ($path -eq "/api/my-leads" -and $method -eq "GET") {
        $guard = Require-Agent $Request
        if ($guard -is [hashtable] -and $guard.ContainsKey("StatusCode")) { return $guard }
        $items = @(Read-Leads | Where-Object { $_.assignedAgentPhone -eq $guard.phone })
        return (New-Response 200 @{ items = $items; agentName = $guard.name; agentPhone = $guard.phone })
    }

    return (New-Response 404 @{ error = "Route not found"; path = $path; method = $method })
}

Initialize-ListingsFile
Initialize-JsonFile $script:AgentsPath "[]"
Initialize-JsonFile $script:LeadsPath "[]"
Initialize-JsonFile $script:RotationPath "{`"lastIndex`":-1}"

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$listener.Start()
Write-Host "Klang Valley backend running at http://localhost:$Port"

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $request = Parse-Request $client
            if ($null -eq $request) {
                $client.Close()
                continue
            }

            $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
            $streamWriter = New-Object System.IO.StreamWriter($request.Stream, $utf8NoBom, 1024, $true)
            try {
                $response = Handle-Request $request
            } catch {
                $response = New-Response 500 @{ error = "Server error"; detail = $_.Exception.Message }
            }
            Write-HttpResponse $streamWriter $response
            $streamWriter.Dispose()
        }
        finally {
            $client.Close()
        }
    }
}
finally {
    $listener.Stop()
}
