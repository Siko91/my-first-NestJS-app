import { initTestApi } from '../utils/test/testingFunctions';

describe('HealthController', () => {
  it('Should return the health status of the system', async () => {
    const api = await initTestApi();

    const res = await api.healthController.getHealth();
    expect(res.online).toBe(true);
    expect(res.connectionReports.db).toBe(true);
    expect(res.errors).toHaveLength(0);
  }, 30000);
});
