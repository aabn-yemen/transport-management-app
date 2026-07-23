import { IBaseDocument, IQueryOptions } from '../interfaces/base.interface';
import { BaseRepository } from '../repositories/base.repository';
import { activityService } from './activity.service';
import { NotFoundError } from '../../utils/errors';

export class CrudService<T extends IBaseDocument> {
  protected repository: BaseRepository<T>;
  protected moduleName: string;

  constructor(repository: BaseRepository<T>, moduleName: string) {
    this.repository = repository;
    this.moduleName = moduleName;
  }

  async findAll(queryOptions: IQueryOptions = {}) {
    return this.repository.findAll(queryOptions);
  }

  async findById(id: string) {
    const doc = await this.repository.findById(id);
    if (!doc) throw new NotFoundError(`${this.moduleName} not found`);
    return doc;
  }

  async create(data: Partial<T>, userId?: string) {
    if (userId) {
      (data as any).createdBy = userId;
    }
    const doc = await this.repository.create(data);
    await activityService.log({
      userId,
      module: this.moduleName,
      action: 'create',
      recordId: doc._id?.toString(),
      description: `Created ${this.moduleName}`,
    });
    return doc;
  }

  async update(id: string, data: Partial<T>, userId?: string) {
    const oldDoc = await this.repository.findById(id);
    if (!oldDoc) throw new NotFoundError(`${this.moduleName} not found`);

    if (userId) {
      (data as any).updatedBy = userId;
    }
    const doc = await this.repository.update(id, data as any);
    if (!doc) throw new NotFoundError(`${this.moduleName} not found`);

    await activityService.log({
      userId,
      module: this.moduleName,
      action: 'update',
      recordId: id,
      description: `Updated ${this.moduleName}`,
    });

    await activityService.audit({
      collectionName: this.moduleName,
      recordId: id,
      operation: 'update',
      oldData: oldDoc.toObject() as any,
      newData: doc.toObject() as any,
      userId,
    });

    return doc;
  }

  async delete(id: string, userId?: string) {
    const doc = await this.repository.findById(id);
    if (!doc) throw new NotFoundError(`${this.moduleName} not found`);

    await this.repository.softDelete(id, userId);

    await activityService.log({
      userId,
      module: this.moduleName,
      action: 'delete',
      recordId: id,
      description: `Deleted ${this.moduleName}`,
    });

    await activityService.audit({
      collectionName: this.moduleName,
      recordId: id,
      operation: 'delete',
      oldData: doc.toObject() as any,
      userId,
    });
  }

  async restore(id: string, userId?: string) {
    const doc = await this.repository.restore(id);
    if (!doc) throw new NotFoundError(`${this.moduleName} not found`);

    await activityService.log({
      userId,
      module: this.moduleName,
      action: 'restore',
      recordId: id,
      description: `Restored ${this.moduleName}`,
    });

    return doc;
  }
}
