import {
  initTestApi,
  randomPizzaComponent,
  randomPizzaComponentType,
} from '../utils/test/testingFunctions';

describe('PizzaComponentsController', () => {
  it('should be defined', async () => {
    const api = await initTestApi();

    expect(api.pizzaComponentsAdminController).toBeDefined();
    expect(api.pizzaComponentsController).toBeDefined();
  }, 30000);

  it('can get all types', async () => {
    const api = await initTestApi();

    const t1_req = randomPizzaComponentType(true, 1);
    const t1 =
      await api.pizzaComponentsAdminController.addComponentType(t1_req);

    const t2_req = randomPizzaComponentType(true, 1);
    const t2 =
      await api.pizzaComponentsAdminController.addComponentType(t2_req);

    const t3_req = randomPizzaComponentType(true, 1);
    const t3 =
      await api.pizzaComponentsAdminController.addComponentType(t3_req);

    const tGet = await api.pizzaComponentsController.getComponentTypes();
    expect(tGet).toHaveLength(3);

    expect(
      tGet
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([t1.id, t2.id, t3.id].sort().join());
  }, 30000);

  it('can get all components', async () => {
    const api = await initTestApi();

    const t1_req = randomPizzaComponentType(true, 1);
    const t1 =
      await api.pizzaComponentsAdminController.addComponentType(t1_req);
    const t2_req = randomPizzaComponentType(true, 1);
    const t2 =
      await api.pizzaComponentsAdminController.addComponentType(t2_req);
    await api.pizzaComponentsAdminController.addComponent(
      t1.id,
      randomPizzaComponent(150),
    );
    await api.pizzaComponentsAdminController.addComponent(
      t1.id,
      randomPizzaComponent(300),
    );
    await api.pizzaComponentsAdminController.addComponent(
      t2.id,
      randomPizzaComponent(200),
    );

    const cGet = await api.pizzaComponentsController.getAllComponents();
    expect(
      cGet
        .map((i) => i.currentPrice)
        .sort()
        .join(),
    ).toBe([150, 200, 300].join());

    const cGet1 = await api.pizzaComponentsController.getComponentsOfType(
      t1.id,
    );
    expect(
      cGet1
        .map((i) => i.currentPrice)
        .sort()
        .join(),
    ).toBe([150, 300].join());
  }, 30000);

  it('can filter & sort components', async () => {
    const api = await initTestApi();

    const t1_req = randomPizzaComponentType(true, 1);
    const t1 =
      await api.pizzaComponentsAdminController.addComponentType(t1_req);
    const t2_req = randomPizzaComponentType(true, 1);
    const t2 =
      await api.pizzaComponentsAdminController.addComponentType(t2_req);

    const c1_req = randomPizzaComponent(150, 'my-name12345');
    await api.pizzaComponentsAdminController.addComponent(t1.id, c1_req);
    const c2_req = randomPizzaComponent(300, 'other', 'description-name123');
    await api.pizzaComponentsAdminController.addComponent(t1.id, c2_req);
    const c3_req = randomPizzaComponent(200, 'name123');
    await api.pizzaComponentsAdminController.addComponent(t2.id, c3_req);
    const c4_req = randomPizzaComponent(400, 'other', 'other');
    await api.pizzaComponentsAdminController.addComponent(t2.id, c4_req);

    const cGet = await api.pizzaComponentsController.getAllComponents(
      'name123',
      'currentPrice',
      true,
    );
    expect(cGet.map((i) => i.currentPrice).join()).toBe([300, 200, 150].join());
  }, 30000);

  it('can filter & sort components of a type', async () => {
    const api = await initTestApi();

    const t1_req = randomPizzaComponentType(true, 1);
    const t1 =
      await api.pizzaComponentsAdminController.addComponentType(t1_req);
    const t2_req = randomPizzaComponentType(true, 1);
    const t2 =
      await api.pizzaComponentsAdminController.addComponentType(t2_req);

    const c1_req = randomPizzaComponent(150, 'my-name12345');
    await api.pizzaComponentsAdminController.addComponent(t1.id, c1_req);
    const c2_req = randomPizzaComponent(300, 'other', 'description-name123');
    await api.pizzaComponentsAdminController.addComponent(t1.id, c2_req);
    const c3_req = randomPizzaComponent(200, 'name123');
    await api.pizzaComponentsAdminController.addComponent(t2.id, c3_req);
    const c4_req = randomPizzaComponent(400, 'other', 'other');
    await api.pizzaComponentsAdminController.addComponent(t2.id, c4_req);

    const cGet1 = await api.pizzaComponentsController.getComponentsOfType(
      t1.id,
      'name123',
      'currentPrice',
      true,
    );
    expect(cGet1.map((i) => i.currentPrice).join()).toBe([300, 150].join());

    const cGet2 = await api.pizzaComponentsController.getComponentsOfType(
      t2.id,
      'name123',
      'currentPrice',
      true,
    );
    expect(cGet2.map((i) => i.currentPrice).join()).toBe('200');
  }, 30000);
});
