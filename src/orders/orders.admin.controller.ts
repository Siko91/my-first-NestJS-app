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
import { OrdersService } from './orders.service';
import { AdminAuthGuard } from '../auth/auth.guard';
import { User } from '../users/user.entity';
import { OrderDto } from './orders.types';
import { OrderStatus } from './order.entity';

@Controller('orders')
export class OrdersAdminController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(AdminAuthGuard)
  @Get('status/:status')
  async listAllOrdersWithStatus(
    @Request() req: { user: User },
    @Param('status') status?: OrderStatus,
    @Query('search') searchString?: string,
    @Query('sortBy') sortBy?: string,
    @Query('descending') descending?: boolean,
  ) {
    return await this.ordersService.listAllOrders(
      { status },
      searchString,
      sortBy,
      descending,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  async listAllOrders(
    @Request() req: { user: User },
    @Query('search') searchString?: string,
    @Query('sortBy') sortBy?: string,
    @Query('descending') descending?: boolean,
  ) {
    return await this.ordersService.listAllOrders(
      {},
      searchString,
      sortBy,
      descending,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Post()
  async createOrder(@Request() req: { user: User }, @Body() order: OrderDto) {
    return await this.ordersService.createOrder(req.user, order);
  }

  @UseGuards(AdminAuthGuard)
  @Put(':orderId/status/:status')
  async updateOrderStatus(
    @Request() req: { user: User },
    @Param('orderId') orderId: number,
    @Param('status') status: OrderStatus,
  ) {
    return await this.ordersService.updateOrderStatus(
      req.user,
      orderId,
      status,
    );
  }

  @UseGuards(AdminAuthGuard)
  @Get(':orderId')
  async getOrder(@Request() req: { user: User }, @Param() orderId: number) {
    return await this.ordersService.getOrder(orderId);
  }

  @UseGuards(AdminAuthGuard)
  @Put(':orderId')
  async updateOrder(
    @Request() req: { user: User },
    @Param('orderId') orderId: number,
    @Body() order: Partial<OrderDto>,
  ) {
    return await this.ordersService.updateOrder(req.user, orderId, order);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':orderId')
  async deleteOrder(@Request() req: { user: User }, @Param() orderId: number) {
    return await this.ordersService.deleteOrder(orderId);
  }
}
