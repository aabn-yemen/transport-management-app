import { BaseRepository } from '../../../shared/repositories/base.repository';
import { User, IUser } from '../model/user.model';

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return this.findOne({ username: username.toLowerCase() } as any);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() } as any);
  }
}

export const userRepository = new UserRepository();
