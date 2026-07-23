$login = Invoke-RestMethod -Uri "http://localhost:3500/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{"username":"superadmin","password":"123456"}'
$token = $login.data.token
$h = @{Authorization = "Bearer $token"; "Content-Type" = "application/json"}
$b = "http://localhost:3500/api/v1"
$pass = 0; $fail = 0; $total = 0

function R($m, $p, $d, $desc) {
    $global:total++
    try {
        $url = "$global:b$p"
        $params = @{Uri=$url; Method=$m; Headers=$global:h; UseBasicParsing=$true; ErrorAction='Stop'}
        if ($d) { $params.Body = ($d | ConvertTo-Json -Depth 10) }
        $r = Invoke-WebRequest @params
        $global:pass++
        $j = $r.Content | ConvertFrom-Json -ErrorAction SilentlyContinue
        $id = ""
        if ($j.data -and $j.data._id) { $id = $j.data._id }
        elseif ($j.data -and $j.data.id) { $id = $j.data.id }
        Write-Host "PASS $m $p -> $($r.StatusCode) $desc" -ForegroundColor Green
        return @{ok=$true; id=$id; data=$j.data}
    } catch {
        $code = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "ERR" }
        $global:fail++
        Write-Host "FAIL $m $p -> $code $desc" -ForegroundColor Red
        return @{ok=$false; id=""; data=$null}
    }
}

Write-Host "`n=== 1. USERS CRUD ===" -ForegroundColor Cyan
$u = R POST "/users" @{fullName="Test User"; username="testuser"; email="test@test.com"; phone="0551234567"; password="123456"; roleId=$login.data.user.roleId; status="active"} "Create User"
$uid = $u.id
R GET "/users" $null "List Users"
if ($uid) { R PUT "/users/$uid" @{fullName="Test User Updated"} "Update User" }
if ($uid) { R DELETE "/users/$uid" $null "Delete User" }

Write-Host "`n=== 2. ROLES CRUD ===" -ForegroundColor Cyan
$ro = R POST "/roles" @{name="test_role"; nameAr="Test Role"; slug="test-role"; description="test"} "Create Role"
$roid = $ro.id
R GET "/roles" $null "List Roles"
if ($roid) { R PUT "/roles/$roid" @{description="Updated role"} "Update Role" }
if ($roid) { R DELETE "/roles/$roid" $null "Delete Role" }

Write-Host "`n=== 3. PERMISSIONS CRUD ===" -ForegroundColor Cyan
$pe = R POST "/permissions" @{name="test.perm"; nameAr="Test Perm"; module="test"; slug="test-perm"; actions=@("view","create")} "Create Permission"
$peid = $pe.id
R GET "/permissions" $null "List Permissions"
if ($peid) { R PUT "/permissions/$peid" @{description="Updated perm"} "Update Permission" }
if ($peid) { R DELETE "/permissions/$peid" $null "Delete Permission" }

Write-Host "`n=== 4. STUDENTS CRUD ===" -ForegroundColor Cyan
$s = R POST "/students" @{studentNumber="STU-TEST-01"; universityId="UID-TEST"; firstName="Ahmed"; lastName="Ali"; gender="male"; college="Engineering"; department="CS"; academicLevel="3"; phone="0559999999"; address="Riyadh"} "Create Student"
$sid = $s.id
R GET "/students" $null "List Students"
if ($sid) { R PUT "/students/$sid" @{phone="0558888888"} "Update Student" }
if ($sid) { R DELETE "/students/$sid" $null "Delete Student" }

Write-Host "`n=== 5. DRIVERS CRUD ===" -ForegroundColor Cyan
$dr = R POST "/drivers" @{driverNumber="DRV-TEST-01"; fullName="Driver Test"; phone="0557777777"; nationalId="NID001"; licenseNumber="LIC001"; licenseExpiry="2025-12-31"; address="Riyadh"; employmentDate="2024-01-01"; salary=5000} "Create Driver"
$drid = $dr.id
R GET "/drivers" $null "List Drivers"
if ($drid) { R PUT "/drivers/$drid" @{salary=6000} "Update Driver" }
if ($drid) { R DELETE "/drivers/$drid" $null "Delete Driver" }

