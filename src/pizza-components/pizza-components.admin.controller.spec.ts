import {
  initTestApi,
  randomPizzaComponent,
  randomPizzaComponentType,
} from '../utils/test/testingFunctions';
import CustomAssert from '../utils/test/customAssert';

describe('PizzaComponentsController', () => {
  it('should be defined', async () => {
    const api = await initTestApi();

    expect(api.pizzaComponentsAdminController).toBeDefined();
    expect(api.pizzaComponentsController).toBeDefined();
  }, 30000);

  it('Can create pizza component types', async () => {
    const api = await initTestApi();

    const t_req = randomPizzaComponentType(true, 1);
    const t = await api.pizzaComponentsAdminController.addComponentType(t_req);

    expect(t.id).toBe(1);
    expect(t.mandatory).toBe(true);
    expect(t.maximum).toBe(1);
    expect(t.name).toBe(t_req.name);

    const tGet = await api.pizzaComponentsController.getComponentTypes();
    expect(tGet).toHaveLength(1);

    expect(tGet[0].id).toBe(1);
    expect(tGet[0].mandatory).toBe(true);
    expect(tGet[0].maximum).toBe(1);
    expect(tGet[0].name).toBe(t_req.name);
  }, 30000);

  it('Can update pizza component types', async () => {
    const api = await initTestApi();

    const t_req = randomPizzaComponentType(true, 1);
    const t = await api.pizzaComponentsAdminController.addComponentType(t_req);

    const t2_req = randomPizzaComponentType(false, 2);
    await api.pizzaComponentsAdminController.modifyComponentType(t.id, t2_req);

    const tGet = await api.pizzaComponentsController.getComponentTypes();
    expect(tGet).toHaveLength(1);

    expect(tGet[0].id).toBe(1);
    expect(tGet[0].mandatory).toBe(false);
    expect(tGet[0].maximum).toBe(2);
    expect(tGet[0].name).toBe(t2_req.name);
  }, 30000);

  it('Can delete pizza component types', async () => {
    const api = await initTestApi();

    const t_req = randomPizzaComponentType(true, 1);
    const t = await api.pizzaComponentsAdminController.addComponentType(t_req);

    await api.pizzaComponentsAdminController.deleteComponentType(t.id);

    const tGet = await api.pizzaComponentsController.getComponentTypes();
    expect(tGet).toHaveLength(0);
  }, 30000);

  it('Can create pizza components', async () => {
    const api = await initTestApi();

    const t_req = randomPizzaComponentType(true, 1);
    const t = await api.pizzaComponentsAdminController.addComponentType(t_req);

    const c_req = randomPizzaComponent(150);
    const c = await api.pizzaComponentsAdminController.addComponent(
      t.id,
      c_req,
    );
    expect(c.name).toBe(c_req.name);

    const cGetAll = await api.pizzaComponentsController.getAllComponents();
    expect(cGetAll).toHaveLength(1);
    expect(cGetAll[0].name).toBe(c_req.name);

    const cGet = await api.pizzaComponentsController.getComponentsOfType(t.id);
    expect(cGet).toHaveLength(1);
    expect(cGet[0].name).toBe(c_req.name);
  }, 30000);

  it('Can update pizza components', async () => {
    const api = await initTestApi();

    const t_req = randomPizzaComponentType(true, 1);
    const t = await api.pizzaComponentsAdminController.addComponentType(t_req);

    const c_req = randomPizzaComponent(150);
    const c = await api.pizzaComponentsAdminController.addComponent(
      t.id,
      c_req,
    );

    const c2_req = randomPizzaComponent(130);
    await api.pizzaComponentsAdminController.modifyComponent(c.id, c2_req);

    const cGet = await api.pizzaComponentsController.getComponentsOfType(t.id);
    expect(cGet).toHaveLength(1);
    expect(cGet[0].name).toBe(c2_req.name);
    expect(cGet[0].description).toBe(c2_req.description);
    expect(cGet[0].currentPrice).toBe(c2_req.currentPrice);
  }, 30000);

  it('Can delete pizza components', async () => {
    const api = await initTestApi();

    const t_req = randomPizzaComponentType(true, 1);
    const t = await api.pizzaComponentsAdminController.addComponentType(t_req);

    const c_req = randomPizzaComponent(150);
    const c = await api.pizzaComponentsAdminController.addComponent(
      t.id,
      c_req,
    );

    await api.pizzaComponentsAdminController.deleteComponent(c.id);

    const tGet = await api.pizzaComponentsController.getComponentTypes();
    expect(tGet).toHaveLength(1); // type not deleted

    const cGet = await api.pizzaComponentsController.getComponentsOfType(t.id);
    expect(cGet).toHaveLength(0);
  }, 30000);

  it('Cannot delete Type if it has Components', async () => {
    const api = await initTestApi();

    const t_req = randomPizzaComponentType(true, 1);
    const t = await api.pizzaComponentsAdminController.addComponentType(t_req);

    const c_req = randomPizzaComponent(150);
    await api.pizzaComponentsAdminController.addComponent(t.id, c_req);

    const c2_req = randomPizzaComponent(200);
    await api.pizzaComponentsAdminController.addComponent(t.id, c2_req);

    await CustomAssert.throwsAsync(() =>
      api.pizzaComponentsAdminController.deleteComponentType(t.id),
    );
  }, 30000);
});
