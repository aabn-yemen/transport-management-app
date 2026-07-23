import bcrypt from 'bcryptjs';
import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { Driver, IDriver } from '../model/driver.model';
import { Bus } from '../../buses/model/bus.model';
import { Trip } from '../../trips/model/trip.model';
import { User } from '../../users/model/user.model';
import { Role } from '../../roles/model/role.model';
import { ConflictError, ValidationError, NotFoundError } from '../../../utils/errors';
import { activityService } from '../../../shared/services/activity.service';

const driverRepo = createRepository<IDriver>(Driver);

export class DriverService extends CrudService<IDriver> {
  constructor() {
    super(driverRepo, 'drivers');
  }

  async create(data: Partial<IDriver>, userId?: string) {
    const existingPhone = await Driver.findOne({ phone: data.phone, isDeleted: { $ne: true } });
    if (existingPhone) throw new ConflictError('رقم الهاتف موجود بالفعل');

    const existingNationalId = await Driver.findOne({ nationalId: data.nationalId, isDeleted: { $ne: true } });
    if (existingNationalId) throw new ConflictError('رقم الهوية موجود بالفعل');

    const doc = await super.create(data, userId);

    const driverRole = await Role.findOne({ slug: 'driver' });
    if (driverRole) {
      const hashedPassword = await bcrypt.hash(data.phone || '123456', 10);
      await User.create({
        fullName: data.fullName,
        username: data.driverNumber,
        email: `${data.driverNumber}@driver.university.edu`,
        phone: data.phone,
        password: hashedPassword,
        roleId: driverRole._id,
        role: 'driver',
        status: 'active',
      });
    }

    return doc;
  }

  async assignBus(driverId: string, busId: string, userId?: string) {
    const driver = await Driver.findById(driverId);
    if (!driver) throw new NotFoundError('السائق غير موجود');

    const bus = await Bus.findById(busId);
    if (!bus) throw new NotFoundError('الحافلة غير موجودة');

    const existingDriverOnBus = await Driver.findOne({ busId, _id: { $ne: driverId }, isDeleted: { $ne: true } });
    if (existingDriverOnBus) throw new ValidationError([], 'الحافلة لها سائق بالفعل');

    if (driver.busId) {
      await Bus.findByIdAndUpdate(driver.busId, { driverId: null });
    }

    driver.busId = bus._id as any;
    await driver.save();

    bus.driverId = driver._id as any;
    await bus.save();

    await activityService.log({
      userId,
      module: 'drivers',
      action: 'assign_bus',
      recordId: driverId,
      description: `Driver ${driver.fullName} assigned to bus ${bus.busNumber}`,
    });

    return driver;
  }

  async removeBus(driverId: string, userId?: string) {
    const driver = await Driver.findById(driverId);
    if (!driver) throw new NotFoundError('السائق غير موجود');

    if (driver.busId) {
      await Bus.findByIdAndUpdate(driver.busId, { driverId: null });
      driver.busId = null as any;
      await driver.save();
    }

    await activityService.log({
      userId,
      module: 'drivers',
      action: 'remove_bus',
      recordId: driverId,
    });

    return driver;
  }

  async getMe(userId: string) {
    const driver = await Driver.findOne({ userId, isDeleted: { $ne: true } } as any)
      .populate('busId')
      .exec();
    if (!driver) throw new NotFoundError('السائق غير موجود');
    return driver;
  }

  async getMyTrips(userId: string, status?: string) {
    const driver = await Driver.findOne({ userId, isDeleted: { $ne: true } } as any);
    if (!driver) throw new NotFoundError('السائق غير موجود');

    const filter: Record<string, any> = { driverId: driver._id };
    if (status) filter.status = status;

    const trips = await Trip.find(filter)
      .populate('busId', 'busNumber busType capacity')
      .populate('routeId', 'routeName routeCode')
      .populate('destinationId', 'name nameAr')
      .sort({ date: -1, createdAt: -1 })
      .exec();

    return { data: trips, total: trips.length };
  }

  async getMyActiveTrip(userId: string) {
    const driver = await Driver.findOne({ userId, isDeleted: { $ne: true } } as any);
    if (!driver) throw new NotFoundError('السائق غير موجود');

    const trip = await Trip.findOne({ driverId: driver._id, status: 'in_progress' })
      .populate('busId', 'busNumber busType capacity plateNumber')
      .populate('routeId', 'routeName routeCode')
      .populate('destinationId', 'name nameAr')
      .populate('studentIds', 'fullName studentNumber')
      .exec();

    return trip;
  }
}

export const driverService = new DriverService();
