import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import env from '../env';
import { User } from '../users/user.entity';
import { JWTUserData } from './auth.types';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    public usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const user = await this.validateToken(token);
    request['user'] = user;
    return true;
  }

  async validateToken(token: string): Promise<User> {
    if (!token) throw new UnauthorizedException();
    const payload = await this.parseToken(token);
    const user = await this.usersService.findOne({ id: payload.id });
    if (!user)
      throw new NotFoundException(`User ${JSON.stringify(payload)} not found.`);
    if (user.latestAuthId !== payload.latestAuthId) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async parseToken(token: string): Promise<JWTUserData> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: env.JWT_SECRET,
      });
      return JSON.parse(payload.sub);
    } catch {
      throw new UnauthorizedException();
    }
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class AdminAuthGuard {
  constructor(
    private jwtService: JwtService,
    public usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    const user = await this.validateToken(token);
    request['user'] = user;
    return true;
  }

  async validateToken(token: string): Promise<User> {
    if (!token) throw new UnauthorizedException();
    const payload = await this.parseToken(token);
    const user = await this.usersService.findOne({ id: payload.id });
    if (user.latestAuthId !== payload.latestAuthId) {
      throw new UnauthorizedException();
    }
    if (!user.isAdmin) throw new UnauthorizedException();
    return user;
  }

  async parseToken(token: string): Promise<JWTUserData> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: env.JWT_SECRET,
      });
      return JSON.parse(payload.sub);
    } catch {
      throw new UnauthorizedException();
    }
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
