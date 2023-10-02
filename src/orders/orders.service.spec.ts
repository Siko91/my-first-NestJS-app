import { initTestApi } from '../utils/test/testingFunctions';

describe('OrdersService', () => {
  it('should be defined', async () => {
    const api = await initTestApi();

    expect(api.ordersService).toBeDefined();
  }, 30000);
});