Write-Host "`n=== 6. BUSES CRUD ===" -ForegroundColor Cyan
$b1 = R POST "/buses" @{busNumber="BUS-TEST-01"; plateNumber="TST-9999"; brand="Toyota"; modelName="Coaster"; year=2024; capacity=50; status="active"} "Create Bus"
$bid = $b1.id
R GET "/buses" $null "List Buses"
if ($bid) { R PUT "/buses/$bid" @{capacity=55} "Update Bus" }
if ($bid) { R DELETE "/buses/$bid" $null "Delete Bus" }

Write-Host "`n=== 7. DESTINATIONS CRUD ===" -ForegroundColor Cyan
$dest = R POST "/destinations" @{destinationName="Test City"; city="Jeddah"; description="Test dest"; status="active"} "Create Destination"
$did = $dest.id
R GET "/destinations" $null "List Destinations"
if ($did) { R PUT "/destinations/$did" @{city="Dammam"} "Update Destination" }
if ($did) { R DELETE "/destinations/$did" $null "Delete Destination" }

Write-Host "`n=== 8. ROUTES CRUD ===" -ForegroundColor Cyan
$rt = R POST "/routes" @{routeName="Test Route"; routeCode="RT-TST"; distance=25; estimatedTime=45; status="active"} "Create Route"
$rtid = $rt.id
R GET "/routes" $null "List Routes"
if ($rtid) { R PUT "/routes/$rtid" @{distance=30} "Update Route" }
if ($rtid) { R DELETE "/routes/$rtid" $null "Delete Route" }

Write-Host "`n=== 9. BUS STOPS CRUD ===" -ForegroundColor Cyan
$bs = R POST "/bus-stops" @{stopName="Test Stop"; stopCode="BS-TST"; latitude=24.7; longitude=46.7; status="active"} "Create Bus Stop"
$bsid = $bs.id
R GET "/bus-stops" $null "List Bus Stops"
if ($bsid) { R PUT "/bus-stops/$bsid" @{stopName="Updated Stop"} "Update Bus Stop" }
if ($bsid) { R DELETE "/bus-stops/$bsid" $null "Delete Bus Stop" }

Write-Host "`n=== 10. TRIPS CRUD + START/END ===" -ForegroundColor Cyan
$allBuses = (Invoke-RestMethod -Uri "$b/buses" -Headers $h).data
$allDrivers = (Invoke-RestMethod -Uri "$b/drivers" -Headers $h).data
$allRoutes = (Invoke-RestMethod -Uri "$b/routes" -Headers $h).data
$allDest = (Invoke-RestMethod -Uri "$b/destinations" -Headers $h).data
$busId = if ($allBuses[0]) { $allBuses[0]._id } else { "" }
$driverId = if ($allDrivers[0]) { $allDrivers[0]._id } else { "" }
$routeId = if ($allRoutes[0]) { $allRoutes[0]._id } else { "" }
$destId = if ($allDest[0]) { $allDest[0]._id } else { "" }

if ($busId -and $driverId -and $routeId -and $destId) {
    $today = Get-Date -Format "yyyy-MM-dd"
    $tr = R POST "/trips" @{tripNumber="TRIP-TEST-01"; busId=$busId; driverId=$driverId; routeId=$routeId; date=$today; destinationId=$destId; status="scheduled"} "Create Trip"
    $trid = $tr.id
    R GET "/trips" $null "List Trips"
    R GET "/trips/today" $null "Today Trips"
    R GET "/trips/active" $null "Active Trips"
    if ($trid) {
        R PUT "/trips/$trid" @{notes="Updated trip"} "Update Trip"
        R POST "/trips/$trid/start" $null "Start Trip"
        R POST "/trips/$trid/end" $null "End Trip"
        R DELETE "/trips/$trid" $null "Delete Trip"
    }
} else {
    Write-Host "SKIP Trips - missing FK data" -ForegroundColor Yellow
}

Write-Host "`n=== 11. ATTENDANCE ===" -ForegroundColor Cyan
R GET "/attendance" $null "List Attendance"
R GET "/attendance/today" $null "Today Attendance"

Write-Host "`n=== 12. SUBSCRIPTIONS ===" -ForegroundColor Cyan
R GET "/subscriptions" $null "List Subscriptions"

