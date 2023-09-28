import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/user.entity';
import { PickWithout } from 'src/utils/typescript';
import env from '../env';

export type JWTUserData = {
  id: number;
  username: string;
  latestAuthId: string;
};

export type UserToRegister = Pick<User, 'username' | 'email'> & {
  password: string;
} & Partial<PickWithout<User, 'id' | 'usernanme' | 'passwordHash'>>;

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

  async registerUser(userToRegister: UserToRegister) {
    const password = userToRegister.password;
    const passwordHash = await bcrypt.hash(password, env.PASSWORD_SALT_ROUNDS);

    delete userToRegister.password;
    const newUserObject: PickWithout<User, 'id'> = {
      ...(userToRegister as PickWithout<UserToRegister, 'password'>),
      passwordHash,
      latestAuthId: uuidv4(),
    };

    return await this.usersService.addOne(newUserObject);
  }

  async signIn(username, password) {
    const user = await this.usersService.findOne({ username });

    const passwordsMatch = this.comparePasswordWithHash(
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
