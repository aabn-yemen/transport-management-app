$token = (Get-Content C:\fs\b\test_token.txt).Trim()
$headers = @{Authorization = "Bearer $token"; "Content-Type" = "application/json"}
$base = "http://localhost:3500/api/v1"
$results = @()

function Test-Endpoint {
    param($Method, $Path, $Body, $Description)
    $url = "$base$Path"
    try {
        $params = @{
            Uri = $url
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
            ErrorAction = 'Stop'
        }
        if ($Body) { $params.Body = ($Body | ConvertTo-Json -Depth 10) }
        $r = Invoke-WebRequest @params
        $results += [PSCustomObject]@{Method=$Method; Path=$Path; Status=$r.StatusCode; Desc=$Description; Error=""}
        Write-Host "PASS  $Method $Path -> $($r.StatusCode)" -ForegroundColor Green
    } catch {
        $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "ERR" }
        $msg = if ($_.ErrorDetails.Message) { ($_.ErrorDetails.Message | Select-Object -First 1) } else { $_.Exception.Message.Substring(0, [Math]::Min(80, $_.Exception.Message.Length)) }
        $results += [PSCustomObject]@{Method=$Method; Path=$Path; Status=$code; Desc=$Description; Error=$msg}
        Write-Host "FAIL  $Method $Path -> $code" -ForegroundColor Red
    }
}

Write-Host "`n=== DASHBOARD ===" -ForegroundColor Cyan
Test-Endpoint GET "/dashboard/stats" $null "Dashboard Stats"
Test-Endpoint GET "/dashboard/charts" $null "Dashboard Charts"
Test-Endpoint GET "/dashboard/today-trips" $null "Dashboard Today Trips"

Write-Host "`n=== AUTH ===" -ForegroundColor Cyan
Test-Endpoint GET "/auth/profile" $null "Get Profile"

Write-Host "`n=== USERS ===" -ForegroundColor Cyan
Test-Endpoint GET "/users" $null "List Users"

Write-Host "`n=== ROLES ===" -ForegroundColor Cyan
Test-Endpoint GET "/roles" $null "List Roles"

Write-Host "`n=== PERMISSIONS ===" -ForegroundColor Cyan
Test-Endpoint GET "/permissions" $null "List Permissions"

Write-Host "`n=== STUDENTS ===" -ForegroundColor Cyan
Test-Endpoint GET "/students" $null "List Students"

Write-Host "`n=== DRIVERS ===" -ForegroundColor Cyan
Test-Endpoint GET "/drivers" $null "List Drivers"

Write-Host "`n=== BUSES ===" -ForegroundColor Cyan
Test-Endpoint GET "/buses" $null "List Buses"

Write-Host "`n=== ROUTES ===" -ForegroundColor Cyan
Test-Endpoint GET "/routes" $null "List Routes"

Write-Host "`n=== DESTINATIONS ===" -ForegroundColor Cyan
Test-Endpoint GET "/destinations" $null "List Destinations"

Write-Host "`n=== TRIPS ===" -ForegroundColor Cyan
Test-Endpoint GET "/trips" $null "List Trips"
Test-Endpoint GET "/trips/today" $null "Today Trips"
Test-Endpoint GET "/trips/active" $null "Active Trips"

Write-Host "`n=== ATTENDANCE ===" -ForegroundColor Cyan
Test-Endpoint GET "/attendance" $null "List Attendance"
Test-Endpoint GET "/attendance/today" $null "Today Attendance"

Write-Host "`n=== SUBSCRIPTIONS ===" -ForegroundColor Cyan
Test-Endpoint GET "/subscriptions" $null "List Subscriptions"

Write-Host "`n=== MAINTENANCE ===" -ForegroundColor Cyan
Test-Endpoint GET "/maintenance" $null "List Maintenance"

Write-Host "`n=== FUEL ===" -ForegroundColor Cyan
Test-Endpoint GET "/fuel" $null "List Fuel"
Test-Endpoint GET "/fuel/statistics" $null "Fuel Statistics"

Write-Host "`n=== NOTIFICATIONS ===" -ForegroundColor Cyan
Test-Endpoint GET "/notifications" $null "List Notifications"
Test-Endpoint GET "/notifications/unread-count" $null "Unread Count"

Write-Host "`n=== REPORTS ===" -ForegroundColor Cyan
Test-Endpoint GET "/reports/students" $null "Report Students"
Test-Endpoint GET "/reports/drivers" $null "Report Drivers"
Test-Endpoint GET "/reports/buses" $null "Report Buses"
Test-Endpoint GET "/reports/attendance" $null "Report Attendance"
Test-Endpoint GET "/reports/subscriptions" $null "Report Subscriptions"
Test-Endpoint GET "/reports/maintenance" $null "Report Maintenance"
Test-Endpoint GET "/reports/fuel" $null "Report Fuel"
Test-Endpoint GET "/reports/financial" $null "Report Financial"

Write-Host "`n=== SETTINGS ===" -ForegroundColor Cyan
Test-Endpoint GET "/settings" $null "Get Settings"

Write-Host "`n=== LOGS ===" -ForegroundColor Cyan
Test-Endpoint GET "/logs/activity" $null "Activity Logs"
Test-Endpoint GET "/logs/audit" $null "Audit Logs"

Write-Host "`n=== UPLOADS ===" -ForegroundColor Cyan
Test-Endpoint GET "/uploads" $null "List Uploads"

Write-Host "`n=== SUMMARY ===" -ForegroundColor Yellow
$total = $results.Count
$pass = ($results | Where-Object { $_.Status -eq 200 }).Count
$fail = ($results | Where-Object { $_.Status -ne 200 }).Count
Write-Host "Total: $total | Pass: $pass | Fail: $fail" -ForegroundColor Yellow
$results | Format-Table Method, Path, Status, Desc, Error -AutoSize
