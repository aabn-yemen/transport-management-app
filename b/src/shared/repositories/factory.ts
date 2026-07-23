import { Model } from 'mongoose';
import { BaseRepository } from './base.repository';
import { IBaseDocument } from '../interfaces/base.interface';

export function createRepository<T extends IBaseDocument>(model: Model<T>): BaseRepository<T> {
  return new (class extends BaseRepository<T> {
    constructor() { super(model); }
  })();
}
