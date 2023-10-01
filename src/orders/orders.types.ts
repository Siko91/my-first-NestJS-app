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
  desiredDeliveryTime: Date;

  @ApiProperty()
  status?: OrderStatus;

  @ApiProperty()
  address?: string;

  @ApiProperty()
  userEmail?: string;

  @ApiProperty()
  userPhone?: string;

  @ApiProperty()
  userFullName?: string;

  @ApiProperty()
  extraDeliveryInstructions?: string;
}
