import { User } from '../users/user.entity';
import { PizzaComponentsAdminController } from './pizza-components.admin.controller';
import { PizzaComponentsController } from './pizza-components.controller';
import { PizzaComponentsModule } from './pizza-components.module';
import { PizzaComponentType } from './pizza-component-type.entity';
import { PizzaComponent } from './pizza-component.entity';
import {
  dropDb,
  getControllerOrService,
  randomPizzaComponent,
  randomPizzaComponentType,
} from '../utils/test/testingFunctions';

describe('PizzaComponentsController', () => {
  let adminController: PizzaComponentsAdminController;
  let controller: PizzaComponentsController;

  beforeEach(async () => {
    dropDb();

    adminController = await getControllerOrService(
      PizzaComponentsModule,
      PizzaComponentsAdminController,
      [User, PizzaComponentType, PizzaComponent],
    );
    controller = await getControllerOrService(
      PizzaComponentsModule,
      PizzaComponentsController,
      [User, PizzaComponentType, PizzaComponent],
    );
  }, 30000);

  it('should be defined', () => {
    expect(adminController).toBeDefined();
    expect(controller).toBeDefined();
  }, 30000);

  it('can get all types', async () => {
    const t1_req = randomPizzaComponentType(true, 1);
    const t1 = await adminController.addComponentType(t1_req);

    const t2_req = randomPizzaComponentType(true, 1);
    const t2 = await adminController.addComponentType(t2_req);

    const t3_req = randomPizzaComponentType(true, 1);
    const t3 = await adminController.addComponentType(t3_req);

    const tGet = await controller.getComponentTypes();
    expect(tGet).toHaveLength(3);

    expect(
      tGet
        .map((i) => i.id)
        .sort()
        .join(),
    ).toBe([t1.id, t2.id, t3.id].sort().join());
  }, 30000);

  it('can get all components', async () => {
    const t1_req = randomPizzaComponentType(true, 1);
    const t1 = await adminController.addComponentType(t1_req);
    const t2_req = randomPizzaComponentType(true, 1);
    const t2 = await adminController.addComponentType(t2_req);
    await adminController.addComponent(t1.id, randomPizzaComponent(150));
    await adminController.addComponent(t1.id, randomPizzaComponent(300));
    await adminController.addComponent(t2.id, randomPizzaComponent(200));

    const cGet = await controller.getAllComponents();
    expect(
      cGet
        .map((i) => i.currentPrice)
        .sort()
        .join(),
    ).toBe([150, 200, 300].join());

    const cGet1 = await controller.getComponentsOfType(t1.id);
    expect(
      cGet1
        .map((i) => i.currentPrice)
        .sort()
        .join(),
    ).toBe([150, 300].join());
  }, 30000);

  it('can filter & sort components', async () => {
    const t1_req = randomPizzaComponentType(true, 1);
    const t1 = await adminController.addComponentType(t1_req);
    const t2_req = randomPizzaComponentType(true, 1);
    const t2 = await adminController.addComponentType(t2_req);

    const c1_req = randomPizzaComponent(150, 'my-name12345');
    await adminController.addComponent(t1.id, c1_req);
    const c2_req = randomPizzaComponent(300, 'other', 'description-name123');
    await adminController.addComponent(t1.id, c2_req);
    const c3_req = randomPizzaComponent(200, 'name123');
    await adminController.addComponent(t2.id, c3_req);
    const c4_req = randomPizzaComponent(400, 'other', 'other');
    await adminController.addComponent(t2.id, c4_req);

    const cGet = await controller.getAllComponents(
      'name123',
      'currentPrice',
      true,
    );
    expect(cGet.map((i) => i.currentPrice).join()).toBe([300, 200, 150].join());
  }, 30000);

  it('can filter & sort components of a type', async () => {
    const t1_req = randomPizzaComponentType(true, 1);
    const t1 = await adminController.addComponentType(t1_req);
    const t2_req = randomPizzaComponentType(true, 1);
    const t2 = await adminController.addComponentType(t2_req);

    const c1_req = randomPizzaComponent(150, 'my-name12345');
    await adminController.addComponent(t1.id, c1_req);
    const c2_req = randomPizzaComponent(300, 'other', 'description-name123');
    await adminController.addComponent(t1.id, c2_req);
    const c3_req = randomPizzaComponent(200, 'name123');
    await adminController.addComponent(t2.id, c3_req);
    const c4_req = randomPizzaComponent(400, 'other', 'other');
    await adminController.addComponent(t2.id, c4_req);

    const cGet1 = await controller.getComponentsOfType(
      t1.id,
      'name123',
      'currentPrice',
      true,
    );
    expect(cGet1.map((i) => i.currentPrice).join()).toBe([300, 150].join());

    const cGet2 = await controller.getComponentsOfType(
      t2.id,
      'name123',
      'currentPrice',
      true,
    );
    expect(cGet2.map((i) => i.currentPrice).join()).toBe('200');
  }, 30000);
});
