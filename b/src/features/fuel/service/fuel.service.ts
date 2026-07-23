import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { FuelLog, IFuelLog } from '../model/fuel.model';

export class FuelService extends CrudService<IFuelLog> {
  constructor() {
    super(createRepository<IFuelLog>(FuelLog), 'fuel');
  }

  async getStatistics(busId?: string) {
    const match: any = {};
    if (busId) match.busId = busId;

    const stats = await FuelLog.aggregate([
      { $match: match },
      { $group: { _id: null, totalLiters: { $sum: '$liters' }, totalCost: { $sum: '$totalCost' }, count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
    ]);
    return stats[0] || { totalLiters: 0, totalCost: 0, count: 0, avgPrice: 0 };
  }
}

export const fuelService = new FuelService();
