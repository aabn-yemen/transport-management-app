import { Document, Schema } from 'mongoose';

export interface IBaseEntity {
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: Schema.Types.ObjectId | null;
  updatedBy?: Schema.Types.ObjectId | null;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  deletedBy?: Schema.Types.ObjectId | null;
}

export interface IBaseDocument extends Document, IBaseEntity {}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: IPagination;
  meta?: Record<string, unknown>;
  errors?: unknown[];
}

export interface IPagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

export interface IQueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
  includeDeleted?: boolean;
}

export interface IJwtPayload {
  userId: string;
  roleId: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

export interface IAuthRequest {
  userId: string;
  roleId: string;
  permissions: string[];
}

export type EntityStatus = 'active' | 'inactive' | 'suspended' | 'deleted';
export type Gender = 'male' | 'female';
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded' | 'cancelled';
export type SubscriptionStatus = 'active' | 'expired' | 'suspended' | 'cancelled';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type CheckMethod = 'qr' | 'manual' | 'gps' | 'nfc';
export type TripStatus = 'scheduled' | 'in_progress' | 'paused' | 'completed' | 'cancelled' | 'emergency';
export type MaintenanceStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
export type NotificationType = 'info' | 'warning' | 'success' | 'error' | 'alert';
export type NotificationReceiverType = 'all' | 'role' | 'user' | 'driver' | 'student' | 'parent';
export type LogAction = 'create' | 'update' | 'delete' | 'restore' | 'view' | 'search' | 'export' | 'print' | 'login' | 'logout' | 'approve' | 'reject' | 'assign' | 'start' | 'finish' | 'pause' | 'resume' | 'checkin' | 'checkout';
