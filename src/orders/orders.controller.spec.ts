import { OrdersController } from './orders.controller';
import { AuthController } from '../auth/auth.controller';
import { PizzaComponentsAdminController } from '../pizza-components/pizza-components.admin.controller';
import { PizzaComponentsModule } from '../pizza-components/pizza-components.module';
import { PizzaComponentsController } from '../pizza-components/pizza-components.controller';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from './orders.module';
import {
  getControllerOrService,
  makeOrderDto,
  randomPizzaComponent,
  randomPizzaComponentType,
  randomUserDto,
  setupTestData,
} from '../utils/test/testingFunctions';
import { OrdersAdminController } from './orders.admin.controller';
import { User } from '../users/user.entity';
import { PizzaComponentType } from '../pizza-components/pizza-component-type.entity';
import { PizzaComponent } from '../pizza-components/pizza-component.entity';
import { OrderedPizzaComponent } from './ordered-pizza-component.entity';
import { OrderedPizza } from './ordered-pizza.entity';
import { Order, OrderStatus } from './order.entity';
import { assert } from 'console';

describe('OrdersController', () => {
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

  it('Can create order', async () => {
    const { users, components } = await setupTestData(
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

    const orderReq = makeOrderDto(
      users[0],
      [components[0][0], components[2][3]],
      [components[0][1], components[2][0], components[2][1]],
    );
    const order = await ordersController.createOrder(
      { user: users[0] },
      orderReq,
    );

    expect(order.address).toBe(users[0].address);
    expect(order.status).toBe(OrderStatus.Registered);

    const pzz = order.pizzas;
    expect(pzz[0].components.map((i) => i.price).join()).toBe(`400,360`);
    expect(pzz[1].components.map((i) => i.price).join()).toBe(`700,200,340`);
  }, 30000);

  it('Can update own order', async () => {
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

    const user = users[0];

    const orderReq = makeOrderDto(
      user,
      [comp[0][0], comp[2][3]],
      [comp[0][1], comp[2][0], comp[2][1]],
    );
    const order = await ordersController.createOrder({ user }, orderReq);

    const orderUpdateReq = makeOrderDto(user, [
      comp[0][0],
      comp[1][1],
      comp[2][3],
    ]);
    await ordersController.updateOrder({ user }, order.id, {
      pizzas: orderUpdateReq.pizzas,
      desiredDeliveryTime: orderUpdateReq.desiredDeliveryTime,
    });
    const list = await ordersController.listOrdersOfUser({ user });
    expect(list).toHaveLength(1);
    expect(list[0].orderTimestamp.toISOString()).toBe(
      order.orderTimestamp.toISOString(),
    );
    expect(list[0].desiredDeliveryTime.toISOString()).toBe(
      orderUpdateReq.desiredDeliveryTime.toISOString(),
    );

    const pzz = list[0].pizzas;
    expect(pzz).toHaveLength(1);
    expect(pzz[0].components.map((i) => i.price).join()).toBe(`400,500,360`);
  }, 6030000);

  it('Can list own orders if logged in', async () => {
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

    const user = users[0];

    const o1 = await ordersController.createOrder(
      { user },
      makeOrderDto(user, [comp[0][0], comp[2][3]], [comp[0][1], comp[2][1]]),
    );
    const o2 = await ordersController.createOrder(
      { user },
      makeOrderDto(user, [comp[0][0], comp[2][3]], [comp[0][0], comp[2][1]]),
    );
    await ordersController.createOrder(
      { user: users[1] },
      makeOrderDto(user, [comp[0][1], comp[2][3]], [comp[0][0], comp[2][1]]),
    );

    const ownOrders = await ordersController.listOrdersOfUser({ user });
    expect(
      ownOrders
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([o1.id, o2.id].sort().join());
  }, 30000);

  it('Can filter & sort own orders', async () => {
    const { users, components: comp } = await setupTestData(
      authController,
      pizzaComponentsAdminController,
      {
        usersToCreate: 2,
        componentTypes: [
          {
            mandatory: true,
            maximum: 1,
            components: [{ price: 400, name: '-name123-' }, 700],
          },
          { mandatory: false, maximum: 2, components: [300, 500, 700] },
          {
            mandatory: true,
            maximum: 2,
            components: [200, 340, { price: 350, name: 'name123' }, 360],
          },
        ],
      },
    );

    const user = users[0];

    const o1 = await ordersController.createOrder(
      { user },
      makeOrderDto(user, [comp[0][0], comp[2][3]], [comp[0][1], comp[2][1]]),
    );
    await ordersController.createOrder(
      { user },
      makeOrderDto(user, [comp[0][0], comp[2][3]], [comp[0][0], comp[2][2]]),
    );
    const o3_u2 = await ordersController.createOrder(
      { user: users[1] },
      makeOrderDto(user, [comp[0][1], comp[2][3]], [comp[0][0], comp[2][1]]),
    );

    const ownOrders = await ordersController.listOrdersOfUser(
      { user },
      'name123',
    );
    expect(
      ownOrders
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe(`${o1.id}`);

    const allOrders = await ordersAdminController.listAllOrders(
      { user },
      'name123',
    );
    expect(
      allOrders
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([o1.id, o3_u2.id].sort().join());
  }, 30000);

  it('Only admin can create or update status of order', async () => {
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

    const user = users[0];

    const o = await ordersController.createOrder(
      { user },
      makeOrderDto(user, [comp[0][0], comp[2][3]], [comp[0][1], comp[2][1]]),
    );

    await ordersController.updateOrder({ user }, o.id, {
      status: OrderStatus.DeliveryStarted,
    });

    const list = await ordersController.listOrdersOfUser({ user });
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe(o.status);
    expect(list[0].status).toBe(OrderStatus.Registered);
  }, 30000);

  it('Fails to create or update order if it has no Pizzas', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Fails to create or update order if it has Pizza with no Components', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Fails to create or update order if it has Pizza with missing mandatory components', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Fails to create or update order if it has Pizza with missing mandatory components', async () => {
    throw new Error('Not Implemented');
  }, 30000);

  it('Fails to create or update order if it has Pizza with too many Components of a limited Type', async () => {
    throw new Error('Not Implemented');
  }, 30000);
});
