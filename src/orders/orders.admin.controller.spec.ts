import { OrdersController } from './orders.controller';
import { AuthController } from '../auth/auth.controller';
import { PizzaComponentsAdminController } from '../pizza-components/pizza-components.admin.controller';
import { PizzaComponentsModule } from '../pizza-components/pizza-components.module';
import { PizzaComponentsController } from '../pizza-components/pizza-components.controller';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from './orders.module';
import { getControllerOrService } from '../utils/test/testingFunctions';
import { OrdersAdminController } from './orders.admin.controller';
import { User } from '../users/user.entity';
import { PizzaComponentType } from '../pizza-components/pizza-component-type.entity';
import { PizzaComponent } from '../pizza-components/pizza-component.entity';
import { OrderedPizzaComponent } from './ordered-pizza-component.entity';
import { OrderedPizza } from './ordered-pizza.entity';
import { Order } from './order.entity';

describe('OrdersAdminController', () => {
  let pizzaComponentsAdminController: PizzaComponentsAdminController;
  let pizzaComponentsController: PizzaComponentsController;
  let authController: AuthController;
  let ordersController: OrdersController;
  let ordersAdminController: OrdersAdminController;

  beforeEach(async () => {
    const dataTypes = [
      User,
      PizzaComponentType,
      PizzaComponent,
      OrderedPizzaComponent,
      OrderedPizza,
      Order,
    ];

    pizzaComponentsController = await getControllerOrService(
      PizzaComponentsModule,
      PizzaComponentsController,
      dataTypes,
    );
    pizzaComponentsAdminController = await getControllerOrService(
      PizzaComponentsModule,
      PizzaComponentsAdminController,
      dataTypes,
    );
    authController = await getControllerOrService(
      AuthModule,
      AuthController,
      dataTypes,
    );
    ordersController = await getControllerOrService(
      OrdersModule,
      OrdersController,
      dataTypes,
    );
    ordersAdminController = await getControllerOrService(
      OrdersModule,
      OrdersAdminController,
      dataTypes,
    );
  }, 30000);

  it('should be defined', () => {
    expect(pizzaComponentsAdminController).toBeDefined();
    expect(pizzaComponentsController).toBeDefined();
    expect(authController).toBeDefined();
    expect(ordersController).toBeDefined();
    expect(ordersAdminController).toBeDefined();
  }, 30000);

  it('Can list all orders', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Can list all orders by status', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Can filter & sort all orders', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Can update orders of others', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Can delete orders', async () => {
    throw new Error('Not Implemented');
  }, 30000);
});
