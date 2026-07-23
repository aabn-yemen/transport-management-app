import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../../config';
import { User, IUser } from '../../users/model/user.model';
import { Role } from '../../roles/model/role.model';
import { Student } from '../../students/model/student.model';
import { ActivityLog } from '../../logs/model/activityLog.model';
import { UnauthorizedError, NotFoundError, ConflictError } from '../../../utils/errors';
import { IJwtPayload } from '../../../shared/interfaces/base.interface';

export class AuthService {
  async register(data: { fullName: string; username?: string; email: string; phone: string; password: string; role?: string; studentNumber?: string; universityId?: string; college?: string; department?: string; academicLevel?: string; gender?: string; address?: string; guardianPhone?: string }) {
    const roleSlug = data.role || 'student';
    const autoUsername = data.username || (data.studentNumber ? data.studentNumber.toLowerCase() : data.email.split('@')[0]);

    const existingUsername = await User.findOne({ username: autoUsername.toLowerCase() });
    if (existingUsername) throw new ConflictError('اسم المستخدم موجود بالفعل');

    const existingEmail = await User.findOne({ email: data.email.toLowerCase() });
    if (existingEmail) throw new ConflictError('البريد الإلكتروني موجود بالفعل');

    if (data.studentNumber) {
      const existingStudent = await Student.findOne({ studentNumber: data.studentNumber, isDeleted: { $ne: true } } as any);
      if (existingStudent) throw new ConflictError('رقم الطالب مسجل بالفعل');
    }

    let role = await Role.findOne({ slug: roleSlug });
    if (!role) role = await Role.findOne({ slug: 'student' });
    if (!role) throw new NotFoundError('الدور غير موجود');

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      fullName: data.fullName,
      username: autoUsername.toLowerCase(),
      email: data.email.toLowerCase(),
      phone: data.phone,
      password: hashedPassword,
      roleId: role._id,
      role: roleSlug,
      permissions: role.permissions,
      status: 'active',
      language: 'ar',
    });

    if (roleSlug === 'student' && data.studentNumber) {
      await Student.create({
        studentNumber: data.studentNumber,
        universityId: data.universityId || data.studentNumber,
        firstName: data.fullName.split(' ')[0] || data.fullName,
        secondName: data.fullName.split(' ')[1] || '',
        thirdName: data.fullName.split(' ')[2] || '',
        lastName: data.fullName.split(' ').slice(-1)[0] || data.fullName,
        fullName: data.fullName,
        gender: data.gender || 'male',
        college: data.college || 'غير محدد',
        department: data.department || 'غير محدد',
        academicLevel: data.academicLevel || 'غير محدد',
        phone: data.phone,
        guardianPhone: data.guardianPhone || '',
        address: data.address || '',
        userId: user._id,
        status: 'active',
      });
    }

    const token = this.generateToken(user._id.toString(), role._id.toString(), role.permissions);
    const refreshToken = this.generateRefreshToken(user._id.toString());

    await ActivityLog.create({
      userId: user._id,
      fullName: user.fullName,
      module: 'auth',
      action: 'register',
      description: `User ${user.fullName} registered as ${roleSlug}`,
    });

    return {
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: roleSlug,
        roleId: role._id.toString(),
        permissions: role.permissions,
        avatar: user.avatar,
        language: user.language,
        theme: user.theme,
      },
      token,
      refreshToken,
    };
  }

  async login(username: string, password: string, device: string = '', ipAddress: string = '', userAgent: string = '') {
    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
    if (!user) {
      throw new UnauthorizedError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedError('الحساب غير نشط. يرجى التواصل مع المسؤول.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }

    const role = await Role.findById(user.roleId);
    const permissions = role?.permissions || user.permissions;
    const roleIdStr = user.roleId?.toString() || '';

    const token = this.generateToken(user._id.toString(), roleIdStr, permissions);
    const refreshToken = this.generateRefreshToken(user._id.toString());

    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    await ActivityLog.create({
      userId: user._id,
      fullName: user.fullName,
      module: 'auth',
      action: 'login',
      description: `User ${user.fullName} logged in`,
      device,
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roleId: roleIdStr,
        permissions,
        avatar: user.avatar,
        language: user.language,
        theme: user.theme,
      },
      token,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, config.jwt.refreshSecret) as IJwtPayload;
      const user = await User.findById(decoded.userId);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedError('رمز التحديث غير صالح');
      }

      const role = await Role.findById(user.roleId);
      const permissions = role?.permissions || user.permissions;
      const newToken = this.generateToken(user._id.toString(), user.roleId.toString(), permissions);
      const newRefreshToken = this.generateRefreshToken(user._id.toString());

      return { token: newToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('رمز التحديث غير صالح أو منتهي الصلاحية');
    }
  }

  async logout(userId: string, device: string = '', ipAddress: string = '') {
    const user = await User.findById(userId);
    if (user) {
      await User.findByIdAndUpdate(userId, { deviceToken: '' });
      await ActivityLog.create({
        userId,
        fullName: user.fullName,
        module: 'auth',
        action: 'logout',
        description: `User ${user.fullName} logged out`,
        device,
        ipAddress,
      });
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw new NotFoundError('المستخدم غير موجود');

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new UnauthorizedError('كلمة المرور الحالية غير صحيحة');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    await ActivityLog.create({
      userId,
      fullName: user.fullName,
      module: 'auth',
      action: 'change_password',
      description: `User ${user.fullName} changed password`,
    });
  }

  async getProfile(userId: string) {
    const user = await User.findById(userId).populate('roleId');
    if (!user) throw new NotFoundError('المستخدم غير موجود');
    return user;
  }

  async updateProfile(userId: string, data: Partial<IUser>) {
    const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true });
    if (!user) throw new NotFoundError('المستخدم غير موجود');

    await ActivityLog.create({
      userId,
      fullName: user.fullName,
      module: 'auth',
      action: 'update_profile',
      description: `User ${user.fullName} updated profile`,
    });

    return user;
  }

  private generateToken(userId: string, roleId: string, permissions: string[]): string {
    return jwt.sign({ userId, roleId, permissions }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as any,
    });
  }
}

export const authService = new AuthService();
