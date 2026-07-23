const http = require('http');

const BASE = 'http://localhost:3500/api/v1';
let token = '';
let pass = 0, fail = 0, total = 0;

function req(method, path, body) {
  return new Promise((resolve) => {
    total++;
    const url = new URL(BASE + path);
    const opts = {
      method, hostname: url.hostname, port: url.port, path: url.pathname + url.search,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    };
    const r = http.request(opts, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        let j = null; try { j = JSON.parse(d); } catch {}
        const id = j?.data?._id || j?.data?.id || '';
        const msg = j?.message || j?.error || '';
        if (res.statusCode < 400) { pass++; resolve({ ok: true, id, data: j?.data, status: res.statusCode }); }
        else { fail++; resolve({ ok: false, id: '', data: null, status: res.statusCode, msg: `${res.statusCode}: ${msg}` }); }
      });
    });
    r.on('error', (e) => { fail++; resolve({ ok: false, id: '', data: null, status: 0, msg: `Network: ${e.message}` }); });
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

function log(r, method, path, desc) {
  const c = r.ok ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  const extra = r.ok ? `${r.status}` : `${r.msg || r.status}`;
  console.log(`${c} ${method.padEnd(6)} ${path.padEnd(45)} ${extra} ${desc}`);
}

async function run() {
  const login = await req('POST', '/auth/login', { username: 'superadmin', password: '123456' });
  token = login.data.token;
  console.log('Logged in as superadmin\n');

  // Collect FK IDs from seed
  const buses = (await req('GET', '/buses')).data || [];
  const drivers = (await req('GET', '/drivers')).data || [];
  const routes = (await req('GET', '/routes')).data || [];
  const dests = (await req('GET', '/destinations')).data || [];
  const mtTypes = (await req('GET', '/maintenance/types')).data || [];
  const busId = buses[0]?._id || '';
  const driverId = drivers[0]?._id || '';
  const routeId = routes[0]?._id || '';
  const destId = dests[0]?._id || '';
  const mtTypeId = mtTypes[0]?._id || '';
  const roleId = login.data.user.roleId;

  console.log(`Seed IDs: bus=${!!busId} driver=${!!driverId} route=${!!routeId} dest=${!!destId} mtType=${!!mtTypeId}\n`);

  // 1. USERS
  console.log('--- 1. USERS ---');
  let r = await req('POST', '/users', { fullName: 'Test User', username: `tu_${Date.now()}`, email: `t${Date.now()}@t.com`, phone: '0551234567', password: '123456', roleId, status: 'active' });
  log(r, 'POST', '/users', 'Create'); const uid = r.id;
  r = await req('GET', '/users'); log(r, 'GET', '/users', 'List');
  if (uid) { r = await req('PUT', `/users/${uid}`, { fullName: 'Updated' }); log(r, 'PUT', `/users/${uid}`, 'Update'); }
  if (uid) { r = await req('DELETE', `/users/${uid}`); log(r, 'DELETE', `/users/${uid}`, 'Delete'); }

  // 2. ROLES
  console.log('\n--- 2. ROLES ---');
  r = await req('POST', '/roles', { name: `trole_${Date.now()}`, nameAr: 'Test', slug: `trole-${Date.now()}`, description: 'test' });
  log(r, 'POST', '/roles', 'Create'); const rid = r.id;
  r = await req('GET', '/roles'); log(r, 'GET', '/roles', 'List');
  if (rid) { r = await req('PUT', `/roles/${rid}`, { description: 'Updated' }); log(r, 'PUT', `/roles/${rid}`, 'Update'); }
  if (rid) { r = await req('DELETE', `/roles/${rid}`); log(r, 'DELETE', `/roles/${rid}`, 'Delete'); }

  // 3. PERMISSIONS
  console.log('\n--- 3. PERMISSIONS ---');
  r = await req('POST', '/permissions', { name: `t.perm.${Date.now()}`, nameAr: 'Test', module: 'test', slug: `tp-${Date.now()}`, actions: ['view', 'create'] });
  log(r, 'POST', '/permissions', 'Create'); const pid = r.id;
  r = await req('GET', '/permissions'); log(r, 'GET', '/permissions', 'List');
  if (pid) { r = await req('PUT', `/permissions/${pid}`, { description: 'Updated' }); log(r, 'PUT', `/permissions/${pid}`, 'Update'); }
  if (pid) { r = await req('DELETE', `/permissions/${pid}`); log(r, 'DELETE', `/permissions/${pid}`, 'Delete'); }

  // 4. STUDENTS
  console.log('\n--- 4. STUDENTS ---');
  r = await req('POST', '/students', { studentNumber: `STU-${Date.now()}`, universityId: `UID-${Date.now()}`, firstName: 'Ahmed', lastName: 'Ali', gender: 'male', college: 'Engineering', department: 'CS', academicLevel: '3', phone: '0559999999', address: 'Riyadh' });
  log(r, 'POST', '/students', 'Create'); const sid = r.id;
  r = await req('GET', '/students'); log(r, 'GET', '/students', 'List');
  if (sid) { r = await req('PUT', `/students/${sid}`, { phone: '0558888888' }); log(r, 'PUT', `/students/${sid}`, 'Update'); }
  if (sid) { r = await req('DELETE', `/students/${sid}`); log(r, 'DELETE', `/students/${sid}`, 'Delete'); }

  // 5. DRIVERS
  console.log('\n--- 5. DRIVERS ---');
  r = await req('POST', '/drivers', { driverNumber: `DRV-${Date.now()}`, fullName: 'Driver Test', phone: `055${String(Date.now()).slice(-7)}`, nationalId: `NID${Date.now()}`, licenseNumber: `LIC${Date.now()}`, licenseExpiry: '2026-12-31', address: 'Riyadh', employmentDate: '2024-01-01', salary: 5000 });
  log(r, 'POST', '/drivers', 'Create'); const did = r.id;
  r = await req('GET', '/drivers'); log(r, 'GET', '/drivers', 'List');
  if (did) { r = await req('PUT', `/drivers/${did}`, { salary: 6000 }); log(r, 'PUT', `/drivers/${did}`, 'Update'); }
  if (did) { r = await req('DELETE', `/drivers/${did}`); log(r, 'DELETE', `/drivers/${did}`, 'Delete'); }

  // 6. BUSES
  console.log('\n--- 6. BUSES ---');
  r = await req('POST', '/buses', { busNumber: `BUS-${Date.now()}`, plateNumber: `T${String(Date.now()).slice(-4)}`, brand: 'Toyota', modelName: 'Coaster', year: 2024, capacity: 50, status: 'active' });
  log(r, 'POST', '/buses', 'Create'); const bid = r.id;
  r = await req('GET', '/buses'); log(r, 'GET', '/buses', 'List');
  if (bid) { r = await req('PUT', `/buses/${bid}`, { capacity: 55 }); log(r, 'PUT', `/buses/${bid}`, 'Update'); }
  if (bid) { r = await req('DELETE', `/buses/${bid}`); log(r, 'DELETE', `/buses/${bid}`, 'Delete'); }

  // 7. DESTINATIONS
  console.log('\n--- 7. DESTINATIONS ---');
  r = await req('POST', '/destinations', { destinationName: `TDest-${Date.now()}`, city: 'Jeddah', description: 'Test', status: 'active' });
  log(r, 'POST', '/destinations', 'Create'); const did2 = r.id;
  r = await req('GET', '/destinations'); log(r, 'GET', '/destinations', 'List');
  if (did2) { r = await req('PUT', `/destinations/${did2}`, { city: 'Dammam' }); log(r, 'PUT', `/destinations/${did2}`, 'Update'); }
  if (did2) { r = await req('DELETE', `/destinations/${did2}`); log(r, 'DELETE', `/destinations/${did2}`, 'Delete'); }

  // 8. ROUTES
  console.log('\n--- 8. ROUTES ---');
  r = await req('POST', '/routes', { routeName: `TRoute-${Date.now()}`, routeCode: `RT-${Date.now()}`, distance: 25, estimatedTime: 45, destinationId: destId, status: 'active' });
  log(r, 'POST', '/routes', 'Create'); const rtid = r.id;
  r = await req('GET', '/routes'); log(r, 'GET', '/routes', 'List');
  if (rtid) { r = await req('PUT', `/routes/${rtid}`, { distance: 30 }); log(r, 'PUT', `/routes/${rtid}`, 'Update'); }
  if (rtid) { r = await req('DELETE', `/routes/${rtid}`); log(r, 'DELETE', `/routes/${rtid}`, 'Delete'); }

  // 9. BUS STOPS
  console.log('\n--- 9. BUS STOPS ---');
  if (routeId) {
    r = await req('POST', '/bus-stops', { stopName: `TStop-${Date.now()}`, latitude: 24.7, longitude: 46.7, order: 1, routeId });
    log(r, 'POST', '/bus-stops', 'Create'); const bsid = r.id;
    r = await req('GET', '/bus-stops'); log(r, 'GET', '/bus-stops', 'List');
    if (bsid) { r = await req('PUT', `/bus-stops/${bsid}`, { stopName: 'Updated' }); log(r, 'PUT', `/bus-stops/${bsid}`, 'Update'); }
    if (bsid) { r = await req('DELETE', `/bus-stops/${bsid}`); log(r, 'DELETE', `/bus-stops/${bsid}`, 'Delete'); }
  } else {
    console.log('  SKIP - no routeId');
  }

  // 10. TRIPS
  console.log('\n--- 10. TRIPS ---');
  if (busId && driverId && routeId && destId) {
    r = await req('POST', '/trips', { tripNumber: `TRIP-${Date.now()}`, busId, driverId, routeId, date: new Date().toISOString().split('T')[0], destinationId: destId, status: 'scheduled' });
    log(r, 'POST', '/trips', 'Create'); const trid = r.id;
    r = await req('GET', '/trips'); log(r, 'GET', '/trips', 'List');
    r = await req('GET', '/trips/today'); log(r, 'GET', '/trips/today', 'Today');
    r = await req('GET', '/trips/active'); log(r, 'GET', '/trips/active', 'Active');
    if (trid) { r = await req('PUT', `/trips/${trid}`, { notes: 'Updated' }); log(r, 'PUT', `/trips/${trid}`, 'Update'); }
    if (trid) { r = await req('POST', `/trips/${trid}/start`); log(r, 'POST', `/trips/${trid}/start`, 'Start'); }
    if (trid) { r = await req('POST', `/trips/${trid}/end`); log(r, 'POST', `/trips/${trid}/end`, 'End'); }
    if (trid) { r = await req('DELETE', `/trips/${trid}`); log(r, 'DELETE', `/trips/${trid}`, 'Delete'); }
  }

  // 11. ATTENDANCE
  console.log('\n--- 11. ATTENDANCE ---');
  r = await req('GET', '/attendance'); log(r, 'GET', '/attendance', 'List');
  r = await req('GET', '/attendance/today'); log(r, 'GET', '/attendance/today', 'Today');

  // 12. SUBSCRIPTIONS
  console.log('\n--- 12. SUBSCRIPTIONS ---');
  r = await req('GET', '/subscriptions'); log(r, 'GET', '/subscriptions', 'List');

  // 13. MAINTENANCE TYPES
  console.log('\n--- 13. MAINTENANCE TYPES ---');
  r = await req('POST', '/maintenance/types', { name: `MType-${Date.now()}`, nameAr: 'Test Type', description: 'Test', estimatedCost: 100, intervalDays: 30 });
  log(r, 'POST', '/maintenance/types', 'Create'); const mtid = r.id;
  r = await req('GET', '/maintenance/types'); log(r, 'GET', '/maintenance/types', 'List');
  if (mtid) { r = await req('PUT', `/maintenance/types/${mtid}`, { description: 'Updated' }); log(r, 'PUT', `/maintenance/types/${mtid}`, 'Update'); }
  if (mtid) { r = await req('DELETE', `/maintenance/types/${mtid}`); log(r, 'DELETE', `/maintenance/types/${mtid}`, 'Delete'); }

  // 14. MAINTENANCE
  console.log('\n--- 14. MAINTENANCE ---');
  if (busId && mtTypeId) {
    r = await req('POST', '/maintenance', { busId, maintenanceType: mtTypeId, description: 'Test maintenance', cost: 500, maintenanceDate: new Date().toISOString().split('T')[0], status: 'pending' });
    log(r, 'POST', '/maintenance', 'Create'); const mntid = r.id;
    r = await req('GET', '/maintenance'); log(r, 'GET', '/maintenance', 'List');
    if (mntid) { r = await req('PUT', `/maintenance/${mntid}`, { status: 'in_progress' }); log(r, 'PUT', `/maintenance/${mntid}`, 'Update'); }
    if (mntid) { r = await req('DELETE', `/maintenance/${mntid}`); log(r, 'DELETE', `/maintenance/${mntid}`, 'Delete'); }
  } else {
    console.log('  SKIP - no busId or mtTypeId');
  }

  // 15. FUEL
  console.log('\n--- 15. FUEL ---');
  if (busId && driverId) {
    r = await req('POST', '/fuel', { busId, driverId, liters: 50, price: 2.5, totalCost: 125, station: 'Aramco', odometer: 15000, date: new Date().toISOString().split('T')[0] });
    log(r, 'POST', '/fuel', 'Create'); const fid = r.id;
    r = await req('GET', '/fuel'); log(r, 'GET', '/fuel', 'List');
    r = await req('GET', '/fuel/statistics'); log(r, 'GET', '/fuel/statistics', 'Stats');
    if (fid) { r = await req('PUT', `/fuel/${fid}`, { liters: 60 }); log(r, 'PUT', `/fuel/${fid}`, 'Update'); }
    if (fid) { r = await req('DELETE', `/fuel/${fid}`); log(r, 'DELETE', `/fuel/${fid}`, 'Delete'); }
  } else {
    console.log('  SKIP - no busId/driverId');
  }

  // 16. NOTIFICATIONS
  console.log('\n--- 16. NOTIFICATIONS ---');
  r = await req('GET', '/notifications'); log(r, 'GET', '/notifications', 'List');
  r = await req('GET', '/notifications/unread-count'); log(r, 'GET', '/notifications/unread-count', 'Unread');
  r = await req('POST', '/notifications', { title: 'Test', body: 'Test notification', type: 'info', receiverType: 'all' });
  log(r, 'POST', '/notifications', 'Create'); const nid = r.id;
  if (nid) { r = await req('PATCH', `/notifications/${nid}/read`); log(r, 'PATCH', `/notifications/${nid}/read`, 'Mark Read'); }
  r = await req('PATCH', '/notifications/read-all'); log(r, 'PATCH', '/notifications/read-all', 'Read All');
  if (nid) { r = await req('DELETE', `/notifications/${nid}`); log(r, 'DELETE', `/notifications/${nid}`, 'Delete'); }

  // 17. REPORTS
  console.log('\n--- 17. REPORTS ---');
  for (const rpt of ['students', 'drivers', 'buses', 'attendance', 'subscriptions', 'maintenance', 'fuel', 'financial']) {
    r = await req('GET', `/reports/${rpt}`); log(r, 'GET', `/reports/${rpt}`, rpt);
  }

  // 18. SETTINGS
  console.log('\n--- 18. SETTINGS ---');
  r = await req('GET', '/settings'); log(r, 'GET', '/settings', 'Get');
  r = await req('PUT', '/settings', { systemName: 'SUTMS Updated' }); log(r, 'PUT', '/settings', 'Update');

  // 19. LOGS
  console.log('\n--- 19. LOGS ---');
  r = await req('GET', '/logs/activity'); log(r, 'GET', '/logs/activity', 'Activity');
  r = await req('GET', '/logs/audit'); log(r, 'GET', '/logs/audit', 'Audit');

  // 20. DASHBOARD
  console.log('\n--- 20. DASHBOARD ---');
  r = await req('GET', '/dashboard/stats'); log(r, 'GET', '/dashboard/stats', 'Stats');
  r = await req('GET', '/dashboard/charts'); log(r, 'GET', '/dashboard/charts', 'Charts');
  r = await req('GET', '/dashboard/today-trips'); log(r, 'GET', '/dashboard/today-trips', 'Today Trips');

  // 21. AUTH
  console.log('\n--- 21. AUTH ---');
  r = await req('GET', '/auth/profile'); log(r, 'GET', '/auth/profile', 'Get Profile');
  r = await req('PUT', '/auth/profile', { fullName: 'Super Admin' }); log(r, 'PUT', '/auth/profile', 'Update Profile');

  // 22. UPLOADS
  console.log('\n--- 22. UPLOADS ---');
  r = await req('GET', '/uploads'); log(r, 'GET', '/uploads', 'List');

  console.log('\n==================================');
  console.log(`TOTAL: ${total} | PASS: ${pass} | FAIL: ${fail}`);
  console.log('==================================');
  if (fail > 0) console.log('\x1b[31mSome tests failed!\x1b[0m');
  else console.log('\x1b[32mALL TESTS PASSED!\x1b[0m');
}

run();
