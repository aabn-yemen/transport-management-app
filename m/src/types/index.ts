export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  roleId: string | { id: string; name: string; nameAr: string };
  permissions: string[];
  avatar: string;
  language: string;
  theme: string;
  status?: string;
}

export interface Student {
  id: string;
  studentNumber: string;
  universityId: string;
  firstName: string;
  secondName?: string;
  thirdName?: string;
  lastName: string;
  fullName: string;
  gender: 'male' | 'female';
  college: string;
  department: string;
  academicLevel: string;
  phone: string;
  guardianPhone?: string;
  address?: string;
  busId?: { id: string; busNumber: string } | string;
  routeId?: { id: string; routeName: string; routeCode: string } | string;
  destinationId?: { id: string; destinationName: string } | string;
  subscriptionId?: string;
  qrCode?: string;
  photo?: string;
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  notes?: string;
}

export interface Driver {
  id: string;
  driverNumber: string;
  fullName: string;
  phone: string;
  nationalId: string;
  licenseNumber: string;
  licenseExpiry: string;
  address?: string;
  photo?: string;
  busId?: { id: string; busNumber: string } | string;
  employmentDate: string;
  salary: number;
  status: 'active' | 'inactive' | 'suspended' | 'resigned';
  rating: number;
  notes?: string;
}

export interface Bus {
  id: string;
  busNumber: string;
  plateNumber: string;
  vin?: string;
  brand: string;
  modelName: string;
  year: number;
  capacity: number;
  currentStudents: number;
  driverId?: { id: string; fullName: string } | string;
  routeId?: { id: string; routeName: string } | string;
  destinationId?: { id: string; destinationName: string } | string;
  status: 'active' | 'inactive' | 'maintenance' | 'out_of_service';
  fuelLevel?: number;
  odometer?: number;
}

export interface BusRoute {
  id: string;
  routeName: string;
  routeCode: string;
  distance?: number;
  estimatedTime?: number;
  destinationId?: { id: string; destinationName: string } | string;
  stops?: any[];
}

export interface Trip {
  id: string;
  tripNumber: string;
  busId?: { id: string; busNumber: string } | string;
  driverId?: { id: string; fullName: string } | string;
  routeId?: { id: string; routeName: string; routeCode: string } | string;
  destinationId?: { id: string; destinationName: string } | string;
  studentIds?: string[];
  studentCount?: number;
  date: string;
  startTime?: string;
  endTime?: string;
  status: 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled' | 'emergency';
  delayMinutes?: number;
}

export interface Attendance {
  id: string;
  studentId?: { id: string; fullName: string } | string;
  tripId?: { id: string; tripNumber: string } | string;
  tripDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInMethod?: string;
  checkOutMethod?: string;
  status: 'present' | 'absent' | 'late' | 'excused';
}

export interface Subscription {
  id: string;
  studentId?: { id: string; fullName: string } | string;
  busId?: { id: string; busNumber: string } | string;
  startDate: string;
  endDate: string;
  amount: number;
  discount?: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partial' | 'refunded' | 'cancelled';
  status: 'active' | 'expired' | 'suspended' | 'cancelled';
}

export interface Maintenance {
  id: string;
  busId?: { id: string; busNumber: string } | string;
  maintenanceTypeId?: { id: string; name: string; nameAr: string } | string;
  description?: string;
  scheduledDate: string;
  completedDate?: string;
  estimatedCost?: number;
  actualCost?: number;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
}

export interface Notification {
  id: string;
  title?: string;
  titleAr?: string;
  body?: string;
  bodyAr?: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'alert';
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface Settings {
  systemName?: string;
  universityName?: string;
  academicYear?: string;
  semester?: string;
  supportEmail?: string;
  supportPhone?: string;
  defaultLanguage?: string;
  defaultTheme?: string;
}

export interface DashboardStats {
  totalStudents?: number;
  totalDrivers?: number;
  totalBuses?: number;
  activeTrips?: number;
  totalRoutes?: number;
  totalSubscriptions?: number;
  totalAttendance?: number;
}
