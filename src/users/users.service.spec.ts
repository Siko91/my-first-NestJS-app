import { initTestApi } from '../utils/test/testingFunctions';

describe('UsersService', () => {
  it('should be defined', async () => {
    const api = await initTestApi();

    expect(api.usersService).toBeDefined();
  }, 30000);
});
