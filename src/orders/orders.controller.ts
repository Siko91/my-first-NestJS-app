import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../users/user.entity';
import { OrderDto } from './orders.types';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(AuthGuard)
  @Get()
  async listOrdersOfUser(
    @Request() req: { user: User },
    @Query('search') searchString?: string,
    @Query('sortBy') sortBy?: string,
    @Query('descending') descending?: boolean,
  ) {
    return await this.ordersService.listOrdersOfUser(
      req.user,
      {},
      searchString,
      sortBy,
      descending,
    );
  }

  @UseGuards(AuthGuard)
  @Post()
  async createOrder(@Request() req: { user: User }, @Body() order: OrderDto) {
    return await this.ordersService.createOrder(req.user, order);
  }

  @UseGuards(AuthGuard)
  @Put(':orderId')
  async updateOrder(
    @Request() req: { user: User },
    @Param('orderId') orderId: number,
    @Body() order: Partial<OrderDto>,
  ) {
    return await this.ordersService.updateOrder(req.user, orderId, order);
  }
}
