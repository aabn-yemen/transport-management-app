import { Student } from '../../students/model/student.model';
import { Driver } from '../../drivers/model/driver.model';
import { Bus } from '../../buses/model/bus.model';
import { Trip } from '../../trips/model/trip.model';
import { Attendance } from '../../attendance/model/attendance.model';
import { StudentSubscription } from '../../subscriptions/model/subscription.model';
import { Maintenance } from '../../maintenance/model/maintenance.model';
import { Route } from '../../routes/model/route.model';

export class DashboardService {
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalStudents, totalDrivers, totalBuses, activeTrips, todayAttendance, activeSubscriptions, pendingMaintenance, totalRoutes] = await Promise.all([
      Student.countDocuments({ isDeleted: { $ne: true }, status: 'active' }),
      Driver.countDocuments({ isDeleted: { $ne: true }, status: 'active' }),
      Bus.countDocuments({ isDeleted: { $ne: true }, status: 'active' }),
      Trip.countDocuments({ status: 'in_progress' }),
      Attendance.countDocuments({ tripDate: { $gte: today, $lt: tomorrow } }),
      StudentSubscription.countDocuments({ status: 'active' }),
      Maintenance.countDocuments({ status: 'pending' }),
      Route.countDocuments({ isDeleted: { $ne: true }, status: 'active' }),
    ]);

    return {
      totalStudents, totalDrivers, totalBuses, activeTrips, todayAttendance,
      activeSubscriptions, pendingMaintenance, totalRoutes,
    };
  }

  async getCharts() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weeklyAttendance = await Attendance.aggregate([
      { $match: { tripDate: { $gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$tripDate' } }, count: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }, absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);

    return { weeklyAttendance };
  }

  async getTodayTrips() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Trip.find({ date: { $gte: today, $lt: tomorrow } }).populate(['busId', 'driverId', 'routeId']).sort({ startTime: -1 });
  }
}

export const dashboardService = new DashboardService();
