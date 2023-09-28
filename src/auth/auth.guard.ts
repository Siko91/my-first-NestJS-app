import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import env from '../env';
import { AuthService, JWTUserData } from './auth.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    public authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();
    const payload = await this.parseToken(token);
    const user = await this.authService.findUser(payload.id);
    if (user.latestAuthId !== payload.latestAuthId) {
      throw new UnauthorizedException();
    }
    request['user'] = user;
    return true;
  }

  async parseToken(token: string): Promise<JWTUserData> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: env.JWT_SECRET,
      });
      return payload;
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
export class AdminAuthGuard extends AuthGuard {
  constructor(jwtService: JwtService, authService: AuthService) {
    super(jwtService, authService);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isLoggedIn = super.canActivate(context);
    if (!isLoggedIn) return false;

    const request = context.switchToHttp().getRequest();
    const user: User = request['user'];
    if (!user.isAdmin) throw new UnauthorizedException();
  }
}
