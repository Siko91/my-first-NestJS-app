import { initTestApi } from '../utils/test/testingFunctions';

describe('PizzaComponentsService', () => {
  it('should be defined', async () => {
    const api = await initTestApi();

    expect(api.pizzaComponentsService).toBeDefined();
  }, 30000);
});
