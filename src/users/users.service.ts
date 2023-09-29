import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { PickWithout } from '../utils/typescriptUtils';

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
    const entity = this.usersRepository.create(user);
    await this.usersRepository.insert(entity);
    return entity;
  }

  async updateUser(
    actingUser: User,
    id: number,
    updatesToMake: Partial<PickWithout<User, 'id'>>,
  ) {
    if (!actingUser.isAdmin) {
      if (actingUser.id !== id) {
        throw new UnauthorizedException(
          new Error('Only Admin can update profiles of others'),
        );
      }
      if (Object.prototype.hasOwnProperty.call(updatesToMake, 'isAdmin')) {
        throw new UnauthorizedException(
          'Only Admin can change the isAdmin property of a user',
        );
      }
    }

    const updateResult = await this.usersRepository.update(id, updatesToMake);
    if (updateResult.affected <= 0) throw new NotFoundException();
  }

  async getUser(id: number) {
    const user = await this.usersRepository.findOneBy({ id });
    return user;
  }

  async deleteUser(id: number) {
    const deleteResult = await this.usersRepository.delete(id);
    if (deleteResult.affected <= 0) throw new NotFoundException();
  }
}
