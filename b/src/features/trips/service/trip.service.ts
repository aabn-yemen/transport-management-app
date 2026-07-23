import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { Trip, ITrip } from '../model/trip.model';
import { Bus } from '../../buses/model/bus.model';
import { Driver } from '../../drivers/model/driver.model';
import { Attendance } from '../../attendance/model/attendance.model';
import { Student } from '../../students/model/student.model';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { activityService } from '../../../shared/services/activity.service';

const tripRepo = createRepository<ITrip>(Trip);

export class TripService extends CrudService<ITrip> {
  constructor() {
    super(tripRepo, 'trips');
  }

  async startTrip(id: string, userId?: string) {
    const trip = await tripRepo.findById(id);
    if (!trip) throw new NotFoundError('الرحلة غير موجودة');
    if (trip.status !== 'scheduled') throw new ValidationError([], 'يجب أن تكون الرحلة مجدولة للبدء');

    const bus = await Bus.findById(trip.busId);
    if (!bus || bus.status === 'maintenance' || bus.status === 'out_of_service') {
      throw new ValidationError([], 'الحافلة غير متاحة للرحلة');
    }

    const driver = await Driver.findById(trip.driverId);
    if (!driver || driver.status !== 'active') {
      throw new ValidationError([], 'السائق غير متاح');
    }

    const activeTrip = await Trip.findOne({ busId: trip.busId, status: 'in_progress', _id: { $ne: id } });
    if (activeTrip) throw new ValidationError([], 'الحافلة لها رحلة نشطة بالفعل');

    trip.status = 'in_progress';
    trip.startTime = new Date();
    await trip.save();

    await activityService.log({
      userId, module: 'trips', action: 'start', recordId: id,
      description: `Trip ${trip.tripNumber} started`,
    });

    return trip;
  }

  async endTrip(id: string, userId?: string) {
    const trip = await tripRepo.findById(id);
    if (!trip) throw new NotFoundError('الرحلة غير موجودة');
    if (trip.status !== 'in_progress' && trip.status !== 'paused') {
      throw new ValidationError([], 'يجب أن تكون الرحلة قيد التنفيذ أو متوقفة للإنهاء');
    }

    trip.status = 'completed';
    trip.endTime = new Date();
    await trip.save();

    await activityService.log({
      userId, module: 'trips', action: 'finish', recordId: id,
      description: `Trip ${trip.tripNumber} completed`,
    });

    return trip;
  }

  async assignStudents(id: string, studentIds: string[], userId?: string) {
    const trip = await tripRepo.findById(id);
    if (!trip) throw new NotFoundError('الرحلة غير موجودة');

    const bus = await Bus.findById(trip.busId);
    if (!bus) throw new NotFoundError('الحافلة غير موجودة');

    if (studentIds.length > bus.capacity) {
      throw new ValidationError([], `سعة الحافلة ${bus.capacity}. لا يمكن تعيين ${studentIds.length} طالب`);
    }

    trip.studentIds = studentIds as any;
    await trip.save();

    await activityService.log({
      userId, module: 'trips', action: 'assign', recordId: id,
      description: `Assigned ${studentIds.length} students to trip ${trip.tripNumber}`,
    });

    return trip;
  }

  async getTodayTrips() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data } = await tripRepo.findAll({
      filters: { date: { $gte: today, $lt: tomorrow } },
      limit: 100,
    } as any);
    return data;
  }

  async getActiveTrips() {
    const { data } = await tripRepo.findAll({
      filters: { status: 'in_progress' },
      limit: 100,
    } as any);
    return data;
  }
}

export const tripService = new TripService();
