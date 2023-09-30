import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../auth/auth.guard';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './users.types';
import { User } from './user.entity';
import { CreateUserDto } from '../auth/auth.types';

@ApiTags('Users')
@Controller('users/admin')
export class UsersAdminController {
  constructor(private usersService: UsersService) {}

  // list
  // getOne
  // add
  // update
  // delete

  @UseGuards(AdminAuthGuard)
  @Get()
  async listUsers(
    @Query('search') searchString?: string,
    @Query('isAdmin') isAdmin?: boolean,
    @Query('sortBy') sortBy?: string,
    @Query('descending') descending?: boolean,
  ): Promise<User[]> {
    return await this.usersService.listUsers(
      searchString,
      isAdmin,
      sortBy,
      descending,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get(':userId')
  async getOne(@Param('userId') userId: number) {
    return await this.usersService.getUser(userId);
  }

  @UseGuards(AdminAuthGuard)
  @Post()
  async register(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.registerUser(createUserDto);
  }

  @UseGuards(AdminAuthGuard)
  @Put(':userId')
  async updateUser(
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
