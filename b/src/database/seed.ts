import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../config';
import { Role } from '../features/roles/model/role.model';
import { Permission } from '../features/permissions/model/permission.model';
import { User } from '../features/users/model/user.model';
import { Student } from '../features/students/model/student.model';
import { Driver } from '../features/drivers/model/driver.model';
import { Bus } from '../features/buses/model/bus.model';
import { Destination } from '../features/destinations/model/destination.model';
import { Route } from '../features/routes/model/route.model';
import { BusStop } from '../features/routes/model/busStop.model';
import { MaintenanceType } from '../features/maintenance/model/maintenanceType.model';
import { Setting } from '../features/settings/model/setting.model';
import { Trip } from '../features/trips/model/trip.model';
import { Attendance } from '../features/attendance/model/attendance.model';
import { StudentSubscription } from '../features/subscriptions/model/subscription.model';
import { FuelLog } from '../features/fuel/model/fuel.model';
import { Notification } from '../features/notifications/model/notification.model';

const modules = [
  'auth', 'dashboard', 'users', 'roles', 'permissions', 'students', 'drivers',
  'buses', 'routes', 'destinations', 'trips', 'attendance', 'subscriptions',
  'payments', 'maintenance', 'fuel', 'notifications', 'reports', 'settings',
  'profile', 'logs', 'uploads',
];

const actions = ['view', 'create', 'update', 'delete', 'restore', 'export', 'print', 'approve', 'reject', 'assign', 'manage'];

const rolesData = [
  { name: 'Super Admin', nameAr: 'مدير النظام', slug: 'super_admin', description: 'Full system access', isSystem: true },
  { name: 'Admin', nameAr: 'مدير', slug: 'admin', description: 'Administrative access', isSystem: true },
  { name: 'Transport Manager', nameAr: 'مدير النقل', slug: 'transport_manager', description: 'Transport management access', isSystem: false },
  { name: 'Dispatcher', nameAr: 'مراقب', slug: 'dispatcher', description: 'Trip monitoring access', isSystem: false },
  { name: 'Driver', nameAr: 'سائق', slug: 'driver', description: 'Driver mobile access', isSystem: true },
  { name: 'Student', nameAr: 'طالب', slug: 'student', description: 'Student mobile access', isSystem: true },
  { name: 'Parent', nameAr: 'ولي أمر', slug: 'parent', description: 'Parent mobile access', isSystem: true },
];

