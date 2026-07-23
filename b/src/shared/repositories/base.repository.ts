import { Model, FilterQuery, UpdateQuery, QueryOptions, Types, PipelineStage } from 'mongoose';
import { IBaseDocument, IQueryOptions, IPagination } from '../interfaces/base.interface';

export abstract class BaseRepository<T extends IBaseDocument> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findAll(queryOptions: IQueryOptions = {}): Promise<{ data: T[]; pagination: IPagination }> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      filters = {},
      includeDeleted = false,
    } = queryOptions;

    const filter: Record<string, any> = { ...filters };

    if (!includeDeleted) {
      filter.isDeleted = { $ne: true };
    }

    if (search) {
      const allSearchFields = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { studentNumber: { $regex: search, $options: 'i' } },
        { busNumber: { $regex: search, $options: 'i' } },
        { plateNumber: { $regex: search, $options: 'i' } },
        { driverNumber: { $regex: search, $options: 'i' } },
        { routeName: { $regex: search, $options: 'i' } },
        { routeCode: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
      filter.$or = allSearchFields.filter(f => {
        const field = Object.keys(f)[0];
        return (this.model.schema as any).path(field) !== undefined;
      });
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj: Record<string, 1 | -1> = { [sort]: sortOrder };

    const [data, totalItems] = await Promise.all([
      this.model.find(filter as FilterQuery<T>).sort(sortObj).skip(skip).limit(limit).exec(),
      this.model.countDocuments(filter as FilterQuery<T>),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      pagination: { page, limit, totalPages, totalItems },
    };
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findOne({ _id: id, isDeleted: { $ne: true } } as FilterQuery<T>).exec();
  }

  async findOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOne({ ...filter, isDeleted: { $ne: true } } as FilterQuery<T>).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async update(id: string, data: UpdateQuery<T>, options: QueryOptions = {}): Promise<T | null> {
    return this.model
      .findOneAndUpdate({ _id: id, isDeleted: { $ne: true } } as FilterQuery<T>, data, {
        new: true,
        runValidators: true,
        ...options,
      })
      .exec();
  }

  async softDelete(id: string, deletedBy?: string): Promise<T | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, isDeleted: { $ne: true } } as FilterQuery<T>,
        { isDeleted: true, deletedAt: new Date(), deletedBy: deletedBy ? new Types.ObjectId(deletedBy) : undefined } as any,
        { new: true }
      )
      .exec();
  }

  async restore(id: string): Promise<T | null> {
    const result = await this.model.collection.findOneAndUpdate(
      { _id: new Types.ObjectId(id), isDeleted: true },
      { $set: { isDeleted: false, deletedAt: null, deletedBy: null } },
      { returnDocument: 'after' }
    );
    return result as unknown as T | null;
  }

  async hardDelete(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments({ ...filter, isDeleted: { $ne: true } } as FilterQuery<T>);
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments({ ...filter, isDeleted: { $ne: true } } as FilterQuery<T>);
    return count > 0;
  }

  async aggregate(pipeline: PipelineStage[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }

  async insertMany(data: Partial<T>[]): Promise<T[]> {
    return this.model.insertMany(data) as any;
  }

  async bulkWrite(operations: any[]): Promise<any> {
    return this.model.bulkWrite(operations);
  }
}
