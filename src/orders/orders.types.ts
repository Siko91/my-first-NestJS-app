import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from './order.entity';

export class OrderDto {
  @ApiProperty()
  pizzas: {
    components: {
      componentId: number;
    }[];
    additionalRequests: string;
  }[];

  @ApiProperty()
  orderTimestamp: Date;

  @ApiProperty()
  desiredDeliveryTime: Date;

  @ApiProperty()
  status: OrderStatus;

  @ApiProperty()
  address: string;
}