async function seed(): Promise<void> {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('جاري الاتصال بقاعدة البيانات للإدخار...');

    await Promise.all([
      Role.deleteMany({}),
      Permission.deleteMany({}),
      User.deleteMany({}),
      Student.deleteMany({}),
      Driver.deleteMany({}),
      Bus.deleteMany({}),
      Destination.deleteMany({}),
      Route.deleteMany({}),
      BusStop.deleteMany({}),
      MaintenanceType.deleteMany({}),
      Setting.deleteMany({}),
      Trip.deleteMany({}),
      Attendance.deleteMany({}),
      StudentSubscription.deleteMany({}),
      FuelLog.deleteMany({}),
      Notification.deleteMany({}),
    ]);
    console.log('تم حذف البيانات القديمة');

    const permissions: any[] = [];
    for (const mod of modules) {
      for (const action of actions) {
        permissions.push({
          name: `${mod}.${action}`,
          nameAr: `${action} ${mod}`,
          module: mod,
          slug: `${mod}_${action}`,
          actions: [action],
        });
      }
    }
    const createdPermissions = await Permission.insertMany(permissions);
    console.log(`تم إنشاء ${createdPermissions.length} صلاحية`);

    const roles = await Role.insertMany(rolesData);
    console.log(`تم إنشاء ${roles.length} أدوار`);

    const superAdminRole = roles.find(r => r.slug === 'super_admin')!;
    const adminRole = roles.find(r => r.slug === 'admin')!;
    const driverRole = roles.find(r => r.slug === 'driver')!;
    const studentRole = roles.find(r => r.slug === 'student')!;
    const parentRole = roles.find(r => r.slug === 'parent')!;

    const allPermissionNames = createdPermissions.map(p => p.name);
    const studentPermissions = ['dashboard.view', 'students.view', 'trips.view', 'attendance.view', 'subscriptions.view', 'notifications.view', 'notifications.create', 'buses.view', 'routes.view'];
    const driverPermissions = ['dashboard.view', 'trips.view', 'trips.update', 'attendance.view', 'attendance.create', 'students.view', 'buses.view', 'routes.view', 'notifications.view', 'notifications.create'];
    const parentPermissions = ['dashboard.view', 'students.view', 'trips.view', 'attendance.view', 'subscriptions.view', 'notifications.view', 'buses.view', 'routes.view'];

    await Role.findByIdAndUpdate(superAdminRole._id, { permissions: allPermissionNames });
    await Role.findByIdAndUpdate(adminRole._id, { permissions: allPermissionNames });
    await Role.findByIdAndUpdate(driverRole._id, { permissions: driverPermissions });
    await Role.findByIdAndUpdate(studentRole._id, { permissions: studentPermissions });
    await Role.findByIdAndUpdate(parentRole._id, { permissions: parentPermissions });

    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = await User.insertMany([
      {
        fullName: 'مدير النظام', username: 'superadmin', email: 'superadmin@university.edu',
        phone: '0500000001', password: hashedPassword, roleId: superAdminRole._id,
        role: 'super_admin', permissions: allPermissionNames, status: 'active', language: 'ar',
      },
      {
        fullName: 'مدير التطبيق', username: 'admin', email: 'admin@university.edu',
        phone: '0500000002', password: hashedPassword, roleId: adminRole._id,
        role: 'admin', permissions: allPermissionNames, status: 'active', language: 'ar',
      },
    ]);
    console.log(`تم إنشاء ${users.length} مستخدم`);

    const destinations = await Destination.insertMany([
      { destinationName: 'الحرم الجامعي الرئيسي', city: 'تعز', description: 'الحرم الجامعي الرئيسي لجامعة إقليم سبأ' },
      { destinationName: 'المدينة الطبية', city: 'تعز', description: 'المجمع الطبي الجامعي' },
      { destinationName: 'سكن الطلاب', city: 'تعز', description: 'المباني السكنية للطلاب' },
      { destinationName: 'كلية الهندسة', city: 'تعز', description: 'كلية الهندسة والتقنية' },
      { destinationName: 'كلية الآداب', city: 'تعز', description: 'كلية الآداب والعلوم الإنسانية' },
    ]);
    console.log(`تم إنشاء ${destinations.length} وجهات`);

    const buses = await Bus.insertMany([
      { busNumber: 'BUS-001', plateNumber: '1234 س ي', brand: 'Toyota', modelName: 'Coaster', year: 2023, capacity: 30, status: 'active' },
      { busNumber: 'BUS-002', plateNumber: '5678 د ع', brand: 'Mercedes', modelName: 'Sprinter', year: 2024, capacity: 20, status: 'active' },
      { busNumber: 'BUS-003', plateNumber: '9012 ه و', brand: 'Toyota', modelName: 'Hiace', year: 2023, capacity: 15, status: 'active' },
      { busNumber: 'BUS-004', plateNumber: '3456 ك م', brand: 'Nissan', modelName: 'Civilian', year: 2022, capacity: 30, status: 'maintenance' },
      { busNumber: 'BUS-005', plateNumber: '7890 ن ب', brand: 'Hyundai', modelName: 'County', year: 2024, capacity: 25, status: 'active' },
    ]);
    console.log(`تم إنشاء ${buses.length} حافلات`);

    const drivers = await Driver.insertMany([
      {
        driverNumber: 'DRV-001', fullName: 'أحمد محمد العلي', phone: '0551234567',
        nationalId: '1010000001', licenseNumber: 'LIC-001',
        licenseExpiry: new Date('2026-12-31'), address: 'تعز، شارع الستين',
        busId: buses[0]._id, employmentDate: new Date('2023-01-01'), salary: 5000, status: 'active',
      },
      {
        driverNumber: 'DRV-002', fullName: 'خالد علي الحجري', phone: '0559876543',
        nationalId: '1010000002', licenseNumber: 'LIC-002',
        licenseExpiry: new Date('2025-06-30'), address: 'تعز، حي السلام',
        busId: buses[1]._id, employmentDate: new Date('2023-03-15'), salary: 4500, status: 'active',
      },
      {
        driverNumber: 'DRV-003', fullName: 'فهد عمر المقطري', phone: '0555551234',
        nationalId: '1010000003', licenseNumber: 'LIC-003',
        licenseExpiry: new Date('2026-09-30'), address: 'تعز، شارع جمال',
        busId: buses[2]._id, employmentDate: new Date('2024-01-10'), salary: 4800, status: 'active',
      },
      {
        driverNumber: 'DRV-004', fullName: 'سعيد حسين الشميري', phone: '0553334444',
        nationalId: '1010000004', licenseNumber: 'LIC-004',
        licenseExpiry: new Date('2027-03-15'), address: 'تعز، المعافر',
        busId: buses[4]._id, employmentDate: new Date('2024-06-01'), salary: 4700, status: 'active',
      },
    ]);
    console.log(`تم إنشاء ${drivers.length} سائقين`);

    await Bus.findByIdAndUpdate(buses[0]._id, { driverId: drivers[0]._id });
    await Bus.findByIdAndUpdate(buses[1]._id, { driverId: drivers[1]._id });
    await Bus.findByIdAndUpdate(buses[2]._id, { driverId: drivers[2]._id });
    await Bus.findByIdAndUpdate(buses[4]._id, { driverId: drivers[3]._id });

    const routeDocs = await Route.insertMany([
      { routeName: 'خط الحرم الجامعي', routeCode: 'RTE-001', distance: 15.5, estimatedTime: 35, destinationId: destinations[0]._id },
      { routeName: 'خط المدينة الطبية', routeCode: 'RTE-002', distance: 12.0, estimatedTime: 25, destinationId: destinations[1]._id },
      { routeName: 'خط سكن الطلاب', routeCode: 'RTE-003', distance: 8.5, estimatedTime: 20, destinationId: destinations[2]._id },
      { routeName: 'خط كلية الهندسة', routeCode: 'RTE-004', distance: 10.0, estimatedTime: 22, destinationId: destinations[3]._id },
      { routeName: 'خط كلية الآداب', routeCode: 'RTE-005', distance: 7.5, estimatedTime: 18, destinationId: destinations[4]._id },
    ]);
    console.log(`تم إنشاء ${routeDocs.length} مسارات`);

    await Bus.findByIdAndUpdate(buses[0]._id, { routeId: routeDocs[0]._id, destinationId: destinations[0]._id });
    await Bus.findByIdAndUpdate(buses[1]._id, { routeId: routeDocs[1]._id, destinationId: destinations[1]._id });
    await Bus.findByIdAndUpdate(buses[2]._id, { routeId: routeDocs[2]._id, destinationId: destinations[2]._id });
    await Bus.findByIdAndUpdate(buses[4]._id, { routeId: routeDocs[3]._id, destinationId: destinations[3]._id });

    const busStops = await BusStop.insertMany([
      { stopName: 'البوابة الرئيسية', latitude: 13.5784, longitude: 44.0219, order: 1, routeId: routeDocs[0]._id },
      { stopName: 'كلية الهندسة', latitude: 13.5820, longitude: 44.0250, order: 2, routeId: routeDocs[0]._id },
      { stopName: 'كلية العلوم', latitude: 13.5850, longitude: 44.0280, order: 3, routeId: routeDocs[0]._id },
      { stopName: 'المبنى الإداري', latitude: 13.5750, longitude: 44.0200, order: 1, routeId: routeDocs[1]._id },
      { stopName: 'الكلية الطبية', latitude: 13.5700, longitude: 44.0180, order: 2, routeId: routeDocs[1]._id },
      { stopName: 'بوابة السكن', latitude: 13.5900, longitude: 44.0300, order: 1, routeId: routeDocs[2]._id },
      { stopName: 'المبنى أ', latitude: 13.5920, longitude: 44.0320, order: 2, routeId: routeDocs[2]._id },
    ]);
    console.log(`تم إنشاء ${busStops.length} محطات`);

    await Route.findByIdAndUpdate(routeDocs[0]._id, { stops: [busStops[0]._id, busStops[1]._id, busStops[2]._id] });
    await Route.findByIdAndUpdate(routeDocs[1]._id, { stops: [busStops[3]._id, busStops[4]._id] });
    await Route.findByIdAndUpdate(routeDocs[2]._id, { stops: [busStops[5]._id, busStops[6]._id] });

    const students = await Student.insertMany([
      {
        studentNumber: 'STU-2024-001', universityId: '2024001', firstName: 'عمر', lastName: 'السعود',
        fullName: 'عمر السعود', gender: 'male', college: 'الهندسة', department: 'هندسة الحاسب',
        academicLevel: 'السنة الثالثة', phone: '0561234567', guardianPhone: '0551234567',
        address: 'تعز، حي السلام', busId: buses[0]._id, routeId: routeDocs[0]._id,
        destinationId: destinations[0]._id, status: 'active', isLocal: true,
      },
      {
        studentNumber: 'STU-2024-002', universityId: '2024002', firstName: 'سارة', lastName: 'القحطاني',
        fullName: 'سارة القحطاني', gender: 'female', college: 'العلوم', department: 'الأحياء',
        academicLevel: 'السنة الثانية', phone: '0569876543', guardianPhone: '0559876543',
        address: 'تعز، شارع الستين', busId: buses[0]._id, routeId: routeDocs[0]._id,
        destinationId: destinations[0]._id, status: 'active', isLocal: true,
      },
      {
        studentNumber: 'STU-2024-003', universityId: '2024003', firstName: 'محمد', lastName: 'الحربي',
        fullName: 'محمد الحربي', gender: 'male', college: 'الطب', department: 'الطب العام',
        academicLevel: 'السنة الرابعة', phone: '0565551234', guardianPhone: '0555551234',
        address: 'تعز، المعافر', busId: buses[1]._id, routeId: routeDocs[1]._id,
        destinationId: destinations[1]._id, status: 'active', isLocal: true,
      },
      {
        studentNumber: 'STU-2024-004', universityId: '2024004', firstName: 'نورة', lastName: 'المطيري',
        fullName: 'نورة المطيري', gender: 'female', college: 'الهندسة', department: 'هندسة المدنية',
        academicLevel: 'السنة الثالثة', phone: '0563334444', guardianPhone: '0553334444',
        address: 'تعز، جولак', busId: buses[2]._id, routeId: routeDocs[2]._id,
        destinationId: destinations[2]._id, status: 'active', isLocal: true,
      },
      {
        studentNumber: 'STU-2024-005', universityId: '2024005', firstName: 'عبدالله', lastName: 'النعيمي',
        fullName: 'عبدالله النعيمي', gender: 'male', college: 'الآداب', department: 'اللغة العربية',
        academicLevel: 'السنة الأولى', phone: '0562223333', guardianPhone: '0552223333',
        address: 'تعز، صبر', busId: buses[4]._id, routeId: routeDocs[3]._id,
        destinationId: destinations[3]._id, status: 'active', isLocal: true,
      },
      {
        studentNumber: 'STU-2024-006', universityId: '2024006', firstName: 'فاطمة', lastName: 'الرشدي',
        fullName: 'فاطمة الرشدي', gender: 'female', college: 'العلوم', department: 'الفيزياء',
        academicLevel: 'السنة الثانية', phone: '0567778888', guardianPhone: '0557778888',
        address: 'تعز، الكدسة', busId: buses[4]._id, routeId: routeDocs[3]._id,
        destinationId: destinations[3]._id, status: 'active', isLocal: true,
      },
      {
        studentNumber: 'STU-2024-007', universityId: '2024007', firstName: 'يوسف', lastName: 'العمري',
        fullName: 'يوسف العمري', gender: 'male', college: 'الهندسة', department: 'هندسة الكهرباء',
        academicLevel: 'السنة الرابعة', phone: '0561112222', guardianPhone: '0551112222',
        address: 'تعز، المخا', busId: buses[0]._id, routeId: routeDocs[0]._id,
        destinationId: destinations[0]._id, status: 'active', isLocal: true,
      },
      {
        studentNumber: 'STU-2024-008', universityId: '2024008', firstName: 'ريم', lastName: 'الهاشمي',
        fullName: 'ريم الهاشمي', gender: 'female', college: 'الطب', department: 'التمريض',
        academicLevel: 'السنة الثالثة', phone: '0566665555', guardianPhone: '0556665555',
        address: 'تعز، جبل حضار', busId: buses[1]._id, routeId: routeDocs[1]._id,
        destinationId: destinations[1]._id, status: 'active', isLocal: true,
      },
    ]);
    console.log(`تم إنشاء ${students.length} طلاب`);

    const maintenanceTypes = await MaintenanceType.insertMany([
      { name: 'Oil Change', nameAr: 'تغيير زيت', description: 'تغيير زيت دوري', estimatedCost: 300, intervalDays: 90, status: 'active' },
      { name: 'Tire Replacement', nameAr: 'استبدال إطارات', description: 'استبدال الإطارات', estimatedCost: 2000, intervalDays: 365, status: 'active' },
      { name: 'Brake Service', nameAr: 'صيانة الفرامل', description: 'فحص وإصلاح الفرامل', estimatedCost: 800, intervalDays: 180, status: 'active' },
      { name: 'AC Service', nameAr: 'صيانة التكييف', description: 'صيانة نظام التكييف', estimatedCost: 500, intervalDays: 180, status: 'active' },
      { name: 'Engine Repair', nameAr: 'إصلاح المحرّك', description: 'إصلاح وصيانة المحرّك', estimatedCost: 3000, intervalDays: 365, status: 'active' },
    ]);
    console.log(`تم إنشاء ${maintenanceTypes.length} أنواع صيانة`);

    const today = new Date();
    const startTime1 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 6, 30);
    const startTime2 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 0);
    const startTime3 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 30);
    const startTime4 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0);
    const endTime1 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 7, 15);

    const trips = await Trip.insertMany([
      {
        tripNumber: 'TRP-001', busId: buses[0]._id, driverId: drivers[0]._id,
        routeId: routeDocs[0]._id, destinationId: destinations[0]._id,
        studentIds: [students[0]._id, students[1]._id, students[6]._id],
        date: today, startTime: startTime1, endTime: endTime1, status: 'completed',
      },
      {
        tripNumber: 'TRP-002', busId: buses[1]._id, driverId: drivers[1]._id,
        routeId: routeDocs[1]._id, destinationId: destinations[1]._id,
        studentIds: [students[2]._id, students[7]._id],
        date: today, startTime: startTime2, status: 'in_progress',
      },
      {
        tripNumber: 'TRP-003', busId: buses[2]._id, driverId: drivers[2]._id,
        routeId: routeDocs[2]._id, destinationId: destinations[2]._id,
        studentIds: [students[3]._id],
        date: today, startTime: startTime3, status: 'scheduled',
      },
      {
        tripNumber: 'TRP-004', busId: buses[4]._id, driverId: drivers[3]._id,
        routeId: routeDocs[3]._id, destinationId: destinations[3]._id,
        studentIds: [students[4]._id, students[5]._id],
        date: today, startTime: startTime4, status: 'scheduled',
      },
    ]);
    console.log(`تم إنشاء ${trips.length} رحلات`);

    const attendances = await Attendance.insertMany([
      { studentId: students[0]._id, tripId: trips[0]._id, tripDate: new Date(), checkInTime: new Date(), checkInMethod: 'qr', status: 'present' },
      { studentId: students[1]._id, tripId: trips[0]._id, tripDate: new Date(), checkInTime: new Date(), checkInMethod: 'qr', status: 'present' },
      { studentId: students[6]._id, tripId: trips[0]._id, tripDate: new Date(), checkInTime: new Date(), checkInMethod: 'manual', status: 'late' },
      { studentId: students[2]._id, tripId: trips[1]._id, tripDate: new Date(), checkInTime: new Date(), checkInMethod: 'qr', status: 'present' },
    ]);
    console.log(`تم إنشاء ${attendances.length} سجلات حضور`);

    const subscriptions = await StudentSubscription.insertMany([
      {
        studentId: students[0]._id, busId: buses[0]._id,
        startDate: new Date('2024-09-01'), endDate: new Date('2025-06-30'),
        amount: 2000, totalAmount: 2000, paymentStatus: 'paid', status: 'active',
      },
      {
        studentId: students[1]._id, busId: buses[0]._id,
        startDate: new Date('2024-09-01'), endDate: new Date('2025-06-30'),
        amount: 2000, discount: 200, totalAmount: 1800, paymentStatus: 'paid', status: 'active',
      },
      {
        studentId: students[2]._id, busId: buses[1]._id,
        startDate: new Date('2024-09-01'), endDate: new Date('2025-06-30'),
        amount: 1800, totalAmount: 1800, paymentStatus: 'paid', status: 'active',
      },
      {
        studentId: students[3]._id, busId: buses[2]._id,
        startDate: new Date('2024-09-01'), endDate: new Date('2025-01-31'),
        amount: 1500, totalAmount: 1500, paymentStatus: 'paid', status: 'expired',
      },
      {
        studentId: students[4]._id, busId: buses[4]._id,
        startDate: new Date('2025-01-01'), endDate: new Date('2025-06-30'),
        amount: 1600, totalAmount: 1600, paymentStatus: 'pending', status: 'active',
      },
    ]);
    console.log(`تم إنشاء ${subscriptions.length} اشتراكات`);

    const fuelLogs = await FuelLog.insertMany([
      {
        busId: buses[0]._id, driverId: drivers[0]._id,
        liters: 60, price: 150, totalCost: 150, station: 'محطة الوقود الرئيسية',
        odometer: 45000, date: new Date('2025-01-10'),
      },
      {
        busId: buses[1]._id, driverId: drivers[1]._id,
        liters: 45, price: 112.5, totalCost: 112.5, station: 'محطة الوقود الشرقية',
        odometer: 32000, date: new Date('2025-01-12'),
      },
      {
        busId: buses[2]._id, driverId: drivers[2]._id,
        liters: 35, price: 87.5, totalCost: 87.5, station: 'محطة الوقود الرئيسية',
        odometer: 28000, date: new Date('2025-01-14'),
      },
    ]);
    console.log(`تم إنشاء ${fuelLogs.length} سجلات وقود`);

    const notificationData = await Notification.insertMany([
      {
        title: 'تنبيه الصيانة', titleAr: 'تنبيه صيانة الحافلة',
        body: 'Bus BUS-004 requires maintenance', bodyAr: 'الحافلة BUS-004 تحتاج إلى صيانة',
        type: 'warning', receiverType: 'all',
      },
      {
        title: 'رحلة جديدة', titleAr: 'تم إنشاء رحلة جديدة',
        body: 'New trip TRP-004 scheduled', bodyAr: 'تم جدولة رحلة جديدة TRP-004',
        type: 'info', receiverType: 'all',
      },
      {
        title: 'اشتراك منتهي', titleAr: 'انتهت صلاحية الاشتراك',
        body: 'Student subscription expired', bodyAr: 'انتهت صلاحية اشتراك الطالب',
        type: 'alert', receiverType: 'all',
      },
    ]);
    console.log(`تم إنشاء ${notificationData.length} إشعارات`);

    await Setting.create({
      systemName: 'Smart University Transportation Management System',
      systemNameAr: 'نظام إدارة النقل الجامعي الذكي',
      universityName: 'University of Saba Region',
      universityNameAr: 'جامعة إقليم سبأ',
      supportEmail: 'support@saba-university.edu',
      supportPhone: '0112345678',
      academicYear: '2024-2025',
      semester: 'الفصل الأول',
      defaultLanguage: 'ar',
      defaultTheme: 'light',
    });
    console.log('تم إنشاء إعدادات النظام');

    console.log('\n========================================');
    console.log('  تم إنشاء البيانات بنجاح');
    console.log('========================================');
    console.log('  مدير النظام: superadmin / 123456');
    console.log('  مدير التطبيق: admin / 123456');
    console.log('========================================\n');
  } catch (error) {
    console.error('خطأ في الإدخار:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
