import {
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { PizzaComponentsService } from './pizza-components.service';
import { AdminAuthGuard } from '../auth/auth.guard';
import {
  PizzaComponentDto,
  PizzaComponentTypeDto,
  UpdatePizzaComponentDto,
  UpdatePizzaComponentTypeDto,
} from './pizza-components.types';
import { PizzaComponentType } from './pizza-component-type.entity';
import { PizzaComponent } from './pizza-component.entity';

@Controller('pizza-components')
export class PizzaComponentsAdminController {
  constructor(private pizzaComponentService: PizzaComponentsService) {}

  @UseGuards(AdminAuthGuard)
  @Post('type')
  async addComponentType(
    @Body() componentType: PizzaComponentTypeDto,
  ): Promise<PizzaComponentType> {
    return await this.pizzaComponentService.addComponentType(componentType);
  }

  @UseGuards(AdminAuthGuard)
  @Put('type/:type')
  async modifyComponentType(
    @Param('type') id: number,
    @Body() componentTypeUpdate: UpdatePizzaComponentTypeDto,
  ) {
    await this.pizzaComponentService.modifyComponentType(
      id,
      componentTypeUpdate,
    );
    return { success: true };
  }

  @UseGuards(AdminAuthGuard)
  @Delete('type/:type')
  async deleteComponentType(@Param('type') id: number) {
    await this.pizzaComponentService.deleteComponentType(id);
    return { success: true };
  }

  @UseGuards(AdminAuthGuard)
  @Post('type/:type')
  async addComponent(
    @Param('type') id: number,
    @Body() component: PizzaComponentDto,
  ): Promise<PizzaComponent> {
    return await this.pizzaComponentService.addComponent(id, component);
  }

  @UseGuards(AdminAuthGuard)
  @Put(':componentId')
  async modifyComponent(
    @Param('componentId') id: number,
    @Body() component: UpdatePizzaComponentDto,
  ) {
    await this.pizzaComponentService.modifyComponent(id, component);
    return { success: true };
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':componentId')
  async deleteComponent(@Param('componentId') id: number) {
    await this.pizzaComponentService.deleteComponent(id);
    return { success: true };
  }
}
