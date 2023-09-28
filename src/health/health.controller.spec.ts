import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('AppController', () => {
  let appController: HealthController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    appController = app.get<HealthController>(HealthController);
  });

  describe('root', () => {
    it('Should return the health status of the system', async () => {
      const res = await appController.getHealth();
      expect(res.online).toBe(true);
      expect(res.connectionReports.db).toBe(true);
      expect(res.errors).toHaveLength(0);
    });
  });
});
