import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/user.entity';
import { PickWithout } from '../utils/typescriptUtils';
import env from '../env';
import { CreateUserDto, JWTUserData } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async comparePasswordWithHash(password, passwordHash): Promise<boolean> {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, passwordHash, function (err, result) {
        if (err) reject(err);
        else resolve(result);
      });
    });
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

    const registeredUser = await this.usersService.addOne(newUserObject);
    return this.usersService.hidePrivateData(registeredUser);
  }

  getOwnProfile(user: User) {
    return this.usersService.hidePrivateData(user);
  }

  async signIn(username, password) {
    const user = await this.usersService.findOne({ username });

    const passwordsMatch = await this.comparePasswordWithHash(
      password,
      user.passwordHash,
    );
    if (!passwordsMatch) {
      throw new UnauthorizedException();
    }

    const userData: JWTUserData = {
      id: user.id,
      username: user.username,
      latestAuthId: user.latestAuthId,
      timestamp: Date.now(),
    };
    const payload = {
      sub: JSON.stringify(userData),
      username: user.username,
    };

    return { access_token: await this.jwtService.signAsync(payload) };
  }

  async invalidateAllExistingTokens(profile: JWTUserData) {
    await this.usersService.updateUser(profile.id, { latestAuthId: uuidv4() });
  }

  async findUser(id: number): Promise<User> {
    return await this.usersService.findOne({ id });
  }
}
