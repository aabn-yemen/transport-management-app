import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { Attendance, IAttendance } from '../model/attendance.model';
import { Student } from '../../students/model/student.model';
import { Trip } from '../../trips/model/trip.model';
import { StudentSubscription } from '../../subscriptions/model/subscription.model';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { activityService } from '../../../shared/services/activity.service';

const attendanceRepo = createRepository<IAttendance>(Attendance);

export class AttendanceService extends CrudService<IAttendance> {
  constructor() {
    super(attendanceRepo, 'attendance');
  }

  async checkIn(studentId: string, tripId: string, method: 'qr' | 'manual' | 'gps' = 'manual', latitude = 0, longitude = 0, userId?: string) {
    const student = await Student.findById(studentId);
    if (!student) throw new NotFoundError('الطالب غير موجود');
    if (student.status !== 'active') throw new ValidationError([], 'الطالب غير نشط');

    const trip = await Trip.findById(tripId);
    if (!trip) throw new NotFoundError('الرحلة غير موجودة');
    if (trip.status !== 'in_progress') throw new ValidationError([], 'الرحلة ليست قيد التنفيذ');

    const subscription = await StudentSubscription.findOne({ studentId, status: 'active' });
    if (!subscription) throw new ValidationError([], 'الطالب ليس لديه اشتراك نشط');

    const existingAttendance = await Attendance.findOne({ studentId, tripId, checkInTime: { $ne: null } });
    if (existingAttendance) throw new ValidationError([], 'الطالب سجل حضوره بالفعل لهذه الرحلة');

    const attendance = await attendanceRepo.create({
      studentId: studentId as any,
      tripId: tripId as any,
      tripDate: trip.date,
      checkInTime: new Date(),
      checkInMethod: method,
      status: 'present',
      checkInLatitude: latitude,
      checkInLongitude: longitude,
    } as any);

    await activityService.log({
      userId, module: 'attendance', action: 'checkin', recordId: attendance._id?.toString(),
      description: `Student ${student.fullName} checked in`,
    });

    return attendance;
  }

  async checkOut(studentId: string, tripId: string, method: 'qr' | 'manual' | 'gps' = 'manual', latitude = 0, longitude = 0, userId?: string) {
    const attendance = await Attendance.findOne({ studentId, tripId, checkInTime: { $ne: null }, checkOutTime: null });
    if (!attendance) throw new ValidationError([], 'الطالب لم يسجل حضوره أو سجل انصرافه بالفعل');

    attendance.checkOutTime = new Date();
    attendance.checkOutMethod = method;
    attendance.checkOutLatitude = latitude;
    attendance.checkOutLongitude = longitude;
    await attendance.save();

    const student = await Student.findById(studentId);
    await activityService.log({
      userId, module: 'attendance', action: 'checkout', recordId: attendance._id?.toString(),
      description: `Student ${student?.fullName} checked out`,
    });

    return attendance;
  }

  async getAttendanceByTrip(tripId: string) {
    const { data } = await attendanceRepo.findAll({ filters: { tripId }, limit: 200 } as any);
    return data;
  }

  async getAttendanceByStudent(studentId: string, queryOptions: any = {}) {
    return attendanceRepo.findAll({ ...queryOptions, filters: { ...queryOptions.filters, studentId } } as any);
  }

  async getTodayAttendance() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return attendanceRepo.findAll({ filters: { tripDate: { $gte: today } }, limit: 500 } as any);
  }
}

export const attendanceService = new AttendanceService();
