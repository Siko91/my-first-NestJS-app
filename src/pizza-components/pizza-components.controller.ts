import { Controller, Get, Param, Query } from '@nestjs/common';
import { PizzaComponentsService } from './pizza-components.service';

@Controller('pizza-components')
export class PizzaComponentsController {
  constructor(private pizzaComponentService: PizzaComponentsService) {}

  @Get()
  async getComponentTypes() {
    return await this.pizzaComponentService.getComponentTypes();
  }

  @Get('type/:type')
  async getComponentsOfType(
    @Param('type') type: number,
    @Query('search') searchString?: string,
    @Query('sortBy') sortBy?: string,
    @Query('descending') descending?: boolean,
  ) {
    return await this.pizzaComponentService.listComponents(
      { type: { id: type } },
      searchString,
      sortBy,
      descending,
    );
  }

  @Get('all')
  async getAllComponents(
    @Query('search') searchString?: string,
    @Query('sortBy') sortBy?: string,
    @Query('descending') descending?: boolean,
  ) {
    return await this.pizzaComponentService.listComponents(
      {},
      searchString,
      sortBy,
      descending,
    );
  }
}
