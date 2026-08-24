#Requires -Version 5.1
# Safe outside-Cursor network diagnostic. Prints no secrets, tokens, or proxy values.
$ErrorActionPreference = 'Continue'
$ts = [DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ')
Write-Host "network-diagnostic.ps1  utc=$ts"

function Test-DnsA([string]$Name) {
    try {
        $r = Resolve-DnsName $Name -ErrorAction Stop | Where-Object { $_.Type -eq 'A' } | Select-Object -First 1
        if ($r) {
            Write-Host "DNS_OK  $Name -> $($r.IPAddress)"
            return $true
        }
        Write-Host "DNS_FAIL  $Name (no A record)"
        return $false
    } catch {
        Write-Host "DNS_FAIL  $Name"
        return $false
    }
}

function Test-Tcp([string]$HostName, [int]$Port, [int]$TimeoutMs = 10000) {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $iar = $client.BeginConnect($HostName, $Port, $null, $null)
        if (-not $iar.AsyncWaitHandle.WaitOne($TimeoutMs, $false)) {
            Write-Host "TCP_TIMEOUT  ${HostName}:${Port}"
            return $false
        }
        $client.EndConnect($iar)
        Write-Host "TCP_OK  ${HostName}:${Port}"
        return $true
    } catch {
        $msg = $_.Exception.InnerException.Message
        if ($msg -match 'access permissions') {
            Write-Host "TCP_BLOCKED  ${HostName}:${Port}  (WSAEACCES / local socket policy)"
        } else {
            Write-Host "TCP_FAIL  ${HostName}:${Port}"
        }
        return $false
    } finally {
        $client.Close()
    }
}

function Test-CurlHttps([string]$Url) {
    & curl.exe -I --connect-timeout 10 --max-time 20 $Url | Out-Null
    $code = $LASTEXITCODE
    Write-Host "CURL_HTTPS_EXIT=$code  $Url"
    return ($code -eq 0)
}

Write-Host '==== DNS ===='
$dnsGh = Test-DnsA 'github.com'
$dnsSsh = Test-DnsA 'ssh.github.com'
$dnsEx = Test-DnsA 'example.com'

Write-Host '==== TCP ===='
$tcpGh22 = Test-Tcp 'github.com' 22
$tcpGh443 = Test-Tcp 'github.com' 443
$tcpSsh443 = Test-Tcp 'ssh.github.com' 443
$tcpEx80 = Test-Tcp 'example.com' 80
$tcpEx443 = Test-Tcp 'example.com' 443

Write-Host '==== HTTPS ===='
$curlGh = Test-CurlHttps 'https://github.com'
$curlEx = Test-CurlHttps 'https://example.com'

Write-Host '==== PROXY PRESENCE (values not printed) ===='
foreach ($n in @('HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY','http_proxy','https_proxy','all_proxy','no_proxy')) {
    $v = [Environment]::GetEnvironmentVariable($n)
    if ([string]::IsNullOrEmpty($v)) { Write-Host "$n=UNSET" } else { Write-Host "$n=SET" }
}

Write-Host '==== GIT PROXY KEYS (values not printed) ===='
$null = git config --global --get-regexp 'http.*proxy|https.*proxy' 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host 'git_global_proxy=SET' } else { Write-Host 'git_global_proxy=UNSET' }
$null = git config --local --get-regexp 'http.*proxy|https.*proxy' 2>$null
if ($LASTEXITCODE -eq 0) { Write-Host 'git_local_proxy=SET' } else { Write-Host 'git_local_proxy=UNSET' }

$httpsOk = $curlGh -and $curlEx
$tcpAny = $tcpGh22 -or $tcpGh443 -or $tcpSsh443 -or $tcpEx80 -or $tcpEx443
$dnsOk = $dnsGh -and $dnsEx

Write-Host '==== SUMMARY ===='
if ($httpsOk -and $tcpGh443) {
    Write-Host 'OUTSIDE_CURSOR_NETWORK_OK'
    exit 0
} elseif ($dnsOk -and -not $tcpAny -and -not $httpsOk) {
    Write-Host 'OUTSIDE_CURSOR_NETWORK_BLOCKED'
    exit 2
} else {
    Write-Host 'PARTIAL_CONNECTIVITY'
    exit 1
}
