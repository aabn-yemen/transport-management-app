import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { StudentSubscription, IStudentSubscription } from '../model/subscription.model';
import { Setting } from '../../settings/model/setting.model';
import { NotFoundError, ValidationError } from '../../../utils/errors';
import { activityService } from '../../../shared/services/activity.service';

const subRepo = createRepository<IStudentSubscription>(StudentSubscription);

export class SubscriptionService extends CrudService<IStudentSubscription> {
  constructor() {
    super(subRepo, 'subscriptions');
  }

  async create(data: Partial<IStudentSubscription>, userId?: string) {
    const activeSub = await StudentSubscription.findOne({ studentId: data.studentId, status: 'active' });
    if (activeSub) {
      const settings = await Setting.findOne();
      if (!settings?.subscriptionSettings?.allowEarlyRenewal) {
        throw new ValidationError([], 'الطالب لديه اشتراك نشط بالفعل. التجديد المبكر غير مسموح.');
      }
      const daysDiff = Math.ceil((activeSub.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysDiff > (settings?.subscriptionSettings?.earlyRenewalDays || 30)) {
        throw new ValidationError([], `لا يمكن تجديد الاشتراك إلا خلال ${settings?.subscriptionSettings?.earlyRenewalDays || 30} يوم من انتهاء الصلاحية`);
      }
    }

    return super.create(data, userId);
  }

  async renew(id: string, startDate: Date, endDate: Date, amount: number, userId?: string) {
    const sub = await subRepo.findById(id);
    if (!sub) throw new NotFoundError('الاشتراك غير موجود');

    sub.status = 'expired';
    await sub.save();

    const newSub = await subRepo.create({
      studentId: sub.studentId,
      busId: sub.busId,
      startDate,
      endDate,
      amount,
      discount: 0,
      totalAmount: amount,
      status: 'active',
    } as any);

    await activityService.log({
      userId, module: 'subscriptions', action: 'create', recordId: newSub._id?.toString(),
      description: 'تم تجديد الاشتراك',
    });

    return newSub;
  }

  async suspend(id: string, userId?: string) {
    const sub = await this.update(id, { status: 'suspended' } as any, userId);
    return sub;
  }

  async cancel(id: string, userId?: string) {
    const sub = await this.update(id, { status: 'cancelled' } as any, userId);
    return sub;
  }

  async getByStudent(studentId: string) {
    const { data } = await subRepo.findAll({ filters: { studentId }, limit: 50 } as any);
    return data;
  }

  async getExpiringSoon(days: number = 7) {
    const future = new Date();
    future.setDate(future.getDate() + days);
    return subRepo.findAll({ filters: { status: 'active', endDate: { $lte: future } }, limit: 100 } as any);
  }
}

export const subscriptionService = new SubscriptionService();
