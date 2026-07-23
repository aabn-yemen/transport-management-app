import { BaseRepository } from '../../../shared/repositories/base.repository';
import { Student, IStudent } from '../model/student.model';

export class StudentRepository extends BaseRepository<IStudent> {
  constructor() {
    super(Student);
  }

  async findByStudentNumber(studentNumber: string): Promise<IStudent | null> {
    return this.findOne({ studentNumber } as any);
  }

  async findByUniversityId(universityId: string): Promise<IStudent | null> {
    return this.findOne({ universityId } as any);
  }

  async findByBusId(busId: string): Promise<IStudent[]> {
    const { data } = await this.findAll({ filters: { busId } } as any);
    return data;
  }

  async countByBusId(busId: string): Promise<number> {
    return this.count({ busId } as any);
  }

  async findByUserId(userId: string): Promise<IStudent | null> {
    return Student.findOne({ userId, isDeleted: { $ne: true } } as any)
      .populate('busId')
      .populate('routeId')
      .populate('destinationId')
      .populate('subscriptionId')
      .exec();
  }
}

export const studentRepository = new StudentRepository();
