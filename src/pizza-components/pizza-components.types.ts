import { ApiProperty } from '@nestjs/swagger';

export class PizzaComponentTypeDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  mandatory: boolean;

  @ApiProperty()
  maximum: number;
}

export type UpdatePizzaComponentTypeDto = Partial<PizzaComponentTypeDto>;

export class PizzaComponentDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  currentPrice: number;
}

export type UpdatePizzaComponentDto = Partial<PizzaComponentDto>;
