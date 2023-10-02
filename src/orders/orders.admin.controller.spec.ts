import {
  initTestApi,
  makeOrderDto,
  setupTestData,
} from '../utils/test/testingFunctions';
import { OrderStatus } from './order.entity';

describe('OrdersAdminController', () => {
  it('should be defined', async () => {
    const api = await initTestApi();

    expect(api.pizzaComponentsAdminController).toBeDefined();
    expect(api.pizzaComponentsController).toBeDefined();
    expect(api.authController).toBeDefined();
    expect(api.ordersController).toBeDefined();
    expect(api.ordersAdminController).toBeDefined();
  }, 30000);

  it('Can list all orders', async () => {
    const api = await initTestApi();

    const { users, components: comp } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const o1 = await api.ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][0]]),
    );
    const o2 = await api.ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][1]]),
    );
    const o3 = await api.ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][2]]),
    );

    const list = await api.ordersAdminController.listAllOrders();
    expect(list).toHaveLength(3);
    expect(
      list
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([o1.id, o2.id, o3.id].sort().join());
  }, 30000);

  it('Can update status and list all orders by status', async () => {
    const api = await initTestApi();

    const { users, components: comp } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const o1 = await api.ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][0]]),
    );
    const o2 = await api.ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][1]]),
    );
    await api.ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][2]]),
    );

    await api.ordersAdminController.updateOrderStatus(
      { user: { ...users[0], isAdmin: true } },
      o1.id,
      OrderStatus.Accepted,
    );
    await api.ordersAdminController.updateOrderStatus(
      { user: { ...users[0], isAdmin: true } },
      o2.id,
      OrderStatus.Accepted,
    );

    const list = await api.ordersAdminController.listAllOrdersWithStatus(
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
    const api = await initTestApi();

    const { users, components: comp } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const o1 = await api.ordersController.createOrder(
      { user: { ...users[0] } },
      makeOrderDto(
        users[0],
        { address: 'name123' },
        [comp[0][0], comp[2][3]],
        [comp[0][1], comp[2][1]],
      ),
    );
    const o2 = await api.ordersController.createOrder(
      { user: { ...users[0], fullName: '-name1234-' } },
      makeOrderDto(
        users[0],
        null,
        [comp[0][0], comp[2][3]],
        [comp[0][0], comp[2][2]],
      ),
    );
    await api.ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][0]]),
    );

    const o4_u2 = await api.ordersController.createOrder(
      { user: { ...users[1], email: 'name123-' } },
      makeOrderDto(users[0], null, [comp[0][1], comp[2][3]]),
    );
    const o5_u2 = await api.ordersController.createOrder(
      { user: users[1] },
      makeOrderDto(
        users[0],
        { extraDeliveryInstructions: 'bla bla name123 bla bla' },
        [comp[0][1], comp[2][1]],
      ),
    );

    const allOrders = await api.ordersAdminController.listAllOrders('name123');
    expect(
      allOrders
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([o1.id, o2.id, o4_u2.id, o5_u2.id].sort().join());

    const registeredOrders =
      await api.ordersAdminController.listAllOrdersWithStatus(
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
    const api = await initTestApi();

    const { users, components: comp } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const o = await api.ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][0], comp[2][1]]),
    );

    const updateDto = makeOrderDto(users[0], null, [comp[0][0], comp[2][0]]);
    await api.ordersAdminController.updateOrder(
      { user: { ...users[0], isAdmin: true } },
      o.id,
      updateDto,
    );

    const allOrders = await api.ordersAdminController.listAllOrders();
    expect(allOrders).toHaveLength(1);
    expect(allOrders[0].desiredDeliveryTime.toISOString()).toBe(
      updateDto.desiredDeliveryTime.toISOString(),
    );
    expect(allOrders[0].pizzas.length).toBe(updateDto.pizzas.length);
  }, 30000);

  it('Can delete orders', async () => {
    const api = await initTestApi();

    const { users, components: comp } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const o = await api.ordersController.createOrder(
      { user: users[0] },
      makeOrderDto(users[0], null, [comp[0][0], comp[2][0], comp[2][1]]),
    );

    const allOrders1 = await api.ordersAdminController.listAllOrders();
    expect(allOrders1).toHaveLength(1);

    await api.ordersAdminController.deleteOrder(
      { user: { ...users[1], isAdmin: true } },
      o.id,
    );

    const allOrders2 = await api.ordersAdminController.listAllOrders();
    expect(allOrders2).toHaveLength(0);
  }, 30000);
});
