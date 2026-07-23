import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { Bus, IBus } from '../model/bus.model';
import { Student } from '../../students/model/student.model';
import { NotFoundError } from '../../../utils/errors';

const busRepo = createRepository<IBus>(Bus);

export class BusService extends CrudService<IBus> {
  constructor() {
    super(busRepo, 'buses');
  }

  async updateLocation(id: string, latitude: number, longitude: number, speed: number) {
    const bus = await busRepo.update(id, { currentLatitude: latitude, currentLongitude: longitude, speed } as any);
    if (!bus) throw new NotFoundError('الحافلة غير موجودة');
    return bus;
  }

  async updateFuelLevel(id: string, fuelLevel: number) {
    return busRepo.update(id, { fuelLevel } as any);
  }

  async getStudents(id: string) {
    const students = await Student.find({ busId: id, isDeleted: { $ne: true } });
    return students;
  }
}

export const busService = new BusService();
