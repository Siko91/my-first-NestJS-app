import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../users/user.entity';
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
    return await this.usersService.registerUser(createUserDto);
  }

  getOwnProfile(user: User) {
    return user;
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

  async invalidateAllExistingTokens(profile: User) {
    await this.usersService.updateUser(profile, profile.id, {
      latestAuthId: uuidv4(),
    });
    return { success: true };
  }

  async findUser(id: number): Promise<User> {
    return await this.usersService.findOne({ id });
  }
}
