import { CrudService } from '../../../shared/services/crud.service';
import { studentRepository } from '../repository/student.repository';
import { Student, IStudent } from '../model/student.model';
import { Bus } from '../../buses/model/bus.model';
import { Trip } from '../../trips/model/trip.model';
import { Attendance } from '../../attendance/model/attendance.model';
import { ConflictError, ValidationError, NotFoundError } from '../../../utils/errors';
import { activityService } from '../../../shared/services/activity.service';
import QRCode from 'qrcode';

export class StudentService extends CrudService<IStudent> {
  constructor() {
    super(studentRepository, 'students');
  }

  async create(data: Partial<IStudent>, userId?: string) {
    const existingStudentNumber = await studentRepository.findByStudentNumber(data.studentNumber!);
    if (existingStudentNumber) throw new ConflictError('رقم الطالب موجود بالفعل');

    const existingUniversityId = await studentRepository.findByUniversityId(data.universityId!);
    if (existingUniversityId) throw new ConflictError('الرقم الجامعي موجود بالفعل');

    if (data.busId) {
      const bus = await Bus.findById(data.busId);
      if (!bus) throw new NotFoundError('الحافلة غير موجودة');
      if (bus.status === 'maintenance' || bus.status === 'out_of_service') {
        throw new ValidationError([{ message: 'الحافلة غير متاحة' }], 'الحافلة غير متاحة');
      }
      if (bus.currentStudents >= bus.capacity) {
        throw new ValidationError([{ message: 'الحافلة ممتلئة' }], 'الحافلة ممتلئة');
      }
    }

    const doc = await super.create(data, userId);

    if (doc.busId) {
      await Bus.findByIdAndUpdate(doc.busId, { $inc: { currentStudents: 1 } });
    }

    try {
      const qrData = JSON.stringify({
        id: doc._id!.toString(),
        studentNumber: doc.studentNumber,
        universityId: doc.universityId,
        fullName: doc.fullName,
      });
      const qrCode = await QRCode.toDataURL(qrData);
      await Student.findByIdAndUpdate(doc._id, { qrCode });
      doc.qrCode = qrCode;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }

    return doc;
  }

  async update(id: string, data: Partial<IStudent>, userId?: string) {
    const oldStudent = await studentRepository.findById(id);
    if (!oldStudent) throw new NotFoundError('الطالب غير موجود');

    if (data.studentNumber && data.studentNumber !== oldStudent.studentNumber) {
      const existing = await studentRepository.findByStudentNumber(data.studentNumber);
      if (existing) throw new ConflictError('رقم الطالب موجود بالفعل');
    }

    const doc = await super.update(id, data, userId);

    if (data.busId && data.busId.toString() !== oldStudent.busId?.toString()) {
      if (oldStudent.busId) {
        await Bus.findByIdAndUpdate(oldStudent.busId, { $inc: { currentStudents: -1 } });
      }
      const bus = await Bus.findById(data.busId);
      if (bus && bus.currentStudents < bus.capacity) {
        await Bus.findByIdAndUpdate(data.busId, { $inc: { currentStudents: 1 } });
      }
    }

    return doc;
  }

  async delete(id: string, userId?: string) {
    const student = await studentRepository.findById(id);
    if (!student) throw new NotFoundError('الطالب غير موجود');

    if (student.busId) {
      await Bus.findByIdAndUpdate(student.busId, { $inc: { currentStudents: -1 } });
    }

    return super.delete(id, userId);
  }

  async search(query: string, queryOptions: any = {}) {
    return studentRepository.findAll({
      ...queryOptions,
      search: query,
      filters: {
        $or: [
          { fullName: { $regex: query, $options: 'i' } },
          { studentNumber: { $regex: query, $options: 'i' } },
          { universityId: { $regex: query, $options: 'i' } },
          { phone: { $regex: query, $options: 'i' } },
          { college: { $regex: query, $options: 'i' } },
        ],
      },
    } as any);
  }

  async getMe(userId: string) {
    const student = await studentRepository.findByUserId(userId);
    if (!student) throw new NotFoundError('الطالب غير موجود');
    return student;
  }

  async generateQR(id: string) {
    const student = await studentRepository.findById(id);
    if (!student) throw new NotFoundError('الطالب غير موجود');

    const qrData = JSON.stringify({
      id: student._id!.toString(),
      studentNumber: student.studentNumber,
      universityId: student.universityId,
      fullName: student.fullName,
    });

    const qrCode = await QRCode.toDataURL(qrData);
    await Student.findByIdAndUpdate(id, { qrCode });

    await activityService.log({
      userId: undefined,
      module: 'students',
      action: 'generate_qr',
      recordId: id,
    });

    return { qrCode };
  }

  async getMyAttendance(userId: string) {
    const student = await Student.findOne({ userId, isDeleted: { $ne: true } } as any);
    if (!student) throw new NotFoundError('الطالب غير موجود');

    const records = await Attendance.find({ studentId: student._id })
      .populate('tripId', 'tripNumber date routeId')
      .sort({ createdAt: -1 })
      .exec();

    return { data: records, total: records.length };
  }

  async getMyTrips(userId: string) {
    const student = await Student.findOne({ userId, isDeleted: { $ne: true } } as any);
    if (!student) throw new NotFoundError('الطالب غير موجود');

    if (!student.busId) return { data: [], total: 0 };

    const trips = await Trip.find({ busId: student.busId })
      .populate('driverId', 'fullName driverNumber')
      .populate('routeId', 'routeName routeCode')
      .sort({ date: -1 })
      .exec();

    return { data: trips, total: trips.length };
  }
}

export const studentService = new StudentService();
