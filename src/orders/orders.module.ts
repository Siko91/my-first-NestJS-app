import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { PizzaComponent } from '../pizza-components/pizza-component.entity';
import { PizzaComponentType } from '../pizza-components/pizza-component-type.entity';
import { PizzaComponentsModule } from '../pizza-components/pizza-components.module';
import { OrderedPizzaComponent } from './ordered-pizza-component.entity';
import { OrderedPizza } from './ordered-pizza.entity';
import { Order } from './order.entity';
import { OrdersAdminController } from './orders.admin.controller';

@Module({
  imports: [
    UsersModule,
    PizzaComponentsModule,
    TypeOrmModule.forFeature([
      User,
      PizzaComponentType,
      PizzaComponent,
      OrderedPizzaComponent,
      OrderedPizza,
      Order,
    ]),
  ],
  controllers: [OrdersController, OrdersAdminController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
