import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { PickWithout } from '../utils/typescript';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(where: FindOptionsWhere<User>): Promise<User | undefined> {
    return this.usersRepository.findOne({ where });
  }

  async addOne(user: PickWithout<User, 'id'>): Promise<User | undefined> {
    return this.usersRepository.create(user);
  }

  async updateUser(
    id: number,
    updatesToMake: Partial<PickWithout<User, 'id'>>,
  ): Promise<{ success: boolean }> {
    if (Object.prototype.hasOwnProperty.call(updatesToMake, 'isAdmin')) {
      const user = await this.findOne({ id });
      if (!user.isAdmin)
        throw new UnauthorizedException(
          'Only Admin can change the isAdmin property of a user',
        );
    }
    const updateResult = await this.usersRepository.update(id, updatesToMake);
    if (updateResult.affected <= 0) throw new NotFoundException();
    return { success: true };
  }

  async deleteUser(id: number): Promise<{ success: boolean }> {
    const deleteResult = await this.usersRepository.delete(id);
    if (deleteResult.affected <= 0) throw new NotFoundException();
    return { success: true };
  }
}
