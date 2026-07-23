import { CrudService } from '../../../shared/services/crud.service';
import { createRepository } from '../../../shared/repositories/factory';
import { Notification, INotification } from '../model/notification.model';

export class NotificationService extends CrudService<INotification> {
  constructor() {
    super(createRepository<INotification>(Notification), 'notifications');
  }

  async getUserNotifications(userId: string, queryOptions: any = {}) {
    return this.findAll({
      ...queryOptions,
      filters: {
        $or: [
          { receiverType: 'all' },
          { receiverId: userId },
          { receiverType: 'user', receiverId: userId },
        ],
      },
    } as any);
  }

  async markAsRead(id: string) {
    return createRepository<INotification>(Notification).update(id, { isRead: true, readAt: new Date() } as any);
  }

  async markAllAsRead(userId: string) {
    await Notification.updateMany(
      { $or: [{ receiverType: 'all' }, { receiverId: userId }], isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async getUnreadCount(userId: string) {
    return Notification.countDocuments({
      $or: [{ receiverType: 'all' }, { receiverId: userId }],
      isRead: false,
    });
  }
}

export const notificationService = new NotificationService();
