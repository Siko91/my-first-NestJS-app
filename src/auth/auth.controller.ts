import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto, SignInDto } from './auth.types';
import { User } from '../users/user.entity';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: SignInDto,
  ): Promise<{ access_token: string }> {
    return await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.authService.registerUser(createUserDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  async getOwnProfile(@Request() req: { user: User }) {
    return this.authService.getOwnProfile(req.user);
  }

  @UseGuards(AuthGuard)
  @Delete()
  async invalidateAllExistingTokens(@Request() req: { user: User }) {
    const profile = req.user;
    await this.authService.invalidateAllExistingTokens(profile);
  }
}