Write-Host "`n=== 13. MAINTENANCE TYPES CRUD ===" -ForegroundColor Cyan
$mt = R POST "/maintenance/types" @{typeName="Test Type"; description="Test maintenance type"; defaultCost=100} "Create Maintenance Type"
$mtid = $mt.id
R GET "/maintenance/types" $null "List Maintenance Types"
if ($mtid) { R PUT "/maintenance/types/$mtid" @{description="Updated"} "Update Maintenance Type" }
if ($mtid) { R DELETE "/maintenance/types/$mtid" $null "Delete Maintenance Type" }

Write-Host "`n=== 14. MAINTENANCE CRUD ===" -ForegroundColor Cyan
if ($busId) {
    $mt2 = R POST "/maintenance" @{busId=$busId; maintenanceType="Engine Check"; description="Test maintenance"; cost=500; maintenanceDate=(Get-Date -Format "yyyy-MM-dd"); status="pending"} "Create Maintenance"
    $mt2id = $mt2.id
} else {
    $mt2 = R POST "/maintenance" @{maintenanceType="Engine Check"; description="Test"; cost=500; maintenanceDate=(Get-Date -Format "yyyy-MM-dd"); status="pending"} "Create Maintenance"
    $mt2id = $mt2.id
}
R GET "/maintenance" $null "List Maintenance"
if ($mt2id) { R PUT "/maintenance/$mt2id" @{status="in_progress"} "Update Maintenance" }
if ($mt2id) { R DELETE "/maintenance/$mt2id" $null "Delete Maintenance" }

Write-Host "`n=== 15. FUEL CRUD ===" -ForegroundColor Cyan
$fuel = R POST "/fuel" @{busId=$busId; driverId=$driverId; liters=50; price=2.5; station="Aramco"; odometer=15000; date=(Get-Date -Format "yyyy-MM-dd")} "Create Fuel"
$fuelid = $fuel.id
R GET "/fuel" $null "List Fuel"
R GET "/fuel/statistics" $null "Fuel Statistics"
if ($fuelid) { R PUT "/fuel/$fuelid" @{liters=60} "Update Fuel" }
if ($fuelid) { R DELETE "/fuel/$fuelid" $null "Delete Fuel" }

Write-Host "`n=== 16. NOTIFICATIONS CRUD ===" -ForegroundColor Cyan
R GET "/notifications" $null "List Notifications"
R GET "/notifications/unread-count" $null "Unread Count"
$noti = R POST "/notifications" @{title="Test Notification"; body="This is a test"; type="info"; receiverType="all"} "Create Notification"
$notid = $noti.id
if ($notid) { R PATCH "/notifications/$notid/read" $null "Mark Read" }
R PATCH "/notifications/read-all" $null "Mark All Read"
if ($notid) { R DELETE "/notifications/$notid" $null "Delete Notification" }

Write-Host "`n=== 17. REPORTS ===" -ForegroundColor Cyan
R GET "/reports/students" $null "Report Students"
R GET "/reports/drivers" $null "Report Drivers"
R GET "/reports/buses" $null "Report Buses"
R GET "/reports/attendance" $null "Report Attendance"
R GET "/reports/subscriptions" $null "Report Subscriptions"
R GET "/reports/maintenance" $null "Report Maintenance"
R GET "/reports/fuel" $null "Report Fuel"
R GET "/reports/financial" $null "Report Financial"

Write-Host "`n=== 18. SETTINGS ===" -ForegroundColor Cyan
R GET "/settings" $null "Get Settings"
R PUT "/settings" @{systemName="SUTMS Updated"} "Update Settings"

Write-Host "`n=== 19. LOGS ===" -ForegroundColor Cyan
R GET "/logs/activity" $null "Activity Logs"
R GET "/logs/audit" $null "Audit Logs"

Write-Host "`n=== 20. DASHBOARD ===" -ForegroundColor Cyan
R GET "/dashboard/stats" $null "Dashboard Stats"
R GET "/dashboard/charts" $null "Dashboard Charts"
R GET "/dashboard/today-trips" $null "Today Trips"

Write-Host "`n=== 21. AUTH ===" -ForegroundColor Cyan
R GET "/auth/profile" $null "Get Profile"
R PUT "/auth/profile" @{fullName="Super Admin"} "Update Profile"

Write-Host "`n=== 22. UPLOADS ===" -ForegroundColor Cyan
R GET "/uploads" $null "List Uploads"

Write-Host "`n==============================" -ForegroundColor Yellow
Write-Host "TOTAL: $total | PASS: $pass | FAIL: $fail" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow
