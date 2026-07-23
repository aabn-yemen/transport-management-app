import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { MaintenanceType, IMaintenanceType } from '../model/maintenanceType.model';

const maintenanceTypeRepo = createRepository<IMaintenanceType>(MaintenanceType);

export class MaintenanceTypeService extends CrudService<IMaintenanceType> {
  constructor() {
    super(maintenanceTypeRepo, 'maintenanceTypes');
  }
}

export const maintenanceTypeService = new MaintenanceTypeService();
