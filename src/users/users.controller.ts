import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard, AuthGuard } from '../auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './users.types';
import { User } from './user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  async getOwnProfile(@Request() req: { user: User }) {
    const profile = req.user as User;
    return await profile;
  }

  @UseGuards(AuthGuard)
  @Get(':userId')
  async getUser(
    @Request() req: { user: User },
    @Param('userId') userId: number,
  ) {
    const profile = req.user as User;

    if (!profile.isAdmin) {
      throw new UnauthorizedException(
        new Error('Only Admin can read profiles of others'),
      );
    }
    return await this.usersService.getUser(userId);
  }

  @UseGuards(AuthGuard)
  @Put(':userId')
  async updateProfile(
    @Request() req: { user: User },
    @Param('userId') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean }> {
    const actingUser = req.user as User;

    await this.usersService.updateUser(actingUser, userId, updateUserDto);
    return { success: true };
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':userId')
  async deleteUser(
    @Request() req: { user: User },
    @Param('userId') userId: number,
  ): Promise<{ success: boolean }> {
    await this.usersService.deleteUser(userId);
    return { success: true };
  }
}
