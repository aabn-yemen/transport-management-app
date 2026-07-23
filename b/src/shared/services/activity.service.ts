import { ActivityLog } from '../../features/logs/model/activityLog.model';
import { AuditLog } from '../../features/logs/model/auditLog.model';
import { logger } from '../../utils/logger';

export class ActivityService {
  async log(params: {
    userId?: string;
    fullName?: string;
    module: string;
    action: string;
    recordId?: string;
    description?: string;
    device?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      await ActivityLog.create({
        userId: params.userId,
        fullName: params.fullName || '',
        module: params.module,
        action: params.action,
        recordId: params.recordId,
        description: params.description || `${params.action} on ${params.module}`,
        device: params.device || '',
        ipAddress: params.ipAddress || '',
        userAgent: params.userAgent || '',
      });
    } catch (error) {
      logger.error('Failed to create activity log:', error);
    }
  }

  async audit(params: {
    collectionName: string;
    recordId: string;
    operation: 'create' | 'update' | 'delete' | 'restore';
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    userId?: string;
    ipAddress?: string;
    device?: string;
  }) {
    try {
      await AuditLog.create({
        collectionName: params.collectionName,
        recordId: params.recordId,
        operation: params.operation,
        oldData: params.oldData || {},
        newData: params.newData || {},
        userId: params.userId,
        ipAddress: params.ipAddress || '',
        device: params.device || '',
      });
    } catch (error) {
      logger.error('Failed to create audit log:', error);
    }
  }
}

export const activityService = new ActivityService();
