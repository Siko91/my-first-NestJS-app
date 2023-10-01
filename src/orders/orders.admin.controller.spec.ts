import { OrdersController } from './orders.controller';
import { AuthController } from '../auth/auth.controller';
import { PizzaComponentsAdminController } from '../pizza-components/pizza-components.admin.controller';
import { PizzaComponentsModule } from '../pizza-components/pizza-components.module';
import { PizzaComponentsController } from '../pizza-components/pizza-components.controller';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from './orders.module';
import {
  dropDb,
  getControllerOrService,
  makeOrderDto,
  setupTestData,
} from '../utils/test/testingFunctions';
import { OrdersAdminController } from './orders.admin.controller';
import { User } from '../users/user.entity';
import { PizzaComponentType } from '../pizza-components/pizza-component-type.entity';
import { PizzaComponent } from '../pizza-components/pizza-component.entity';
import { OrderedPizzaComponent } from './ordered-pizza-component.entity';
import { OrderedPizza } from './ordered-pizza.entity';
import { Order, OrderStatus } from './order.entity';

describe('OrdersAdminController', () => {
  let pizzaComponentsAdminController: PizzaComponentsAdminController;
  let pizzaComponentsController: PizzaComponentsController;
  let authController: AuthController;
  let ordersController: OrdersController;
  let ordersAdminController: OrdersAdminController;

  beforeEach(async () => {
    dropDb();

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
    const { users, components: comp } = await setupTestData(
      authController,
      pizzaComponentsAdminController,
      {
        usersToCreate: 2,
        componentTypes: [
          { mandatory: true, maximum: 1, components: [400, 700] },
          { mandatory: false, maximum: 2, components: [300, 500, 700] },
          { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
        ],
      },
    );

    const o1 = await ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][0]]),
    );
    const o2 = await ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][1]]),
    );
    const o3 = await ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][2]]),
    );

    const list = await ordersAdminController.listAllOrders();
    expect(list).toHaveLength(3);
    expect(
      list
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([o1.id, o2.id, o3.id].sort().join());
  }, 30000);

  it('Can update status and list all orders by status', async () => {
    const { users, components: comp } = await setupTestData(
      authController,
      pizzaComponentsAdminController,
      {
        usersToCreate: 2,
        componentTypes: [
          { mandatory: true, maximum: 1, components: [400, 700] },
          { mandatory: false, maximum: 2, components: [300, 500, 700] },
          { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
        ],
      },
    );

    const o1 = await ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][0]]),
    );
    const o2 = await ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][1]]),
    );
    await ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][2]]),
    );

    await ordersAdminController.updateOrderStatus(
      { user: { ...users[0], isAdmin: true } },
      o1.id,
      OrderStatus.Accepted,
    );
    await ordersAdminController.updateOrderStatus(
      { user: { ...users[0], isAdmin: true } },
      o2.id,
      OrderStatus.Accepted,
    );

    const list = await ordersAdminController.listAllOrdersWithStatus(
      OrderStatus.Accepted,
    );
    expect(list).toHaveLength(2);
    expect(
      list
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([o1.id, o2.id].sort().join());
  }, 30000);

  it('Can filter & sort all orders', async () => {
    const { users, components: comp } = await setupTestData(
      authController,
      pizzaComponentsAdminController,
      {
        usersToCreate: 2,
        componentTypes: [
          { mandatory: true, maximum: 1, components: [400, 700] },
          { mandatory: false, maximum: 2, components: [300, 500, 700] },
          { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
        ],
      },
    );

    const o1 = await ordersController.createOrder(
      { user: { ...users[0] } },
      makeOrderDto(
        users[0],
        { address: 'name123' },
        [comp[0][0], comp[2][3]],
        [comp[0][1], comp[2][1]],
      ),
    );
    const o2 = await ordersController.createOrder(
      { user: { ...users[0], fullName: '-name1234-' } },
      makeOrderDto(
        users[0],
        null,
        [comp[0][0], comp[2][3]],
        [comp[0][0], comp[2][2]],
      ),
    );
    await ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][0]]),
    );

    const o4_u2 = await ordersController.createOrder(
      { user: { ...users[1], email: 'name123-' } },
      makeOrderDto(users[0], null, [comp[0][1], comp[2][3]]),
    );
    const o5_u2 = await ordersController.createOrder(
      { user: users[1] },
      makeOrderDto(
        users[0],
        { extraDeliveryInstructions: 'bla bla name123 bla bla' },
        [comp[0][1], comp[2][1]],
      ),
    );

    const allOrders = await ordersAdminController.listAllOrders('name123');
    expect(
      allOrders
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([o1.id, o2.id, o4_u2.id, o5_u2.id].sort().join());

    const registeredOrders =
      await ordersAdminController.listAllOrdersWithStatus(
        OrderStatus.Registered,
        'name123',
      );
    expect(
      registeredOrders
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([o1.id, o2.id, o4_u2.id, o5_u2.id].sort().join());
  }, 30000);

  it('Can update orders of others', async () => {
    const { users, components: comp } = await setupTestData(
      authController,
      pizzaComponentsAdminController,
      {
        usersToCreate: 2,
        componentTypes: [
          { mandatory: true, maximum: 1, components: [400, 700] },
          { mandatory: false, maximum: 2, components: [300, 500, 700] },
          { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
        ],
      },
    );

    const o = await ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][0], comp[2][1]]),
    );

    const updateDto = makeOrderDto(users[0], null, [comp[0][0], comp[2][0]]);
    await ordersAdminController.updateOrder(
      { user: { ...users[0], isAdmin: true } },
      o.id,
      updateDto,
    );

    const allOrders = await ordersAdminController.listAllOrders();
    expect(allOrders).toHaveLength(1);
    expect(allOrders[0].desiredDeliveryTime.toISOString()).toBe(
      updateDto.desiredDeliveryTime.toISOString(),
    );
    expect(allOrders[0].pizzas.length).toBe(updateDto.pizzas.length);
  }, 30000);

  it('Can delete orders', async () => {
    const { users, components: comp } = await setupTestData(
      authController,
      pizzaComponentsAdminController,
      {
        usersToCreate: 2,
        componentTypes: [
          { mandatory: true, maximum: 1, components: [400, 700] },
          { mandatory: false, maximum: 2, components: [300, 500, 700] },
          { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
        ],
      },
    );

    const o = await ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][0], comp[2][1]]),
    );

    const allOrders1 = await ordersAdminController.listAllOrders();
    expect(allOrders1).toHaveLength(1);

    await ordersAdminController.deleteOrder(
      { user: { ...users[1], isAdmin: true } },
      o.id,
    );

    const allOrders2 = await ordersAdminController.listAllOrders();
    expect(allOrders2).toHaveLength(0);
  }, 30000);
});
