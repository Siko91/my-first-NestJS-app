import {
  initTestApi,
  makeOrderDto,
  setupTestData,
} from '../utils/test/testingFunctions';
import CustomAssert from '../utils/test/customAssert';
import { OrderStatus } from './order.entity';

describe('OrdersController', () => {
  it('should be defined', async () => {
    const api = await initTestApi();

    expect(api.pizzaComponentsAdminController).toBeDefined();
    expect(api.pizzaComponentsController).toBeDefined();
    expect(api.authController).toBeDefined();
    expect(api.ordersController).toBeDefined();
    expect(api.ordersAdminController).toBeDefined();
  }, 30000);

  it('Can create order', async () => {
    const api = await initTestApi();

    const { users, components } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const orderReq = makeOrderDto(
      users[0],
      null,
      [components[0][0], components[2][3]],
      [components[0][1], components[2][0], components[2][1]],
    );
    const order = await api.ordersController.createOrder(
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
    const api = await initTestApi();

    const { users, components: comp } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const user = users[0];

    const orderReq = makeOrderDto(
      user,
      null,
      [comp[0][0], comp[2][3]],
      [comp[0][1], comp[2][0], comp[2][1]],
    );
    const order = await api.ordersController.createOrder({ user }, orderReq);

    const orderUpdateReq = makeOrderDto(user, null, [
      comp[0][0],
      comp[1][1],
      comp[2][3],
    ]);
    await api.ordersController.updateOrder({ user }, order.id, {
      pizzas: orderUpdateReq.pizzas,
      desiredDeliveryTime: orderUpdateReq.desiredDeliveryTime,
    });
    const list = await api.ordersController.listOrdersOfUser({ user });
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
    const api = await initTestApi();

    const { users, components: comp } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const user = users[0];

    const o1 = await api.ordersController.createOrder(
      { user },
      makeOrderDto(
        user,
        null,
        [comp[0][0], comp[2][3]],
        [comp[0][1], comp[2][1]],
      ),
    );
    const o2 = await api.ordersController.createOrder(
      { user },
      makeOrderDto(
        user,
        null,
        [comp[0][0], comp[2][3]],
        [comp[0][0], comp[2][1]],
      ),
    );
    await api.ordersController.createOrder(
      { user: users[1] },
      makeOrderDto(
        user,
        null,
        [comp[0][1], comp[2][3]],
        [comp[0][0], comp[2][1]],
      ),
    );

    const ownOrders = await api.ordersController.listOrdersOfUser({ user });
    expect(
      ownOrders
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([o1.id, o2.id].sort().join());
  }, 30000);

  it('Can filter & sort own orders', async () => {
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

    const ownOrders = await api.ordersController.listOrdersOfUser(
      { user: users[0] },
      'name123',
    );
    expect(
      ownOrders
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe(`${o1.id},${o2.id}`);
  }, 30000);

  it('Only admin can create status of order', async () => {
    const api = await initTestApi();

    const { users, components: comp } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const user = users[0];

    const o = await api.ordersController.createOrder(
      { user },
      makeOrderDto(
        user,
        null,
        [comp[0][0], comp[2][3]],
        [comp[0][1], comp[2][1]],
      ),
    );

    await api.ordersController.updateOrder({ user }, o.id, {
      status: OrderStatus.DeliveryStarted,
    });

    const list = await api.ordersController.listOrdersOfUser({ user });
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe(o.status);
    expect(list[0].status).toBe(OrderStatus.Registered);
  }, 30000);

  it('Fails to create order if it has no Pizzas or Pizza with no Components', async () => {
    const api = await initTestApi();

    const { users, components: comp } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const user = users[0];

    const err1 = await CustomAssert.throwsAsync(() =>
      api.ordersController.createOrder({ user }, makeOrderDto(user, null)),
    );
    expect(err1.message).toBe('Cannot make order without any pizzas');

    const err2 = await CustomAssert.throwsAsync(() =>
      api.ordersController.createOrder(
        { user },
        makeOrderDto(
          user,
          null,
          [comp[0][0], comp[2][3]],
          [],
          [(comp[0][1], comp[2][1])],
        ),
      ),
    );
    expect(err2.message).toBe(
      'Cannot make order with a pizza without any components',
    );
  }, 30000);

  it('Fails to create order if it has Pizza with missing mandatory components', async () => {
    const api = await initTestApi();

    const {
      users,
      components: comp,
      componentTypes: types,
    } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const user = users[0];

    const err1 = await CustomAssert.throwsAsync(() =>
      api.ordersController.createOrder(
        { user },
        makeOrderDto(user, null, [comp[0][0]], [comp[0][0], comp[2][3]]),
      ),
    );
    expect(err1.message).toBe(
      `Pizza must contain a component of type "${types[2].name}"`,
    );

    const err2 = await CustomAssert.throwsAsync(() =>
      api.ordersController.createOrder(
        { user },
        makeOrderDto(user, null, [comp[0][0], comp[2][3]], [comp[2][0]]),
      ),
    );
    expect(err2.message).toBe(
      `Pizza must contain a component of type "${types[0].name}"`,
    );
  }, 30000);

  it('Fails to create order if it has Pizza with too many Components of a limited Type', async () => {
    const api = await initTestApi();

    const {
      users,
      components: comp,
      componentTypes: types,
    } = await setupTestData(api, {
      usersToCreate: 2,
      componentTypes: [
        { mandatory: true, maximum: 1, components: [400, 700] },
        { mandatory: false, maximum: 2, components: [300, 500, 700] },
        { mandatory: true, maximum: 2, components: [200, 340, 350, 360] },
      ],
    });

    const user = users[0];

    const err1 = await CustomAssert.throwsAsync(() =>
      api.ordersController.createOrder(
        { user },
        makeOrderDto(
          user,
          null,
          [comp[0][0], comp[2][1], comp[2][3], comp[2][3]],
          [comp[0][0], comp[2][3]],
        ),
      ),
    );
    expect(err1.message).toBe(
      `Cannot select more than 2 components of type "${types[2].name}"`,
    );
  }, 30000);
});
