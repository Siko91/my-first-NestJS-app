import { initTestApi } from '../utils/test/testingFunctions';

describe('AuthService', () => {
  it('should be defined', async () => {
    const api = await initTestApi();
    expect(api.authService).toBeDefined();
  }, 30000);
});
