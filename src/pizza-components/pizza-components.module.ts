import { Module } from '@nestjs/common';
import { PizzaComponentsController } from './pizza-components.controller';
import { PizzaComponentsService } from './pizza-components.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PizzaComponent } from './pizza-component.entity';
import { PizzaComponentType } from './pizza-component-type.entity';
import { PizzaComponentsAdminController } from './pizza-components.admin.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([PizzaComponentType, PizzaComponent]),
  ],
  controllers: [PizzaComponentsController, PizzaComponentsAdminController],
  providers: [PizzaComponentsService],
  exports: [PizzaComponentsService],
})
export class PizzaComponentsModule {}
