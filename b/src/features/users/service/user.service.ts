import bcrypt from 'bcryptjs';
import { CrudService } from '../../../shared/services/crud.service';
import { userRepository } from '../repository/user.repository';
import { IUser } from '../model/user.model';
import { Role } from '../../roles/model/role.model';
import { ConflictError } from '../../../utils/errors';

export class UserService extends CrudService<IUser> {
  constructor() {
    super(userRepository, 'users');
  }

  async create(data: Partial<IUser>, userId?: string) {
    const existingUsername = await userRepository.findByUsername(data.username!);
    if (existingUsername) throw new ConflictError('اسم المستخدم موجود بالفعل');

    const existingEmail = await userRepository.findByEmail(data.email!);
    if (existingEmail) throw new ConflictError('البريد الإلكتروني موجود بالفعل');

    const hashedPassword = await bcrypt.hash(data.password!, 10);
    data.password = hashedPassword;

    if (data.roleId && !data.role) {
      const role = await Role.findById(data.roleId);
      if (role) data.role = role.slug;
    }

    return super.create(data, userId);
  }

  async update(id: string, data: Partial<IUser>, userId?: string) {
    if (data.roleId && !data.role) {
      const role = await Role.findById(data.roleId);
      if (role) data.role = role.slug;
    }
    return super.update(id, data, userId);
  }

  async findByUsername(username: string) {
    return userRepository.findByUsername(username);
  }
}

export const userService = new UserService();
