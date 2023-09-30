import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { PickWithout } from '../utils/typescriptUtils';
import { CreateUserDto } from 'src/auth/auth.types';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import env from '../env';

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

  async registerUser(createUserDto: CreateUserDto) {
    const password = createUserDto.password;
    const saltRounds = env.PASSWORD_SALT_ROUNDS;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const userToRegister = { ...createUserDto };
    delete (userToRegister as any).id;
    delete userToRegister.password;

    const newUserObject: PickWithout<User, 'id'> = {
      ...(userToRegister as PickWithout<CreateUserDto, 'password'>),
      passwordHash,
      latestAuthId: uuidv4(),
      isAdmin: false,
    };

    const registeredUser = await this.addOne(newUserObject);
    return registeredUser;
  }

  async listUsers(
    searchString?: string,
    isAdmin?: boolean,
    sortBy?: string,
    descending?: boolean,
  ): Promise<User[]> {
    const nothingOrIsAdminFilter = isAdmin === undefined ? {} : { isAdmin };
    const whereFilter =
      searchString === undefined
        ? { ...nothingOrIsAdminFilter }
        : [
            { fullName: Like(`%${searchString}%`), ...nothingOrIsAdminFilter },
            { username: Like(`%${searchString}%`), ...nothingOrIsAdminFilter },
            { address: Like(`%${searchString}%`), ...nothingOrIsAdminFilter },
            { email: Like(`%${searchString}%`), ...nothingOrIsAdminFilter },
            { phone: Like(`%${searchString}%`), ...nothingOrIsAdminFilter },
          ];

    const results = await this.usersRepository.find({
      where: whereFilter,
      order:
        sortBy === undefined
          ? undefined
          : { [sortBy]: descending ? 'DESC' : 'ASC' },
    });
    return results;
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
