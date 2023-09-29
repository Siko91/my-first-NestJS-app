import { HealthController } from './health.controller';
import { getControllerOrService } from '../utils/test/testingFunctions';
import { HealthModule } from './health.module';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    controller = await getControllerOrService(
      HealthModule,
      HealthController,
      [],
    );
  }, 30000);

  it('Should return the health status of the system', async () => {
    const res = await controller.getHealth();
    expect(res.online).toBe(true);
    expect(res.connectionReports.db).toBe(true);
    expect(res.errors).toHaveLength(0);
  }, 30000);
});
