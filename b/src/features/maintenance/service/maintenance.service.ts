import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { Maintenance, IMaintenance } from '../model/maintenance.model';
import { Bus } from '../../buses/model/bus.model';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { activityService } from '../../../shared/services/activity.service';

const maintenanceRepo = createRepository<IMaintenance>(Maintenance);

export class MaintenanceService extends CrudService<IMaintenance> {
  constructor() {
    super(maintenanceRepo, 'maintenance');
  }

  async approve(id: string, userId?: string) {
    const record = await this.findById(id);
    if (record.status !== 'pending') throw new ValidationError([], 'يجب أن تكون طلبات الصيانة معلقة');
    const updated = await maintenanceRepo.update(id, { status: 'approved', approvedBy: userId as any } as any);
    await Bus.findByIdAndUpdate(record.busId, { status: 'maintenance' });
    await activityService.log({ userId, module: 'maintenance', action: 'approve', recordId: id });
    return updated;
  }

  async reject(id: string, userId?: string) {
    const record = await this.findById(id);
    if (record.status !== 'pending') throw new ValidationError([], 'يجب أن تكون طلبات الصيانة معلقة');
    const updated = await maintenanceRepo.update(id, { status: 'rejected' } as any);
    await activityService.log({ userId, module: 'maintenance', action: 'reject', recordId: id });
    return updated;
  }

  async start(id: string, userId?: string) {
    const record = await this.findById(id);
    if (record.status !== 'approved') throw new ValidationError([], 'يجب الموافقة على الصيانة أولاً');
    const updated = await maintenanceRepo.update(id, { status: 'in_progress' } as any);
    await activityService.log({ userId, module: 'maintenance', action: 'start', recordId: id });
    return updated;
  }

  async finish(id: string, userId?: string) {
    const record = await this.findById(id);
    if (record.status !== 'in_progress') throw new ValidationError([], 'يجب أن تكون الصيانة قيد التنفيذ');
    const updated = await maintenanceRepo.update(id, { status: 'completed', completedBy: userId as any } as any);
    await Bus.findByIdAndUpdate(record.busId, { status: 'active' });
    await activityService.log({ userId, module: 'maintenance', action: 'finish', recordId: id });
    return updated;
  }
}

export const maintenanceService = new MaintenanceService();
